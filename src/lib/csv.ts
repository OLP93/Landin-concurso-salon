import type { Participante } from "./types";

export function escaparCelda(v: string | number | boolean | undefined | null, antiFormula = true): string {
  let s = v === undefined || v === null ? "" : String(v);
  if (antiFormula && /^[=+\-@]/.test(s)) s = "'" + s;
  if (/[",\r\n;]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function participantesACsv(ps: Participante[]): string {
  const header = ["id", "nombre", "correo", "telefono", "confirmado", "acepta_bases", "acepta_comunicaciones", "fecha_inscripcion"];
  const rows = ps.map((p) =>
    [p.id, p.nombre, p.correo, p.telefono ?? "", p.confirmado ? "sí" : "no", p.aceptaBases ? "sí" : "no", p.aceptaComunicaciones ? "sí" : "no", p.fechaInscripcion]
      .map((c, i) => escaparCelda(c, i !== 3))
      .join(","),
  );
  return "\uFEFF" + [header.join(","), ...rows].join("\r\n");
}

export function descargarCsv(nombreArchivo: string, contenido: string) {
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}
