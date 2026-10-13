import { Link } from "@tanstack/react-router";
import { useContest } from "@/hooks/use-contest";
import { Countdown } from "@/components/Countdown";
import { SignupForm } from "@/components/SignupForm";
import { formatearFecha } from "@/lib/contest";

const pasos = [
  { n: "1", t: "Inscríbete", d: "Rellena el formulario con tu nombre y correo." },
  { n: "2", t: "Confirma tu correo", d: "Te enviamos un enlace. Solo las participaciones confirmadas entran en el sorteo." },
  { n: "3", t: "Espera el sorteo", d: "Al cierre elegimos al azar una ganadora y suplentes, y publicamos el resultado." },
];

function Decor() {
  return (
    <svg viewBox="0 0 200 200" className="pointer-events-none absolute -right-10 -top-6 h-64 w-64 opacity-60 sm:h-80 sm:w-80" aria-hidden="true">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
        <ellipse key={r} cx="100" cy="55" rx="16" ry="40" transform={`rotate(${r} 100 100)`} className="fill-blush/60 stroke-gold" strokeWidth="0.8" />
      ))}
      <circle cx="100" cy="100" r="12" className="fill-gold/70" />
    </svg>
  );
}

export default function Landing() {
  const s = useContest();
  return (
    <>
      <section className="relative overflow-hidden bg-hero">
        <Decor />
        <div className="relative mx-auto max-w-5xl px-4 pb-14 pt-12 sm:pt-20">
          <p className="mb-3 inline-block rounded-full border border-gold/50 bg-card/70 px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">Concurso gratuito</p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] sm:text-6xl">
            Gana <span className="text-gold-gradient italic">{s.ready ? s.concurso.premio.toLowerCase() : "un regalo para tus manos"}</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">Participa en nuestro sorteo en tres sencillos pasos. Sin trucos: solo tu nombre y tu correo.</p>
          {s.ready && (
            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end">
              {s.estado === "no-iniciado" ? (
                <Countdown target={s.concurso.fechaInicio} label="Empieza en" />
              ) : s.estado === "abierto" ? (
                <Countdown target={s.concurso.fechaCierre} label="Cierra en" />
              ) : null}
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div><dt className="text-muted-foreground">Inicio</dt><dd className="font-medium">{formatearFecha(s.concurso.fechaInicio)}</dd></div>
                <div><dt className="text-muted-foreground">Cierre</dt><dd className="font-medium">{formatearFecha(s.concurso.fechaCierre)}</dd></div>
              </dl>
            </div>
          )}
          <a href="#inscripcion" className="mt-8 inline-flex h-12 items-center rounded-full bg-primary px-7 text-primary-foreground shadow-soft hover:bg-primary/90">Quiero participar</a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14" aria-labelledby="como">
        <h2 id="como" className="text-4xl font-semibold">Cómo participar</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {pasos.map((p) => (
            <li key={p.n} className="rounded-3xl border bg-card p-6 shadow-card">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-gradient font-display text-xl font-semibold text-foreground">{p.n}</span>
              <h3 className="mt-4 text-2xl font-semibold">{p.t}</h3>
              <p className="mt-1 text-muted-foreground">{p.d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-muted-foreground">
          Consulta las <Link to="/bases-legales" className="text-primary underline underline-offset-4">bases legales completas</Link> del concurso.
        </p>
      </section>

      <section id="inscripcion" className="mx-auto max-w-5xl scroll-mt-20 px-4" aria-labelledby="insc">
        <div className="mx-auto max-w-lg rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
          <h2 id="insc" className="text-3xl font-semibold">Inscripción</h2>
          {!s.ready ? (
            <div className="mt-6 h-64 animate-pulse rounded-2xl bg-muted" aria-hidden="true" />
          ) : s.estado === "abierto" ? (
            <div className="mt-6"><SignupForm disabled={false} /></div>
          ) : (
            <p className="mt-6 rounded-2xl bg-muted p-5 text-center" role="status">
              {s.estado === "no-iniciado" ? "Aún no han empezado las inscripciones. ¡Vuelve pronto!" : "Las inscripciones están cerradas."}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
