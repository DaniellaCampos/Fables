# Fables

A creative tech solution built for the Hackathon de Turismo Creativo Vol. 1. Developed by engineering minds from Key Institute, this project leverages software development, strategy, and design to generate a real-world impact in the tourism industry. This repository will host the core logic and technical documentation of our final product.

## Run Locally

To run the application locally, you will need to start both the backend server and the frontend dev server.

### 1. Start the Backend (Python FastAPI)

FastAPI runs on port `8000`. Install Python dependencies and start the server:

```bash
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> **Importante:** usa `--host 0.0.0.0` si accedes al frontend por IP de red (ej. `http://10.74.10.88:5173`). Sin esto, el Armario no podrá conectar con la API.

También necesitas un archivo `.env` en la raíz con al menos `GROQ_API_KEY`, y `firebase_credenciales.json` para guardar el ADN de marca.

#### Variables de entorno del backend

| Variable | Requerida | Descripción |
|---|---|---|
| `GROQ_API_KEY` | Sí | API key para la generación de contenido con IA. |
| `UNSPLASH_ACCESS_KEY` | Sí | API key para las imágenes de referencia del Armario. |
| `HUBSPOT_TOKEN` | No | Habilita la sincronización de onboarding a HubSpot CRM. Si falta, el sync se omite silenciosamente. |
| `DEV_MODE` | No (default `false`) | Ver advertencia abajo. |

> ⚠️ **`DEV_MODE=true` es solo para desarrollo local en solitario, nunca para un ambiente compartido (demo, staging, producción, o cualquier máquina donde más de una persona pruebe la app).**
>
> Con `DEV_MODE=true`, `security.py` **se salta la verificación del token de Firebase** y responde a *toda* petición con el mismo usuario falso (`uid: "test_local_user"`). Esto significa que, si dos personas usan el backend al mismo tiempo con esta bandera activa, **ambas leen y escriben el mismo documento de Firestore** — es exactamente la clase de bug de "cruce de datos entre usuarios" que se corrigió en este proyecto (ver `AppContext.jsx`, `AppLayout.jsx`).
>
> Reglas de uso:
> - Déjala **sin definir** (o en `false`) en cualquier `.env` que se vaya a compartir, desplegar, o usar para pruebas con más de un usuario/cuenta.
> - Actívala únicamente en tu `.env` local, solo mientras trabajas offline sin credenciales reales de Firebase.
> - Nunca la definas a nivel de sistema/CI ni en el hosting — si el backend de producción arranca con `DEV_MODE=true`, todos los usuarios comparten sesión sin darse cuenta.

### 2. Start the Frontend (React + Vite)

The frontend runs on port `5173`. Install the Node dependencies and start the dev server:

```bash
# Install dependencies (if you haven't already)
npm install

# Start the dev server
npm run dev
```

Open your browser at [http://localhost:5173](http://localhost:5173).

### Acceso por red local

Si abres la app desde otro dispositivo o por IP (`http://10.74.10.88:5173`), el frontend intentará llamar a la API en `http://10.74.10.88:8000`. Ambos servidores deben estar corriendo en la misma máquina.
