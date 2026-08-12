# CLAUDE.md — FasoTALN

Instructions pour Claude Code. Lire ce fichier entièrement avant toute modification.

---

## Qu'est-ce que FasoTALN ?

**FasoTALN** est le portail scientifique, pédagogique et technologique de
référence sur le **Traitement Automatique des Langues Naturelles (TALN/NLP)
appliqué aux langues africaines**. Le projet est né dans le cadre de CITADEL
(Centre d'Excellence Interdisciplinaire en IA pour le Développement,
Ouagadougou, Burkina Faso), et couvre actuellement cinq langues, sans
hiérarchie de priorité entre elles — mooré, dioula, fulfuldé, gourmantché
(Burkina Faso) et bambara (langue malienne incluse pour ses ressources de TALN, cf.
`data/knowledge/languages.json`) — avec la vocation de s'élargir
progressivement à d'autres langues du continent. Le contenu institutionnel
propre au Burkina Faso (institutions, contexte constitutionnel/administratif,
feuille de route nationale) est délibérément regroupé sur la page
Écosystème TALN-BF plutôt que diffusé dans le reste du site, pour que le
narratif général reste centré sur le TALN africain.

Ce n'est pas une vitrine du mémoire de l'auteur : le mémoire y est présenté
comme **une contribution de recherche parmi d'autres**. L'objectif est
qu'une personne qui découvre le domaine comprenne, dans l'ordre : pourquoi le
TALN compte, quels sont les enjeux des langues africaines, quels défis
scientifiques restent ouverts, quelles ressources existent déjà, quelles
approches sont utilisées aujourd'hui, ce que propose notre contribution, et
quelles sont les perspectives de recherche.

FasoTALN est conçu pour évoluer pendant plusieurs années : nouvelles langues,
nouvelles tâches, nouveaux modèles, ressources enrichies au fil du temps.

---

## Décisions architecturales importantes

### Frontend : React + Vite + Tailwind CSS
- Fichier de tokens CSS : `frontend/src/index.css` — source de vérité pour
  toutes les couleurs, polices, espacements. Ne jamais hardcoder de valeurs
  de couleur dans les composants, toujours utiliser les variables CSS.
- React Router pour la navigation SPA (14 routes + fallback 404, voir
  « Structure des pages » ci-dessous).
- Framer Motion pour les animations (installé dans package.json).
- Lucide React pour les icônes — jamais d'émojis dans l'interface.
- Pas de logo image : le wordmark « FasoTALN » (texte, dégradé violet) sert de
  logo dans `Navbar`/`Footer`. Favicon SVG dans `frontend/public/favicon.svg`.
- `frontend/src/config/nav.js` est la **source de vérité unique** pour la
  navigation de contenu et l'ordre curriculaire (groupes + pages) : `Navbar`
  (dropdown), `Sidebar`, `Breadcrumbs`, `LessonNav` (précédent/suivant), la
  page d'accueil (parcours d'apprentissage numéroté) et le moteur de
  recherche en dérivent tous. Toute nouvelle page de contenu doit y être
  ajoutée — le reste du site s'y adapte automatiquement (y compris le
  décompte du nombre d'étapes affiché sur `/`, jamais codé en dur).
- Les 12 pages de contenu (`Langues`, `Glossaire`, `Défis`, `Approches`,
  `Ressources`, `Contribution`, `DemoG2P`, `Pipeline`, `Résultats`,
  `Perspectives`, `Écosystème`, `Nouvelles`) sont enveloppées dans
  `frontend/src/components/layout/DocsLayout.jsx` — gabarit de type
  documentation/cours (en-tête clair `.page-header`, sidebar de navigation,
  sommaire de page `TOC` avec scrollspy, navigation précédent/suivant).
  `hero-gradient` (hero clair de la page d'accueil) est réservé à `/`
  uniquement.
- `frontend/src/pages/NotFound.jsx` gère les routes inconnues (`path="*"` dans
  `App.jsx`) — pas de 404 serveur en SPA, uniquement côté client.
- `frontend/src/hooks/useKnowledge.js` : hook générique de fetch pour
  `/api/knowledge/{category}` (liste ou objet unique via l'option `isList`),
  utilisé par la plupart des pages de contenu.
- Composants UI partagés à réutiliser plutôt que dupliquer :
  - `components/ui/Callout.jsx` — encadrés définition/exemple/attention/note.
  - `components/ui/StatTile.jsx` — tuile chiffre-clé (utilisée en rangées de
    « chiffres clés » en haut de plusieurs pages).
  - `components/ui/SourceList.jsx` — bloc de citations avec lien externe,
    utilisé partout où une affirmation s'appuie sur une source (`Défis`,
    `Approches`, `Écosystème`). **Toute affirmation factuelle externe ajoutée
    au contenu éditorial doit être sourcée avec un lien vérifiable — pas
    d'invention de chiffres, d'institutions ou de publications.**
  - `components/layout/SearchModal.jsx` — recherche client (raccourci `/` ou
    Cmd/Ctrl+K), indexe à la demande les endpoints `/api/knowledge/*` listés
    dans `SOURCES` et les pages statiques de `nav.js`. Si une nouvelle
    catégorie de contenu est ajoutée, envisager de l'ajouter à `SOURCES`.

### Backend : FastAPI (Python)
- `backend/main.py` — point d'entrée unique.
- `backend/src/g2p_engine.py` — modèle ByT5 G2P (texte → IPA), local.
- `backend/src/g2p_postprocessing.py` — post-traitement IPA (nasalisation,
  affriquées) pour le dioula et le bambara, porté depuis le repo HF du modèle.
- `backend/src/classifier_engine.py` — classifieur AfroXLMR hybride
  (texte + IPA → classe thématique), local.
- `backend/src/translate_engine.py` (`TranslateEngine`) — traduction
  français → mooré via l'API CITADEL (NLLB), exposée via `POST /api/translate`.
  Voir « Ce qui a été retiré de l'ancien produit (FasoXplore) ».
- `backend/src/knowledge_base.py` — chargement du contenu éditorial JSON. La
  liste `CATEGORIES` doit être mise à jour à chaque nouveau fichier
  `data/knowledge/*.json` destiné à être servi via
  `/api/knowledge/{category}`.
- Variables d'environnement dans `.env` (voir `.env.example`) — `HF_TOKEN`,
  `MISTRAL_API_KEY`, `CITADEL_EMAIL`/`CITADEL_PASSWORD` : tous optionnels
  (fonctionnalité correspondante indisponible/503 si absents).

### Données
- `data/knowledge/*.json` — base de connaissance éditoriale, une catégorie
  par fichier : `languages`, `languages_context` (panorama panafricain des
  quatre grands ensembles linguistiques du continent — Niger-Congo,
  afro-asiatique, nilo-saharien, langues à clics d'Afrique australe —, de
  la fracture numérique en TALN (taxonomie Joshi et al. 2020) et de la
  couverture des benchmarks panafricains (MasakhaNER, MasakhaNEWS,
  SIB-200) ; objet unique, pas une liste), `challenges`, `approaches`,
  `resources`, `perspectives` (perspectives de recherche de la
  contribution FasoTALN), `glossaire` (vocabulaire TALN par catégorie),
  `ecosysteme` (tout le contenu institutionnel propre au Burkina Faso :
  institutions burkinabè, panorama des 59 langues nationales documentées
  par SIL Burkina Faso et des trois langues véhiculaires de 1974, contexte
  linguistique national — réforme constitutionnelle 2023, recensement,
  langues coloniales —, ressources documentaires nationales, réseau
  panafricain — Masakhane, AI4D Africa, Lacuna Fund —, feuilles de route
  nationales, comment se spécialiser au Burkina Faso — objet unique).
  Le contenu spécifiquement burkinabè/institutionnel doit être ajouté à
  `ecosysteme.json`, pas dispersé dans les autres catégories, pour que le
  reste du site garde un cadrage panafricain. À enrichir progressivement.
- `challenges.json`, `approaches.json` et `ecosysteme.json` incluent un champ
  `sources` (ou `sources` par item) avec `titre`/`auteurs`/`annee`/`venue`/
  `lien` pour chaque affirmation appuyée sur une publication externe —
  affiché via `SourceList.jsx`. Respecter ce format pour tout nouvel ajout.
- `data/knowledge/results.json` contient les **résultats définitifs** de la
  contribution FasoTALN (F1 hybride vs texte seul, global et par langue,
  `a_confirmer: false`). Ne jamais remplacer ces valeurs par des
  approximations : si de nouveaux résultats expérimentaux arrivent, les
  intégrer tels quels, avec leur source.
- Aucune donnée utilisateur persistante, aucun fichier audio, aucune base
  de données.
- `frontend/public/images/langues/` — photos illustratives (Wikimedia
  Commons, licences CC vérifiées) et la carte de répartition des langues.
  Attribution complète dans `CREDITS.md` du même dossier — à mettre à jour
  pour toute nouvelle image ajoutée. Chaque langue avec une `image` dans
  `languages.json` doit aussi avoir un `image_alt` descriptif (accessibilité)
  distinct du `image_credit`.

### Assistant conversationnel
- `backend/src/chat_engine.py` (`ChatEngine`) — assistant Q&A (Mistral,
  `mistral-small-latest`, API Agents/Conversations) exposé via
  `POST /api/chat`. Ancrage RAG statique en priorité : le contenu de
  `data/knowledge/*.json` (toutes catégories, y compris `news`, +
  `results.json`) est sérialisé une seule fois au démarrage dans les
  `instructions`.
- **Repli `web_search`** : si l'information demandée (typiquement une
  actualité récente) n'est pas dans ce contexte, l'agent peut chercher sur
  le web via `client.beta.conversations.start(tools=[{"type": "web_search"}])`
  — même connecteur que `NewsAgent`, restreint aux mêmes domaines de
  confiance (`ALLOWED_DOMAINS`, importés depuis `news_agent.py` pour rester
  en synchronisation). La source (titre + lien) est toujours ajoutée à la fin
  de la réponse quand ce repli est utilisé — voir `backend/src/mistral_utils.py`
  (`extract_text_and_citations`, partagé avec `NewsAgent`). Si rien de fiable
  n'est trouvé, l'agent le dit honnêtement plutôt que d'inventer.
- Historique de conversation transmis via `inputs` (liste d'entrées
  `{"type": "message.input", "role": ..., "content": ...}`), pas via
  l'ancienne API Chat Completions (qui n'expose pas `web_search`).
- **Limite de débit** : `POST /api/chat` est limité à 15 messages / 5 min
  par IP (en mémoire, voir `_check_rate_limit` dans `main.py`) — protège
  contre le spam et les coûts API incontrôlés. Pas de persistance, remise à
  zéro au redémarrage du backend.
- **Différent de l'ancien agent FasoGuide** (`backend/src/agent.py`,
  supprimé avec FasoXplore, voir « Ce qui a été retiré ») : pas de fallback
  Gemini, pas d'appel CITADEL, pas d'audio — uniquement du texte.
- Frontend : `frontend/src/components/chat/ChatWidget.jsx`, bulle flottante
  montée une seule fois dans `App.jsx` (hors `<Routes>`) donc visible et
  persistante (état non sauvegardé) sur toutes les pages. Pas de page dédiée.
- `MISTRAL_API_KEY` (voir `.env.example`) est optionnelle : absente,
  `/api/chat` répond 503 et le widget affiche un message d'indisponibilité.

### Nouvelles du jour (agent unique, sans validation humaine)
- `backend/src/news_agent.py` (`NewsAgent`) — **un seul agent** (pas de
  système multi-agent) : un agent Mistral (`mistral-medium-latest`) avec le
  connecteur `web_search` de l'**API Agents/Conversations**
  (`client.beta.conversations.start`, différente de l'API Chat Completions
  utilisée par `ChatEngine` — seule l'API Agents expose `web_search`) fait
  en un seul passage la recherche et le résumé. Réutilise `MISTRAL_API_KEY`,
  aucune clé supplémentaire.
- **Publication directe sans relecture humaine**, compensée par deux garde-fous :
  1. Instructions strictes anti-hallucination + liste `ALLOWED_DOMAINS` de
     sources de confiance (arxiv.org, aclanthology.org, masakhane.io,
     huggingface.co, ai4d.ai, lacunafund.org, wearetech.africa,
     deeplearningindaba.com, citadel.bf, mesrsi.gov.bf, education.gov.bf,
     idrc-crdi.ca) intégrée au prompt.
  2. **Vérification côté serveur** (`_domain_allowed`) : tout item dont le
     `source_lien` n'appartient pas à `ALLOWED_DOMAINS` est rejeté avant
     écriture — la confiance ne repose pas uniquement sur le prompt.
  Si la réponse du modèle n'est pas un JSON exploitable, ou si tous les
  items sont rejetés, l'ancien contenu de `news.json` est conservé
  (jamais écrasé par du vide/invalide).
- Résultat fusionné (dédoublonné par `source_lien`) dans
  `data/knowledge/news.json`, plafonné à 30 items, trié par date décroissante.
  Format d'un item : `{id, titre, resume, categorie, date, source_nom,
  source_lien, ajoute_le}`.
- Déclenchement : boucle `asyncio` en arrière-plan dans `main.py`
  (rafraîchit au démarrage puis toutes les 24h) — **best-effort**, un HF
  Space gratuit qui se met en veille ne fait pas tourner cette boucle en
  continu. `POST /api/news/refresh` permet un déclenchement externe (ex.
  cron GitHub Actions) pour un fonctionnement fiable en production.
- Frontend : `frontend/src/pages/Nouvelles.jsx` (route `/nouvelles`, groupe
  de nav « Actualités »), cartes par actualité avec badge de catégorie,
  date, lien source. État vide géré explicitement (pas d'actualité tant que
  `POST /api/news/refresh` n'a jamais tourné).

---

## Palette et design (NE PAS MODIFIER sans raison)

Palette revue en 2026 : le thème initial (indigo nuit / or du Sahel / argile,
hero sombre) évoquait trop l'artisanat/tourisme (FasoXplore) pour un portail
scientifique de type plateforme d'apprentissage. Nouvelle direction, dans
l'esprit clair d'un SaaS éducatif (OpenClassrooms) sans être criarde :
- Encre (texte, titres) : `#1F2129` — gris anthracite neutre (remplace l'indigo sombre)
- Violet de marque (accent principal — boutons, liens, badges) : `#6D5BD0`,
  variantes `--or-light: #8B7ADC`, `--or-dark: #4F46E5`
- Orange (accent sémantique « attention/limites ») : `#EA580C`
- Vert (accent sémantique « succès/exemple ») : `#16A34A`
- Fond de section clair : `#F7F7FB` — gris très clair, pas de crème/sable
- Blanc pur : `#FFFFFF`

Ces variables gardent les **mêmes noms** qu'avant (`--indigo`, `--or`,
`--argile`, `--mil`, `--sable`, `--blanc`...) dans `frontend/src/index.css` —
seules les valeurs hex ont changé, pour ne pas casser les usages inline
existants dans les composants. `--or` (violet) est l'accent principal
(liens, boutons, états actifs, loaders) ; `--argile` (orange) et `--mil`
(vert) sont réservés aux usages sémantiques (attention/succès dans
`Callout.jsx`, badges), pas utilisés comme accent générique.

Les grandes sections sombres plein écran (hero, footer) ont été abandonnées
au profit d'un fond clair partout ; les rares blocs colorés pleins (CTA,
citation) utilisent `--or-dark` (violet) plutôt qu'un fond quasi noir.

Signature visuelle : les séparateurs de section utilisent un motif SVG géométrique
discret inspiré du **bogolan** burkinabè, très atténué (faible opacité) pour
ne pas dominer visuellement — défini dans
`frontend/src/components/ui/BogolonDivider.jsx`, utilisé avec parcimonie
(accueil, pied de page) plutôt qu'entre chaque section.

Typographies (chargées depuis Google Fonts dans index.html) :
- `Playfair Display` : titres (display, caractère historique)
- `Inter` : corps de texte, UI
- `Space Grotesk` : labels, chiffres, badges
- `JetBrains Mono` : transcriptions IPA, pseudo-code du pipeline
  (`--font-mono` / `font-mono`)

---

## Modèles de recherche (contribution FasoTALN)

Titre de la contribution : **Leveraging Phonemic Features for Cross-lingual
NLP in African Languages**. Pipeline :

```
Texte → ByT5 fine-tuné → IPA → [CLS] texte [SEP] IPA [SEP] → AfroXLMR → Classification
```

### G2P — `Uriath/byt5-small-g2p-african`
- `T5ForConditionalGeneration`, chargé avec **`tie_word_embeddings=False`**
  (impératif : le modèle a été fine-tuné avec une tête de sortie `lm_head`
  non liée aux embeddings d'entrée — sans ce paramètre, le chargement HF
  réécrase silencieusement la tête entraînée avec les poids d'embeddings et
  produit une sortie proche du hasard).
- Tokenizer **natif** `google/byt5-small` (pas `AutoTokenizer.from_pretrained
  (MODEL_REPO)` — un tokenizer chargé depuis le repo du modèle a été identifié
  comme source d'erreurs).
- Génération **mot par mot** (jamais phrase entière), chaque mot en
  minuscules et préfixé par le code langue : `"lang_code: mot"` (ex.
  `"mos: naam"`), `num_beams=4, max_length=128, early_stopping=True`. Les
  mots transcrits sont rejoints avec `" | "` (`WORD_SEP`).
- Process reproduit à l'identique du notebook d'entraînement/évaluation
  `12_sib200_masakhanews_5class_byt5_FINAL` (section G2P) — toute
  modification de `backend/src/g2p_engine.py` doit revalider sur ce notebook,
  pas sur intuition.
- Chargé au démarrage dans `backend/src/g2p_engine.py`.
- Post-traitement (`apply_postprocessing(ipa, lang_code)`) appliqué
  uniquement pour `lang_code in ('bam', 'dyu')` — le mooré (`mos`) ressort
  sans correction. Ne pas modifier cette logique sans revalider avec le
  modèle source sur HuggingFace.

### Classification — `Uriath/afro-xlmr-hybrid-sib200-masakhanews-5class-byt5`
- `XLMRobertaForSequenceClassification` (base `Davlan/afro-xlmr-base`), 5
  classes (`politics, sports, health, entertainment, technology`).
- Entrée hybride construite **manuellement** : texte et IPA tronqués chacun
  à `MAX_LEN/2` tokens (`add_special_tokens=False`), puis assemblés en
  `[CLS] texte [SEP] IPA [SEP]` — **un seul** `[SEP]` entre les deux segments.
  Ne **jamais** utiliser l'appel standard `tokenizer(texte, ipa)` de XLM-R :
  il insère deux `[SEP]` consécutifs (format de paire à la RoBERTa), ce qui
  ne correspond pas au format vu par le modèle à l'entraînement et dégrade
  fortement les prédictions. Voir `backend/src/classifier_engine.py`
  (`_build_hybrid_inputs`), reproduit à l'identique de `tokenize_hybrid` dans
  le notebook `12_sib200_masakhanews_5class_byt5_FINAL`.
- Chargé au démarrage dans `backend/src/classifier_engine.py`. Le mapping
  français des labels (`LABELS_FR`) est la source de vérité pour
  l'affichage — ne pas dupliquer de mapping côté frontend.

### Modèle ASR précédent — `Uriath/mms-mos-finetuned`
- ASR mooré (MMS-1B fine-tuné, WER 13.7%) — n'est **plus une fonctionnalité
  live** du site (pas de démo audio), mais reste **catalogué comme ressource**
  dans `data/knowledge/resources.json`.

---

## API backend

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/health` | État des modèles chargés |
| POST | `/api/g2p` | `{text, lang}` → `{ipa}` |
| POST | `/api/pipeline/classify` | `{text, lang}` → `{ipa, sequence, predicted_label_fr, probabilities_fr, ...}` |
| GET | `/api/knowledge/{category}` | `languages \| languages_context \| challenges \| resources \| approaches \| perspectives \| glossaire \| ecosysteme` |
| GET | `/api/results` | Sert `data/knowledge/results.json` (lu à chaque requête, pas de cache — pas besoin de redémarrer le backend après édition) |
| POST | `/api/chat` | `{message, history}` → `{reply}` — assistant Q&A ancré sur `data/knowledge/*.json`, repli `web_search` sourcé si nécessaire, limité à 15 req/5min par IP (voir « Assistant conversationnel ») |
| POST | `/api/translate` | `{text}` (français) → `{translation}` (mooré) — API CITADEL, voir `backend/src/translate_engine.py`. `CITADEL_EMAIL`/`CITADEL_PASSWORD` absentes → 503. Dioula/bambara non supportés par l'API CITADEL, pas de sens inverse, pas de TTS. |
| GET | `/api/news` | Sert `data/knowledge/news.json` (lu à chaque requête, pas de cache) — voir « Nouvelles du jour » |
| POST | `/api/news/refresh` | Déclenche immédiatement l'agent de recherche + résumé (voir « Nouvelles du jour »). `MISTRAL_API_KEY` absente → 503. |

`lang` (endpoints `/api/g2p` et `/api/pipeline/classify`) ∈ `mos` (mooré) \|
`dyu` (dioula) \| `bam` (bambara) uniquement — le fulfuldé et le gourmantché
n'ont pas encore de modèle G2P/classification (`tester_g2p: false` dans
`languages.json`).

---

## Structure des pages

```
/                Accueil (parcours d'apprentissage numéroté, dérivé de nav.js)
/langues         Les langues africaines (panorama panafricain + 5 langues actuellement couvertes par FasoTALN, point de départ d'une ambition continentale : mooré, dioula, fulfuldé, gourmantché, bambara)
/glossaire       Glossaire du vocabulaire TALN
/defis           Les défis du TALN (sourcé, littérature scientifique)
/approches       Approches actuelles (sourcé, littérature scientifique)
/ressources      Ressources (datasets, corpus, outils, modèles, articles)
/contribution    Notre contribution (pipeline explicatif statique)
/demo-g2p        Transcription phonétique (G2P, texte → IPA, interactive)
/pipeline        Pipeline de classification (texte + IPA, démo animée texte → IPA → classe)
/resultats       Résultats (F1 hybride vs texte seul, définitifs)
/perspectives    Perspectives de recherche (roadmap de la contribution FasoTALN)
/ecosysteme      Écosystème TALN du Burkina Faso (institutions, contexte linguistique national, réseau panafricain, feuilles de route, se spécialiser)
/nouvelles       Nouvelles du jour (actualités TALN Afrique, agent Mistral + web_search)
*                404 (NotFound.jsx)
```

La navigation (`Navbar.jsx`) regroupe ces routes en 6 entrées desktop
(Accueil, Langues, « TALN africain » ▾, « Approche phonémique » ▾, « Écosystème TALN-BF », Actualités) via un
composant `DesktopGroup` (dropdown) — le menu mobile les affiche à plat avec
des sous-titres de groupe. Le `Navbar` est toujours clair/solide (le hero de
`/` est lui-même clair depuis la refonte de palette, donc plus de logique de
transparence route-aware à maintenir). Une icône de recherche (raccourci `/`
ou Cmd/Ctrl+K) ouvre `SearchModal`.

Chaque page de contenu (hors Home) utilise `DocsLayout` qui affiche en plus,
dans la page elle-même, une `Sidebar` (arbre complet des sections, générée
depuis `config/nav.js`) et un `TOC` (sommaire « Sur cette page », scanne les
éléments `[data-toc]` du contenu via un `MutationObserver` — fonctionne donc
même si le contenu apparaît après un fetch asynchrone).

Le footer (`Footer.jsx`) inclut un lien vers le dépôt GitHub du projet et le
profil Hugging Face des modèles, en plus des liens de navigation (dérivés de
`FLAT_PAGES`).

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

Le premier démarrage du backend télécharge les deux modèles HuggingFace
(~1,5 Go cumulés, CPU) — patience au premier lancement.

---

## Ce qui a été retiré de l'ancien produit (FasoXplore)

FasoXplore (tourisme/culture du Burkina Faso) a été entièrement remplacé.
Ont été supprimés : les pages Découvrir/Communiquer/FasoGuide, l'ASR mooré
en démo live, la synthèse vocale CITADEL (TTS), l'agent conversationnel
FasoGuide (Mistral/Gemini), les images tourisme, et les fichiers JSON
éditoriaux correspondants. Le contenu historique reste consultable dans
`docs/documentation.md` à titre d'archive.

La traduction texte CITADEL (français → mooré uniquement, voir
`backend/src/translate_engine.py`) a été **réintroduite dans un périmètre
volontairement restreint** : sur `/pipeline`, pour permettre de générer une
phrase en mooré à tester dans le pipeline de classification sans savoir lire
la langue. Différence avec l'ancien `citadel_api.py` (FasoXplore) : pas de
TTS, pas de S2S, pas d'identifiants en dur dans le code — uniquement du
texte, et uniquement français → mooré (le dioula et le bambara ne sont pas
supportés par l'API CITADEL).

---

## Contraintes importantes

- JAMAIS d'émojis dans le code frontend — utiliser Lucide React pour toutes les icônes
- JAMAIS de couleurs hardcodées — utiliser les variables CSS de `index.css`
- JAMAIS de `console.log` en production
- Les textes d'interface sont en FRANÇAIS (pas en anglais), à l'exception du
  titre de la contribution de recherche (« Leveraging Phonemic Features for
  Cross-lingual NLP in African Languages »), gardé en anglais car c'est un
  titre académique.
- Les animations utilisent Framer Motion — pas de CSS `@keyframes` manuels
  sauf pour le motif bogolan (SVG statique)
- Responsive : mobile-first, breakpoints Tailwind `sm` (640px) `md` (768px) `lg` (1024px)
- Le backend ne stocke aucune donnée utilisateur persistante (pas de BDD)
- **Aucune hallucination dans le contenu éditorial** : tout chiffre,
  institution, publication ou citation ajouté à `data/knowledge/*.json` doit
  être vérifié (recherche web) avant d'être écrit, et sourcé via le champ
  `sources` (voir `SourceList.jsx`) quand l'affirmation vient d'une source
  externe. Ne jamais remplacer une valeur `null`/`a_confirmer` par une
  approximation plausible — la laisser telle quelle jusqu'à disposer du vrai
  chiffre.
