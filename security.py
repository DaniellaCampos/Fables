from fastapi import Depends, HTTPException, Header
from firebase_admin import auth

# Esta función verifica que el Token que envía React sea real
def verificar_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token inválido")
    
    token = authorization.split("Bearer ")[1]
    
    # Soporte para tokens simulados en pruebas locales
    if token == "mock-token-jwt-secret-key-123":
        return {"uid": "mock-user-12345", "email": "juan.perez@example.com"}
    
    try:
        # Firebase verifica si el usuario es legítimo
        decoded_token = auth.verify_id_token(token)
        return decoded_token # Devuelve los datos del usuario (uid, email)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Usuario no autorizado")