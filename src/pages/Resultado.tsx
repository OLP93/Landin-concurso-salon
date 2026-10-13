import { useContest } from "@/hooks/use-contest";
import { MessageCard, PageShell } from "@/components/SiteChrome";
import { resultado } from "@/lib/draw";
import { enmascararCorreo, nombrePublico } from "@/lib/normalize";
import { formatearFecha } from "@/lib/contest";

export default function Resultado() {
  const s = useContest();
  if (!s.ready) return <PageShell><div className="mx-auto h-56 max-w-lg animate-pulse rounded-3xl bg-muted" /></PageShell>;
  if (s.sorteos.length === 0)
    return <PageShell><MessageCard title="El sorteo aún no se ha realizado"><p>Publicaremos aquí el resultado cuando se celebre.</p></MessageCard></PageShell>;
  const { ganadorId, suplentesIds } = resultado(s.sorteos);
  const byId = new Map(s.participantes.map((p) => [p.id, p]));
  const fmt = (id: string) => {
    const p = byId.get(id);
    return p ? `${nombrePublico(p.nombre)} · ${enmascararCorreo(p.correo)}` : "Participante";
  };
  return (
    <PageShell>
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-5xl font-semibold">Resultado del sorteo</h1>
        <p className="mt-2 text-sm text-muted-foreground">Celebrado el {formatearFecha(s.sorteos[0].fechaHora)} entre {s.sorteos[0].totalParticipantesElegibles} participaciones confirmadas.</p>
        <div className="mt-8 rounded-3xl border bg-card p-8 shadow-soft">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Ganadora</p>
          <p className="mt-2 font-display text-3xl font-semibold text-gold-gradient">{ganadorId && fmt(ganadorId)}</p>
          <p className="mt-1 text-sm text-muted-foreground">Premio: {s.concurso.premio}</p>
        </div>
        {suplentesIds.length > 0 && (
          <div className="mt-6 rounded-3xl border bg-card p-6 text-left shadow-card">
            <h2 className="text-2xl font-semibold">Suplentes</h2>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-muted-foreground">{suplentesIds.map((id) => <li key={id}>{fmt(id)}</li>)}</ol>
          </div>
        )}
      </div>
    </PageShell>
  );
}
