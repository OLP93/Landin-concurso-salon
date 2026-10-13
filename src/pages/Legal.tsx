import { PageShell } from "@/components/SiteChrome";

function Aviso() {
  return (
    <p className="mb-8 rounded-2xl border-2 border-dashed border-gold bg-muted p-4 text-sm" role="note">
      <strong>Texto de ejemplo.</strong> Este documento debe ser revisado y adaptado por un profesional legal antes de publicar el concurso. Sustituye los marcadores entre corchetes.
    </p>
  );
}

export function BasesLegales() {
  return (
    <PageShell>
      <article className="legal-prose mx-auto max-w-3xl">
        <h1 className="mb-4 text-5xl font-semibold">Bases legales del concurso</h1>
        <Aviso />
        <h2>1. Organizador</h2>
        <p>El concurso lo organiza <strong>[NOMBRE DEL SALÓN]</strong>, con CIF <strong>[CIF]</strong> y domicilio en <strong>[DIRECCIÓN]</strong> (en adelante, «el Organizador»). Contacto: <strong>[EMAIL DE CONTACTO]</strong>.</p>
        <h2>2. Objeto</h2>
        <p>Promocionar los servicios del salón mediante el sorteo gratuito de un premio entre las personas participantes. La participación no exige compra.</p>
        <h2>3. Duración</h2>
        <p>El concurso estará abierto entre la fecha y hora de inicio y la fecha y hora de cierre indicadas en la página principal. No se aceptarán inscripciones fuera de ese periodo.</p>
        <h2>4. Requisitos</h2>
        <ul>
          <li>Personas físicas mayores de 18 años residentes en [PAÍS/ÁMBITO].</li>
          <li>Una única participación por dirección de correo electrónico.</li>
          <li>No pueden participar empleadas del salón ni sus familiares directos.</li>
        </ul>
        <h2>5. Mecánica</h2>
        <p>Para participar es necesario rellenar el formulario, aceptar estas bases y la política de privacidad, y confirmar la participación mediante el enlace enviado por correo. Las inscripciones no confirmadas no entran en el sorteo.</p>
        <h2>6. Premio</h2>
        <p>El premio es el indicado en la página principal. Es personal, no canjeable por dinero y deberá disfrutarse en [PLAZO] desde la comunicación al ganador, previa cita.</p>
        <h2>7. Selección del ganador y suplentes</h2>
        <p>Tras el cierre, el Organizador realizará un sorteo aleatorio entre las participaciones confirmadas mediante un sistema informático que registra la fecha, hora y número de participantes. Se extraerán además suplentes por orden. Si el ganador no responde en [X] días o no cumple los requisitos, el premio pasará al siguiente suplente.</p>
        <p>El resultado se publicará en la página «Resultado» mostrando el nombre y el correo parcialmente ocultos.</p>
        <h2>8. Protección de datos</h2>
        <p>Los datos se tratan conforme a la <a href="/privacidad" className="text-primary underline">política de privacidad</a>. El consentimiento para comunicaciones comerciales es opcional e independiente de la participación.</p>
        <h2>9. Aceptación y modificaciones</h2>
        <p>Participar implica aceptar estas bases. El Organizador podrá modificarlas o cancelar el concurso por causa justificada, comunicándolo en esta web.</p>
        <h2>10. Legislación aplicable</h2>
        <p>Estas bases se rigen por la legislación de [PAÍS]. Para cualquier controversia, los juzgados de [CIUDAD].</p>
      </article>
    </PageShell>
  );
}

export function Privacidad() {
  return (
    <PageShell>
      <article className="legal-prose mx-auto max-w-3xl">
        <h1 className="mb-4 text-5xl font-semibold">Política de privacidad</h1>
        <Aviso />
        <h2>Responsable del tratamiento</h2>
        <p><strong>[NOMBRE DEL SALÓN]</strong>, CIF <strong>[CIF]</strong>, <strong>[DIRECCIÓN]</strong>. Correo: <strong>[EMAIL DE CONTACTO]</strong>.</p>
        <h2>Datos que tratamos</h2>
        <p>Nombre, correo electrónico, teléfono (si lo facilitas), fecha de inscripción y tus elecciones de consentimiento.</p>
        <h2>Finalidades</h2>
        <ul>
          <li><strong>Gestión del concurso</strong> (obligatoria para participar): verificar tu inscripción, realizar el sorteo, contactar al ganador y suplentes y publicar el resultado de forma parcialmente anonimizada.</li>
          <li><strong>Comunicaciones comerciales</strong> (opcional): enviarte novedades y promociones del salón solo si marcas la casilla correspondiente. No marcarla no afecta a tu participación.</li>
        </ul>
        <h2>Base jurídica</h2>
        <p>Para el concurso, la ejecución de la relación derivada de aceptar las bases y tu consentimiento. Para comunicaciones comerciales, tu consentimiento expreso, que puedes retirar en cualquier momento.</p>
        <h2>Conservación</h2>
        <p>Los datos del concurso se conservarán hasta [X] meses tras su finalización. Los de comunicaciones, hasta que retires tu consentimiento.</p>
        <h2>Destinatarios</h2>
        <p>No cedemos tus datos a terceros salvo obligación legal o proveedores técnicos (por ejemplo, de envío de correo) con contrato de encargo de tratamiento.</p>
        <h2>Tus derechos</h2>
        <p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a <strong>[EMAIL DE CONTACTO]</strong>. También puedes reclamar ante la autoridad de control competente.</p>
        <h2>Cookies y almacenamiento local</h2>
        <p>Esta web usa almacenamiento local del navegador estrictamente necesario para funcionar (por ejemplo, recordar tu elección sobre cookies). No usamos cookies de publicidad ni de redes sociales. Puedes borrar estos datos desde la configuración de tu navegador.</p>
      </article>
    </PageShell>
  );
}
