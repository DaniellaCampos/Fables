from pydantic import BaseModel

# Modelo para cuando el usuario hace Onboarding por primera vez
class OnboardingData(BaseModel):
    nicho_negocio: str       # Ej: "Alquiler de lanchas"
    cliente_ideal: str       # Ej: "Familias"
    ubicacion: str           # Ej: "Lago de Ilopango"
    color_hex: str           # Ej: "#FF5733"
    vibra_marca: str         # Ej: "Aventurera"

# Modelo para la generación de campaña en el Armario
class ClosetGenerateRequest(BaseModel):
    usuario_id: str          # ID único del usuario para consultar su ADN de marca en Firestore
    idea_usuario: str        # Ej: "Promo de fin de semana"
    formato: str             # Ej: "Post de Instagram"
    objetivo: str            # Ej: "Vender"