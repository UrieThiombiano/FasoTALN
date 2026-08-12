"""
FasoTALN — Backend FastAPI
Sert le contenu éditorial du portail TALN et les deux modèles de recherche :
ByT5 G2P (texte → IPA) et AfroXLMR hybride (classification texte+IPA).

Lancement : uvicorn main:app --reload --port 8000
"""
import asyncio
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# ── Limite de débit basique (en mémoire, par IP) ─────────────────────────
# Protège /api/chat contre le spam/l'abus (coût API Mistral) : pas de
# persistance, remise à zéro au redémarrage — suffisant pour ce volume.
_RATE_LIMIT_WINDOW_S = 300
_RATE_LIMIT_MAX_REQUESTS = 15
_rate_limit_buckets: dict[str, deque] = defaultdict(deque)


def _check_rate_limit(client_ip: str):
    now = time.time()
    bucket = _rate_limit_buckets[client_ip]
    while bucket and now - bucket[0] > _RATE_LIMIT_WINDOW_S:
        bucket.popleft()
    if len(bucket) >= _RATE_LIMIT_MAX_REQUESTS:
        raise HTTPException(429, "Trop de messages envoyés à l'assistant. Réessayez dans quelques minutes.")
    bucket.append(now)

# Utilise le magasin de certificats du système (nécessaire derrière une
# inspection TLS d'entreprise/antivirus) avant tout téléchargement HF.
try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

from src.knowledge_base import KnowledgeBase
from src.g2p_engine import G2PEngine
from src.classifier_engine import TopicClassifier
from src.chat_engine import ChatEngine
from src.translate_engine import TranslateEngine
from src.news_agent import NewsAgent

DATA_DIR = Path("../data/knowledge")
SUPPORTED_LANGS = ("mos", "dyu", "bam")
NEWS_REFRESH_INTERVAL_S = 24 * 60 * 60

# ── Initialisation (une seule fois au démarrage) ──────────────────────────
print("[FasoTALN] Chargement des modèles...")
kb = KnowledgeBase(DATA_DIR)
g2p = G2PEngine()
classifier = TopicClassifier()
chat_engine = ChatEngine(kb, DATA_DIR)
translate_engine = TranslateEngine()
news_agent = NewsAgent(DATA_DIR / "news.json")
print("[FasoTALN] Prêt.")


async def _news_refresh_loop():
    """Rafraîchit les actualités au démarrage puis toutes les 24h.
    Best-effort : un HF Space en veille ne fera pas tourner cette boucle
    en continu — voir POST /api/news/refresh pour un déclenchement externe
    (ex. cron GitHub Actions)."""
    while True:
        try:
            news_agent.refresh()
            print("[NewsAgent] Actualités rafraîchies.")
        except Exception as e:
            print(f"[NewsAgent] Échec du rafraîchissement : {e}")
        await asyncio.sleep(NEWS_REFRESH_INTERVAL_S)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(_news_refresh_loop())
    yield
    task.cancel()


# ── App ───────────────────────────────────────────────────────────────────
app = FastAPI(title="FasoTALN API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _check_lang(lang: str):
    if lang not in SUPPORTED_LANGS:
        raise HTTPException(400, f"Langue non supportée : {lang} (attendu : {', '.join(SUPPORTED_LANGS)})")


# ── Health ────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "g2p_model": "Uriath/byt5-small-g2p-african",
        "classifier_model": "Uriath/afro-xlmr-hybrid-sib200-masakhanews-5class-byt5",
    }


# ── G2P : texte → IPA ────────────────────────────────────────────────────
class G2PRequest(BaseModel):
    text: str
    lang: str = "mos"

@app.post("/api/g2p")
def g2p_endpoint(req: G2PRequest):
    """
    Transcrit un texte en API (Alphabet Phonétique International).
    lang : "mos" (mooré) | "dyu" (dioula) | "bam" (bambara)
    """
    if not req.text.strip():
        raise HTTPException(400, "Texte vide.")
    _check_lang(req.lang)
    ipa = g2p.transcribe(req.text, req.lang)
    return JSONResponse({"text": req.text, "lang": req.lang, "ipa": ipa})


# ── Pipeline complète : texte → IPA → AfroXLMR → classe ──────────────────
class PipelineRequest(BaseModel):
    text: str
    lang: str = "mos"

@app.post("/api/pipeline/classify")
def pipeline_classify(req: PipelineRequest):
    """
    Exécute le pipeline complet de la contribution :
    texte → ByT5 (IPA) → construction [CLS] texte [SEP] IPA [SEP] → AfroXLMR → classe.
    """
    if not req.text.strip():
        raise HTTPException(400, "Texte vide.")
    _check_lang(req.lang)
    ipa = g2p.transcribe(req.text, req.lang)
    result = classifier.classify(req.text, ipa)
    sequence = f"[CLS] {req.text} [SEP] {ipa} [SEP]"
    return JSONResponse({
        "text": req.text,
        "lang": req.lang,
        "ipa": ipa,
        "sequence": sequence,
        **result,
    })


# ── Traduction français -> mooré (API CITADEL) ───────────────────────────
class TranslateRequest(BaseModel):
    text: str

@app.post("/api/translate")
def translate_endpoint(req: TranslateRequest):
    """
    Traduit un texte français en mooré (API CITADEL, NLLB).
    Pensé pour préparer un texte à tester dans le pipeline de classification
    quand on ne lit pas le mooré. Dioula/bambara non supportés par l'API.
    """
    text = req.text.strip()
    if not text:
        raise HTTPException(400, "Texte vide.")
    try:
        translation = translate_engine.translate_to_moore(text)
    except RuntimeError as e:
        raise HTTPException(503, str(e))
    return JSONResponse({"text": text, "lang": "mos", "translation": translation})


# ── Nouvelles du jour (agent Mistral, connecteur web_search) ────────────
@app.get("/api/news")
def news():
    """Sert data/knowledge/news.json (lu à chaque requête, pas de cache)."""
    path = DATA_DIR / "news.json"
    if not path.is_file():
        return JSONResponse([])
    return FileResponse(path, media_type="application/json")


@app.post("/api/news/refresh")
def news_refresh():
    """
    Déclenche une recherche + résumé immédiat (agent unique, sans validation
    humaine). Utile en local, ou depuis un déclencheur externe (cron) pour
    les déploiements où le Space n'est pas toujours actif.
    """
    try:
        result = news_agent.refresh()
    except RuntimeError as e:
        raise HTTPException(503, str(e))
    return JSONResponse(result)


# ── Assistant conversationnel (RAG sur la base éditoriale) ───────────────
class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []

@app.post("/api/chat")
def chat_endpoint(req: ChatRequest, request: Request):
    """
    Assistant Q&A ancré sur data/knowledge/*.json (mistral-small-latest),
    avec repli web_search (domaines de confiance uniquement, source toujours
    citée) si l'information demandée n'est pas dans la base éditoriale.
    Ne répond que sur le TALN, les langues africaines et la contribution
    FasoTALN — hors périmètre, il refuse plutôt que d'inventer.
    """
    _check_rate_limit(request.client.host if request.client else "unknown")
    message = req.message.strip()
    if not message:
        raise HTTPException(400, "Message vide.")
    if len(message) > 2000:
        raise HTTPException(400, "Message trop long (2000 caractères max).")
    try:
        reply = chat_engine.ask(message, req.history)
    except RuntimeError as e:
        raise HTTPException(503, str(e))
    return JSONResponse({"reply": reply})


# ── Contenu éditorial ─────────────────────────────────────────────────────
@app.get("/api/knowledge/{category}")
def knowledge(category: str):
    """
    categories : languages | challenges | resources | approaches | perspectives
    """
    data = kb.get_category(category)
    if data is None:
        raise HTTPException(404, f"Catégorie '{category}' introuvable.")
    return JSONResponse(data)


@app.get("/api/results")
def results():
    path = DATA_DIR / "results.json"
    if not path.is_file():
        raise HTTPException(404, "Résultats introuvables.")
    return FileResponse(path, media_type="application/json")


# ── Frontend statique (production) ────────────────────────────────────────
# En production (Docker/HF Spaces), le build Vite est servi par FastAPI :
# même origine, donc ni proxy ni CORS nécessaires. En dev, le dossier
# n'existe pas forcément et le proxy Vite fait le travail.
_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if _dist.is_dir():
    app.mount("/assets", StaticFiles(directory=str(_dist / "assets")), name="spa-assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(404, "Route API inconnue.")
        candidate = _dist / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        # React Router gère le routage côté client
        return FileResponse(_dist / "index.html")
