"""
Script de test manuel pour CitadelAPI (MT + TTS).

Usage :
    cd backend
    python test_citadel.py

Teste :
  1. Authentification + traduction français -> mooré
  2. Synthèse vocale (TTS) du texte mooré obtenu, sauvegardée en WAV
"""
import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from dotenv import load_dotenv

load_dotenv()

from citadel_api import CitadelAPI

TEXTE_FR = "Bonjour, comment allez-vous ?"
SORTIE_WAV = os.path.join(os.path.dirname(__file__), "test_output.wav")


def main():
    api = CitadelAPI()

    print("=" * 60)
    print("TEST 1/2 — Traduction MT (français -> mooré)")
    print("=" * 60)
    print(f"Texte source : {TEXTE_FR!r}")
    try:
        resultat = api.translate(TEXTE_FR, source_lang="french", target_lang="moore")
    except Exception as e:
        print(f"[ECHEC] La traduction a échoué : {e}")
        sys.exit(1)

    traduction = resultat["translation"]
    print(f"Traduction   : {traduction!r}")
    print(f"Résultat complet : {resultat}")
    print("[OK] Traduction reçue.\n")

    print("=" * 60)
    print("TEST 2/2 — Synthèse vocale (TTS) du texte mooré")
    print("=" * 60)
    print(f"Texte à synthétiser : {traduction!r}")
    try:
        audio_bytes = api.tts(traduction)
    except Exception as e:
        print(f"[ECHEC] Le TTS a échoué : {e}")
        sys.exit(1)

    if not audio_bytes:
        print("[ECHEC] Le TTS a renvoyé une réponse vide.")
        sys.exit(1)

    with open(SORTIE_WAV, "wb") as f:
        f.write(audio_bytes)

    taille_ko = len(audio_bytes) / 1024
    print(f"[OK] Audio WAV reçu ({taille_ko:.1f} Ko), sauvegardé dans : {SORTIE_WAV}\n")

    print("=" * 60)
    print("RESUME")
    print("=" * 60)
    print(f"MT  : OK — {TEXTE_FR!r} -> {traduction!r}")
    print(f"TTS : OK — {taille_ko:.1f} Ko écrits dans {SORTIE_WAV}")
    print("Les deux APIs CITADEL répondent correctement.")


if __name__ == "__main__":
    main()
