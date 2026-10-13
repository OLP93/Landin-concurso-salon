import { useEffect, useState } from "react";
import { EVENTO_CAMBIO, storage } from "@/lib/storage";
import { estadoInscripcion, type EstadoInscripcion } from "@/lib/contest";
import type { Concurso, Participante, Plantillas, Sorteo } from "@/lib/types";

interface Snapshot {
  concurso: Concurso;
  participantes: Participante[];
  sorteos: Sorteo[];
  plantillas: Plantillas;
  estado: EstadoInscripcion;
}

function snap(): Snapshot {
  const concurso = storage.getConcurso();
  return {
    concurso,
    participantes: storage.getParticipantes(),
    sorteos: storage.getSorteos(),
    plantillas: storage.getPlantillas(),
    estado: estadoInscripcion(concurso),
  };
}

/** Estado del concurso desde localStorage; se re-evalúa al cambiar y cada 5 s (cierre automático). */
export function useContest(): (Snapshot & { ready: true }) | { ready: false } {
  const [data, setData] = useState<Snapshot | null>(null);
  useEffect(() => {
    const update = () => setData(snap());
    update();
    window.addEventListener(EVENTO_CAMBIO, update);
    window.addEventListener("storage", update);
    const id = window.setInterval(update, 5000);
    return () => {
      window.removeEventListener(EVENTO_CAMBIO, update);
      window.removeEventListener("storage", update);
      window.clearInterval(id);
    };
  }, []);
  return data ? { ...data, ready: true } : { ready: false };
}
