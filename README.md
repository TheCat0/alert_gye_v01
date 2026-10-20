# alert_gye_v01
El proyecto busca desarrollar una campaña de concientización ciudadana para prevenir y reducir los riesgos asociados a las lluvias intensas y al fenómeno de El Niño en Guayaquil.

## Aplicación web

Implementación inicial de **Alerta Guayaquil**, basada en el plan estratégico facilitado en PDF. Interfaz adaptable, API HTTP y SQLite local, sin dependencias externas de ejecución.

### Requisitos y arranque

- Node.js 24 o superior con `node:sqlite` (validado con 24.19.0).
- Desde este directorio: `npm start`.
- Desarrollo con reinicio automático: `npm run dev`.
- Pruebas de API y persistencia: `npm test`.
- Puerto predeterminado: 3000. Configuración opcional: `PORT`, `HOST`, `DB_PATH`.
- No se requiere instalar paquetes ni claves para el flujo local.

SQLite se crea en `.data/reports.sqlite`, excluido de Git. Incluye las fotografías; conserva y respalda este archivo para mantener los datos. Las pruebas usan bases temporales independientes. No se incluyen reportes de ejemplo en la base de la aplicación.

### Funciones y conexiones

- `GET /api/health`: disponibilidad de la aplicación.
- `GET /api/reports`: reportes públicos sin el contenido de las imágenes.
- `POST /api/reports`: registra tipo, sector, descripción, coordenadas y fotografía opcional (JPG/PNG/WebP hasta 3 MB desde la interfaz). Estado inicial: pendiente.
- `GET /api/reports/:id/photo`: fotografía de un reporte.
- `GET /api/sources`: directorio de las cinco instituciones del proyecto, enlaces y estado de integración.

El formulario guarda reportes de forma persistente y actualiza el listado, los contadores y los marcadores. La geolocalización requiere permiso del navegador y HTTPS cuando se publica; también se admiten coordenadas manuales. El mapa es esquemático, no cartografía oficial ni herramienta de navegación.

Las fuentes INAMHI, Segura EP, ATM, Municipio de Guayaquil y SNGR se ofrecen como enlaces de consulta. **No hay conexión a sus sistemas, pronósticos ni alertas oficiales en tiempo real**: el documento no proporciona endpoints, acuerdos ni credenciales. Su estado se muestra explícitamente como pendiente de acceso autorizado. El tablero COE es una vista ciudadana de consulta; no implementa gestión institucional, verificación por operadores ni despacho de emergencias.

### Alcance antes de un lanzamiento público

Esta versión permite desarrollar y probar el flujo ciudadano. Un despliegue público requiere alojamiento HTTPS, controles contra abuso y moderación, autenticación y permisos para operadores, política de tratamiento y retención de datos e imágenes, copias de seguridad y acuerdos para las integraciones institucionales. Los reportes y las fotografías son públicos; el formulario advierte que no se incluyan datos personales. Ante una emergencia inmediata se debe llamar al ECU 911.

### Publicación en GitHub Pages

El flujo `.github/workflows/pages.yml` publica la versión informativa desde `main`. En **Settings → Pages**, selecciona **GitHub Actions**. Consulta [PUBLICAR.md](PUBLICAR.md) para los pasos y limitaciones. El sitio estático se genera con `npm run build:pages`; no recibe reportes ni conecta con SQLite. La aplicación completa se conserva para alojamientos con Node.js.

### Cartografía de Guayaquil

La página incorpora un visor externo de Bing Maps centrado en Guayaquil y un enlace para abrir el mapa en otra pestaña. El visor necesita acceso del navegador a los servicios de Microsoft; su disponibilidad depende del proveedor. No recibe coordenadas de los reportes ni muestra alertas institucionales. La vista esquemática de los reportes se mantiene separada. También se conserva el enlace de Microsoft facilitado por el usuario como referencia; su redirección no pudo verificarse desde el entorno.

### Servicio de Gestión de Riesgos

Se enlaza el servicio `SUSCEPT_INUNDACIONES_Z/MapServer` de `sgrportal.gestionderiesgos.gob.ec`, aportado por el usuario. La sección permite abrir su visor `?f=jsapi` dentro de un panel o en otra pestaña y consultar sus metadatos `?f=pjson`. El iframe solo se activa al desplegar el panel. No se descargan ni se reinterpretan capas; no se supone cobertura, fecha, leyenda ni estado de alerta sin consultar los metadatos del proveedor. La susceptibilidad territorial no representa una inundación actual. El entorno bloqueó la consulta de este host, por lo que la carga externa y la posibilidad de incrustación no se verificaron. El acceso directo sigue disponible si el proveedor restringe los iframes.

### Visor hidrometeorológico INAMHI

La sección INAMHI enlaza `https://inamhi.gob.ec/info/visor/` y permite intentar abrirlo bajo demanda dentro de la página. No se extraen mediciones ni se generan pronósticos. El proveedor controla sus datos, fechas y acceso. La consulta desde este entorno fue bloqueada; no se ha confirmado que permita incrustación. Si el visor no carga, se ofrece el enlace directo en otra pestaña. El directorio institucional apunta ahora a los visores proporcionados de INAMHI y SGR.

### Tráfico en vivo · Waze

La sección de movilidad incorpora el visor oficial `https://embed.waze.com/iframe`, centrado en Guayaquil (latitud -2.1894, longitud -79.8891, zoom 12). Se carga al desplegar el panel. El botón de Vía Perimetral conserva la dirección completa proporcionada por el usuario; también hay un enlace al mapa general de Waze. No se extraen datos ni se almacenan rutas. El contenido, su actualización y disponibilidad dependen de Waze y no representan una confirmación de seguridad ante inundaciones ni datos institucionales de ATM. El acceso externo está bloqueado en este entorno, por lo que no se ha verificado el contenido del proveedor; los enlaces directos son una alternativa a la incrustación.

### Presentación con 10 reportes simulados

GitHub Pages carga `public/demo-reports.json`: 10 casos ficticios de 10 sectores, con 4 pendientes, 3 verificados, 2 en atención y 1 resuelto, todos simulados. No son emergencias actuales, actividad ciudadana real, validación institucional ni resultados del proyecto. El aviso superior, cada fila y cada detalle identifican la demostración. El mapa y el listado se colocan antes de los visores externos y los filtros funcionan sobre ambos. No se inventan fotografías. Los datos nunca se insertan en SQLite ni se mezclan con reportes reales. Para presentar el mismo modo con el servidor local, agrega `?demo=1` a la dirección de la aplicación; sin ese parámetro el servidor conserva el flujo real. La versión estática permanece en modo demostración por defecto.

### Referencia periodística · El Heraldo

Se añadió el enlace aportado a `https://www.elheraldo.com.ec/inundaciones-en-guayaquil-por-fuertes-lluvias/`, en una sección de prensa independiente de los reportes ficticios y de las alertas. La consulta desde el entorno devolvió 403, por lo que no se extrajeron ni verificaron el texto, la fecha, los sectores ni las cifras. No se asignan coordenadas, estados de verificación ni vigencia al artículo, y no se incorpora a los contadores de reportes ciudadanos. Para añadir datos concretos con atribución, hace falta acceder al texto o recibirlo del usuario.

#### Datos de Tenguel incorporados del fragmento proporcionado

El usuario facilitó el texto con fecha de referencia 19 de octubre de 2026: cerca de 300 familias afectadas en Tenguel, parroquia rural de Guayaquil; viviendas anegadas y daños o pérdida de enseres. Se enumeran ocho recintos: San Francisco, La Floresta, Limonal, San Rafael, Nuevo Tenguel, 12 de Julio, 9 de Agosto y Virgen del Cisne. El texto atribuye la relación de sectores a Segura EP. Se conserva el enlace original de El Heraldo y la referencia relacionada de Ecuavisa a seis ríos y un estero desbordados en Guayas y El Oro, delimitando ese dato como regional. La fecha es la indicada por el usuario y no una fecha comprobada en el sitio. La plataforma atribuye estos hechos al fragmento recibido, sin afirmar verificación propia ni alerta vigente. No se agregan coordenadas, fotografías, reportes recibidos ni métricas de impacto de la aplicación. Las cifras y el listado están separados de los 10 casos ficticios, cuyos contadores no cambian.
