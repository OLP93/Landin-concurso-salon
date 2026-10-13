import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageCard, PageShell } from "@/components/SiteChrome";
import { confirmarToken } from "@/lib/storage";

// Evita que el doble efecto de desarrollo muestre "ya confirmada" en la primera visita.
const cache = new Map<string, ReturnType<typeof confirmarToken>>();

export default function Confirmar({ token }: { token: string }) {
  const [r, setR] = useState<ReturnType<typeof confirmarToken> | null>(null);
  useEffect(() => {
    if (!cache.has(token)) cache.set(token, confirmarToken(token));
    setR(cache.get(token)!);
  }, [token]);
  return (
    <PageShell>
      {!r ? (
        <div className="mx-auto h-56 max-w-lg animate-pulse rounded-3xl bg-muted" aria-label="Cargando" />
      ) : r.estado === "confirmado" ? (
        <MessageCard title="¡Participación confirmada!" tone="success">
          <p>Gracias, {r.nombre}. Ya estás dentro del sorteo. Publicaremos el resultado en la web.</p>
          <Link to="/resultado" className="mt-4 inline-block text-primary underline underline-offset-4">Ver resultado</Link>
        </MessageCard>
      ) : r.estado === "ya-confirmado" ? (
        <MessageCard title="Ya estaba confirmada" tone="success">
          <p>Tu participación ya estaba confirmada. No necesitas hacer nada más. ¡Suerte!</p>
        </MessageCard>
      ) : (
        <MessageCard title="Enlace no válido">
          <p>Este enlace no es válido o ha caducado. Si crees que es un error, vuelve a inscribirte o escríbenos.</p>
          <Link to="/" className="mt-4 inline-block text-primary underline underline-offset-4">Volver al inicio</Link>
        </MessageCard>
      )}
    </PageShell>
  );
}
