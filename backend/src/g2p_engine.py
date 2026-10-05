"""
G2PEngine : modèle ByT5 fine-tuné pour la transcription phonémique (IPA)
des langues africaines couvertes par le modèle G2P de FasoTALN (mooré, dioula, bambara).

Modèle : Uriath/byt5-small-g2p-african (T5ForConditionalGeneration).

Process reproduit à l'identique du notebook d'entraînement/évaluation
`12_sib200_masakhanews_5class_byt5_FINAL` (section G2P : cellule "ByT5 pour
mos/dyu/bam : format validé") :
  - tokenizer natif `google/byt5-small` (PAS `AutoTokenizer.from_pretrained
    (MODEL_REPO)` : un tokenizer custom avait été identifié comme source
    d'erreurs dans des sessions antérieures) ;
  - `tie_word_embeddings=False` au chargement du modèle : le modèle a été
    fine-tuné avec une tête de sortie (`lm_head`) *non liée* aux embeddings
    d'entrée ; sans ce paramètre, `from_pretrained` réécrase la tête de
    sortie entraînée avec les poids des embeddings d'entrée (comportement de
    tie_weights() par défaut de T5), ce qui produit une sortie proche du
    hasard ;
  - génération **mot par mot** (pas phrase entière), chaque mot en
    minuscules et préfixé par le code langue : `"lang_code: mot"`
    (ex. `"mos: naam"`) : le modèle n'a jamais vu de phrases complètes ni de
    texte non préfixé pendant l'entraînement ;
  - `num_beams=4, max_length=128, early_stopping=True`, sans
    repetition_penalty ni no_repeat_ngram_size (ces paramètres, présents
    dans une version antérieure de ce fichier, compensaient à tort les
    boucles de répétition causées par le mauvais format d'entrée plutôt que
    par le modèle lui-même) ;
  - les mots transcrits sont rejoints avec ' | ' (WORD_SEP), identique au
    format utilisé pour construire l'entrée IPA du classifieur hybride en
    aval (voir classifier_engine.py).
"""
import torch
from transformers import AutoTokenizer, T5ForConditionalGeneration

from .g2p_postprocessing import apply_postprocessing

MODEL_REPO = "Uriath/byt5-small-g2p-african"
TOKENIZER_REPO = "google/byt5-small"
WORD_SEP = " | "
MAX_WORDS = 200


class G2PEngine:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[G2P] Chargement de {MODEL_REPO} sur {self.device}...")
        self.tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_REPO)
        self.model = T5ForConditionalGeneration.from_pretrained(
            MODEL_REPO, tie_word_embeddings=False
        ).to(self.device)
        self.model.eval()
        print("[G2P] Prêt.")

    @torch.inference_mode()
    def _word_to_ipa(self, word: str, lang_code: str) -> str:
        prefixed = f"{lang_code}: {word.lower()}"
        inputs = self.tokenizer(
            prefixed, max_length=64, truncation=True, padding=False, return_tensors="pt"
        ).to(self.device)
        output_ids = self.model.generate(
            **inputs, num_beams=4, max_length=128, early_stopping=True
        )
        ipa = self.tokenizer.decode(output_ids[0], skip_special_tokens=True).strip()
        return ipa if ipa else word

    def transcribe(self, text: str, lang_code: str) -> str:
        words = text.split()[:MAX_WORDS]
        ipa_words = [self._word_to_ipa(w, lang_code) for w in words]
        ipa = WORD_SEP.join(ipa_words)
        return apply_postprocessing(ipa, lang_code)
