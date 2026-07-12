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
