import { createFileRoute } from "@tanstack/react-router";
import Confirmar from "@/pages/Confirmar";

export const Route = createFileRoute("/confirmar/$token")({
  head: () => ({
    meta: [
      { title: "Confirmación de participación · Concurso del Salón" },
      { name: "description", content: "Confirmación de tu participación en el concurso del salón." },
      { property: "og:title", content: "Confirmación de participación" },
      { property: "og:description", content: "Confirma tu participación en el concurso." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmarPage,
});

function ConfirmarPage() {
  const { token } = Route.useParams();
  return <Confirmar token={token} />;
}
