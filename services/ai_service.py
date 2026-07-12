import json
import os
from dotenv import load_dotenv
from groq import AsyncGroq
from api.schemas import OnboardingData

load_dotenv()

# Inicialización del cliente asíncrono de Groq leyendo la API key desde las variables de entorno
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("La variable de entorno GROQ_API_KEY no está configurada.")

client = AsyncGroq(api_key=api_key)

# System Prompt experto en marketing y psicoanálisis de marca
SYSTEM_PROMPT = (
    "Eres un psicólogo de marcas y redactor creativo de marketing de élite, especializado en Growth Marketing para microempresas.\n"
    "Tu objetivo es crear copys altamente persuasivos que conecten emocionalmente con el público objetivo, basándote en la identidad de marca (el ADN de la marca).\n\n"
    "Debes responder EXCLUSIVAMENTE con un objeto JSON válido, sin texto adicional, saludos o explicaciones fuera del JSON.\n"
    "La estructura del JSON debe ser exactamente la siguiente:\n"
    "{\n"
    '  "instagram_copy": "Texto persuasivo del post de Instagram, con un gancho atrapante, cuerpo estructurado, emojis y llamada a la acción (CTA) clara.",\n'
    '  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],\n'
    '  "image_recommendation": "Descripción en español del tipo de imagen o concepto visual que acompañaría bien este texto.",\n'
    '  "search_keywords": "2 a 3 palabras clave en inglés, separadas por espacios, óptimas para buscar imágenes realistas y estéticas en Unsplash (ejemplo: \'cozy coffee workspace\' o \'beach sunset adventure\')"\n'
    "}"
)

async def generate_campaign_content(brand_adn: OnboardingData, idea_usuario: str, formato: str, objetivo: str) -> dict:
    """
    Función asíncrona que conecta con Groq para generar el contenido persuasivo,
    hashtags y recomendación visual basándose en el ADN de la marca.
    """
    user_prompt = (
        f"Genera una propuesta de campaña con las siguientes especificaciones:\n\n"
        f"--- ADN DE LA MARCA ---\n"
        f"- Nicho de Negocio: {brand_adn.nicho_negocio}\n"
        f"- Cliente Ideal: {brand_adn.cliente_ideal}\n"
        f"- Ubicación: {brand_adn.ubicacion}\n"
        f"- Color de Marca (HEX): {brand_adn.color_hex}\n"
        f"- Vibra de la Marca: {brand_adn.vibra_marca}\n\n"
        f"--- PETICIÓN DEL USUARIO ---\n"
        f"- Idea del Post: {idea_usuario}\n"
        f"- Formato: {formato}\n"
        f"- Objetivo: {objetivo}\n"
    )

    try:
        # Llamada asíncrona a la API de Groq usando Llama 3.3
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        # En caso de error, retornamos una estructura por defecto con el error
        return {
            "instagram_copy": f"¡Hola! Prepárate para algo increíble sobre {idea_usuario}. Próximamente novedades.",
            "hashtags": ["marketing", brand_adn.vibra_marca.lower(), "negocio", "post", "creadores"],
            "image_recommendation": f"Una imagen que represente la vibra {brand_adn.vibra_marca} del negocio.",
            "search_keywords": f"{brand_adn.vibra_marca.lower()} business",
            "error": str(e)
        }
