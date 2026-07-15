"""
MooreASR — encodeur ASR mooré (+ français).

Charge facebook/mms-1b-all puis superpose l'adaptateur fine-tuné
publié sur HuggingFace (Uriath/mms-mos-finetuned, WER 13.7%).

Méthode PEFT : seuls les ~2M paramètres de l'adaptateur natif MMS
et de la tête CTC ont été entraînés sur 10 000 exemples CITADEL.

Support multilingue : MMS permet de basculer d'adaptateur à chaud
(mos <-> fra). Au retour vers le mooré, les poids fine-tunés sont
ré-appliqués par-dessus l'adaptateur générique.
"""
import torch
import torchaudio
import soundfile as sf
from transformers import Wav2Vec2ForCTC, AutoProcessor
from huggingface_hub import hf_hub_download

TARGET_SR = 16_000


class MooreASR:
    def __init__(self):
        BASE_MODEL   = "facebook/mms-1b-all"
        ADAPTER_REPO = "Uriath/mms-mos-finetuned"
        ADAPTER_FILE = "adapter_mos_finetuned.bin"
        LANG         = "mos"

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        print(f"[ASR] Chargement de {BASE_MODEL} sur {self.device}...")
        self.processor = AutoProcessor.from_pretrained(BASE_MODEL, target_lang=LANG)
        self.model = Wav2Vec2ForCTC.from_pretrained(
            BASE_MODEL,
            target_lang=LANG,
            ignore_mismatched_sizes=True,
        )
        self.model.load_adapter(LANG)

        print(f"[ASR] Chargement de l'adaptateur fine-tuné {ADAPTER_REPO}...")
        adapter_path = hf_hub_download(repo_id=ADAPTER_REPO, filename=ADAPTER_FILE)
        finetuned_state = torch.load(adapter_path, map_location="cpu")
        self.model.load_state_dict(finetuned_state, strict=False)

        # Conservé pour ré-application après un passage par une autre langue
        self._finetuned_state = finetuned_state
        self._current_lang = LANG

        self.model.eval()
        self.model.to(self.device)
        print("[ASR] Prêt. WER mesuré : 13.7%")

    def _set_lang(self, lang: str):
        """
        Bascule l'adaptateur MMS ("mos" ou "fra").
        load_adapter écrase les poids de l'adaptateur courant : au retour
        vers "mos", on ré-applique nos poids fine-tunés.
        """
        if lang == self._current_lang:
            return
        print(f"[ASR] Bascule de langue : {self._current_lang} -> {lang}")
        self.processor.tokenizer.set_target_lang(lang)
        self.model.load_adapter(lang)
        if lang == "mos":
            self.model.load_state_dict(self._finetuned_state, strict=False)
        self.model.eval()
        self.model.to(self.device)
        self._current_lang = lang

    def _load(self, path: str):
        """Charge un fichier audio en tableau numpy float32, 16 kHz mono."""
        audio, sr = sf.read(path, dtype="float32")
        if audio.ndim > 1:
            audio = audio.mean(axis=1)
        if sr != TARGET_SR:
            w = torch.from_numpy(audio).unsqueeze(0)
            w = torchaudio.functional.resample(w, sr, TARGET_SR)
            audio = w.squeeze(0).numpy()
        return audio

    def transcribe(self, audio_path: str, lang: str = "mos") -> str:
        """Transcrit un fichier WAV en texte (mooré par défaut, ou français)."""
        self._set_lang(lang)
        audio = self._load(audio_path)
        inputs = self.processor(audio, sampling_rate=TARGET_SR, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        with torch.no_grad():
            logits = self.model(**inputs).logits
        ids = torch.argmax(logits, dim=-1)
        return self.processor.batch_decode(ids)[0]
