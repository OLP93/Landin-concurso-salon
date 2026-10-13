import { createFileRoute } from "@tanstack/react-router";
import { Privacidad } from "@/pages/Legal";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de privacidad · Concurso del Salón" },
      { name: "description", content: "Cómo tratamos tus datos en el concurso y tus derechos de acceso, rectificación y supresión." },
      { property: "og:title", content: "Política de privacidad" },
      { property: "og:description", content: "Tratamiento de datos del concurso del salón." },
    ],
  }),
  component: Privacidad,
});
