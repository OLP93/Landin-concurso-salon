# Dream Sparkle Draw

Crea una aplicación React (Vite + TypeScript + Tailwind + shadcn/ui) llamada "Concurso del Salón": landing de concurso con inscripción, doble validación por correo y panel de sorteo para un salón de uñas de dos técnicas que quiere captar contactos de forma transparente. Todo el contenido en español. SIN backend: toda la persistencia en localStorage (envuelve el acceso en un módulo `storage` con funciones tipadas). Sin integración con redes sociales. Rendimiento: carga en menos de 2 s en móvil (rutas con lazy loading, fuentes con display=swap, sin imágenes pesadas, SVG/CSS para decoración).

DISEÑO
Estético y cuidado acorde a un salón de uñas: paleta cálida/rosada (rosa empolvado, nude, crema, toques de dorado rosado), tipografía elegante (serif display tipo Cormorant Garamond o Playfair para títulos + sans suave tipo Inter/DM Sans para texto), mobile-first, bordes redondeados, sombras suaves, sensación de confianza. Define los colores como tokens en el sistema de diseño (index.css / tailwind config), no hardcodees colores en componentes.

RUTAS / PANTALLAS
1. `/` Landing: hero con el premio, sección "Cómo participar" (mecánica en 3 pasos: inscríbete, confirma tu correo, espera el sorteo), fechas de inicio y cierre bien visibles con cuenta atrás, enlace a bases legales, y formulario de inscripción con campos "Nombre", "Correo electrónico", "Teléfono (opcional)", casilla obligatoria "He leído y acepto las bases legales y la política de privacidad" (con enlaces) y casilla SEPARADA y no premarcada "Acepto recibir comunicaciones del salón". Botón "Participar". Validación con zod + react-hook-form; mensajes de error claros. Si el concurso aún no empezó o ya cerró (ahora >= fechaCierre), el formulario se deshabilita/oculta y muestra "Las inscripciones están cerradas" (o "Aún no han empezado"). La comprobación debe hacerse también en el momento de enviar, no solo al renderizar, y re-evaluarse periódicamente (setInterval) para cerrarse automáticamente al llegar fechaCierre. Además el admin puede cerrar/abrir manualmente.
2. `/pendiente` Confirmación pendiente: mensaje "Revisa tu correo y confirma tu participación". Como el envío de correo real lo conectará después Kodarvia, en modo demo muestra un recuadro claramente rotulado "Modo demostración" con el enlace de confirmación generado (para poder probar el flujo) y un aviso de que en producción llegará por correo.
3. `/confirmar/:token` Página de confirmación: busca el participante por tokenConfirmacion, marca confirmado=true y muestra "¡Participación confirmada!". Si el token es inválido o ya fue usado, mensaje amable. Es idempotente.
4. `/resultado` Página pública de resultado: solo visible tras realizarse al menos un sorteo; antes muestra "El sorteo aún no se ha realizado". Muestra ganador y suplentes (por privacidad, muestra nombre y correo parcialmente enmascarado, p. ej. "Ana G. · a***@gmail.com").
5. `/bases-legales` y `/privacidad`: páginas completas con texto de ejemplo realista (organizador, objeto, duración, requisitos, mecánica, premio, selección del ganador y suplentes, protección de datos, finalidades separadas: gestión del concurso vs. comunicaciones comerciales opcionales, base jurídica, conservación, derechos de acceso/rectificación/supresión/oposición, contacto, uso de cookies). Deja marcadores claros tipo [NOMBRE DEL SALÓN], [CIF], [DIRECCIÓN], [EMAIL DE CONTACTO] y una nota visible de que deben ser revisados por un profesional legal antes de publicar.
6. `/admin` Panel protegido: pantalla de acceso con contraseña (demo: constante configurable en un único archivo, valor inicial "salon-admin", sesión en sessionStorage; indica claramente en el panel que es protección básica de demostración y que para producción hace falta autenticación real). Contenido: 
   - Resumen: total inscritos, confirmados, no confirmados, estado de inscripciones (abiertas/cerradas) con interruptor.
   - Edición del concurso: premio, fechaInicio, fechaCierre (fecha y hora), premio.
   - Tabla de participantes (nombre, correo, teléfono, confirmado, acepta comunicaciones, fecha de inscripción) con filtro Todos / Confirmados / No confirmados y búsqueda por nombre/correo. Tarjetas en móvil en lugar de tabla ancha.
   - Botón "Exportar CSV" (todas las columnas relevantes, respetando el filtro activo, con BOM UTF-8 y escape correcto de comillas/comas; protege contra inyección de fórmulas prefijando con apóstrofo valores que empiecen por = + - @).
   - Botón "Seleccionar ganador": elige al azar entre participantes confirmados y no elegidos antes en el mismo ciclo, usando crypto.getRandomValues. Registra un Sorteo con id, fechaHora, totalParticipantesElegibles, ganadorId y suplentesIds[]. Permite repetir para generar suplentes (cada repetición añade un registro nuevo y NUNCA borra los anteriores; el primer sorteo define el ganador oficial y los siguientes aportan suplentes, excluyendo a quienes ya salieron). Confirmación antes de sortear. Si no hay confirmados elegibles, mensaje de error.
   - Registro de sorteos realizados (historial inmutable, más reciente arriba).
   - Editor de plantillas de correo: "Confirmación" (con variables {{nombre}} y {{enlace_confirmacion}}) y "Aviso al ganador" (con {{nombre}} y {{premio}}), con vista previa y botón de restaurar por defecto. Nota visible: "El envío de correos lo conectará Kodarvia"; deja una función `sendEmail(template, to, vars)` aislada en `src/lib/email.ts` que ahora solo hace console.info/simula y es el único punto a reemplazar.

MODELO DE DATOS (localStorage, claves con prefijo `salon.`)
- Participante: id, nombre, correo (normalizado: trim, minúsculas y SIN ningún espacio; único), telefono (opcional), aceptaBases (bool), aceptaComunicaciones (bool, campo independiente guardado por separado), confirmado (bool, false al inscribirse), tokenConfirmacion (aleatorio con crypto.randomUUID), fechaInscripcion (ISO).
- Concurso: fechaInicio, fechaCierre (fecha/hora ISO), premio, además de `inscripcionesAbiertasManual` (bool) para el interruptor del admin. Valores iniciales: inicio = hoy, cierre = hoy + 30 días, premio de ejemplo "Manicura completa + diseño de uñas para ti y una amiga".
- Sorteo: id, fechaHora, totalParticipantesElegibles, ganadorId, suplentesIds[] (cada registro guarda el resultado de esa extracción; el registro de ganador y suplentes se deriva de la secuencia).
- Plantillas de correo: confirmacion y ganador (asunto + cuerpo).

CRITERIOS DE ACEPTACIÓN (impleméntalos todos y respétalos estrictamente)
- Un correo solo puede inscribirse una vez: normaliza a minúsculas y sin espacios ANTES de comprobar duplicado y rechaza repetidos con mensaje claro (sin revelar datos del otro participante).
- Una inscripción con confirmado=false no entra en el sorteo ni cuenta como participante elegible (los contadores públicos y el sorteo usan solo confirmados).
- Las inscripciones se cierran automáticamente al llegar fechaCierre: el formulario deja de aceptar envíos (validar también en el submit).
- La selección de ganador es aleatoria entre confirmados y registra fechaHora, total de participantes elegibles y resultado; se puede repetir para suplentes sin perder el registro anterior.
- El permiso de comunicaciones se guarda en un campo independiente del consentimiento de bases; aceptaBases es obligatorio, aceptaComunicaciones es opcional y por defecto desmarcado.
- Exportación de participantes a CSV desde el panel.
- Banner de aviso de cookies (aceptar / solo necesarias, preferencia guardada en localStorage, enlace a política de privacidad) y footer en todas las páginas con enlaces a Bases legales y Política de privacidad.
- Carga rápida en móvil (<2 s).
- Proyecto transferible en Lovable con URL de previsualización funcionando.

CALIDAD
Accesibilidad (labels, aria, foco visible, contraste suficiente), estados vacíos y de error cuidados, textos en español neutro y cercano, página 404 con el mismo estilo, `<title>` y meta descripción adecuados. Incluye un botón discreto en el admin para "Restablecer datos de demostración". Código organizado: `src/lib/` (storage, normalización, sorteo, csv, email), `src/pages/`, `src/components/`, y hooks para estado del concurso.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a371f1bc-9d0d-470c-afd8-13c44f30d4df).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
