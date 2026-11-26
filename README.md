# Sitio personal de CV

Sitio de una sola página para Rafael Maldonado. HTML, CSS y JavaScript sin framework, compilación, backend ni dependencias de ejecución. El contenido está en inglés y se edita en [content.json](./content.json).

navegación superior, portada, tipografía Sora/Inter, tema claro, acento rojo, estadísticas, especialidades, trayectoria y credenciales. Incluye navegación móvil, progreso de lectura, selección automática de sección y apariciones al hacer scroll.

## Vista previa local

Desde la carpeta del proyecto, con Python 3 instalado:

~~~sh
python3 -m http.server 8000 --bind 127.0.0.1
~~~

Abre <http://127.0.0.1:8000/>. Detén el servidor con Ctrl+C.

Si tienes Ruby con WEBrick:

~~~sh
ruby -run -e httpd . -p 8000 -b 127.0.0.1
~~~

La carga de JSON requiere HTTP; al abrir el HTML mediante file:// aparece una indicación de usar un servidor. Si el navegador conserva estilos anteriores, realiza una recarga forzada con Cmd+Shift+R o Ctrl+Shift+R.

## Archivos

- [index.html](./index.html): estructura, navegación, portada, secciones y metadatos de respaldo.
- [content.json](./content.json): contenido del CV y textos de la portada.
- [script.js](./script.js): renderizado del contenido, validación básica, fechas, menú y seguimiento del scroll.
- [styles.css](./styles.css): colores, tipografía, distribución adaptable, foco, movimiento reducido e impresión.
- [favicon.svg](./favicon.svg): monograma RM con el borde rojo de la cabecera para la pestaña del navegador.
- [assets/](./assets/): badges originales Master y Expert proporcionados por el propietario.
- [output/pdf/rafael-maldonado-cv.pdf](./output/pdf/rafael-maldonado-cv.pdf): CV descargable con texto seleccionable, en una sola columna.
- [output/rafael-maldonado-cv.txt](./output/rafael-maldonado-cv.txt): versión de texto para extracción, ATS y herramientas de IA.
- [scripts/build-resume.mjs](./scripts/build-resume.mjs): genera ambas descargas desde el contenido del CV con Node.js y Google Chrome en macOS.
- [tests/smoke.html](./tests/smoke.html): comprobaciones ejecutables en el navegador, sin instalar herramientas.
- [tests/check-resume.py](./tests/check-resume.py): verifica texto, fechas, orden de lectura y enlaces del PDF y renderiza sus páginas; requiere PyMuPDF en Python.
- [robots.txt](./robots.txt): reservado para las decisiones pendientes sobre rastreo.
- [.gitignore](./.gitignore): exclusiones del sistema operativo.

## Contenido y fechas

Se incorporó el CV compartido por el propietario, junto con sus correcciones:

- Doce puestos en orden de finalización, del más reciente al más antiguo.
- Virtusa, AEM Architect: agosto–octubre de 2026, con salida el 30 de octubre. Impartió un programa de technical enablement de AEM Sites para AEM as a Cloud Service durante tres meses, dirigido a un equipo global de frontend developers.
- Perficient, Lead AEM Developer: mayo de 2025–agosto de 2026. Incluye EDS, Adobe App Builder e integraciones con múltiples API externas, especialmente Salesforce, además de componentes y pruebas automatizadas.
- Dos certificaciones de Adobe: Sites Architect (Master) y Sites Developer (Expert), renovadas en 2025 y vigentes hasta el 14 de agosto de 2027. Las tarjetas muestran la renovación y la vigencia; las fechas de emisión inicial verificadas en Adobe se conservan en el modelo de contenido. Los enlaces de verificación están incorporados.
- Especialidades y ejemplos de trabajo redactados a partir de los puestos documentados. El perfil abarca plataformas digitales, integraciones empresariales, enablement global, arquitectura de Anthropic y desarrollo asistido por Copilot.
- Estadísticas verificables: AEM desde 2012, doce puestos, dos certificaciones y gestión de hasta cuatro personas. No se inventan cifras de proyectos o resultados.

Se conservaron las fechas del documento, incluidos los períodos superpuestos. Los años de experiencia declarados por tecnología se sustituyeron por una lista de habilidades, para no publicar cifras que podrían estar desactualizadas.

Las fechas admiten año, mes o día: YYYY, YYYY-MM y YYYY-MM-DD. No completes días ni fechas de inicio desconocidos. Los meses se presentan en inglés; cuando se conoce el día, también se muestra. El valor ISO completo se conserva en el elemento time.

En las certificaciones, issuedDate conserva la emisión inicial, renewedDate registra la renovación confirmada por el propietario y expirationDate indica la vigencia del portal de Adobe. Cuando hay renovación se muestra Renewed; las certificaciones sin renovación mantienen Issued.

El campo badge contiene la ruta local de cada imagen en [assets/](./assets/). Se reutiliza en la portada y en la tarjeta de la certificación, junto a su nombre y especialidad.

Los datos opcionales desconocidos usan cadenas vacías o listas vacías. Las secciones de testimonios y publicaciones se ocultan mientras no contengan información. No se muestran imágenes, enlaces o textos de relleno. La portada usa un monograma porque todavía no se ha proporcionado una fotografía.

## Editar el CV

Edita [content.json](./content.json) y recarga la página. Mantén el formato JSON: comillas dobles y sin comentarios ni comas finales.

El modelo conserva las secciones page, hero, stats, skills, about, expertise, inDepth, experience, credentials, testimonials, writingCommunity, faq y contact.

- Mantén la experiencia ordenada de la más reciente a la más antigua y actualiza la estadística de puestos si agregas o eliminas uno.
- Usa únicamente información confirmada para descripciones, tecnologías, cifras y testimonios.
- Una fecha de inicio vacía se presenta como “Until” seguida de la fecha de salida.
- Cada habilidad tiene un nombre. Las áreas de especialidad añaden una lista de etiquetas.
- Los títulos de sección pueden llevar una etiqueta breve en eyebrow.
- El correo de contacto también alimenta el botón principal de la portada.
- Los enlaces externos solo admiten URL absolutas HTTP o HTTPS. El contenido se inserta como texto, sin interpretar HTML.
- Los enlaces de verificación de certificaciones se abren en una pestaña nueva con noopener y noreferrer, una indicación visual y una etiqueta accesible.

Después de editar datos del CV, regenera las descargas con Node.js y Google Chrome instalados en macOS:

~~~sh
node scripts/build-resume.mjs
~~~

El generador usa únicamente módulos estándar de Node y un perfil temporal de Chrome. No instala dependencias ni utiliza tu perfil personal. Incluye los doce puestos, fechas, habilidades y certificaciones desde el mismo JSON. Los archivos de [output/](./output/) deben publicarse junto al sitio; las comprobaciones detectan cambios del contenido que no se hayan reflejado en la versión de texto.

Las secciones opcionales mantienen bloques independientes en [index.html](./index.html) y [script.js](./script.js). Si quitas una sección incluida en la navegación, quita también su enlace.

## Diseño e interacción

La paleta y las familias tipográficas se definen al principio de [styles.css](./styles.css). El sitio utiliza exclusivamente el tema claro. Se retiraron el selector, el tema oscuro y la lógica que guardaba preferencias de tema.

Las certificaciones Master y Expert aparecen debajo del nombre en la portada, generadas desde los mismos datos de credenciales. El botón View credentials lleva a la sección destacada, situada inmediatamente después de Experience. La navegación sigue ese orden. Las tarjetas conservan la renovación de 2025, la vigencia y los enlaces de verificación en otra pestaña.

Sora e Inter se solicitan a Google Fonts. Si la conexión no está disponible, se utilizan fuentes del sistema. No hay analítica integrada.

El menú móvil expone su estado con aria-expanded, se cierra al elegir una sección y responde a Escape devolviendo el foco al botón. Las preguntas frecuentes usan details y summary nativos. Hay un enlace para saltar al contenido, estados de foco visibles y respeto por la preferencia de movimiento reducido.

La línea roja encima del menú indica el progreso de lectura. El enlace de la sección actual se marca con aria-current="location" al desplazarse; al llegar al final se selecciona Contact. Se actualiza también al cambiar el tamaño de la ventana y al abrir preguntas frecuentes.

El JSON se carga completo al abrir la página. Después, los bloques aparecen al entrar en pantalla mediante un fundido y un desplazamiento de 14 px durante 500 ms. Cada aparición ocurre una vez. La preferencia de movimiento reducido y la ausencia de IntersectionObserver mantienen el texto visible, y la impresión muestra todas las secciones. No se aplaza la carga del texto ni se incorporan librerías de animación.

Los enlaces a CSS y JavaScript incluyen una versión para que una recarga obtenga los recursos de esta revisión. Los datos JSON se revalidan en cada carga.

Los enlaces directos a secciones, como #experience, se posicionan después de cargar el JSON, para conservar el destino al recargar o abrir la página.

La portada ofrece Download CV (PDF) y Plain text (.txt). El PDF utiliza una sola columna, encabezados convencionales, texto real y enlaces de certificación visibles. La versión de texto conserva el mismo contenido y orden para facilitar su extracción por ATS y LLM. No se añaden instrucciones ocultas ni credenciales no obtenidas; el resultado de cada sistema de selección puede variar. Las descargas se generan desde [content.json](./content.json), sin incluir navegación, estadísticas o texto de preguntas frecuentes.

La hoja de impresión del sitio utiliza fondo blanco y omite navegación y elementos decorativos.

## Comprobaciones

Con el servidor local activo, abre [tests/smoke.html](./tests/smoke.html), por ejemplo <http://127.0.0.1:8000/tests/smoke.html>.

La página ejecuta comprobaciones sobre el sitio real dentro de un iframe:

- Carga del CV, doce puestos, dos certificaciones y fechas confirmadas.
- Ausencia de textos de relleno y enlaces de navegación rotos.
- Desbordamiento horizontal a 320, 390, 768 y 1280 px en el tema claro.
- Contraste del texto principal y secundario.
- Tema claro fijo, ausencia del selector y barra de progreso encima del menú.
- Contenido de Virtusa, EDS, App Builder, Salesforce, Copilot y arquitectura de Anthropic.
- Apertura del menú, cierre con Escape, retorno del foco y cierre al navegar.
- Apertura y cierre de preguntas frecuentes.
- Rechazo de enlaces inseguros, inserción segura de texto y validación de fechas.
- Manejo de errores al cargar datos y ausencia de duplicados al recargar.
- Correspondencia entre empleadores, cargos y descripciones del JSON y lo mostrado en la página.
- Progreso desde cero hasta el final y selección de cada sección al hacer scroll.
- Actualización del progreso al desplegar respuestas, apariciones únicas y contenido visible sin animaciones o sin IntersectionObserver.
- Cambios recibidos del JSON reflejados en la página.
- Apertura de enlaces directos a secciones después de cargar el contenido.
- Apertura de enlaces de certificación en otra pestaña y disponibilidad del favicon RM.
- Certificaciones destacadas en la portada, acceso directo y sección completa inmediatamente después de la experiencia.
- Carga de los badges Master y Expert y correspondencia con cada certificación en la portada y las tarjetas.
- Ubicación Mexico · Remote, AEMaaCS en el panel y descargas disponibles de PDF y texto.
- Correspondencia de la descarga de texto con el perfil, habilidades, doce puestos y certificaciones del JSON.

Estas comprobaciones no sustituyen una revisión visual ni una prueba en un teléfono real.

Para comprobar el PDF con PyMuPDF disponible, ejecuta `python3 tests/check-resume.py`. Compara el texto extraído con los datos originales, comprueba las etiquetas de estructura, el orden de los puestos y los enlaces de certificación. Guarda imágenes de las páginas en `tmp/pdfs/` para revisión visual; son archivos temporales.

## Habilitar GitHub Pages

La publicación queda a cargo del propietario:

1. Sube los archivos a la raíz de la rama que quieras publicar, normalmente main.
2. Abre Settings → Pages en el repositorio.
3. En Build and deployment selecciona Deploy from a branch.
4. Elige la rama y la carpeta raíz, y guarda.
5. Espera el despliegue y abre la URL que indique GitHub.

Las rutas relativas funcionan tanto en local como bajo la ruta de un repositorio de GitHub Pages. No hace falta compilación.

## Pendientes

- Fotografía y perfil de LinkedIn.
- Testimonios y publicaciones reales, si se quieren incluir.
- Tarea 5: acordar las medidas de privacidad y rastreo antes de publicar.
- Tarea 6: confirmar GoatCounter o Plausible antes de integrar analítica.
- Tarea 7: revisión final en dispositivos y publicación.

Las tareas originales 0–4 y la integración del contenido están implementadas. No se ha publicado el sitio ni se han integrado proveedores de analítica.
