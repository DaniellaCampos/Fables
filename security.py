import os

from fastapi import HTTPException, Header
from firebase_admin import auth

DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"

# Esta función verifica que el Token que envía React sea real
def verificar_token(authorization: str = Header(default=None)):
    # Bypass de autenticación solo para desarrollo local (DEV_MODE=true en .env)
    if DEV_MODE:
        return {"uid": "test_local_user", "email": "dev@local.test"}

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token inválido")

    token = authorization.split("Bearer ")[1]

    try:
        # Firebase verifica si el usuario es legítimo
        decoded_token = auth.verify_id_token(token)
        return decoded_token # Devuelve los datos del usuario (uid, email)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Usuario no autorizado")