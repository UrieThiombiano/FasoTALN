"""
Tunnel ngrok vers l'app FasoXplore locale (port 8000 : frontend + API).

Usage :
    python deploy/tunnel_ngrok.py

Prérequis : NGROK_AUTHTOKEN dans le .env à la racine. Affiche l'URL
publique puis maintient le tunnel ouvert jusqu'à Ctrl+C.
"""
import sys
import time
from pathlib import Path

from dotenv import dotenv_values
import ngrok

ROOT = Path(__file__).resolve().parent.parent
PORT = 8000

def main():
    token = dotenv_values(ROOT / ".env").get("NGROK_AUTHTOKEN")
    if not token:
        sys.exit("NGROK_AUTHTOKEN manquant dans .env")

    listener = ngrok.forward(PORT, authtoken=token)
    print(f"URL publique : {listener.url()}", flush=True)
    try:
        while True:
            time.sleep(60)
    except KeyboardInterrupt:
        print("Tunnel fermé.")

if __name__ == "__main__":
    main()
