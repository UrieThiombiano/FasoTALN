"""
Utilitaires partagés pour l'API Agents/Conversations de Mistral (connecteur
web_search) : utilisé par ChatEngine et NewsAgent. Différente de l'API Chat
Completions classique : seule l'API Agents/Conversations
(`client.beta.conversations.start`) expose le connecteur `web_search`.
"""
from urllib.parse import urlparse


def domain(url: str) -> str:
    try:
        return urlparse(url).netloc.lower().removeprefix("www.")
    except Exception:
        return ""


def extract_text_and_citations(response):
    """
    Parcourt les `outputs` d'une ConversationResponse et retourne :
      - le texte complet de la réponse (concaténation des chunks texte)
      - la liste des citations utilisées par l'outil web_search, sous la
        forme [{"title": ..., "url": ...}, ...]
    """
    text_parts = []
    citations = []
    for output in response.outputs:
        content = getattr(output, "content", None)
        if content is None:
            continue
        if isinstance(content, str):
            text_parts.append(content)
            continue
        for chunk in content:
            ctype = getattr(chunk, "type", None)
            if ctype == "text":
                text_parts.append(chunk.text)
            elif ctype == "tool_reference" and getattr(chunk, "url", None):
                citations.append({"title": getattr(chunk, "title", None) or chunk.url, "url": chunk.url})
    return "\n".join(text_parts), citations
