"""
FasoXplore — Backend FastAPI
Orchestre les agents NLP : ASR mooré (local), MT/TTS CITADEL (API),
agent conversationnel FasoGuide.

Lancement : uvicorn main:app --reload --port 8000
"""
import os
import shutil
import subprocess
import tempfile
import uuid
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, Response, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from src.asr_engine import MooreASR
from src.citadel_api import CitadelAPI
from src.knowledge_base import KnowledgeBase
from src.agent import run_agent

# ── Initialisation (une seule fois au démarrage) ──────────────────────────
print("[FasoXplore] Chargement des modèles...")
asr = MooreASR()
citadel = CitadelAPI()
kb = KnowledgeBase(Path("../data/knowledge"))
print("[FasoXplore] Prêt.")

# ── App ───────────────────────────────────────────────────────────────────
app = FastAPI(title="FasoXplore API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ffmpeg ────────────────────────────────────────────────────────────────
def _ffmpeg_exe() -> str:
    """
    Localise ffmpeg : d'abord dans le PATH, sinon via le binaire embarqué
    du package imageio-ffmpeg (aucune installation système requise).
    """
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        raise HTTPException(
            500,
            "ffmpeg introuvable. Installez-le, ou exécutez : pip install imageio-ffmpeg",
        )


def _convert_to_wav16k(raw_path: str, wav_path: str):
    """Convertit un fichier audio quelconque en WAV mono 16 kHz."""
    try:
        subprocess.run(
            [_ffmpeg_exe(), "-y", "-i", raw_path, "-ar", "16000", "-ac", "1", wav_path],
            check=True, capture_output=True
        )
    except subprocess.CalledProcessError as e:
        raise HTTPException(400, f"Conversion audio échouée : {e.stderr.decode()[:200]}")


# ── Health ────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "asr": "MMS-1B fine-tuné (WER 13.7%)",
        "model": "Uriath/mms-mos-finetuned",
    }


# ── ASR : parole mooré ou française → texte ────────────────────────────────
@app.post("/api/asr")
async def asr_endpoint(audio: UploadFile = File(...), lang: str = Form("mos")):
    """
    Transcrit un fichier audio en texte.
    lang : "mos" (mooré, modèle fine-tuné) ou "fra" (français, adaptateur MMS)
    Retourne : {"transcription": "texte", "lang": "mos|fra"}
    """
    if lang not in ("mos", "fra"):
        raise HTTPException(400, f"Langue non supportée : {lang} (attendu : mos ou fra)")

    suffix = Path(audio.filename or "audio.wav").suffix or ".wav"
    uid = uuid.uuid4().hex
    raw = os.path.join(tempfile.gettempdir(), f"faso_{uid}_raw{suffix}")
    wav = os.path.join(tempfile.gettempdir(), f"faso_{uid}.wav")

    with open(raw, "wb") as f:
        f.write(await audio.read())

    try:
        _convert_to_wav16k(raw, wav)
    finally:
        if os.path.exists(raw):
            os.remove(raw)

    try:
        transcription = asr.transcribe(wav, lang=lang)
    finally:
        if os.path.exists(wav):
            os.remove(wav)

    return JSONResponse({"transcription": transcription, "lang": lang})


# ── MT : traduction texte ─────────────────────────────────────────────────
class TranslateRequest(BaseModel):
    text: str
    source_lang: str = "french"   # "french" ou "moore"
    target_lang: str = "moore"    # "french" ou "moore"

@app.post("/api/translate")
async def translate(req: TranslateRequest):
    """
    Traduit un texte entre le français et le mooré via l'API CITADEL.
    Retourne : {"translation": "texte traduit", "source": "...", "target": "..."}
    """
    result = citadel.translate(req.text, req.source_lang, req.target_lang)
    return JSONResponse(result)


# ── TTS : texte mooré → audio ─────────────────────────────────────────────
class TTSRequest(BaseModel):
    text: str

@app.post("/api/tts")
async def tts(req: TTSRequest):
    """
    Génère l'audio d'un texte mooré via l'API TTS CITADEL.
    Retourne : audio WAV servi depuis la mémoire, rien n'est écrit sur disque.
    """
    audio_bytes = citadel.tts(req.text)
    return Response(
        content=audio_bytes,
        media_type="audio/wav",
        headers={"Content-Disposition": "inline"},
    )


# ── Phrasebook ────────────────────────────────────────────────────────────
@app.get("/api/phrasebook")
def phrasebook(situation: str = "salutations"):
    """
    Retourne les phrases utiles pour une situation donnée.
    situations : salutations | marche | transport | hotel |
                 nourriture | urgence | politesse | fetes
    """
    phrases = kb.get_phrasebook(situation)
    return JSONResponse({"situation": situation, "phrases": phrases})


# ── Knowledge base ────────────────────────────────────────────────────────
@app.get("/api/knowledge/{category}")
def knowledge(category: str):
    """
    Retourne le contenu éditorial d'une catégorie.
    categories : histoire | lieux | culture | gastronomie | festivals
    """
    data = kb.get_category(category)
    if data is None:
        raise HTTPException(404, f"Catégorie '{category}' introuvable.")
    return JSONResponse(data)


# ── Agent FasoGuide ───────────────────────────────────────────────────────
class AgentRequest(BaseModel):
    message: str
    history: list = []

@app.post("/api/agent/chat")
async def agent_chat(req: AgentRequest):
    """
    Point d'entrée de l'agent FasoGuide.
    Retourne : {"text": "réponse", "audio_path": "optionnel"}
    """
    if not req.message.strip():
        raise HTTPException(400, "Message vide.")
    result = run_agent(req.message, req.history, citadel=citadel, kb=kb)
    return JSONResponse(result)


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
