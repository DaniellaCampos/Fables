# Semana 3 -- Limpiar el repo

**Responsable:** Daniela
**Fechas:** 12 - 18 oct (hecha el 7 nov por el atraso del relevo)
**Rama:** `semana-3`
**PR:** #8

## Qué terminé
- Moví los mockups de Stitch a `docs/diseno/`:
  - `Creator/` → `docs/diseno/Creator/`
  - `Dashboard/` → `docs/diseno/Dashboard/`
  - `OnBoarding/` → `docs/diseno/OnBoarding/`
  - `Upload-Images/` → `docs/diseno/Upload-Images/`
  - `login/` → `docs/diseno/login/`
- Actualicé `eslint.config.js`: antes ignoraba cada carpeta de mockups por nombre, ahora ignora `docs`.
- Borré `old/` (versión vieja de `forecast_service.py` y su prueba) y `liquid-glass-concept.html`. Ningún archivo los importaba. Si se necesitan, siguen en el historial de git.
- Moví los scripts de prueba manual a `scripts/`: `test_endpoint.py`, `test_ia.py`, `test_services_async.py` y `test_unsplash.py`.
- Borré `REFACTORING_SUMMARY.md`, que describía componentes que ya no existen (por ejemplo `FixedDesignCanvas`).
- Antes de mover o borrar, busqué referencias en todo el código. La única era la lista de ignores de ESLint.
- Ahora la raíz solo tiene código, configuración y el README.

## Qué quedó a medias
- Nada de esta semana.

## Variables de entorno nuevas o cambiadas
Ninguna.

## Cómo probarlo
1. `npm run build`. Debe terminar con `built in`.
2. `npm run lint`. Da 0 errores y 3 avisos de hooks (ver abajo).
3. `python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000` y abrir `http://localhost:8000/`. Debe responder `"status": "online"`.

## Cosas que la siguiente persona debe saber
- `scripts/test_services_async.py` importa `api` y `services`, así que se corre desde la raíz del repo como módulo: `python -m scripts.test_services_async`. Los otros scripts se pueden correr directo con `python scripts/<archivo>.py`.
- Los 3 avisos de `npm run lint` (en `CategoryBottomBar.jsx`, `AppContext.jsx` y `Closet.jsx`) son los de la semana 5. No los toqué.
- Confirmado: la protección de rama en `main` está activa. El PR #7 pedía una aprobación antes de poder hacer merge.
