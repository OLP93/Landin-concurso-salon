import { createFileRoute } from "@tanstack/react-router";
import Resultado from "@/pages/Resultado";

export const Route = createFileRoute("/resultado")({
  head: () => ({
    meta: [
      { title: "Resultado del sorteo · Concurso del Salón" },
      { name: "description", content: "Consulta la ganadora y las suplentes del concurso del salón." },
      { property: "og:title", content: "Resultado del sorteo" },
      { property: "og:description", content: "Ganadora y suplentes del concurso del salón." },
    ],
  }),
  component: Resultado,
});
