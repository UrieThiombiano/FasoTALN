# Chapitre « Contribution technique » — intégration dans le rapport PFE

Ce dossier contient le chapitre LaTeX consacré à la plateforme FasoTALN et les
sources des figures UML. Il est écrit pour le projet `Rapport_PFE_Mémoire`
(classe `report`, `biblatex`, `glossaries`, TikZ).

## Placement dans le rapport

Le rapport comporte déjà :

| Chapitre | Contenu |
|---|---|
| 1 | Présentation générale |
| 2 | État de l'art |
| 3 | Conception et méthodologie (recherche) |
| 4 | Réalisation et résultats (recherche) |
| **5** | **Contribution technique : la plateforme FasoTALN** ← ce chapitre |

Le chapitre se place donc **après** la partie recherche et ne reprend aucune
métrique expérimentale : il traite de l'industrialisation des modèles et du
portail pédagogique. Les contraintes d'implémentation qui conditionnent la
fidélité du service au modèle entraîné (tête `lm_head` non liée, `[SEP]` unique,
génération mot à mot) y sont en revanche détaillées — c'est le cœur du travail
d'ingénierie et cela ne double pas le chapitre 4.

## Installation

1. Copier `chap5_contribution_technique.tex` dans `chapters/` du projet LaTeX.
2. Copier `figures/*.png` dans `figures/` du projet LaTeX.
3. Ajouter dans `main.tex`, après la ligne du chapitre 4 :

```latex
\input{chapters/chap5_contribution_technique}
```

Le chapitre charge lui-même `\usetikzlibrary{shapes.geometric}` (requis par le
diagramme de cas d'utilisation). Si d'autres chapitres en ont besoin, déplacer
cette ligne dans `config/preamble.tex`.

Compilation vérifiée avec `pdflatex` (MiKTeX) : aucune erreur, aucune référence
non résolue. Le chapitre occupe 24 pages.

## Acronymes à ajouter (optionnel)

`config/macros.tex` définit déjà `nlp`, `g2p`, `api`, `asr`… Si le glossaire
doit couvrir le vocabulaire du chapitre 5 :

```latex
\newacronym{spa}{SPA}{Single Page Application}
\newacronym{rest}{REST}{Representational State Transfer}
\newacronym{json}{JSON}{JavaScript Object Notation}
\newacronym{uml}{UML}{Unified Modeling Language}
\newacronym{ipa}{IPA}{International Phonetic Alphabet}
```

## Figures

| Figure | Source | Outil |
|---|---|---|
| 5.1 Cas d'utilisation | dans le `.tex` | TikZ |
| 5.2 Séquence — pipeline | `uml_sequence_pipeline.puml` | PlantUML |
| 5.3 Séquence — assistant | `uml_sequence_chat.puml` | PlantUML |
| 5.4 Séquence — veille | `uml_sequence_news.puml` | PlantUML |
| 5.5 Architecture physique | dans le `.tex` | TikZ |
| 5.6 Architecture logique | dans le `.tex` | TikZ |
| 5.7 Classes — inférence | `uml_classes_inference.puml` | PlantUML |
| 5.8 Classes — services | `uml_classes_services.puml` | PlantUML |
| 5.9 Activités — pipeline | `uml_activite_pipeline.puml` | PlantUML |
| 5.10 Activités — veille | `uml_activite_news.puml` | PlantUML |

### Régénérer les PNG

Nécessite Java (présent) et `plantuml.jar` (à télécharger depuis
<https://github.com/plantuml/plantuml/releases>, non versionné ici : 22 Mo).
Graphviz n'est pas installé, d'où
l'option `-Playout=smetana` (moteur de placement interne) pour les diagrammes
de classes ; les diagrammes de séquence et d'activités n'en ont pas besoin.

```bash
cd docs/rapport/figures
java -jar plantuml.jar -charset UTF-8 -tpng -Playout=smetana *.puml
```

L'option `-charset UTF-8` est **obligatoire** : sans elle, les accents sortent
en mojibake.

Les tailles d'affichage (`\figurefull{...}{0.86}`, etc.) ont été calculées pour
que le texte des diagrammes reste lisible (≈ 7–8 pt à l'impression). Si un
diagramme est modifié et change de proportions, recalculer la largeur : la
hauteur rendue ne doit pas dépasser ~19 cm.

## Captures d'écran à produire

Six emplacements sont réservés dans le chapitre par la commande
`\captureareserver`. Le document compile en l'état (cadre gris avec le nom du
fichier attendu). Une fois la capture réalisée, remplacer l'appel par
`\figurefull{figures/captures/<fichier>}{0.9}{<légende>}{<label>}`.

| Fichier attendu | Ce que la capture doit montrer |
|---|---|
| `captures/demo_g2p.png` | Page `/demo-g2p` : texte saisi, langue choisie, transcription IPA affichée |
| `captures/pipeline.png` | Page `/pipeline` : texte, IPA, séquence hybride et distribution des probabilités sur les 5 classes |
| `captures/accueil.png` | Page `/` : parcours d'apprentissage numéroté |
| `captures/page_contenu.png` | Une page de contenu (ex. `/defis`) : plan latéral, sommaire, navigation précédent/suivant |
| `captures/assistant.png` | Widget d'assistant ouvert, avec une réponse ancrée sur la base de connaissance |
| `captures/nouvelles.png` | Page `/nouvelles` : cartes d'actualité avec catégorie, date et lien source |

Conseil : capturer en 1400–1600 px de large, navigateur en mode clair, sans
barre d'outils ni onglets personnels visibles.

## Points restés ouverts

- La section « Difficultés rencontrées et enseignements » (5.4.2) est le pendant
  du passage « Rasa abandonné » du chapitre modèle : elle expose les trois
  pièges silencieux rencontrés. Elle peut être enrichie si d'autres incidents
  méritent d'être documentés.
- La section « Environnement matériel » reste volontairement générique sur le
  poste de développement : compléter avec les caractéristiques réelles
  (processeur, RAM, système) si le jury attend ce niveau de détail, comme dans
  le rapport modèle.
