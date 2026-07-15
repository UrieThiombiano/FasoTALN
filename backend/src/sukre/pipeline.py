"""
SukrePipeline — adaptation de SUKRE (hackathon) pour FasoXplore.
Recherche sémantique dans un corpus audio mooré indexé avec FAISS + NLLB-200.
"""
import glob
import json
import os
from pathlib import Path

import numpy as np
import faiss
import torch
from transformers import AutoTokenizer, AutoModel


NLLB_MODEL_ID   = "facebook/nllb-200-distilled-600M"
AUDIO_DIR       = Path("../data/audio")
INDEX_DIR       = Path("../data/index")
FAISS_PATH      = INDEX_DIR / "segments.faiss"
META_PATH       = INDEX_DIR / "segments_metadata.json"
QUERY_LANG      = "fra_Latn"
AUDIO_LANG      = "mos_Latn"
TOP_K           = 5

CRITICALITY_PROTOTYPES = {
    "urgence_sanitaire":    ["signalement de cas de maladie grave", "rupture de médicaments"],
    "tension_sociale":      ["appel à la mobilisation", "accusation grave contre une communauté"],
    "detresse_individuelle":["demande urgente d'aide personnelle"],
    "desinformation":       ["fausse information qui contredit les faits vérifiés"],
    "alerte_agricole":      ["invasion acridienne dans les champs", "sécheresse menaçant les récoltes"],
}

CRIT_LABELS = {
    "urgence_sanitaire":    "Urgence sanitaire",
    "tension_sociale":      "Tension sociale",
    "detresse_individuelle":"Détresse individuelle",
    "desinformation":       "Désinformation potentielle",
    "alerte_agricole":      "Alerte agricole",
}


def _normalize(v: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(v)
    return v / (norm + 1e-9)


class SukrePipeline:
    def __init__(self):
        print("[SUKRE] Chargement de NLLB-200...")
        self._tokenizer = AutoTokenizer.from_pretrained(NLLB_MODEL_ID)
        self._model     = AutoModel.from_pretrained(NLLB_MODEL_ID)
        self._model.eval()
        self._index: faiss.Index | None = None
        self._meta: list = []
        INDEX_DIR.mkdir(parents=True, exist_ok=True)
        self._prototypes = self._build_prototypes()
        print("[SUKRE] Prêt.")

    # ── Embedding ────────────────────────────────────────────────────
    def _embed(self, text: str, lang: str = QUERY_LANG) -> np.ndarray:
        inputs = self._tokenizer(
            text,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=128,
            src_lang=lang,
        )
        with torch.no_grad():
            out = self._model(**inputs)
        vec = out.last_hidden_state[:, 0, :].squeeze(0).numpy()
        return _normalize(vec).reshape(1, -1)

    # ── Criticité ─────────────────────────────────────────────────────
    def _build_prototypes(self) -> dict:
        protos = {}
        for dim, phrases in CRITICALITY_PROTOTYPES.items():
            vecs = np.vstack([self._embed(p) for p in phrases])
            protos[dim] = _normalize(vecs.mean(axis=0, keepdims=True))
        return protos

    def _score_criticality(self, text: str, lang: str = AUDIO_LANG) -> tuple[dict, dict]:
        emb = self._embed(text, lang)
        scores = {dim: float(np.dot(emb, proto.T).squeeze())
                  for dim, proto in self._prototypes.items()}
        mean  = np.mean(list(scores.values()))
        ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
        active = {dim: sc for dim, sc in ranked[:2] if sc > mean + 0.02}
        return scores, active

    # ── Index ─────────────────────────────────────────────────────────
    def build_from_folder(self, folder: Path = AUDIO_DIR) -> int:
        from ..asr_engine import MooreASR
        asr = MooreASR()
        wavs = sorted(glob.glob(str(folder / "*.wav")))
        if not wavs:
            raise FileNotFoundError(f"Aucun .wav dans {folder}")

        dim = 1024
        self._index = faiss.IndexFlatIP(dim)
        self._meta  = []

        for i, path in enumerate(wavs, 1):
            print(f"[SUKRE] [{i}/{len(wavs)}] {os.path.basename(path)}")
            transcription = asr.transcribe(path)
            emb = self._embed(transcription, AUDIO_LANG).astype("float32")
            self._index.add(emb)
            self._meta.append({"path": path, "transcription": transcription})

        self.save_index()
        return len(wavs)

    def save_index(self):
        if self._index is None:
            return
        faiss.write_index(self._index, str(FAISS_PATH))
        with open(META_PATH, "w", encoding="utf-8") as f:
            json.dump(self._meta, f, ensure_ascii=False, indent=2)

    def load_index(self):
        self._index = faiss.read_index(str(FAISS_PATH))
        with open(META_PATH, encoding="utf-8") as f:
            self._meta = json.load(f)
        print(f"[SUKRE] Index chargé : {len(self._meta)} segments.")

    def __len__(self):
        return len(self._meta)

    # ── Recherche ─────────────────────────────────────────────────────
    def _format_results(self, indices, scores) -> list:
        results = []
        for idx, score in zip(indices[0], scores[0]):
            if idx < 0 or idx >= len(self._meta):
                continue
            r = dict(self._meta[idx])
            r["score"] = round(float(score), 4)
            _, active = self._score_criticality(r["transcription"])
            top = next(iter(active), None)
            r["criticite"] = {k: round(v, 3) for k, v in active.items()}
            r["criticite_top"] = CRIT_LABELS.get(top, "Neutre") if top else "Neutre"
            r["filename"] = os.path.basename(r["path"])
            results.append(r)
        return results

    def search_text(self, query: str, k: int = TOP_K) -> list:
        if self._index is None or self._index.ntotal == 0:
            return []
        emb = self._embed(query, QUERY_LANG).astype("float32")
        k   = min(k, self._index.ntotal)
        scores, indices = self._index.search(emb, k)
        return self._format_results(indices, scores)

    def search_audio(self, wav_path: str, k: int = TOP_K) -> tuple[list, str]:
        from ..asr_engine import MooreASR
        asr = MooreASR()
        transcription = asr.transcribe(wav_path)
        results = self.search_text(transcription, k)
        return results, transcription
