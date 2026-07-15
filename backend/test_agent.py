"""
Script de test manuel pour l'agent FasoGuide (Gemini + fallback Mistral).

Usage :
    cd backend
    python test_agent.py

Prérequis : GEMINI_API_KEY et/ou MISTRAL_API_KEY dans backend/.env
  - Gemini  : https://aistudio.google.com/apikey (gratuit)
  - Mistral : https://console.mistral.ai/api-keys
Sans aucune clé, l'agent retourne le message d'indisponibilité (comportement attendu).
"""
import os
import sys
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from dotenv import load_dotenv

load_dotenv()

import logging
logging.basicConfig(level=logging.WARNING, format="%(levelname)s %(name)s : %(message)s")

from agent import run_agent
from citadel_api import CitadelAPI
from knowledge_base import KnowledgeBase

QUESTIONS = [
    "Raconte-moi l'histoire du Burkina Faso",
    "Comment dit-on bonjour en mooré ?",
]


def main():
    kb = KnowledgeBase(Path(__file__).parent.parent / "data" / "knowledge")
    citadel = CitadelAPI()

    for question in QUESTIONS:
        print("=" * 60)
        print(f"Question : {question}")
        print("=" * 60)
        result = run_agent(question, [], citadel=citadel, kb=kb)
        print(f"Modèle   : {result.get('model') or 'aucun (les deux ont échoué)'}")
        print()
        print(result["text"])
        print()


if __name__ == "__main__":
    main()
