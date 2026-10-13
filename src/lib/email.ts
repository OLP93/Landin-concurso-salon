import type { Plantilla } from "./types";

export function renderPlantilla(texto: string, vars: Record<string, string>): string {
  return texto.replace(/\{\{\s*(\w+)\s*\}\}/g, (m: string, k: string) => vars[k] ?? m);
}

/**
 * ÚNICO punto a reemplazar cuando Kodarvia conecte el envío real de correos.
 * Ahora solo simula el envío.
 */
export async function sendEmail(template: Plantilla, to: string, vars: Record<string, string>): Promise<{ ok: true; simulado: true }> {
  const asunto = renderPlantilla(template.asunto, vars);
  const cuerpo = renderPlantilla(template.cuerpo, vars);
  console.info("[email simulado]", { to, asunto, cuerpo });
  return { ok: true, simulado: true };
}
