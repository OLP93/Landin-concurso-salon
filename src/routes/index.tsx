import { createFileRoute } from "@tanstack/react-router";
import Landing from "@/pages/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Concurso del Salón · Gana una manicura para ti y una amiga" },
      { name: "description", content: "Participa gratis en el sorteo de nuestro salón de uñas: inscríbete, confirma tu correo y espera el resultado." },
      { property: "og:title", content: "Concurso del Salón" },
      { property: "og:description", content: "Sorteo gratuito de manicura y diseño de uñas. Inscríbete en tres pasos." },
    ],
  }),
  component: Landing,
});
