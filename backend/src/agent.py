"""
FasoGuide — Agent conversationnel pour FasoXplore.

Architecture :
  1. Mistral (mistral-small-latest) — agent principal avec function calling
     natif : le modèle décide lui-même d'appeler search_burkina_info et/ou
     translate_to_moore, en boucle (max 3 tours).
  2. Google Gemini (gemini-1.5-flash) — fallback automatique si Mistral
     échoue, sans function calling : la KB est injectée dans le prompt.

Si les deux échouent, un message d'erreur clair en français est retourné.
"""
import json
import os
import re

import google.generativeai as genai

# mistralai 1.x : `from mistralai import Mistral`
# mistralai 2.x : package namespace, le SDK vit dans `mistralai.client`
try:
    from mistralai import Mistral
except ImportError:
    from mistralai.client import Mistral

from dotenv import load_dotenv

load_dotenv()  # permet l'usage autonome (tests terminal) sans passer par main.py

MISTRAL_MODEL = "mistral-small-latest"
GEMINI_MODEL  = "gemini-1.5-flash"

SYSTEM_PROMPT = """Tu es FasoGuide, l'assistant intelligent de FasoXplore,
plateforme de découverte du Burkina Faso.

Tu aides les utilisateurs à découvrir l'histoire, la culture, les lieux,
les langues et les traditions du Burkina Faso.

Règles strictes :
- Toujours chercher dans la base de connaissance avec search_burkina_info
  avant de répondre à une question factuelle sur le Burkina.
- Utiliser translate_to_moore quand l'utilisateur demande une traduction
  ou veut savoir comment dire quelque chose en mooré.
- Ne jamais inventer de faits. Si l'information n'est pas dans la base,
  le dire honnêtement.
- Répondre en français, de façon chaleureuse et précise.
- Pas d'emojis. Utiliser le Markdown (gras, italique) pour structurer.
- Maximum 4 paragraphes par réponse."""

tools = [
    {
        "type": "function",
        "function": {
            "name": "search_burkina_info",
            "description": (
                "Cherche des informations sur l'histoire, la culture, les lieux, "
                "la gastronomie et les festivals du Burkina Faso dans la base éditoriale."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "La question ou le sujet à rechercher",
                    },
                    "category": {
                        "type": "string",
                        "enum": ["histoire", "lieux", "culture", "gastronomie", "festivals", "general"],
                        "description": "Catégorie dans laquelle chercher",
                    },
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "translate_to_moore",
            "description": (
                "Traduit un texte du français vers le mooré via l'API de traduction "
                "CITADEL. Utiliser quand l'utilisateur demande une traduction ou veut "
                "savoir comment dire quelque chose en mooré."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "Texte en français à traduire en mooré",
                    },
                },
                "required": ["text"],
            },
        },
    },
]


# ── Recherche KB ───────────────────────────────────────────────────────────
# kb.search fait une recherche par sous-chaîne exacte : si le modèle passe une
# question entière comme query, rien ne matche. On retombe alors sur une
# recherche mot-clé par mot-clé (mots vides ignorés).
_STOPWORDS = {
    "avec", "cette", "comme", "comment", "dans", "elle", "elles", "était",
    "être", "faso", "leur", "leurs", "mais", "moore", "mooré", "nous",
    "pour", "pourquoi", "quand", "quel", "quelle", "quelles", "quels",
    "qui", "quoi", "sans", "sont", "sur", "tout", "toute", "tous", "vous",
    "raconte", "parle", "burkina", "visiter",
}


def _kb_search(query: str, category: str, kb) -> list:
    """Recherche la query complète, puis mot-clé par mot-clé si vide."""
    results = kb.search(query, category)
    if results:
        return results

    seen = set()
    merged = []
    for word in re.findall(r"[\wÀ-ÿ]{4,}", query):
        if word.lower() in _STOPWORDS:
            continue
        for item in kb.search(word, category):
            key = item.get("id") or json.dumps(item, ensure_ascii=False)[:80]
            if key not in seen:
                seen.add(key)
                merged.append(item)
        if len(merged) >= 6:
            break
    return merged[:6]


# ── Formatage de l'historique ──────────────────────────────────────────────
def _clean_history(history: list) -> list:
    """Filtre l'historique en messages {role, content} textuels valides."""
    cleaned = []
    for msg in history:
        if not isinstance(msg, dict):
            continue
        role = msg.get("role")
        content = msg.get("content")
        if role in ("user", "assistant") and isinstance(content, str) and content.strip():
            cleaned.append({"role": role, "content": content})
    return cleaned


# ── Exécution des tools ────────────────────────────────────────────────────
def _execute_tool(name: str, args: dict, citadel, kb) -> str:
    """Exécute un tool demandé par le modèle et retourne le résultat en JSON."""
    if name == "search_burkina_info":
        result = _kb_search(args["query"], args.get("category", "general"), kb)
        if not result:
            return json.dumps(
                {"resultats": [], "note": "Aucune information trouvée dans la base."},
                ensure_ascii=False,
            )
        return json.dumps(result, ensure_ascii=False)

    if name == "translate_to_moore":
        result = citadel.translate(args["text"], "french", "moore")
        return json.dumps(result, ensure_ascii=False)

    return json.dumps({"error": f"Tool inconnu: {name}"}, ensure_ascii=False)


# ── Boucle agent Mistral (function calling réel) ───────────────────────────
def run_agent_mistral(user_message: str, history: list, citadel, kb) -> dict:
    api_key = os.getenv("MISTRAL_API_KEY")
    if not api_key:
        raise RuntimeError("MISTRAL_API_KEY manquante")
    client = Mistral(api_key=api_key)

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(_clean_history(history))
    messages.append({"role": "user", "content": user_message})

    # Boucle agentique — max 3 tours pour éviter les boucles infinies
    for turn in range(3):
        response = client.chat.complete(
            model=MISTRAL_MODEL,
            messages=messages,
            tools=tools,
            tool_choice="auto",
        )

        msg = response.choices[0].message
        messages.append(msg)

        # Pas d'appel de tool → réponse finale
        if not msg.tool_calls:
            text = (msg.content or "").strip()
            if not text:
                raise RuntimeError("Réponse Mistral vide")
            print(f"[FasoGuide] Réponse Mistral après {turn + 1} tour(s)")
            return {"text": text, "audio_path": None}

        # Exécuter les tools demandés
        for tool_call in msg.tool_calls:
            name = tool_call.function.name
            try:
                args = json.loads(tool_call.function.arguments)
            except (TypeError, json.JSONDecodeError):
                args = {}

            print(f"[FasoGuide] Tool appelé : {name}({args})")

            try:
                result_str = _execute_tool(name, args, citadel, kb)
            except Exception as e:
                result_str = json.dumps(
                    {"error": f"Le tool {name} a échoué : {e}"}, ensure_ascii=False
                )

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "name": name,
                "content": result_str,
            })

    return {
        "text": "Je n'ai pas pu formuler une réponse. Reformulez votre question.",
        "audio_path": None,
    }


# ── Fallback Gemini (sans function calling) ────────────────────────────────
def run_agent_gemini_fallback(user_message: str, history: list, citadel, kb) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY manquante")
    genai.configure(api_key=api_key)

    # Enrichir avec la KB manuellement
    try:
        kb_results = _kb_search(user_message, "general", kb)
    except Exception:
        kb_results = []
    context = json.dumps(kb_results, ensure_ascii=False) if kb_results else "(aucun résultat)"

    history_text = "\n".join(
        f"{'Utilisateur' if m['role'] == 'user' else 'FasoGuide'} : {m['content']}"
        for m in _clean_history(history)
    ) or "(aucun)"

    prompt = f"""{SYSTEM_PROMPT}

Contexte de la base de connaissance :
{context}

Historique :
{history_text}

Question : {user_message}"""

    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content(prompt)
    text = (response.text or "").strip()
    if not text:
        raise RuntimeError("Réponse Gemini vide")
    print("[FasoGuide] Fallback Gemini utilisé")
    return {"text": text, "audio_path": None}


# ── Fonction principale ────────────────────────────────────────────────────
def run_agent(user_message: str, history: list, citadel, kb) -> dict:
    """
    Lance l'agent FasoGuide (Mistral function calling, puis Gemini en fallback).
    Retourne : {"text": str, "audio_path": None}
    """
    try:
        return run_agent_mistral(user_message, history, citadel, kb)
    except Exception as e:
        print(f"[FasoGuide] Mistral échoué ({e}), fallback Gemini...")
        try:
            return run_agent_gemini_fallback(user_message, history, citadel, kb)
        except Exception as e2:
            print(f"[FasoGuide] Gemini échoué aussi ({e2})")
            return {
                "text": (
                    "FasoGuide est momentanément indisponible. "
                    "Réessayez dans quelques instants."
                ),
                "audio_path": None,
            }
