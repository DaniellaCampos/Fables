# Semana 2 -- Dependencias y reglas

**Responsable:** Monica
**Fechas:** 5 - 11 oct
**Rama:** `semana-2`
**PR:** #[pendiente]

## Qué terminé
- Reemplacé cada `"latest"` de `package.json` por la versión exacta que aparece en `package-lock.json` (React 19.2.7, React Router 7.18.1, Vite 8.1.4, ESLint 10.7.0, entre otras).
- Quité `typescript` de las dependencias. Estaba instalado pero no se usaba en el proyecto.
- Verifiqué que borrar `node_modules`, correr `npm install` y luego `npm run build` termina sin errores.

## Qué quedó a medias
- La protección de rama en `main` (exigir Pull Request) se configura desde GitHub: Settings → Branches. Falta confirmar que quedó activa y que un push directo a `main` es rechazado.

## Variables de entorno nuevas o cambiadas
Ninguna.

## Cómo probarlo
1. Borrar la carpeta `node_modules`.
2. `npm install`.
3. `npm run build`. Debe terminar con `built in`.

## Regla nueva: no más cambios directos a `main`
- **Ya no se debe hacer push directo a `main`.** Todo cambio entra por Pull Request.
- Flujo de trabajo:
  1. Crear una rama desde `main` (por ejemplo `semana-3`).
  2. Hacer los commits en esa rama y subirla con `git push -u origin <rama>`.
  3. Abrir un Pull Request hacia `main` en GitHub.
  4. Esperar la revisión y la aprobación antes de hacer merge.
- Una vez activa la protección, `git push origin main` debe ser rechazado por GitHub.

## Cosas que la siguiente persona debe saber
- Las dependencias ya no usan `latest`. Para actualizar una, cambia la versión a mano en `package.json` y corre `npm install` para regenerar el lock.
- `typescript` se quitó porque el proyecto está escrito en JavaScript. Si alguien lo quiere usar después, hay que agregarlo otra vez de forma explícita.
