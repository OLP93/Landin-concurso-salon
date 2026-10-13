export interface Participante {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  aceptaBases: boolean;
  aceptaComunicaciones: boolean;
  confirmado: boolean;
  tokenConfirmacion: string;
  fechaInscripcion: string;
}

export interface Concurso {
  fechaInicio: string;
  fechaCierre: string;
  premio: string;
  inscripcionesAbiertasManual: boolean;
}

export interface Sorteo {
  id: string;
  fechaHora: string;
  totalParticipantesElegibles: number;
  ganadorId: string;
  suplentesIds: string[];
}

export interface Plantilla {
  asunto: string;
  cuerpo: string;
}

export interface Plantillas {
  confirmacion: Plantilla;
  ganador: Plantilla;
}

export type CookiePref = "todas" | "necesarias";
