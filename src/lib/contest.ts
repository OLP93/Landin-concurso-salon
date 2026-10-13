import type { Concurso } from "./types";

export type EstadoInscripcion = "abierto" | "no-iniciado" | "cerrado" | "cerrado-manual";

export function estadoInscripcion(c: Concurso, now: Date = new Date()): EstadoInscripcion {
  if (!c.inscripcionesAbiertasManual) return "cerrado-manual";
  const t = now.getTime();
  if (t < new Date(c.fechaInicio).getTime()) return "no-iniciado";
  if (t >= new Date(c.fechaCierre).getTime()) return "cerrado";
  return "abierto";
}

export function concursoPorDefecto(now: Date = new Date()): Concurso {
  const inicio = new Date(now);
  inicio.setHours(0, 0, 0, 0);
  const cierre = new Date(inicio);
  cierre.setDate(cierre.getDate() + 30);
  cierre.setHours(23, 59, 0, 0);
  return {
    fechaInicio: inicio.toISOString(),
    fechaCierre: cierre.toISOString(),
    premio: "Manicura completa + diseño de uñas para ti y una amiga",
    inscripcionesAbiertasManual: true,
  };
}

export function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** ISO -> valor para <input type="datetime-local"> en hora local */
export function isoALocal(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
