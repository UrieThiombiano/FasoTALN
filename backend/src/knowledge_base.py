"""
KnowledgeBase — charge et sert les fichiers JSON éditoriaux de FasoTALN.

Structure attendue dans data/knowledge/ :
  languages.json         — cinq langues africaines actuellement couvertes par FasoTALN,
                            point de départ d'une ambition continentale (mooré, dioula,
                            fulfuldé, gourmantché, bambara)
  languages_context.json — panorama panafricain des familles de langues (Niger-Congo,
                            afro-asiatique, nilo-saharien, langues à clics) et de la
                            fracture numérique en TALN (objet unique, pas une liste —
                            cf. `KnowledgeBase.get_category`). Le panorama linguistique
                            propre au Burkina Faso (59 langues SIL, langues véhiculaires
                            de 1974) est dans ecosysteme.json, pas ici.
  challenges.json        — défis scientifiques du TALN pour ces langues
  resources.json         — jeux de données, corpus, outils, modèles, articles
  approaches.json        — approches actuelles du TALN multilingue/cross-lingue
  perspectives.json      — pistes de recherche futures de la contribution FasoTALN
  glossaire.json          — glossaire de vocabulaire TALN, groupé par catégorie
  ecosysteme.json         — écosystème TALN/IA du Burkina Faso : institutions, contexte
                            linguistique national, réseau panafricain, feuilles de route,
                            pistes pour se spécialiser (objet unique, pas une liste)

`results.json` a une structure différente (tableaux de métriques) et est
servi séparément par l'endpoint `/api/results`, pas via cette classe.
"""
import json
from pathlib import Path

CATEGORIES = ["languages", "languages_context", "challenges", "resources", "approaches", "perspectives", "glossaire", "ecosysteme"]


class KnowledgeBase:
    def __init__(self, data_dir: Path):
        self._dir  = data_dir
        self._data: dict = {}
        self._load_all()

    def _load_all(self):
        for cat in CATEGORIES:
            path = self._dir / f"{cat}.json"
            if path.exists():
                with open(path, encoding="utf-8") as f:
                    self._data[cat] = json.load(f)
            else:
                self._data[cat] = []
        print(f"[KB] {len(self._data)} catégories chargées depuis {self._dir}")

    def get_category(self, category: str) -> list | None:
        return self._data.get(category)
