"""
FasoXplore — Backend FastAPI
Orchestre les agents NLP : ASR mooré (local), MT/TTS CITADEL (API),
recherche sémantique SUKRE, agent conversationnel FasoGuide.

Lancement : uvicorn main:app --reload --port 8000
"""
import os
import shutil
import subprocess
import tempfile
import uuid
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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

# Servir les fichiers audio du corpus
audio_dir = Path("../data/audio")
if audio_dir.exists():
    app.mount("/audio", StaticFiles(directory=str(audio_dir)), name="audio")


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
    Retourne : fichier audio WAV en streaming.
    """
    audio_bytes = citadel.tts(req.text)
    uid = uuid.uuid4().hex
    out_path = os.path.join(tempfile.gettempdir(), f"faso_tts_{uid}.wav")
    with open(out_path, "wb") as f:
        f.write(audio_bytes)
    return FileResponse(
        out_path,
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


# ── Recherche sémantique SUKRE ────────────────────────────────────────────
class SearchTextRequest(BaseModel):
    query: str

@app.post("/api/search/text")
async def search_text(req: SearchTextRequest):
    """
    Recherche sémantique dans le corpus audio mooré à partir d'une requête texte française.
    Retourne : {"results": [{filename, score, transcription, criticite_top, ...}]}
    """
    # Import ici pour éviter de charger FAISS si non utilisé
    from src.sukre.pipeline import SukrePipeline
    pipeline = _get_sukre()
    results = pipeline.search_text(req.query)
    return JSONResponse({"results": results})


@app.post("/api/search/audio")
async def search_audio(audio: UploadFile = File(...)):
    """
    Recherche sémantique dans le corpus audio mooré à partir d'une requête vocale.
    Retourne : {"transcription": "...", "results": [...]}
    """
    from src.sukre.pipeline import SukrePipeline
    suffix = Path(audio.filename or "audio.wav").suffix or ".wav"
    uid = uuid.uuid4().hex
    raw = os.path.join(tempfile.gettempdir(), f"faso_q_{uid}_raw{suffix}")
    wav = os.path.join(tempfile.gettempdir(), f"faso_q_{uid}.wav")

    with open(raw, "wb") as f:
        f.write(await audio.read())

    try:
        _convert_to_wav16k(raw, wav)
    finally:
        if os.path.exists(raw):
            os.remove(raw)

    try:
        pipeline = _get_sukre()
        results, transcription = pipeline.search_audio(wav)
    finally:
        if os.path.exists(wav):
            os.remove(wav)

    return JSONResponse({"transcription": transcription, "results": results})


@app.post("/api/build-index")
def build_index():
    """
    (Re)construit l'index FAISS depuis data/audio/.
    À appeler après ajout de nouveaux fichiers audio.
    """
    from src.sukre.pipeline import SukrePipeline
    pipeline = _get_sukre(force_rebuild=True)
    try:
        n = pipeline.build_from_folder()
        pipeline.save_index()
        return JSONResponse({"message": f"{n} fichier(s) indexé(s)."})
    except FileNotFoundError as e:
        raise HTTPException(400, str(e))


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


# ── Cache SUKRE (singleton paresseux) ────────────────────────────────────
_sukre_instance = None

def _get_sukre(force_rebuild: bool = False):
    global _sukre_instance
    if _sukre_instance is None or force_rebuild:
        from src.sukre.pipeline import SukrePipeline
        _sukre_instance = SukrePipeline()
        index_dir = Path("../data")
        faiss_path = index_dir / "index" / "segments.faiss"
        meta_path  = index_dir / "index" / "segments_metadata.json"
        if faiss_path.exists() and meta_path.exists():
            _sukre_instance.load_index()
    return _sukre_instance
