# FasoTALN — Le TALN des langues africaines

> *"Le TALN au service des langues africaines"*

Portail scientifique, pédagogique et technologique de référence sur le
Traitement Automatique des Langues Naturelles (TALN) appliqué aux langues
africaines — né à CITADEL (Burkina Faso) autour du mooré, du dioula, du
fulfuldé, du gourmantché et du bambara, et conçu pour s'élargir
progressivement à d'autres langues du continent.

**PFE Double Diplôme — Ingénierie IA & M.Sc. Data Science**
ENSI Université de la Manouba / CITADEL Ouagadougou, 2026

---

## Architecture

```
FasoTALN
├── frontend/          React + Vite + Tailwind + Framer Motion
└── backend/           FastAPI Python
    ├── G2P             ByT5 fine-tuné (texte → IPA) — LOCAL
    └── Classification  AfroXLMR hybride (texte + IPA) — LOCAL
```

## Installation rapide

```bash
# 1. Variables d'environnement (optionnel, HF_TOKEN uniquement)
cp .env.example .env

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

## Notre contribution

**Leveraging Phonemic Features for Cross-lingual NLP in African Languages**

Un pipeline en deux modèles enchaînés :

```
Texte → ByT5 fine-tuné → IPA → [CLS] texte [SEP] IPA [SEP] → AfroXLMR → Classe
```

- [Uriath/byt5-small-g2p-african](https://huggingface.co/Uriath/byt5-small-g2p-african)
  — ByT5-small fine-tuné pour la transcription graphème → phonème (mooré,
  dioula, bambara).
- [Uriath/afro-xlmr-hybrid-sib200-masakhanews-5class-byt5](https://huggingface.co/Uriath/afro-xlmr-hybrid-sib200-masakhanews-5class-byt5)
  — classifieur AfroXLMR (5 classes) entraîné sur une entrée hybride
  texte + IPA, sur SIB-200 et MasakhaNEWS.

Testez ce pipeline en direct sur les pages **Démonstration G2P** et
**Pipeline complète** de la plateforme.

## Contribution ASR précédente

Modèle publié : [Uriath/mms-mos-finetuned](https://huggingface.co/Uriath/mms-mos-finetuned)
— ASR mooré, base `facebook/mms-1b-all`, adaptateur PEFT (~2M paramètres
entraînés sur 1B), WER 13,7% — cataloguée comme ressource sur la plateforme.

## Documentation

La documentation technique du produit précédent (FasoXplore) est conservée
à titre historique dans [`docs/documentation.md`](docs/documentation.md).

---

*Burkina Faso — Pays des Hommes Intègres*
