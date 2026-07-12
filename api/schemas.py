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
    idea_usuario: str        # Ej: "Promo de fin de semana"
    formato: str             # Ej: "Post de Instagram"
    objetivo: str            # Ej: "Vender"


# Modelo para registrar telemetría del radar de oportunidades (Fase 2)
class OpportunityActionLog(BaseModel):
    date_logged: str         # Timestamp ISO de la acción
    opportunity_date: str    # Fecha de la oportunidad sobre la que se actuó
    signals_active: List[str] # Señales activas ej: ["holiday", "weekend", "sunny"]
    action: str              # Acción realizada ej: "clicked_cta"


# Modelo para guardar un diseño del Closet en Firestore (Fase 3)
class DesignData(BaseModel):
    name: str
    format: str
    imageUrl: str
    projectSettings: dict
    campaignCopy: Optional[str] = None
    campaignHashtags: Optional[List[str]] = None
    campaignMusic: Optional[str] = None
