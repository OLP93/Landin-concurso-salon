import { beforeEach, describe, expect, it } from "vitest";
import { normalizarCorreo, enmascararCorreo, nombrePublico } from "@/lib/normalize";
import { escaparCelda } from "@/lib/csv";
import { estadoInscripcion } from "@/lib/contest";
import { realizarExtraccion, resultado } from "@/lib/draw";
import { inscribir, storage, confirmarToken } from "@/lib/storage";
import type { Participante } from "@/lib/types";

const base = { fechaInicio: "2026-01-01T00:00:00.000Z", fechaCierre: "2026-02-01T00:00:00.000Z", premio: "x", inscripcionesAbiertasManual: true };

describe("reglas", () => {
  beforeEach(() => localStorage.clear());

  it("normaliza correo sin espacios y en minúsculas", () => {
    expect(normalizarCorreo("  Ana G @Gmail.COM ")).toBe("anag@gmail.com");
  });

  it("rechaza correo duplicado tras normalizar", () => {
    storage.setConcurso({ ...base, fechaCierre: "2099-01-01T00:00:00.000Z" });
    const d = { nombre: "Ana", aceptaBases: true, aceptaComunicaciones: false };
    expect(inscribir({ ...d, correo: "ana@x.com" }).ok).toBe(true);
    expect(inscribir({ ...d, correo: " ANA @x.com" })).toEqual({ ok: false, error: "duplicado" });
  });

  it("guarda aceptaComunicaciones independiente y confirmado=false", () => {
    storage.setConcurso({ ...base, fechaCierre: "2099-01-01T00:00:00.000Z" });
    const r = inscribir({ nombre: "Ana", correo: "a@x.com", aceptaBases: true, aceptaComunicaciones: false });
    expect(r.ok && r.participante.aceptaComunicaciones).toBe(false);
    expect(r.ok && r.participante.confirmado).toBe(false);
  });

  it("rechaza inscripción al llegar fechaCierre", () => {
    storage.setConcurso(base);
    const r = inscribir({ nombre: "Ana", correo: "a@x.com", aceptaBases: true, aceptaComunicaciones: false }, new Date(base.fechaCierre));
    expect(r).toEqual({ ok: false, error: "cerrado" });
    expect(estadoInscripcion(base, new Date("2026-01-15"))).toBe("abierto");
    expect(estadoInscripcion({ ...base, inscripcionesAbiertasManual: false }, new Date("2026-01-15"))).toBe("cerrado-manual");
  });

  it("confirmación es idempotente", () => {
    storage.setConcurso({ ...base, fechaCierre: "2099-01-01T00:00:00.000Z" });
    const r = inscribir({ nombre: "Ana", correo: "a@x.com", aceptaBases: true, aceptaComunicaciones: false });
    if (!r.ok) throw new Error();
    expect(confirmarToken(r.participante.tokenConfirmacion).estado).toBe("confirmado");
    expect(confirmarToken(r.participante.tokenConfirmacion).estado).toBe("ya-confirmado");
    expect(confirmarToken("nope").estado).toBe("invalido");
  });

  it("sorteo solo entre confirmados y sin repetir", () => {
    const mk = (id: string, confirmado: boolean) => ({ id, confirmado }) as Participante;
    const ps = [mk("a", false), mk("b", true), mk("c", true)];
    const s1 = realizarExtraccion(ps, [], () => 0)!;
    expect(s1.ganadorId).toBe("b");
    expect(s1.totalParticipantesElegibles).toBe(2);
    const s2 = realizarExtraccion(ps, [s1], () => 0)!;
    expect(s2.suplentesIds).toEqual(["c"]);
    expect(resultado([s1, s2])).toEqual({ ganadorId: "b", suplentesIds: ["c"] });
    expect(realizarExtraccion(ps, [s1, s2])).toBeNull();
  });

  it("CSV escapa comillas y fórmulas", () => {
    expect(escaparCelda('a,"b"')).toBe('"a,""b"""');
    expect(escaparCelda("=SUM(A1)")).toBe("'=SUM(A1)");
    expect(escaparCelda("+34 600")).toBe("'+34 600");
  });

  it("enmascara datos públicos", () => {
    expect(enmascararCorreo("ana@gmail.com")).toBe("a***@gmail.com");
    expect(nombrePublico("Ana García López")).toBe("Ana G.");
  });
});
