"""
KnowledgeBase — charge et interroge les fichiers JSON éditoriaux.

Structure attendue dans data/knowledge/ :
  histoire.json    — liste de faits/périodes historiques
  lieux.json       — sites et villes à découvrir
  culture.json     — ethnies, traditions, arts
  gastronomie.json — plats et boissons
  festivals.json   — événements culturels
  phrasebook.json  — phrases par situation
"""
import json
from pathlib import Path


class KnowledgeBase:
    def __init__(self, data_dir: Path):
        self._dir  = data_dir
        self._data: dict = {}
        self._load_all()

    def _load_all(self):
        categories = ["histoire", "lieux", "culture", "gastronomie", "festivals", "phrasebook"]
        for cat in categories:
            path = self._dir / f"{cat}.json"
            if path.exists():
                with open(path, encoding="utf-8") as f:
                    self._data[cat] = json.load(f)
            else:
                self._data[cat] = []
        print(f"[KB] {len(self._data)} catégories chargées depuis {self._dir}")

    def get_category(self, category: str) -> list | None:
        return self._data.get(category)

    def get_phrasebook(self, situation: str) -> list:
        phrases = self._data.get("phrasebook", [])
        if isinstance(phrases, list):
            return [p for p in phrases if p.get("situation") == situation]
        # Format alternatif : dict {situation: [phrases]}
        if isinstance(phrases, dict):
            return phrases.get(situation, [])
        return []

    def search(self, query: str, category: str = "general") -> list:
        """
        Recherche simple par mots-clés dans les JSONs éditoriaux.
        Pour une recherche sémantique, utiliser SUKRE (pipeline.py).
        """
        query_lower = query.lower()
        results = []

        cats = (
            list(self._data.keys())
            if category == "general"
            else [category] if category in self._data
            else list(self._data.keys())
        )

        for cat in cats:
            items = self._data.get(cat, [])
            if not isinstance(items, list):
                continue
            for item in items:
                if not isinstance(item, dict):
                    continue
                text = " ".join(str(v) for v in item.values()).lower()
                if query_lower in text:
                    results.append({"category": cat, **item})
                if len(results) >= 6:
                    break

        return results
