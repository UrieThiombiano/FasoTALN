# ── Étape 1 : build du frontend (Vite) ─────────────────────────────────────
FROM node:20-alpine AS frontend
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Étape 2 : backend FastAPI + frontend buildé ────────────────────────────
FROM python:3.11-slim
WORKDIR /app

# torch CPU-only d'abord : évite les roues CUDA (~5 Go inutiles)
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
 && pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ backend/
COPY data/knowledge/ data/knowledge/
COPY --from=frontend /build/dist/ frontend/dist/

# HF Spaces exécute le conteneur en utilisateur non-root : cache modèles dans /tmp
ENV HF_HOME=/tmp/huggingface

WORKDIR /app/backend
EXPOSE 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
