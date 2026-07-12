import os
import httpx
from dotenv import load_dotenv

load_dotenv()

# Leer la clave de acceso de Unsplash desde las variables de entorno
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

async def get_images(keywords: str, vibe: str, orientation: str = "portrait") -> list[str]:
    """
    Función asíncrona que conecta con la API de Unsplash para buscar imágenes de alta calidad.
    Combina las palabras clave con la 'vibra' de la marca y retorna 3 URLs de imágenes.
    Soporta orientación 'portrait' (vertical) y 'squarish' (cuadrada).
    """
    # Si no está la API Key, retornamos imágenes estéticas por defecto (fallback)
    if not UNSPLASH_ACCESS_KEY or UNSPLASH_ACCESS_KEY == "your_unsplash_access_key_here":
        return [
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",  # Playa estética
            "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",  # Barco en la playa
            "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800"   # Atardecer
        ]

    # Combinamos palabras clave con la vibra de la marca
    query = f"{keywords} {vibe}"
    
    # Mapear orientación al estándar de Unsplash
    unsplash_orientation = "portrait"
    if orientation in ["square", "squarish"]:
        unsplash_orientation = "squarish"

    url = "https://api.unsplash.com/search/photos"
    params = {
        "query": query,
        "per_page": 3,
        "orientation": unsplash_orientation
    }
    headers = {
        "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers, timeout=10.0)
            response.raise_for_status()
            
            data = response.json()
            results = data.get("results", [])
            
            # Obtener las URLs 'regular' de las primeras 3 imágenes
            image_urls = [img["urls"]["regular"] for img in results[:3]]
            
            # Si Unsplash devuelve menos de 3 resultados, rellenamos con fallbacks
            fallbacks = [
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
                "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
                "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800"
            ]
            while len(image_urls) < 3:
                image_urls.append(fallbacks[len(image_urls)])
                
            return image_urls
    except Exception as e:
        print(f"Error al conectar con Unsplash API: {e}")
        # Retorno de fallback en caso de error de red o de API
        return [
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
            "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
            "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800"
        ]
