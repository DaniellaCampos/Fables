import os
from fastapi import FastAPI, Depends
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

if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

# Conectar a la base de datos Firestore
db = firestore.client()

# Inicializar FastAPI (¡Solo una vez!)
app = FastAPI(title="Hackathon Backend - Creator's Closet")

# Configuración CORS para que React pueda comunicarse sin bloqueos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# 2. IMPORTACIONES LOCALES (Tus otros archivos)
# ---------------------------------------------------------
# ⚠️ IMPORTANTE: Si aún no has creado los archivos 'schemas.py' 
# y 'security.py', Python dará error aquí. 
from api.schemas import OnboardingData, ClosetRequest
from security import verificar_token


# ---------------------------------------------------------
# 3. RUTAS (Endpoints)
# ---------------------------------------------------------

# Endpoint de prueba para verificar que el servidor vive
@app.get("/")
def read_root():
    return {"status": "online", "mensaje": "Servidor listo y Firebase conectado"}


# RUTA 1: Guardar el ADN de la marca en Firestore
@app.post("/api/onboarding")
def guardar_onboarding(datos: OnboardingData, usuario: dict = Depends(verificar_token)):
    # usuario["uid"] contiene el ID único de Google del usuario
    uid = usuario["uid"]
    
    # Aquí guardas en Firestore (Descomentar cuando quieras probar la escritura)
    # db.collection("usuarios").document(uid).set(datos.dict())
    
    return {"mensaje": "ADN de marca guardado con éxito", "uid_procesado": uid}


# RUTA 2: El Armario (Aquí entrará el código de la Persona 1)
@app.post("/api/closet/generate")
def generar_contenido(peticion: ClosetRequest, usuario: dict = Depends(verificar_token)):
    uid = usuario["uid"]
    
    # 1. Leer el ADN de marca de Firestore usando el 'uid'
    # 2. Persona 1 entra aquí: Pasa el ADN + peticion a la API de IA (Gemini/Groq)
    # 3. Persona 1 entra aquí: Pasa la petición a Unsplash
    
    return {"mensaje": "Infraestructura lista. Esperando a que Persona 1 conecte la IA."}