import type { Participante, Sorteo } from "./types";

/** Entero uniforme en [0, max) con crypto.getRandomValues (muestreo por rechazo). */
export function randomIndex(max: number): number {
  if (max <= 0) throw new Error("max debe ser > 0");
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  let x: number;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % max;
}

export function idsYaElegidos(sorteos: Sorteo[]): Set<string> {
  const s = new Set<string>();
  for (const r of sorteos) {
    s.add(r.ganadorId);
    r.suplentesIds.forEach((id) => s.add(id));
  }
  return s;
}

export function elegibles(participantes: Participante[], sorteos: Sorteo[]): Participante[] {
  const usados = idsYaElegidos(sorteos);
  return participantes.filter((p) => p.confirmado && !usados.has(p.id));
}

/**
 * Nuevo registro de sorteo. El primero define el ganador oficial;
 * los siguientes repiten ganadorId (el oficial) y añaden un suplente.
 * Los sorteos ordenados del más antiguo al más reciente.
 */
export function realizarExtraccion(
  participantes: Participante[],
  sorteos: Sorteo[],
  rnd: (max: number) => number = randomIndex,
  now: Date = new Date(),
): Sorteo | null {
  const pool = elegibles(participantes, sorteos);
  if (pool.length === 0) return null;
  const elegido = pool[rnd(pool.length)];
  const base = { id: crypto.randomUUID(), fechaHora: now.toISOString(), totalParticipantesElegibles: pool.length };
  if (sorteos.length === 0) return { ...base, ganadorId: elegido.id, suplentesIds: [] };
  return { ...base, ganadorId: sorteos[0].ganadorId, suplentesIds: [elegido.id] };
}

export function resultado(sorteos: Sorteo[]): { ganadorId: string | null; suplentesIds: string[] } {
  if (sorteos.length === 0) return { ganadorId: null, suplentesIds: [] };
  return { ganadorId: sorteos[0].ganadorId, suplentesIds: sorteos.slice(1).flatMap((s) => s.suplentesIds) };
}
