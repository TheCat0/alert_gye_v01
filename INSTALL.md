# Instalación de Alerta Guayaquil

## 1. Preparar Node.js

Instala Node.js 24 LTS, que incluye npm y SQLite integrado, desde https://nodejs.org/ si tu equipo todavía no lo tiene. La aplicación se ha validado con Node.js 24.19.0.

Comprueba la instalación:

```bash
node --version
npm --version
node -e "require('node:sqlite'); console.log('SQLite disponible')"
```

No hace falta instalar un servidor de base de datos ni ejecutar `npm install`: esta versión no usa paquetes externos.

## 2. Entrar al proyecto

En este entorno en la nube el repositorio ya está disponible:

```bash
cd /workspace/alert_gye_v01
```

Para instalarlo en otro equipo con Git y acceso al repositorio:

```bash
git clone https://github.com/TheCat0/alert_gye_v01.git
cd alert_gye_v01
```

Usa una versión del repositorio que contenga `package.json`, `server.js` y `public/`. Los archivos creados en este entorno deben guardarse en Git y subirse al repositorio para que estén disponibles al clonarlo en otro equipo.

## 3. Comprobar el funcionamiento

Desde la carpeta del proyecto:

```bash
npm test
```

La prueba comprueba la API, validación de reportes, fotografías y persistencia tras reiniciar. Usa una base temporal y no modifica los reportes de la aplicación.

## 4. Iniciar la aplicación

```bash
npm start
```

El puerto predeterminado es **3000**. Mantén este proceso activo; usa **Ctrl+C** para detenerlo. Para desarrollo con reinicio al editar archivos:

```bash
npm run dev
```

En este entorno, comprueba el servicio desde otra terminal:

```bash
curl --fail http://127.0.0.1:3000/api/health
curl --fail http://127.0.0.1:3000/api/reports
```

La primera petición debe devolver `{"ok":true}`. La segunda devuelve una lista JSON, inicialmente `[]` si no hay reportes.

## 5. Configuración opcional

No se necesitan claves ni variables para iniciar el flujo local. En Bash puedes cambiar el puerto:

```bash
PORT=3001 npm start
```

Variables admitidas:

| Variable | Valor predeterminado | Función |
| --- | --- | --- |
| `PORT` | `3000` | Puerto HTTP |
| `HOST` | `0.0.0.0` | Interfaz de escucha |
| `DB_PATH` | `.data/reports.sqlite` dentro del proyecto | Archivo SQLite persistente |

Ejemplo con almacenamiento fuera del repositorio; el directorio debe permitir escritura:

```bash
DB_PATH=/workspace/alerta-datos/reports.sqlite npm start
```

Las variables se pasan al proceso; la aplicación no carga archivos `.env` automáticamente.

## 6. Conservar los datos

La aplicación crea el archivo SQLite al arrancar. No lo elimines al actualizar el código: contiene reportes y fotografías. Para una copia sencilla y consistente, detén el servicio y copia el archivo a un destino seguro; luego reinicia el servicio. No lo guardes en Git.

## 7. Entorno en la nube y conexiones

Las instrucciones de preparación y arranque se guardan en la configuración del entorno. Revísalas y guarda los cambios en los ajustes; después publica el entorno. Los procesos deben iniciarse de nuevo en futuras tareas cuando sea necesario.

Las instituciones figuran como enlaces de consulta. Las conexiones de datos con INAMHI, Segura EP, ATM, Municipio de Guayaquil y SNGR requieren endpoints y acceso autorizado; no se activan durante esta instalación. El mapa es esquemático. Consulta README.md para el alcance de la versión y los requisitos previos a un lanzamiento público.
