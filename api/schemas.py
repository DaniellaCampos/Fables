from typing import Literal, Optional, List

from pydantic import BaseModel

ArquetipoMarca = Literal[
    "Heroe", "Sabio", "Explorador", "Inocente", "Hombre_Comun",
    "Bufon", "Amante", "Cuidador", "Gobernante", "Creador", "Mago", "Rebelde",
]
TonoVoz = Literal["Formal", "Cercano"]

# Modelo para cuando el usuario hace Onboarding por primera vez
class OnboardingData(BaseModel):
    nicho_negocio: str       # Ej: "Alquiler de lanchas"
    cliente_ideal: str       # Ej: "Familias"
    ubicacion: str           # Ej: "Lago de Ilopango"
    color_hex: str           # Ej: "#FF5733"
    vibra_marca: str         # Ej: "Aventurera"
    arquetipo_marca: ArquetipoMarca   # Ej: "Explorador"
    proposito_marca: str     # Golden Circle - el "por que" existe la marca
    enemigo_marca: str       # Contra que o quien se posiciona la marca
    tono_voz: TonoVoz        # Formal o Cercano
    emocion_objetivo: str    # Que debe sentir el cliente 3 segundos despues

    # Nuevos campos de Fase 2 (opcionales para mantener compatibilidad hacia atrás)
    name: Optional[str] = None
    secondary_color: Optional[str] = None
    language: Optional[str] = None
    audiences: Optional[List[str]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

# Modelo para la generación de campaña en el Armario
class ClosetGenerateRequest(BaseModel):
    usuario_id: str          # ID único del usuario para consultar su ADN de marca en Firestore
    idea_usuario: str        # Ej: "Promo de fin de semana"
    formato: str             # Ej: "Post de Instagram"
    objetivo: str            # Ej: "Vender"
