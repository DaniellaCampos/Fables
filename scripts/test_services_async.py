import asyncio
import json
from api.schemas import OnboardingData
from services.ai_service import generate_campaign_content
from services.vision_service import get_images

async def test():
    # 1. Crear un ADN de marca ficticio para la prueba
    brand_adn = OnboardingData(
        nicho_negocio="Pastelería de Masa Madre",
        cliente_ideal="Amantes de la repostería artesanal",
        ubicacion="San Salvador",
        color_hex="#E85F3D",
        vibra_marca="Cálida y acogedora"
    )
    
    print("--- 1. Probando el servicio de IA (Groq) ---")
    ai_response = await generate_campaign_content(
        brand_adn=brand_adn,
        idea_usuario="Lanzamiento de croissants de chocolate calientes los domingos por la mañana",
        formato="Post de Instagram",
        objetivo="Vender"
    )
    print("Respuesta de la IA (Groq):")
    print(json.dumps(ai_response, indent=2, ensure_ascii=True))
    
    print("\n--- 2. Probando el servicio de Visión (Unsplash) ---")
    keywords = ai_response.get("search_keywords", "chocolate croissant bakery")
    image_urls = await get_images(
        keywords=keywords,
        vibe=brand_adn.vibra_marca,
        orientation="portrait"
    )
    print("Imágenes obtenidas de Unsplash:")
    for url in image_urls:
        print(f"- {url}")

if __name__ == "__main__":
    # Ejecutar la prueba asíncrona
    asyncio.run(test())
