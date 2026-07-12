import os
import functools
import anyio
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Imports de Firebase
import firebase_admin
from firebase_admin import credentials, firestore

# ---------------------------------------------------------
# 1. INICIALIZACIÓN Y CONFIGURACIÓN
# ---------------------------------------------------------

# Cargar variables de entorno (.env)
load_dotenv()

# Inicializar Firebase
cred_path = "firebase_credenciales.json"
print("Buscando credenciales en:", os.path.abspath(cred_path))

try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)

    # Conectar a la base de datos Firestore
    db = firestore.client()
except FileNotFoundError:
    print("Firebase credentials not found, skipping initialization")
    db = None

# Inicializar FastAPI con Response Class personalizado para forzar UTF-8
from fastapi.responses import JSONResponse

class UTF8JSONResponse(JSONResponse):
    media_type = "application/json; charset=utf-8"

app = FastAPI(title="Hackathon Backend - Creator's Closet", default_response_class=UTF8JSONResponse)

# Configuración CORS para que React pueda comunicarse sin bloqueos desde cualquier origen (local o de red)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware para forzar charset=utf-8 en todas las respuestas JSON
@app.middleware("http")
async def add_charset_to_json_response(request, call_next):
    response = await call_next(request)
    content_type = response.headers.get("content-type", "")
    if "application/json" in content_type and "charset" not in content_type:
        response.headers["content-type"] = "application/json; charset=utf-8"
    return response

# ---------------------------------------------------------
# 2. IMPORTACIONES LOCALES
# ---------------------------------------------------------
from api.schemas import OnboardingData, ClosetGenerateRequest, OpportunityActionLog, DesignData
from security import verificar_token
from services.ai_service import generate_campaign_content
from services.vision_service import get_images
from services.forecast_service import get_forecast


# ---------------------------------------------------------
# 3. RUTAS (Endpoints)
# ---------------------------------------------------------

# Endpoint de prueba para verificar que el servidor está online
@app.get("/")
def read_root():
    return {"status": "online", "mensaje": "Servidor listo y Firebase conectado"}


# RUTA 1: Guardar el ADN de la marca en Firestore
@app.post("/api/onboarding")
async def guardar_onboarding(datos: OnboardingData, usuario: dict = Depends(verificar_token)):
    if db is None:
        raise HTTPException(status_code=500, detail="Servicio de base de datos no disponible")

    uid = usuario["uid"]
    
    try:
        # Guardar en Firestore de forma asíncrona para no bloquear el event loop.
        # Usamos merge=True para que las actualizaciones parciales no borren campos previos.
        doc_ref = db.collection("usuarios").document(uid)
        await anyio.to_thread.run_sync(functools.partial(doc_ref.set, datos.dict(), merge=True))

        # Sincronización fire-and-forget a HubSpot CRM (Fase 2)
        try:
            from services.hubspot_service import sync_brand_to_hubspot
            await anyio.to_thread.run_sync(sync_brand_to_hubspot, datos.dict(), usuario.get("email"))
        except Exception as hs_err:
            print(f"HubSpot background trigger failed: {hs_err}")

        return {"mensaje": "ADN de marca guardado con éxito", "uid_procesado": uid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar en base de datos: {str(e)}")


# RUTA 1b: Leer el ADN de marca guardado en Firestore
@app.get("/api/onboarding")
async def obtener_onboarding(usuario: dict = Depends(verificar_token)):
    if db is None:
        raise HTTPException(status_code=500, detail="Servicio de base de datos no disponible")

    uid = usuario["uid"]

    doc_ref = db.collection("usuarios").document(uid)
    doc = await anyio.to_thread.run_sync(doc_ref.get)

    if not doc.exists:
        raise HTTPException(
            status_code=404,
            detail="Aún no completaste el onboarding. Completa tu ADN de marca primero."
        )

    return OnboardingData(**doc.to_dict())


# RUTA 1c: Radar de oportunidades (clima + feriados/festividades + reglas simples)
@app.get("/api/forecast")
async def obtener_forecast(days: int = 90, usuario: dict = Depends(verificar_token)):
    if db is None:
        raise HTTPException(status_code=500, detail="Servicio de base de datos no disponible")

    uid = usuario["uid"]

    doc_ref = db.collection("usuarios").document(uid)
    doc = await anyio.to_thread.run_sync(doc_ref.get)

    if not doc.exists:
        raise HTTPException(
            status_code=404,
            detail="Aún no completaste el onboarding. Completa tu ADN de marca primero."
        )

    brand_dict = doc.to_dict()
    brand_adn = OnboardingData(**brand_dict)

    lat = brand_dict.get("latitude")
    lon = brand_dict.get("longitude")

    if lat is None or lon is None:
        from services.forecast_service import geocode_location
        lat, lon = await geocode_location(brand_adn.ubicacion)
        if lat is not None and lon is not None:
            await anyio.to_thread.run_sync(doc_ref.update, {"latitude": lat, "longitude": lon})

    opportunities = await get_forecast(
        location=brand_adn.ubicacion,
        days_ahead=days,
        nicho_negocio=brand_adn.nicho_negocio,
        latitude=lat,
        longitude=lon
    )

    return {
        "location": brand_adn.ubicacion,
        "model_version": "rules_v1",
        "opportunities": opportunities
    }


# RUTA 1d: Telemetría - Registrar acciones sobre el radar de oportunidades
@app.post("/api/telemetry/opportunity")
async def log_opportunity_action(datos: OpportunityActionLog, usuario: dict = Depends(verificar_token)):
    if db is None:
        raise HTTPException(status_code=500, detail="Servicio de base de datos no disponible")

    uid = usuario["uid"]
    log_dict = datos.dict()
    log_dict["user_id"] = uid
    # This data feeds the future ML forecasting model (Level 2/3 roadmap).

    try:
        # Guardar en Firestore de forma asíncrona para no bloquear el event loop
        doc_ref = db.collection("opportunity_actions").document()
        await anyio.to_thread.run_sync(doc_ref.set, log_dict)
        return {"mensaje": "Log de telemetría guardado con éxito", "id": doc_ref.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"No se pudo guardar la telemetría: {str(e)}")


# RUTA 2: El Armario - Generación de campaña completa (IA + Imágenes)
@app.post("/api/closet/generate")
async def generar_contenido(peticion: ClosetGenerateRequest, usuario: dict = Depends(verificar_token)):
    if db is None:
        raise HTTPException(status_code=500, detail="Servicio de base de datos no disponible")

    usuario_id = usuario["uid"]

    try:
        # 1. Leer el documento del usuario en Firestore usando el UID autenticado
        doc_ref = db.collection("usuarios").document(usuario_id)
        doc = await anyio.to_thread.run_sync(doc_ref.get)
        
        if not doc.exists:
            raise HTTPException(
                status_code=404, 
                detail="Usuario no encontrado. Por favor, completa el onboarding primero antes de generar contenido."
            )
            
        user_data = doc.to_dict()
        brand_adn = OnboardingData(**user_data)
        
        # 2. Llamar al servicio de IA asíncrono para generar los copys y recomendaciones
        ai_response = await generate_campaign_content(
            brand_adn=brand_adn,
            idea_usuario=peticion.idea_usuario,
            formato=peticion.formato,
            objetivo=peticion.objetivo
        )
        
        # 3. Extraer las palabras clave sugeridas por la IA para buscar imágenes
        keywords = ai_response.get("search_keywords", f"{brand_adn.nicho_negocio} {brand_adn.vibra_marca}")
        
        # 4. Llamar al servicio de visión asíncrono para obtener las 3 fotos estéticas
        image_urls = await get_images(
            keywords=keywords,
            vibe=brand_adn.vibra_marca,
            orientation="portrait"
        )
        
        # 5. Retornar la campaña unificada al Frontend
        return {
            "instagram_copy": ai_response.get("instagram_copy"),
            "hashtags": ai_response.get("hashtags"),
            "image_recommendation": ai_response.get("image_recommendation"),
            "suggested_music": ai_response.get("suggested_music", "Música acústica e instrumental suave"),
            "images": image_urls,
            "brand_adn": {
                "nicho": brand_adn.nicho_negocio,
                "cliente_ideal": brand_adn.cliente_ideal,
                "ubicacion": brand_adn.ubicacion,
                "color": brand_adn.color_hex,
                "vibra": brand_adn.vibra_marca,
                "arquetipo": brand_adn.arquetipo_marca,
                "proposito": brand_adn.proposito_marca,
                "enemigo": brand_adn.enemigo_marca,
                "tono_voz": brand_adn.tono_voz,
                "emocion_objetivo": brand_adn.emocion_objetivo
            }
        }
        
    except HTTPException:
        # Re-lanzar excepciones HTTP conocidas (como el 404 del usuario no registrado)
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error interno al generar la campaña: {str(e)}")


# RUTA 3: Guardar un diseño en el historial de Firestore
@app.post("/api/designs")
async def guardar_diseno(datos: DesignData, usuario: dict = Depends(verificar_token)):
    if db is None:
        raise HTTPException(status_code=500, detail="Servicio de base de datos no disponible")
    
    uid = usuario["uid"]
    diseno_dict = datos.dict()
    diseno_dict["uid"] = uid
    diseno_dict["createdAt"] = datetime.utcnow().isoformat()
    
    try:
        doc_ref = db.collection("designs").document()
        await anyio.to_thread.run_sync(doc_ref.set, diseno_dict)
        return {"mensaje": "Diseño guardado con éxito", "id": doc_ref.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar el diseño: {str(e)}")


# RUTA 4: Obtener todos los diseños guardados del usuario desde Firestore
@app.get("/api/designs")
async def obtener_disenos(usuario: dict = Depends(verificar_token)):
    if db is None:
        raise HTTPException(status_code=500, detail="Servicio de base de datos no disponible")
    
    uid = usuario["uid"]
    try:
        collection_ref = db.collection("designs").where("uid", "==", uid)
        docs = await anyio.to_thread.run_sync(collection_ref.get)
        
        disenos = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            disenos.append(d)
            
        # Ordenar por fecha de creación descendente
        disenos.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
        return disenos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener los diseños: {str(e)}")