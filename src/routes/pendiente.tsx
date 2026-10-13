import { createFileRoute } from "@tanstack/react-router";
import Pendiente from "@/pages/Pendiente";

export const Route = createFileRoute("/pendiente")({
  validateSearch: (s: Record<string, unknown>): { t?: string } => (typeof s["t"] === "string" ? { t: s["t"] } : {}),
  head: () => ({
    meta: [
      { title: "Confirma tu participación · Concurso del Salón" },
      { name: "description", content: "Revisa tu correo y confirma tu participación en el concurso." },
      { property: "og:title", content: "Confirma tu participación" },
      { property: "og:description", content: "Revisa tu correo para confirmar tu inscripción." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PendientePage,
});

function PendientePage() {
  const { t } = Route.useSearch();
  return <Pendiente token={t} />;
}
