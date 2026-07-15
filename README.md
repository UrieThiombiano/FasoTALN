# FasoXplore — Plateforme de Découverte du Burkina Faso

> *"Découvrez le Burkina Faso — son histoire, sa culture, ses langues"*

Plateforme multilingue (français ↔ mooré) combinant contenu éditorial riche,
outils NLP souverains et agent IA conversationnel.

**PFE Double Diplôme — Ingénierie IA & M.Sc. Data Science**
ENSI Université de la Manouba / CITADEL Ouagadougou, 2026

---

## Architecture

```
FasoXplore
├── frontend/          React + Vite + Tailwind + Framer Motion
└── backend/           FastAPI Python
    ├── ASR mooré      MMS-1B fine-tuné (WER 13.7%) — LOCAL
    ├── MT fr↔mos      APIs NLP CITADEL (promotion précédente)
    ├── TTS mooré      APIs NLP CITADEL (promotion précédente)
    ├── Retrieval      SUKRE (FAISS + NLLB-200) — LOCAL
    └── Agent IA       Mistral (function calling, 2 outils) + fallback Gemini
```

## Installation rapide

```bash
# 1. Variables d'environnement
cp .env.example .env
# Remplir MISTRAL_API_KEY / GEMINI_API_KEY et vérifier les credentials CITADEL

# 2. Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 3. Frontend (autre terminal)
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Contribution ASR originale

Modèle publié : [Uriath/mms-mos-finetuned](https://huggingface.co/Uriath/mms-mos-finetuned)
- Base : `facebook/mms-1b-all`
- Méthode : PEFT — adaptateur natif MMS, ~2M paramètres entraînés sur 1B
- Corpus : 10 000 exemples CITADEL-BF-Center/moore_audio_data
- WER : **13.7%** sur validation (vs baseline générique)

## Documentation

La documentation complète (objectifs, besoins fonctionnels et non
fonctionnels, acteurs, architecture, conception détaillée, déploiement)
est dans [`docs/documentation.md`](docs/documentation.md).

---

*Burkina Faso — Pays des Hommes Intègres*
