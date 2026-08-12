"""
TranslateEngine — traduction français -> mooré via l'API CITADEL (NLLB).

Portée volontairement restreinte : uniquement français -> mooré, en texte,
pour permettre à quelqu'un qui ne lit pas le mooré de générer une phrase à
tester dans le pipeline de classification. Pas de dioula ni de bambara
(non supportés par l'API CITADEL), pas de TTS/audio, pas de sens inverse.

Différent de l'ancien backend/src/citadel_api.py (supprimé avec FasoXplore) :
pas de TTS, pas de S2S, pas d'identifiants en dur dans le code (CITADEL_EMAIL
/ CITADEL_PASSWORD viennent uniquement de l'environnement).
"""
import os
import time
import threading

import requests

MT_BASE = "https://playground.citadel.bf/translation/api"


class TranslateEngine:
    def __init__(self):
        self._token: str | None = None
        self._token_ts: float = 0
        self._lock = threading.Lock()

    def _get_token(self) -> str:
        email = os.getenv("CITADEL_EMAIL")
        password = os.getenv("CITADEL_PASSWORD")
        if not email or not password:
            raise RuntimeError("Traduction indisponible : CITADEL_EMAIL/CITADEL_PASSWORD non configurés.")

        with self._lock:
            if self._token and (time.time() - self._token_ts) < 3000:
                return self._token
            r = requests.post(
                f"{MT_BASE}/auth/login",
                json={"email": email, "password": password},
                timeout=10,
            )
            r.raise_for_status()
            self._token = r.json()["access_token"]
            self._token_ts = time.time()
            return self._token

    def translate_to_moore(self, text: str) -> str:
        """Traduit un texte français en mooré. Lève RuntimeError si l'API est indisponible."""
        token = self._get_token()
        try:
            r = requests.post(
                f"{MT_BASE}/translate",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json={
                    "text": text,
                    "source_lang": "french",
                    "target_lang": "moore",
                    "model_type": "nllb",
                },
                timeout=30,
            )
            r.raise_for_status()
        except requests.RequestException as e:
            raise RuntimeError(f"Traduction indisponible : {e}") from e

        data = r.json()
        translation = data.get("translated_text") or data.get("translation")
        if not translation:
            raise RuntimeError("Traduction indisponible : réponse inattendue de l'API CITADEL.")
        return translation
