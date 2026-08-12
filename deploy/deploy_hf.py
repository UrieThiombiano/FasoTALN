"""
Déploiement de FasoTALN sur Hugging Face Spaces (Docker).

Usage :
    python deploy/deploy_hf.py

Prérequis : HF_TOKEN (rôle "write") dans le .env à la racine, ou dans
l'environnement. Le script crée le Space s'il n'existe pas, pousse les
secrets depuis le .env, puis uploade le code nécessaire au build Docker.
"""
import os
import sys
from pathlib import Path

from dotenv import dotenv_values
from huggingface_hub import HfApi

ROOT = Path(__file__).resolve().parent.parent
SPACE_NAME = "fasotaln"
# Les modèles Uriath/byt5-small-g2p-african et
# Uriath/afro-xlmr-hybrid-sib200-masakhanews-5class-byt5 sont publics :
# seul HF_TOKEN est nécessaire, et uniquement s'ils passent en privé.
SECRET_KEYS = ["HF_TOKEN"]

def main():
    env = dotenv_values(ROOT / ".env")
    # Token explicite, sinon session `huggingface-cli login` existante
    token = os.getenv("HF_TOKEN") or env.get("HF_TOKEN") or None

    api = HfApi(token=token)
    try:
        user = api.whoami()["name"]
    except Exception:
        sys.exit("Aucune authentification HF : renseigner HF_TOKEN dans .env "
                 "(token 'write' depuis https://huggingface.co/settings/tokens) "
                 "ou exécuter `huggingface-cli login`.")
    repo_id = f"{user}/{SPACE_NAME}"
    print(f"[1/4] Space cible : {repo_id}")

    api.create_repo(repo_id=repo_id, repo_type="space", space_sdk="docker",
                    exist_ok=True)
    print("[2/4] Space créé (ou déjà existant).")

    for key in SECRET_KEYS:
        value = env.get(key)
        if value:
            api.add_space_secret(repo_id=repo_id, key=key, value=value)
            print(f"      secret poussé : {key}")
        else:
            print(f"      absent du .env, ignoré : {key}")
    print("[3/4] Secrets configurés.")

    api.upload_file(path_or_fileobj=ROOT / "deploy" / "README_space.md",
                    path_in_repo="README.md", repo_id=repo_id, repo_type="space")
    api.upload_file(path_or_fileobj=ROOT / "Dockerfile",
                    path_in_repo="Dockerfile", repo_id=repo_id, repo_type="space")
    api.upload_folder(folder_path=ROOT / "backend", path_in_repo="backend",
                      repo_id=repo_id, repo_type="space",
                      ignore_patterns=["__pycache__/*", "*.pyc", ".env", "*.wav"])
    api.upload_folder(folder_path=ROOT / "data" / "knowledge",
                      path_in_repo="data/knowledge",
                      repo_id=repo_id, repo_type="space")
    api.upload_folder(folder_path=ROOT / "frontend", path_in_repo="frontend",
                      repo_id=repo_id, repo_type="space",
                      ignore_patterns=["node_modules/*", "dist/*"])
    print("[4/4] Code uploadé — le build Docker démarre automatiquement.")
    print(f"\nSuivre le build : https://huggingface.co/spaces/{repo_id}")

if __name__ == "__main__":
    main()
