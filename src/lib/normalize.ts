/** trim, minúsculas y sin ningún espacio */
export function normalizarCorreo(correo: string): string {
  return correo.trim().toLowerCase().replace(/\s+/g, "");
}

export function enmascararCorreo(correo: string): string {
  const [user, domain] = correo.split("@");
  if (!domain) return "***";
  return `${user.charAt(0)}***@${domain}`;
}

export function nombrePublico(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length < 2) return partes[0] ?? "";
  return `${partes[0]} ${partes[1].charAt(0).toUpperCase()}.`;
}
