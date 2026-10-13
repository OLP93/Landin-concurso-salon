import { createFileRoute } from "@tanstack/react-router";
import { BasesLegales } from "@/pages/Legal";

export const Route = createFileRoute("/bases-legales")({
  head: () => ({
    meta: [
      { title: "Bases legales · Concurso del Salón" },
      { name: "description", content: "Bases legales del concurso: organizador, duración, requisitos, premio y selección del ganador." },
      { property: "og:title", content: "Bases legales del concurso" },
      { property: "og:description", content: "Condiciones completas de participación en el concurso." },
    ],
  }),
  component: BasesLegales,
});
