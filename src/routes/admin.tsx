import { createFileRoute } from "@tanstack/react-router";
import Admin from "@/pages/Admin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel del salón · Concurso del Salón" },
      { name: "description", content: "Gestión del concurso, participantes y sorteo." },
      { property: "og:title", content: "Panel del salón" },
      { property: "og:description", content: "Gestión interna del concurso." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});
