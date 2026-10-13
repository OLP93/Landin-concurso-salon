import { concursoPorDefecto, estadoInscripcion } from "./contest";
import { normalizarCorreo } from "./normalize";
import { realizarExtraccion } from "./draw";
import type { Concurso, CookiePref, Participante, Plantillas, Sorteo } from "./types";

export const KEYS = {
  participantes: "salon.participantes",
  concurso: "salon.concurso",
  sorteos: "salon.sorteos",
  plantillas: "salon.plantillas",
  cookies: "salon.cookies",
} as const;

export const EVENTO_CAMBIO = "salon-change";

export const PLANTILLAS_POR_DEFECTO: Plantillas = {
  confirmacion: {
    asunto: "Confirma tu participación en nuestro concurso",
    cuerpo:
      "Hola {{nombre}}:\n\nGracias por inscribirte. Para que tu participación sea válida, confírmala en este enlace:\n{{enlace_confirmacion}}\n\nSi no te has inscrito, ignora este mensaje.\n\nUn abrazo,\nEl equipo del salón",
  },
  ganador: {
    asunto: "¡Has ganado nuestro concurso!",
    cuerpo:
      "Hola {{nombre}}:\n\n¡Enhorabuena! Has resultado ganadora del concurso. Tu premio: {{premio}}.\n\nResponde a este correo para reservar tu cita.\n\nUn abrazo,\nEl equipo del salón",
  },
};

function hasLS() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function read<T>(key: string, fallback: T): T {
  if (!hasLS()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!hasLS()) return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENTO_CAMBIO));
}

export const storage = {
  getParticipantes: (): Participante[] => read<Participante[]>(KEYS.participantes, []),
  setParticipantes: (v: Participante[]) => write(KEYS.participantes, v),

  getConcurso(): Concurso {
    const c = read<Concurso | null>(KEYS.concurso, null);
    if (c) return c;
    const d = concursoPorDefecto();
    if (hasLS()) localStorage.setItem(KEYS.concurso, JSON.stringify(d));
    return d;
  },
  setConcurso: (v: Concurso) => write(KEYS.concurso, v),

  /** Más antiguo primero */
  getSorteos: (): Sorteo[] => read<Sorteo[]>(KEYS.sorteos, []),

  getPlantillas: (): Plantillas => read<Plantillas>(KEYS.plantillas, PLANTILLAS_POR_DEFECTO),
  setPlantillas: (v: Plantillas) => write(KEYS.plantillas, v),

  getCookiePref: (): CookiePref | null => read<CookiePref | null>(KEYS.cookies, null),
  setCookiePref: (v: CookiePref) => write(KEYS.cookies, v),

  resetDemo() {
    if (!hasLS()) return;
    [KEYS.participantes, KEYS.concurso, KEYS.sorteos, KEYS.plantillas].forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new Event(EVENTO_CAMBIO));
  },
};

export interface NuevaInscripcion {
  nombre: string;
  correo: string;
  telefono?: string;
  aceptaBases: boolean;
  aceptaComunicaciones: boolean;
}

export type ResultadoInscripcion =
  | { ok: true; participante: Participante }
  | { ok: false; error: "duplicado" | "cerrado" | "bases" };

export function inscribir(input: NuevaInscripcion, now: Date = new Date()): ResultadoInscripcion {
  if (estadoInscripcion(storage.getConcurso(), now) !== "abierto") return { ok: false, error: "cerrado" };
  if (input.aceptaBases !== true) return { ok: false, error: "bases" };
  const correo = normalizarCorreo(input.correo);
  const todos = storage.getParticipantes();
  if (todos.some((p) => normalizarCorreo(p.correo) === correo)) return { ok: false, error: "duplicado" };
  const participante: Participante = {
    id: crypto.randomUUID(),
    nombre: input.nombre.trim(),
    correo,
    telefono: input.telefono?.trim() || undefined,
    aceptaBases: true,
    aceptaComunicaciones: input.aceptaComunicaciones === true,
    confirmado: false,
    tokenConfirmacion: crypto.randomUUID(),
    fechaInscripcion: now.toISOString(),
  };
  storage.setParticipantes([...todos, participante]);
  return { ok: true, participante };
}

export function confirmarToken(token: string): { estado: "confirmado" | "ya-confirmado" | "invalido"; nombre?: string } {
  const todos = storage.getParticipantes();
  const p = todos.find((x) => x.tokenConfirmacion === token);
  if (!p) return { estado: "invalido" };
  if (p.confirmado) return { estado: "ya-confirmado", nombre: p.nombre };
  storage.setParticipantes(todos.map((x) => (x.id === p.id ? { ...x, confirmado: true } : x)));
  return { estado: "confirmado", nombre: p.nombre };
}

/** Añade un registro nuevo; nunca borra los anteriores. */
export function sortear(): Sorteo | null {
  const sorteos = storage.getSorteos();
  const nuevo = realizarExtraccion(storage.getParticipantes(), sorteos);
  if (!nuevo) return null;
  write(KEYS.sorteos, [...sorteos, nuevo]);
  return nuevo;
}
