# CLAUDE.md — FasoXplore

Instructions pour Claude Code. Lire ce fichier entièrement avant toute modification.

---

## Qu'est-ce que FasoXplore ?

**FasoXplore** est une plateforme de découverte du Burkina Faso :
histoire, culture, patrimoine, langues nationales.
Elle intègre des outils NLP souverains pour le mooré (langue Mossi, 8M+ locuteurs).

Ce n'est pas une "app touristique" au sens classique — c'est une vitrine
culturelle et technologique, destinée à impressionner un jury académique tunisien
tout en produisant un artefact utilisable par quiconque veut connaître le Burkina.

---

## Décisions architecturales importantes

### Frontend : React + Vite + Tailwind CSS
- Fichier de tokens CSS : `frontend/src/index.css` — source de vérité pour
  toutes les couleurs, polices, espacements. Ne jamais hardcoder de valeurs
  de couleur dans les composants, toujours utiliser les variables CSS.
- React Router pour la navigation SPA.
- Framer Motion pour les animations (installé dans package.json).
- Lucide React pour les icônes — jamais d'émojis dans l'interface.

### Backend : FastAPI (Python)
- `backend/main.py` — point d'entrée unique.
- `backend/src/asr_engine.py` — ASR mooré (MMS fine-tuné, local).
- `backend/src/citadel_api.py` — wrappers pour APIs MT et TTS CITADEL.
- `backend/src/agent.py` — agent FasoGuide (Claude API + tools).
- `backend/src/sukre/` — code de recherche sémantique SUKRE réutilisé.
- Variables d'environnement dans `.env` (voir `.env.example`).

### Données
- `data/knowledge/*.json` — base de connaissance éditoriale (histoire, lieux,
  culture, gastronomie, festivals, phrasebook). À enrichir progressivement.
- `data/audio/` — corpus audio mooré pour SUKRE (fichiers .wav).

---

## Palette et design (NE PAS MODIFIER sans raison)

Inspirée des matériaux réels du Burkina Faso :
- Indigo nuit (fond hero) : `#1A1230` — teinture indigo de l'Afrique de l'Ouest
- Or du Sahel (accent principal) : `#F0A500` — soleil, or du Liptako
- Argile rouge (accent secondaire) : `#B8411A` — terre argileuse du plateau mossi
- Vert mil (accent tertiaire) : `#1E6B4A` — culture du mil, végétation sahélienne
- Sable clair (fond sections lecture) : `#FAF3E0` — sable du Sahel
- Blanc cassé : `#FEFCF7`

Toutes ces variables sont définies dans `frontend/src/index.css`.

Signature visuelle : les séparateurs de section utilisent un motif SVG géométrique
inspiré du **bogolan** burkinabè (textile traditionnel à motifs géométriques).
Ce motif est défini dans `frontend/src/components/ui/BogolonDivider.jsx`.

Typographies (chargées depuis Google Fonts dans index.html) :
- `Playfair Display` : titres (display, caractère historique)
- `Inter` : corps de texte, UI
- `Space Grotesk` : labels, chiffres, badges

---

## APIs externes utilisées

### API MT (traduction texte français ↔ mooré)
- Base URL : `https://playground.citadel.bf`
- Auth : POST `/translation/api/auth/login` → token JWT
- Traduction : POST `/translation/api/translate`
- Credentials dans `.env` : `CITADEL_EMAIL` / `CITADEL_PASSWORD`
- Voir `backend/src/citadel_api.py` pour le wrapper complet

### API TTS (texte mooré → audio)
- URL : `https://splendid-giraffe-arriving.ngrok-free.app/api/tts_moore`
- POST form-data : `text=<texte mooré>`
- Retour : binaire WAV direct
- ⚠️ URL ngrok = temporaire, peut changer. Variable `CITADEL_TTS_URL` dans `.env`

### API ASR CITADEL (NON UTILISÉE — remplacée)
- Remplacée par notre modèle local MMS fine-tuné (WER 13.7%)
- Voir `backend/src/asr_engine.py`

### Agent FasoGuide
- Modèle Claude : `claude-sonnet-4-6`
- Clé API : variable `ANTHROPIC_API_KEY` dans `.env`

---

## ASR mooré fine-tuné (notre contribution principale)

Modèle : `facebook/mms-1b-all` + adaptateur `Uriath/mms-mos-finetuned`
WER mesuré : 13.7% (vs baseline générique non mesurée)
Méthode : PEFT — adaptateur natif MMS, ~2M paramètres entraînés sur 1B total

Chargement dans `backend/src/asr_engine.py` :
1. Charger `facebook/mms-1b-all` avec `ignore_mismatched_sizes=True`
2. `model.load_adapter("mos")` — adaptateur générique de base
3. Télécharger `adapter_mos_finetuned.bin` depuis `Uriath/mms-mos-finetuned`
4. `model.load_state_dict(finetuned_state, strict=False)` — écraser avec nos poids

---

## Structure des pages

```
/ (Home)           — Hero + présentation FasoXplore
/decouvrir         — Histoire, Lieux, Culture, Gastronomie, Festivals
/communiquer       — Traduction vocale, Phrasebook, Immersion
/fasoquide         — Agent IA conversationnel (questions libres)
/archives          — Recherche sémantique SUKRE dans audio mooré
```

---

## Commandes de développement

```bash
# Frontend
cd frontend && npm install && npm run dev     # http://localhost:5173

# Backend
cd backend && pip install -r requirements.txt
uvicorn main:app --reload --port 8000         # http://localhost:8000

# Les deux ensemble (recommandé)
# Terminal 1 : backend
# Terminal 2 : frontend
```

Le frontend appelle le backend via le proxy Vite configuré dans `vite.config.js`
(toutes les requêtes `/api/*` sont proxiées vers `localhost:8000`).

---

## Ce qui est déjà fait vs à implémenter

### Déjà fait (réutiliser sans modifier)
- `backend/src/asr_engine.py` — ASR complet
- `backend/src/sukre/` — pipeline SUKRE (FAISS + NLLB)
- `data/knowledge/*.json` — contenu éditorial de départ (à enrichir)
- Design tokens CSS dans `frontend/src/index.css`

### À implémenter dans l'ordre recommandé
1. Backend : `citadel_api.py` → wrappers MT + TTS
2. Backend : endpoints `/api/translate`, `/api/tts`, `/api/asr`
3. Backend : `agent.py` → FasoGuide avec les 5 tools
4. Frontend : composants UI de base (BogolonDivider, AudioPlayer, Button)
5. Frontend : page Home (Hero + sections éditoriales)
6. Frontend : page Découvrir
7. Frontend : page Communiquer (traduction + phrasebook)
8. Frontend : page FasoGuide (chat agent)
9. Frontend : page Archives (SUKRE)

---

## Contraintes importantes

- JAMAIS d'émojis dans le code frontend — utiliser Lucide React pour toutes les icônes
- JAMAIS de couleurs hardcodées — utiliser les variables CSS de `index.css`
- JAMAIS de `console.log` en production
- Les textes d'interface sont en FRANÇAIS (pas en anglais)
- Les animations utilisent Framer Motion — pas de CSS `@keyframes` manuels
  sauf pour le motif bogolan (SVG statique)
- Responsive : mobile-first, breakpoints Tailwind `sm` (640px) `md` (768px) `lg` (1024px)
- Le backend ne stocke aucune donnée utilisateur persistante (pas de BDD)
