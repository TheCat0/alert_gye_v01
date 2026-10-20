# Publicar la aplicación web

## Estado actual

La aplicación funciona en el entorno de desarrollo. La configuración guardada permite preparar y arrancar futuras tareas. Publicar ese entorno no genera una URL pública para la página.

## Requisitos del alojamiento

- Node.js 24 o superior con `node:sqlite` y un proceso Node.js de larga duración.
- Almacenamiento persistente y escribible para el archivo SQLite (reportes y fotografías).
- HTTPS administrado por el alojamiento o un proxy inverso.
- Variable `PORT` indicada por el proveedor; la aplicación la utiliza automáticamente.

No es una página estática: GitHub Pages y los alojamientos exclusivamente estáticos no ejecutan la API ni SQLite. Una función efímera sin disco persistente tampoco conserva los reportes.

## Configuración de despliegue

1. Copiar el código de esta versión al servidor o al repositorio conectado al alojamiento. Los archivos de la aplicación todavía deben guardarse y subirse a Git si el despliegue se hace desde GitHub.
2. Seleccionar Node.js 24.19.0 o una versión compatible superior.
3. Comando de comprobación/preparación: `npm test`. No hay dependencias externas que instalar ni compilación.
4. Comando de arranque: `npm start`, desde la raíz del proyecto.
5. Configurar `HOST=0.0.0.0` y el `PORT` que suministre el proveedor.
6. Definir `DB_PATH` con una ruta absoluta dentro del volumen persistente, por ejemplo `/data/alerta/reports.sqlite`. El usuario del proceso necesita permisos de escritura. No usar una carpeta efímera.
7. Configurar comprobación de salud HTTP en `/api/health`, esperando código 200 y `{"ok":true}`.
8. Habilitar HTTPS y obtener la URL pública que asigne el proveedor. Comprobar la página, `/api/reports` y el registro de un reporte de prueba identificado como tal; confirmar persistencia después de un reinicio.

No deben copiarse claves a los archivos fuente. Las conexiones de datos institucionales siguen pendientes de endpoints y permisos: los enlaces de consulta no las sustituyen.

## Antes de admitir reportes del público

Esta versión es un prototipo funcional para desarrollo y piloto. Quedan pendientes autenticación y permisos de operadores, moderación y controles contra abuso, política de privacidad y retención, copias de seguridad y gestión institucional. Los reportes y las fotografías son públicos. El mapa es esquemático y no hay alertas oficiales en tiempo real ni despacho de emergencias.

La URL solo se puede generar al desplegar en un alojamiento concreto con acceso autorizado. No se ha efectuado ese despliegue ni se ha configurado un dominio.

## Publicación directamente en GitHub Pages

Se incluye `.github/workflows/pages.yml`. Al subir los archivos a `main`, este flujo ejecuta las pruebas, genera `dist/` y publica la versión informativa.

En GitHub, abre el repositorio **TheCat0/alert_gye_v01**, entra a **Settings → Pages** y selecciona **GitHub Actions** como origen. Luego revisa **Actions → Publicar en GitHub Pages**. Si el primer intento ocurrió antes de activar Pages, vuelve a ejecutar el flujo con **Run workflow**.

La dirección esperada para este repositorio, si no hay un dominio personalizado, es `https://thecat0.github.io/alert_gye_v01/`. Esa dirección solo estará activa después de que GitHub confirme el despliegue; no es prueba de publicación por sí sola. El enlace confirmado aparece en el resultado del despliegue del flujo.

Para preparar el mismo sitio manualmente: `npm run build:pages`. La carpeta `dist/` solo contiene recursos públicos; no contiene SQLite, fotografías ni el servidor.

GitHub Pages muestra prevención, el mapa esquemático y las fuentes oficiales. Identifica claramente la versión como informativa y desactiva los reportes y sus contadores, porque Pages no ejecuta Node.js ni SQLite. La aplicación completa sigue disponible mediante `npm start` en un alojamiento compatible.
