---
title: FasoXplore
emoji: 🌍
colorFrom: yellow
colorTo: red
sdk: docker
app_port: 7860
pinned: false
---

# FasoXplore

Plateforme de découverte du Burkina Faso : histoire, culture, patrimoine,
langues nationales — avec des outils NLP souverains pour le mooré
(ASR fine-tuné [Uriath/mms-mos-finetuned](https://huggingface.co/Uriath/mms-mos-finetuned),
WER 13,7 %, traduction et synthèse vocale via les API CITADEL).

- **Découvrir** — histoire, lieux, culture, gastronomie, festivals
- **Communiquer** — traduction vocale français ↔ mooré, phrasebook
- **FasoGuide** — agent conversationnel sur le Burkina Faso

Backend FastAPI + frontend React servis par le même conteneur.
Le premier démarrage télécharge le modèle ASR (~4 Go) : patience au réveil du Space.

Code source : [github.com/UrieThiombiano/fasoXplore](https://github.com/UrieThiombiano/fasoXplore)
