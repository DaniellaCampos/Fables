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

# Traduce cada arquetipo de Jung a rasgos de escritura concretos para la IA
ARCHETYPE_GUIDE = {
    "Heroe": "valiente, motivador, lenguaje de superacion y logro",
    "Sabio": "analitico, confiable, usa datos y claridad, tono de autoridad",
    "Explorador": "aventurero, libre, invita a descubrir algo nuevo",
    "Inocente": "optimista, simple, honesto, evita cinismo",
    "Hombre_Comun": "cercano, autentico, habla como un amigo, sin pretensiones",
    "Bufon": "divertido, ironico, no se toma en serio, usa humor",
    "Amante": "sensorial, calido, apela a la intimidad y el deseo",
    "Cuidador": "protector, empatico, tranquilizador, enfocado en el bienestar",
    "Gobernante": "autoritativo, exclusivo, lenguaje de prestigio y control",
    "Creador": "innovador, expresivo, invita a imaginar e inventar",
    "Mago": "transformador, casi magico, promete un cambio de estado",
    "Rebelde": "disruptivo, desafiante, rompe reglas del sector",
}

# System Prompt experto en marketing y psicoanálisis de marca
SYSTEM_PROMPT = (
    "Eres un psicólogo de marcas y redactor creativo de marketing de élite, especializado en Growth Marketing para microempresas.\n"
    "Tu objetivo es crear copys altamente persuasivos que conecten emocionalmente con el público objetivo, basándote en la identidad de marca (el ADN de la marca).\n"
    "El copy debe encarnar el arquetipo y el tono de voz indicados, evocar la emoción objetivo señalada, y diferenciarse implícitamente del 'enemigo de marca' sin nombrarlo directamente.\n\n"
    "Debes responder EXCLUSIVAMENTE con un objeto JSON válido, sin texto adicional, saludos o explicaciones fuera del JSON.\n"
    "La estructura del JSON debe ser exactamente la siguiente:\n"
    "{\n"
    '  "instagram_copy": "Texto persuasivo del post de Instagram, con un gancho atrapante, cuerpo estructurado, emojis y llamada a la acción (CTA) clara.",\n'
    '  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],\n'
    '  "image_recommendation": "Descripción en español del tipo de imagen o concepto visual que acompañaría bien este texto.",\n'
    '  "search_keywords": "2 a 3 palabras clave en inglés, separadas por espacios, óptimas para buscar imágenes realistas y estéticas en Unsplash (ejemplo: \'cozy coffee workspace\' o \'beach sunset adventure\')",\n'
    '  "suggested_music": "Recomendación específica de música o audio de tendencia para acompañar la publicación en Instagram/Facebook, describiendo el instrumento, género o vibra (ej. \'Canción acústica instrumental alegre\', \'Lofi beats suaves relajantes\', \'Pop acústico en tendencia\')"\n'
    "}"
)

async def generate_campaign_content(brand_adn: OnboardingData, idea_usuario: str, formato: str, objetivo: str) -> dict:
    """
    Función asíncrona que conecta con Groq para generar el contenido persuasivo,
    hashtags y recomendación visual basándose en el ADN de la marca (incluyendo
    su arquetipo, propósito, enemigo de marca, tono de voz y emoción objetivo).
    """
    user_prompt = (
        f"Genera una propuesta de campaña con las siguientes especificaciones:\n\n"
        f"--- ADN DE LA MARCA ---\n"
        f"- Nicho de Negocio: {brand_adn.nicho_negocio}\n"
        f"- Cliente Ideal: {brand_adn.cliente_ideal}\n"
        f"- Ubicación: {brand_adn.ubicacion}\n"
        f"- Color de Marca (HEX): {brand_adn.color_hex}\n"
        f"- Vibra de la Marca: {brand_adn.vibra_marca}\n"
        f"- Arquetipo de Marca: {brand_adn.arquetipo_marca} "
        f"(tono: {ARCHETYPE_GUIDE[brand_adn.arquetipo_marca]})\n"
        f"- Propósito (por qué existe): {brand_adn.proposito_marca}\n"
        f"- Se posiciona en contra de: {brand_adn.enemigo_marca}\n"
        f"- Tono de voz: {brand_adn.tono_voz}\n"
        f"- Emoción objetivo en el lector: {brand_adn.emocion_objetivo}\n\n"
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
            "suggested_music": "Música acústica suave y relajante",
            "error": str(e)
        }
