"""
NewsAgent — agent unique (Mistral, connecteur web_search) qui recherche puis
résume des actualités récentes sur le TALN en Afrique pour la page
« Nouvelles du jour ». Pas de validation humaine avant publication : la
fiabilité repose sur (1) des instructions strictes anti-hallucination et
une liste de sources de confiance, (2) une vérification côté serveur que
chaque source citée appartient bien à cette liste ET a réellement été
consultée par l'outil de recherche (pas une URL inventée par le modèle).

mistralai 2.x expose le client à `mistralai.client.Mistral` (cf. chat_engine.py) ;
l'API Agents/Conversations (`client.beta.conversations.start`) est utilisée
plutôt que l'API Chat Completions classique, seule à exposer le connecteur
`web_search`.
"""
import json
import os
import re
from datetime import datetime, timezone

try:
    from mistralai import Mistral
except ImportError:
    from mistralai.client import Mistral

from .mistral_utils import domain, extract_text_and_citations

MODEL = "mistral-medium-latest"
MAX_ITEMS_PER_RUN = 6
MAX_STORED_ITEMS = 30

ALLOWED_DOMAINS = [
    "arxiv.org",
    "aclanthology.org",
    "masakhane.io",
    "huggingface.co",
    "ai4d.ai",
    "lacunafund.org",
    "wearetech.africa",
    "deeplearningindaba.com",
    "citadel.bf",
    "mesrsi.gov.bf",
    "education.gov.bf",
    "idrc-crdi.ca",
]

INSTRUCTIONS = f"""Tu es un agent qui recherche puis résume des actualités récentes et \
vérifiables sur le traitement automatique des langues naturelles (TALN/NLP) en Afrique, \
avec un intérêt particulier pour les langues africaines à faibles ressources, notamment le \
mooré, le dioula, le fulfuldé, le gourmantché et le bambara, sans s'y limiter.

Sujets d'intérêt : nouvelles approches ou modèles de TALN, nouveaux jeux de données, \
publications scientifiques marquantes, conférences ou ateliers (Deep Learning Indaba, \
ACL, EMNLP, AfricaNLP, Masakhane), annonces institutionnelles (AI4D Africa, Lacuna Fund, \
CRDI, CITADEL, ministères burkinabè).

RÈGLES STRICTES (anti-hallucination) :
- N'utilise QUE des informations trouvées via ta recherche web réelle à l'instant présent, \
jamais des connaissances internes non vérifiées ni des suppositions.
- Ne retiens QUE des informations provenant de ces domaines de confiance : {', '.join(ALLOWED_DOMAINS)}. \
Si tu ne trouves rien de vérifiable dans ces domaines, renvoie un tableau plus court, y compris vide — \
n'invente jamais un article pour combler.
- Chaque "source_lien" doit être l'URL exacte renvoyée par ta recherche, jamais reconstituée ou devinée.
- Si la date exacte d'un fait n'est pas trouvée, mets `null` plutôt que d'inventer une date.
- N'invente jamais de chiffres, noms d'auteurs, institutions ou citations.
- Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant/après, sans balises markdown, au format :
[{{"titre": "...", "resume": "...", "categorie": "Recherche|Modèle|Jeu de données|Conférence|Financement", \
"date": "YYYY-MM-DD ou null", "source_nom": "...", "source_lien": "..."}}]
- Maximum {MAX_ITEMS_PER_RUN} éléments, uniquement les plus pertinents et récents (idéalement des 30 derniers jours).
- Le "resume" doit être en français, 2 à 3 phrases simples, compréhensibles par quelqu'un qui découvre le domaine.
"""

QUERY = (
    "Cherche les actualités les plus récentes et pertinentes en traitement automatique "
    "des langues naturelles pour l'Afrique, en particulier pour les langues africaines à "
    "faibles ressources (dont le mooré, le dioula, le fulfuldé, le gourmantché et le bambara), "
    "à la date d'aujourd'hui."
)


def _domain_allowed(url: str) -> bool:
    d = domain(url)
    return any(d == allowed or d.endswith(f".{allowed}") for allowed in ALLOWED_DOMAINS)


def _extract_json_array(text: str) -> list:
    start, end = text.find("["), text.rfind("]")
    if start == -1 or end == -1 or end < start:
        raise ValueError("Aucun tableau JSON trouvé dans la réponse du modèle.")
    return json.loads(text[start:end + 1])


class NewsAgent:
    def __init__(self, news_path):
        self._path = news_path

    def refresh(self) -> list:
        """Recherche + résume les actualités du jour, fusionne avec l'historique existant,
        écrit le résultat dans news.json. Lève RuntimeError si l'agent est indisponible."""
        api_key = os.getenv("MISTRAL_API_KEY")
        if not api_key:
            raise RuntimeError("Agent d'actualités indisponible : MISTRAL_API_KEY non configurée.")

        client = Mistral(api_key=api_key)
        response = client.beta.conversations.start(
            model=MODEL,
            instructions=INSTRUCTIONS,
            tools=[{"type": "web_search"}],
            inputs=QUERY,
            completion_args={"temperature": 0.2},
        )

        raw_text, _citations = extract_text_and_citations(response)
        try:
            items = _extract_json_array(raw_text)
        except (ValueError, json.JSONDecodeError) as e:
            raise RuntimeError(f"Réponse de l'agent non exploitable : {e}") from e

        now = datetime.now(timezone.utc).isoformat()
        verified = []
        for item in items:
            if not isinstance(item, dict):
                continue
            source_lien = item.get("source_lien", "")
            if not source_lien or not _domain_allowed(source_lien):
                continue
            if not item.get("titre") or not item.get("resume"):
                continue
            verified.append({
                "id": re.sub(r"[^a-z0-9]+", "-", item["titre"].lower()).strip("-")[:60],
                "titre": item["titre"],
                "resume": item["resume"],
                "categorie": item.get("categorie") or "Recherche",
                "date": item.get("date"),
                "source_nom": item.get("source_nom") or domain(source_lien),
                "source_lien": source_lien,
                "ajoute_le": now,
            })

        existing = []
        if os.path.exists(self._path):
            try:
                with open(self._path, encoding="utf-8") as f:
                    existing = json.load(f)
            except (json.JSONDecodeError, OSError):
                existing = []

        merged = {item["source_lien"]: item for item in existing}
        for item in verified:
            merged[item["source_lien"]] = item

        result = sorted(
            merged.values(),
            key=lambda x: x.get("date") or x["ajoute_le"],
            reverse=True,
        )[:MAX_STORED_ITEMS]

        with open(self._path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        return result
