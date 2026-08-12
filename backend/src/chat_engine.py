"""
ChatEngine — assistant conversationnel de FasoTALN (Mistral, RAG statique +
repli web_search).

Répond aux questions sur le TALN appliqué aux langues africaines et sur la
contribution de recherche FasoTALN. Le contexte injecté dans
le prompt système est entièrement dérivé de data/knowledge/*.json (chargé une
seule fois au démarrage). Si une information n'y figure pas mais reste dans
le périmètre TALN Afrique (ex. actualité récente), l'agent peut chercher sur
le web via le connecteur `web_search` de l'API Agents/Conversations Mistral
(client.beta.conversations.start — différente de l'API Chat Completions,
seule à exposer ce connecteur), restreint aux mêmes domaines de confiance
que NewsAgent, et cite toujours sa source dans la réponse.

Différent de l'ancien agent FasoGuide (backend/src/agent.py, supprimé avec
FasoXplore) : pas de fallback Gemini, pas d'appel CITADEL, pas d'audio.
"""
import json
import os

# mistralai 1.x : `from mistralai import Mistral`
# mistralai 2.x : le SDK vit dans `mistralai.client` (cf. ancien agent.py)
try:
    from mistralai import Mistral
except ImportError:
    from mistralai.client import Mistral

from .mistral_utils import extract_text_and_citations
from .news_agent import ALLOWED_DOMAINS

MISTRAL_MODEL = "mistral-small-latest"
MAX_HISTORY = 8

CONTRIBUTION_TEXT = """Contribution de recherche FasoTALN : « Leveraging Phonemic Features for \
Cross-lingual NLP in African Languages ». Pipeline : Texte -> ByT5 fine-tuné (modèle \
Uriath/byt5-small-g2p-african) -> IPA -> [CLS] texte [SEP] IPA [SEP] -> AfroXLMR \
(modèle Uriath/afro-xlmr-hybrid-sib200-masakhanews-5class-byt5) -> classification \
thématique en 5 classes (politics, sports, health, entertainment, technology). \
L'idée centrale : injecter une transcription phonémique (IPA) en complément du texte \
orthographique pour améliorer la classification cross-lingue sur des langues à faibles \
ressources. Un modèle ASR mooré (MMS-1B fine-tuné, WER 13.7%, Uriath/mms-mos-finetuned) \
a aussi été développé mais n'est plus une fonctionnalité live du site, seulement \
catalogué comme ressource. La plateforme propose aussi une traduction français -> mooré \
(page Pipeline de classification) et une page « Nouvelles du jour » qui recense des \
actualités récentes du TALN en Afrique. Le projet est développé dans le cadre de CITADEL \
(Centre d'Excellence Interdisciplinaire en IA pour le Développement, Ouagadougou)."""

SYSTEM_PROMPT_HEADER = """Tu es l'assistant de FasoTALN, portail scientifique et \
pédagogique sur le Traitement Automatique des Langues Naturelles (TALN/NLP) appliqué aux langues \
africaines, né à CITADEL (Burkina Faso) autour du mooré, du dioula, du fulfuldé, du \
gourmantché et du bambara.

Règles strictes :
- Tu réponds uniquement aux questions sur : le TALN/NLP et les langues africaines \
(pas seulement les cinq langues prioritaires de FasoTALN — le positionnement du projet \
est panafricain), et la contribution de recherche FasoTALN décrite ci-dessous.
- Pour toute question hors de ce périmètre (sujets personnels, actualité sans lien avec \
le TALN, etc.), tu réponds poliment que ça sort du périmètre de FasoTALN, sans tenter \
d'y répondre.
- Tu t'appuies en priorité sur le contexte fourni ci-dessous (extrait de la base de \
connaissance éditoriale de FasoTALN, format JSON, y compris la catégorie `news`).
- Si une question porte sur une actualité ou un fait récent lié au TALN africain qui ne \
figure pas dans ce contexte, tu PEUX faire une recherche web avec l'outil `web_search`, \
mais UNIQUEMENT en te fondant sur ces domaines de confiance : {allowed_domains}. \
Si tu utilises une information trouvée ainsi, tu cites toujours sa source (nom + lien) \
à la fin de ta réponse.
- Si tu ne trouves rien dans le contexte ni via une recherche web fiable, tu dis \
honnêtement que tu ne sais pas plutôt que d'inventer un chiffre, une institution, une \
date ou une publication.
- Tu réponds en français, sans emoji, sans markdown (texte brut), de façon concise \
(quelques phrases à quelques paragraphes selon la question).

{contribution}

Contexte (base de connaissance FasoTALN, JSON) :
{knowledge}
"""

_KNOWLEDGE_CATEGORIES = [
    "languages", "languages_context", "challenges", "approaches",
    "resources", "perspectives", "glossaire", "ecosysteme", "news",
]


class ChatEngine:
    def __init__(self, kb, data_dir):
        knowledge_blocks = []
        for cat in _KNOWLEDGE_CATEGORIES:
            data = kb.get_category(cat)
            if data:
                knowledge_blocks.append(f"## {cat}\n{json.dumps(data, ensure_ascii=False)}")

        results_path = data_dir / "results.json"
        if results_path.is_file():
            with open(results_path, encoding="utf-8") as f:
                results = json.load(f)
            knowledge_blocks.append(f"## results\n{json.dumps(results, ensure_ascii=False)}")

        self._system_prompt = SYSTEM_PROMPT_HEADER.format(
            contribution=CONTRIBUTION_TEXT,
            knowledge="\n\n".join(knowledge_blocks),
            allowed_domains=", ".join(ALLOWED_DOMAINS),
        )

    def ask(self, message: str, history: list) -> str:
        api_key = os.getenv("MISTRAL_API_KEY")
        if not api_key:
            raise RuntimeError("Assistant indisponible : MISTRAL_API_KEY non configurée.")

        client = Mistral(api_key=api_key)
        inputs = _clean_history(history) + [
            {"type": "message.input", "role": "user", "content": message}
        ]

        response = client.beta.conversations.start(
            model=MISTRAL_MODEL,
            instructions=self._system_prompt,
            tools=[{"type": "web_search"}],
            inputs=inputs,
            completion_args={"temperature": 0.3},
        )
        text, citations = extract_text_and_citations(response)
        text = text.strip()
        if not text:
            raise RuntimeError("Réponse vide de l'assistant.")

        if citations and not any(c["url"] in text for c in citations):
            text += "\n\nSource : " + citations[0]["title"] + " — " + citations[0]["url"]

        return text


def _clean_history(history: list) -> list:
    cleaned = []
    for msg in history[-MAX_HISTORY:]:
        if not isinstance(msg, dict):
            continue
        role = msg.get("role")
        content = msg.get("content")
        if role in ("user", "assistant") and isinstance(content, str) and content.strip():
            cleaned.append({"type": "message.input", "role": role, "content": content})
    return cleaned
