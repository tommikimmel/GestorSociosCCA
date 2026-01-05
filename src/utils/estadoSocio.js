export function esDeudor(fechaVencimiento) {
  if (!fechaVencimiento) return false;

  const hoy = new Date();
  return hoy > fechaVencimiento.toDate();
}
