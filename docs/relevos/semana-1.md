# Semana 1 -- Arreglar main

**Responsable:** Verónica
**Fechas:** 28 sep - 4 oct
**PR:** #[pendiente]

## Qué terminé
- Resolví el conflicto de merge sin resolver en `src/components/AppLayout.jsx` (venía del merge 8195a8f "Plan de precios"). `main` no compilaba por eso.
- Restauré el enlace "Mi plan" (ícono Wallet, ruta `/mi-plan`) en el menú lateral.
- Verifiqué que no quedan marcas de conflicto en el repo, que la ruta `/mi-plan` existe en `src/App.jsx` y que `npm install` + `npm run build` terminan sin errores.

## Qué quedó a medias
- Nada de esta semana. Quedan pendientes las 5 ramas viejas sin PR (ver abajo).

## Variables de entorno nuevas o cambiadas
Ninguna.

## Cómo probarlo
1. `npm install` y `npm run dev`.
2. Iniciar sesión y entrar a la app.
3. Verificar que "Mi plan" aparece en el menú lateral y lleva a `/mi-plan`.
4. Verificar que "Cerrar sesión" cierra la sesión de verdad y regresa a `/login`.
5. En vista móvil, la barra inferior debe mostrar solo Inicio, Crear y Mi marca.

## Cosas que la siguiente persona debe saber
- **Versión del conflicto elegida:** la del commit 2237958 ("mejoramiento del login"), porque usa `logout()` del contexto (`useApp`) y cierra la sesión de verdad. La versión HEAD solo hacía `nav('/login')`. Esa versión no tenía "Mi plan", así que se restauró aparte en un segundo commit.
- **Ramas viejas sin PR:** existen 5 ramas sin PR (`feature/ensamblaje-motores`, `feature/infraestructura-base`, `feature/psicoanalisis-marca`, `freature/ia-y-datos`, `frontEnd-avances`). No se tocaron. El equipo debe decidir qué hacer con ellas.
- **"Mi plan" oculto en la barra móvil:** se decidió ocultarlo en la barra inferior móvil (filtro `i!==2&&i!==4`) para que móvil siga mostrando solo Inicio, Crear y Mi marca. En escritorio sí aparece en el menú lateral.
- `AppLayout.jsx` está minificado en una sola línea; se dejó así a propósito para mantener el diff pequeño.
