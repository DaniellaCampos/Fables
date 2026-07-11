from pydantic import BaseModel
from typing import Optional

# Modelo para cuando el usuario se registra por primera vez
class OnboardingData(BaseModel):
    nicho_negocio: str       # Ej: "Alquiler de lanchas"
    cliente_ideal: str       # Ej: "Familias"
    ubicacion: str           # Ej: "Lago de Ilopango"
    color_hex: str           # Ej: "#FF5733"
    vibra_marca: str         # Ej: "Aventurera"

# Modelo para cuando el usuario pide un post en el Armario
class ClosetRequest(BaseModel):
    idea_usuario: str        # Ej: "Promo de fin de semana"
    formato: str             # Ej: "Post de Instagram"
    objetivo: str            # Ej: "Vender"