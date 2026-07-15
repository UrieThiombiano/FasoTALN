"""
CitadelAPI — wrappers pour les APIs NLP de la promotion précédente de CITADEL.

APIs disponibles :
  - MT  : https://playground.citadel.bf/translation (JWT auth)
  - TTS : https://splendid-giraffe-arriving.ngrok-free.app/api/tts_moore
  - S2S : https://splendid-giraffe-arriving.ngrok-free.app/api/s2s (pipeline complet)

Note : l'URL ngrok (TTS/ASR) est temporaire et peut changer.
       Mettre à jour CITADEL_TTS_URL dans .env si elle change.
"""
import os
import time
import threading

import truststore
truststore.inject_into_ssl()  # utilise le magasin de certificats du système
                               # (nécessaire sur Windows : le serveur CITADEL
                               # ne renvoie pas la chaîne de certificats complète)

import requests


MT_BASE    = "https://playground.citadel.bf/translation/api"
TTS_URL    = os.getenv("CITADEL_TTS_URL", "https://splendid-giraffe-arriving.ngrok-free.app/api/tts_moore")
MT_EMAIL   = os.getenv("CITADEL_EMAIL",   "citadel.api.user@citadel.bf")
MT_PASSWORD= os.getenv("CITADEL_PASSWORD","Fe!Ar95@BestM00re")


class CitadelAPI:
    def __init__(self):
        self._token: str | None = None
        self._token_ts: float   = 0
        self._lock = threading.Lock()
        # Cache simple en mémoire pour les traductions répétées
        self._cache: dict[str, str] = {}

    # ── Auth ──────────────────────────────────────────────────────────
    def _get_token(self) -> str:
        with self._lock:
            # Renouveler le token toutes les 50 minutes (durée de validité ~60 min)
            if self._token and (time.time() - self._token_ts) < 3000:
                return self._token
            print("[CitadelAPI] Renouvellement du token JWT...")
            r = requests.post(
                f"{MT_BASE}/auth/login",
                json={"email": MT_EMAIL, "password": MT_PASSWORD},
                timeout=10,
            )
            r.raise_for_status()
            self._token    = r.json()["access_token"]
            self._token_ts = time.time()
            return self._token

    # ── Traduction texte ──────────────────────────────────────────────
    def translate(self, text: str, source_lang: str = "french", target_lang: str = "moore") -> dict:
        """
        Traduit un texte entre le français et le mooré.
        source_lang / target_lang : "french" ou "moore"
        """
        cache_key = f"{source_lang}|{target_lang}|{text.strip()}"
        if cache_key in self._cache:
            return {"translation": self._cache[cache_key], "cached": True}

        token = self._get_token()
        r = requests.post(
            f"{MT_BASE}/translate",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={
                "text": text,
                "source_lang": source_lang,
                "target_lang": target_lang,
                "model_type": "nllb",
            },
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()

        # La réponse de l'API CITADEL varie légèrement selon le endpoint
        translation = (
            data.get("translation")
            or data.get("translated_text")
            or data.get("result")
            or str(data)
        )
        self._cache[cache_key] = translation
        return {
            "translation": translation,
            "source_lang": source_lang,
            "target_lang": target_lang,
            "cached": False,
        }

    # ── Synthèse vocale ───────────────────────────────────────────────
    def tts(self, text: str) -> bytes:
        """
        Génère l'audio d'un texte mooré.
        Retourne les bytes du fichier WAV.
        Modèle sous-jacent : Minervus00/coqui-tts-mos-v2 (XTTS-v2 fine-tuné, 24 kHz)
        """
        tts_url = os.getenv("CITADEL_TTS_URL", TTS_URL)
        r = requests.post(
            tts_url,
            data={"text": text},
            timeout=60,
        )
        r.raise_for_status()
        return r.content

    # ── Speech-to-Speech (pipeline complet CITADEL) ────────────────────
    def s2s(self, audio_bytes: bytes, filename: str, lang_src: str = "mos") -> dict:
        """
        Pipeline S2S complet (ASR + MT + TTS) via l'API CITADEL.
        Non utilisé dans le pipeline principal (notre ASR le remplace),
        mais disponible comme fallback ou pour comparaison.
        """
        s2s_url = os.getenv("CITADEL_S2S_URL",
            "https://splendid-giraffe-arriving.ngrok-free.app/api/s2s")
        import base64
        files = {"audio": (filename, audio_bytes, "audio/wav")}
        data  = {"lang_src": lang_src}
        r = requests.post(s2s_url, files=files, data=data, timeout=120)
        r.raise_for_status()
        result = r.json()
        return {
            "transcript":  result.get("transcript",  ""),
            "translation": result.get("translation", ""),
            "audio_b64":   result.get("audio_b64",   ""),
        }
