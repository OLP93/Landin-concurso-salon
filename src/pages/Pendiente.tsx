import { Link } from "@tanstack/react-router";
import { MODO_DEMO } from "@/lib/config";
import { MessageCard, PageShell } from "@/components/SiteChrome";

export default function Pendiente({ token }: { token?: string | undefined }) {
  const enlace = MODO_DEMO && token ? `/confirmar/${token}` : null;
  return (
    <PageShell>
      <MessageCard title="Revisa tu correo y confirma tu participación">
        <p>Te hemos enviado un enlace de confirmación. Tu inscripción solo entra en el sorteo cuando la confirmas.</p>
        {enlace && (
          <div className="mt-6 rounded-2xl border-2 border-dashed border-gold bg-muted p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground">Modo demostración</p>
            <p className="mt-1 text-sm">En producción este enlace llegará por correo. Para probar el flujo, úsalo aquí:</p>
            <Link to="/confirmar/$token" params={{ token: token! }} className="mt-2 block break-all text-sm font-medium text-primary underline underline-offset-4">
              {typeof window !== "undefined" ? window.location.origin : ""}{enlace}
            </Link>
          </div>
        )}
      </MessageCard>
    </PageShell>
  );
}
