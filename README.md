# Fables

A creative tech solution built for the Hackathon de Turismo Creativo Vol. 1. Developed by engineering minds from Key Institute, this project leverages software development, strategy, and design to generate a real-world impact in the tourism industry. This repository will host the core logic and technical documentation of our final product.

## Run Locally

To run the application locally, you will need to start both the backend server and the frontend dev server.

### 1. Start the Backend (Python FastAPI)

FastAPI runs on port `8000`. Make sure you have your virtual environment activated and run the following command:

```bash
uvicorn main:app --reload
```

*Note for Windows*: If your virtual environment is located at `.venv` and not currently activated in your terminal, you can start the server directly using:
```powershell
.venv\Scripts\uvicorn main:app --reload
```

### 2. Start the Frontend (React + Vite)

The frontend runs on port `5173`. Install the Node dependencies and start the dev server:

```bash
# Install dependencies (if you haven't already)
npm install

# Start the dev server
npm run dev
```

Open your browser at [http://localhost:5173](http://localhost:5173).
