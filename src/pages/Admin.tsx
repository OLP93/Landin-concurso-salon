import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageShell } from "@/components/SiteChrome";
import { useContest } from "@/hooks/use-contest";
import { ADMIN_PASSWORD, MODO_DEMO } from "@/lib/config";
import { formatearFecha, isoALocal } from "@/lib/contest";
import { descargarCsv, participantesACsv } from "@/lib/csv";
import { elegibles, resultado } from "@/lib/draw";
import { renderPlantilla } from "@/lib/email";
import { PLANTILLAS_POR_DEFECTO, sortear, storage } from "@/lib/storage";
import type { Concurso, Participante, Plantillas } from "@/lib/types";

const SESSION_KEY = "salon.admin";

export default function Admin() {
  const [auth, setAuth] = useState<boolean | null>(null);
  useEffect(() => setAuth(sessionStorage.getItem(SESSION_KEY) === "1"), []);
  if (auth === null) return <PageShell><div className="h-40" /></PageShell>;
  if (!auth) return <Login onOk={() => { sessionStorage.setItem(SESSION_KEY, "1"); setAuth(true); }} />;
  return <Panel onLogout={() => { sessionStorage.removeItem(SESSION_KEY); setAuth(false); }} />;
}

function Login({ onOk }: { onOk: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  return (
    <PageShell>
      <form className="mx-auto max-w-sm rounded-3xl border bg-card p-8 shadow-soft" onSubmit={(e) => { e.preventDefault(); if (pw === ADMIN_PASSWORD) onOk(); else setErr(true); }}>
        <h1 className="text-3xl font-semibold">Panel del salón</h1>
        <Label htmlFor="pw" className="mt-6 block">Contraseña</Label>
        <Input id="pw" type="password" className="mt-1 h-11" value={pw} onChange={(e) => { setPw(e.target.value); setErr(false); }} aria-invalid={err} aria-describedby={err ? "pw-err" : undefined} />
        {err && <p id="pw-err" role="alert" className="mt-1 text-sm text-destructive">Contraseña incorrecta.</p>}
        <Button type="submit" className="mt-4 w-full rounded-full">Entrar</Button>
        <p className="mt-4 text-xs text-muted-foreground">Protección básica de demostración.</p>
      </form>
    </PageShell>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-3xl border bg-card p-5 shadow-card sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Panel({ onLogout }: { onLogout: () => void }) {
  const s = useContest();
  if (!s.ready) return <PageShell><div className="h-40 animate-pulse rounded-3xl bg-muted" /></PageShell>;
  const confirmados = s.participantes.filter((p) => p.confirmado).length;
  const abiertas = s.estado === "abierto";
  return (
    <PageShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-semibold">Panel del concurso</h1>
        <Button variant="outline" size="sm" onClick={onLogout}>Cerrar sesión</Button>
      </div>
      <p className="mb-6 rounded-2xl border-2 border-dashed border-gold bg-muted p-3 text-sm" role="note">
        Protección básica de demostración (contraseña en el navegador). Para producción hace falta autenticación real en servidor.
      </p>
      <div className="space-y-6">
        <Section title="Resumen">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["Inscritos", s.participantes.length], ["Confirmados", confirmados], ["Sin confirmar", s.participantes.length - confirmados]].map(([l, v]) => (
              <div key={l} className="rounded-2xl bg-muted p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="font-display text-3xl font-semibold">{v}</p></div>
            ))}
            <div className="rounded-2xl bg-muted p-4">
              <p className="text-xs text-muted-foreground">Inscripciones</p>
              <p className={`font-semibold ${abiertas ? "text-success" : "text-destructive"}`}>
                {abiertas ? "Abiertas" : s.estado === "no-iniciado" ? "Aún no empiezan" : s.estado === "cerrado" ? "Cerradas (fecha)" : "Cerradas (manual)"}
              </p>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <Switch checked={s.concurso.inscripcionesAbiertasManual} onCheckedChange={(v) => storage.setConcurso({ ...s.concurso, inscripcionesAbiertasManual: v })} aria-label="Permitir inscripciones" />
                Permitir
              </label>
            </div>
          </div>
        </Section>
        <EditConcurso concurso={s.concurso} />
        <Participantes participantes={s.participantes} />
        <SorteoSection participantes={s.participantes} sorteos={s.sorteos} />
        <PlantillasEditor plantillas={s.plantillas} premio={s.concurso.premio} />
        {MODO_DEMO && <div className="text-right">
          <Confirm title="¿Restablecer datos de demostración?" desc="Se borrarán participantes, sorteos, plantillas y ajustes del concurso de este navegador." onConfirm={() => { storage.resetDemo(); toast.success("Datos restablecidos"); }}>
            <Button variant="ghost" size="sm" className="text-muted-foreground">Restablecer datos de demostración</Button>
          </Confirm>
        </div>}
      </div>
    </PageShell>
  );
}

function Confirm({ title, desc, onConfirm, children }: { title: string; desc: string; onConfirm: () => void; children: React.ReactNode }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{desc}</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={onConfirm}>Confirmar</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function EditConcurso({ concurso }: { concurso: Concurso }) {
  const [premio, setPremio] = useState(concurso.premio);
  const [ini, setIni] = useState(isoALocal(concurso.fechaInicio));
  const [fin, setFin] = useState(isoALocal(concurso.fechaCierre));
  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    const a = new Date(ini), b = new Date(fin);
    if (!premio.trim()) { toast.error("El premio no puede estar vacío."); return; }
    if (isNaN(a.getTime()) || isNaN(b.getTime())) { toast.error("Fechas no válidas."); return; }
    if (b <= a) { toast.error("La fecha de cierre debe ser posterior a la de inicio."); return; }
    storage.setConcurso({ ...storage.getConcurso(), premio: premio.trim().slice(0, 200), fechaInicio: a.toISOString(), fechaCierre: b.toISOString() });
    toast.success("Concurso actualizado");
  };
  return (
    <Section title="Datos del concurso">
      <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><Label htmlFor="premio">Premio</Label><Input id="premio" className="mt-1" value={premio} maxLength={200} onChange={(e) => setPremio(e.target.value)} /></div>
        <div><Label htmlFor="ini">Inicio (fecha y hora)</Label><Input id="ini" type="datetime-local" className="mt-1" value={ini} onChange={(e) => setIni(e.target.value)} /></div>
        <div><Label htmlFor="fin">Cierre (fecha y hora)</Label><Input id="fin" type="datetime-local" className="mt-1" value={fin} onChange={(e) => setFin(e.target.value)} /></div>
        <div className="sm:col-span-2"><Button type="submit" className="rounded-full">Guardar cambios</Button></div>
      </form>
    </Section>
  );
}

type Filtro = "todos" | "confirmados" | "pendientes";

function Participantes({ participantes }: { participantes: Participante[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [q, setQ] = useState("");
  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return participantes
      .filter((p) => filtro === "todos" || (filtro === "confirmados" ? p.confirmado : !p.confirmado))
      .filter((p) => !t || p.nombre.toLowerCase().includes(t) || p.correo.includes(t))
      .sort((a, b) => b.fechaInscripcion.localeCompare(a.fechaInscripcion));
  }, [participantes, filtro, q]);
  const yn = (b: boolean) => (b ? "Sí" : "No");
  return (
    <Section
      title="Participantes"
      action={<Button variant="outline" size="sm" onClick={() => descargarCsv(`participantes-${filtro}.csv`, participantesACsv(lista))}>Exportar CSV</Button>}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div role="group" aria-label="Filtro" className="flex gap-1 rounded-full bg-muted p-1">
          {(["todos", "confirmados", "pendientes"] as Filtro[]).map((f) => (
            <button key={f} type="button" aria-pressed={filtro === f} onClick={() => setFiltro(f)} className={`rounded-full px-3 py-1.5 text-sm ${filtro === f ? "bg-card font-medium shadow-card" : "text-muted-foreground"}`}>
              {f === "todos" ? "Todos" : f === "confirmados" ? "Confirmados" : "No confirmados"}
            </button>
          ))}
        </div>
        <Input placeholder="Buscar por nombre o correo" aria-label="Buscar participantes" value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" />
      </div>
      {lista.length === 0 ? (
        <p className="rounded-2xl bg-muted p-6 text-center text-muted-foreground">No hay participantes que coincidan.</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground"><tr>{["Nombre", "Correo", "Teléfono", "Confirmado", "Comunicaciones", "Inscripción"].map((h) => <th key={h} className="px-2 py-2 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {lista.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-2 py-2">{p.nombre}</td><td className="px-2 py-2">{p.correo}</td><td className="px-2 py-2">{p.telefono ?? "—"}</td>
                    <td className={`px-2 py-2 ${p.confirmado ? "text-success" : "text-muted-foreground"}`}>{yn(p.confirmado)}</td>
                    <td className="px-2 py-2">{yn(p.aceptaComunicaciones)}</td><td className="px-2 py-2">{formatearFecha(p.fechaInscripcion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-3 md:hidden">
            {lista.map((p) => (
              <li key={p.id} className="rounded-2xl border p-4 text-sm">
                <p className="font-medium">{p.nombre}</p><p className="break-all text-muted-foreground">{p.correo}</p>
                {p.telefono && <p className="text-muted-foreground">{p.telefono}</p>}
                <p className="mt-2 text-xs">Confirmado: <b>{yn(p.confirmado)}</b> · Comunicaciones: <b>{yn(p.aceptaComunicaciones)}</b></p>
                <p className="text-xs text-muted-foreground">{formatearFecha(p.fechaInscripcion)}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </Section>
  );
}

function SorteoSection({ participantes, sorteos }: { participantes: Participante[]; sorteos: ReturnType<typeof storage.getSorteos> }) {
  const pool = elegibles(participantes, sorteos);
  const byId = new Map(participantes.map((p) => [p.id, p]));
  const nombre = (id: string) => { const p = byId.get(id); return p ? `${p.nombre} (${p.correo})` : "Participante eliminado"; };
  const res = resultado(sorteos);
  const ejecutar = () => {
    const r = sortear();
    if (!r) { toast.error("No hay participantes confirmados elegibles para el sorteo."); return; }
    toast.success(sorteos.length === 0 ? "Ganador seleccionado" : "Suplente seleccionado");
  };
  return (
    <Section title="Sorteo">
      <p className="text-sm text-muted-foreground">Elegibles ahora: <b className="text-foreground">{pool.length}</b> confirmados que no han salido antes.</p>
      {res.ganadorId && (
        <div className="mt-3 rounded-2xl bg-muted p-4 text-sm">
          <p><b>Ganador oficial:</b> {nombre(res.ganadorId)}</p>
          {res.suplentesIds.length > 0 && <p className="mt-1"><b>Suplentes:</b> {res.suplentesIds.map(nombre).join(" · ")}</p>}
        </div>
      )}
      <div className="mt-4">
        <Confirm
          title={sorteos.length === 0 ? "¿Seleccionar ganador?" : "¿Seleccionar un suplente?"}
          desc={`Se elegirá al azar entre ${pool.length} participantes confirmados elegibles. El resultado quedará registrado y no se puede deshacer.`}
          onConfirm={ejecutar}
        >
          <Button className="rounded-full">{sorteos.length === 0 ? "Seleccionar ganador" : "Seleccionar suplente"}</Button>
        </Confirm>
      </div>
      <h3 className="mt-6 text-xl font-semibold">Registro de sorteos</h3>
      {sorteos.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Todavía no se ha realizado ningún sorteo.</p>
      ) : (
        <ol className="mt-2 space-y-2 text-sm">
          {[...sorteos].map((s, i) => ({ s, i })).reverse().map(({ s, i }) => (
            <li key={s.id} className="rounded-2xl border p-3">
              <p className="font-medium">#{i + 1} · {i === 0 ? "Ganador" : "Suplente"}: {nombre(i === 0 ? s.ganadorId : (s.suplentesIds[0] ?? ""))}</p>
              <p className="text-xs text-muted-foreground">{formatearFecha(s.fechaHora)} · {s.totalParticipantesElegibles} elegibles · id {s.id.slice(0, 8)}</p>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}

function PlantillasEditor({ plantillas, premio }: { plantillas: Plantillas; premio: string }) {
  const [p, setP] = useState(plantillas);
  const [tab, setTab] = useState<keyof Plantillas>("confirmacion");
  useEffect(() => setP(plantillas), [plantillas]);
  const vars = tab === "confirmacion"
    ? { nombre: "Ana", enlace_confirmacion: "https://ejemplo.com/confirmar/abc123" }
    : { nombre: "Ana", premio };
  const set = (campo: "asunto" | "cuerpo", v: string) => setP({ ...p, [tab]: { ...p[tab], [campo]: v } });
  return (
    <Section title="Plantillas de correo">
      <p className="mb-4 rounded-2xl bg-muted p-3 text-sm">El envío de correos lo conectará Kodarvia.</p>
      <div className="mb-4 flex gap-1 rounded-full bg-muted p-1" role="group" aria-label="Plantilla">
        {(["confirmacion", "ganador"] as const).map((k) => (
          <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)} className={`flex-1 rounded-full px-3 py-1.5 text-sm ${tab === k ? "bg-card font-medium shadow-card" : "text-muted-foreground"}`}>
            {k === "confirmacion" ? "Confirmación" : "Aviso al ganador"}
          </button>
        ))}
      </div>
      <p className="mb-2 text-xs text-muted-foreground">Variables: {tab === "confirmacion" ? "{{nombre}}, {{enlace_confirmacion}}" : "{{nombre}}, {{premio}}"}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div><Label htmlFor="asunto">Asunto</Label><Input id="asunto" className="mt-1" value={p[tab].asunto} onChange={(e) => set("asunto", e.target.value)} /></div>
          <div><Label htmlFor="cuerpo">Cuerpo</Label><Textarea id="cuerpo" rows={9} className="mt-1" value={p[tab].cuerpo} onChange={(e) => set("cuerpo", e.target.value)} /></div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="rounded-full" onClick={() => { storage.setPlantillas(p); toast.success("Plantilla guardada"); }}>Guardar</Button>
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => { const n = { ...p, [tab]: PLANTILLAS_POR_DEFECTO[tab] }; setP(n); storage.setPlantillas(n); toast.success("Plantilla restaurada"); }}>Restaurar por defecto</Button>
          </div>
        </div>
        <div className="rounded-2xl border bg-background p-4" aria-label="Vista previa">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Vista previa</p>
          <p className="mt-2 font-semibold">{renderPlantilla(p[tab].asunto, vars)}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{renderPlantilla(p[tab].cuerpo, vars)}</p>
        </div>
      </div>
    </Section>
  );
}
