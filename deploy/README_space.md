---
title: FasoTALN
emoji: 🗣️
colorFrom: yellow
colorTo: red
sdk: docker
app_port: 7860
pinned: false
---

# FasoTALN

Portail scientifique et pédagogique de référence sur le Traitement
Automatique des Langues Naturelles (TALN) appliqué aux langues africaines —
né à CITADEL (Burkina Faso) autour du mooré, du dioula et du bambara, et
conçu pour s'élargir progressivement à d'autres langues du continent.

- **Les langues africaines** — mooré, dioula, bambara : familles, écritures, tons
- **Les défis du TALN** — faibles ressources, orthographes variables, tons, diacritiques
- **Ressources** — jeux de données, corpus, outils, modèles, articles
- **Approches actuelles** — TALN multilingue et cross-lingue
- **Notre contribution** — *Leveraging Phonemic Features for Cross-lingual
  NLP in African Languages*, avec démonstrations interactives (G2P, pipeline
  complète) et résultats

Backend FastAPI + frontend React servis par le même conteneur. Le premier
démarrage télécharge les deux modèles de recherche
([byt5-small-g2p-african](https://huggingface.co/Uriath/byt5-small-g2p-african),
[afro-xlmr-hybrid-sib200-masakhanews-5class-byt5](https://huggingface.co/Uriath/afro-xlmr-hybrid-sib200-masakhanews-5class-byt5)) :
patience au réveil du Space.

Code source : [github.com/UrieThiombiano/fasoXplore](https://github.com/UrieThiombiano/fasoXplore)
