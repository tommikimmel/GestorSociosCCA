import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../firebase/config";
import { actualizarSocio } from "./socios";

const pagosRef = collection(db, "pagos");

/* =========================
   REGISTRAR PAGO
========================= */
export async function registrarPago(data) {
  const {
    socioId,
    socioNombre,
    tipoCuota,
    montoCuota,
    tipoSeguro,
    montoSeguro,
    fechaPago,
    metodoPago,
  } = data;

  // Crear el registro del pago
  const pago = {
    socioId,
    socioNombre,
    tipoCuota: tipoCuota || null,
    montoCuota: montoCuota || 0,
    tipoSeguro: tipoSeguro || null,
    montoSeguro: montoSeguro || 0,
    montoTotal: (montoCuota || 0) + (montoSeguro || 0),
    metodoPago: metodoPago || "efectivo",
    fechaPago: fechaPago instanceof Date ? Timestamp.fromDate(fechaPago) : Timestamp.now(),
    creadoEn: Timestamp.now(),
  };

  await addDoc(pagosRef, pago);

  // Actualizar las fechas en el socio
  const actualizacionSocio = {};

  // Si hay pago de cuota, actualizar fechas de cuota
  if (tipoCuota) {
    const fechaPagoDate = fechaPago instanceof Date ? fechaPago : new Date();
    actualizacionSocio.fechaPagoCuota = Timestamp.fromDate(fechaPagoDate);

    // Calcular vencimiento según el tipo de cuota
    let fechaVencimiento = new Date(fechaPagoDate);
    if (tipoCuota === "mensual" || tipoCuota === "mensualVencida") {
      // +1 mes
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
    } else if (tipoCuota === "trimestral") {
      // +3 meses
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 3);
    }
    actualizacionSocio.fechaVencimientoCuota = Timestamp.fromDate(fechaVencimiento);
  }

  // Si hay pago de seguro, actualizar fechas de seguro
  if (tipoSeguro) {
    const fechaPagoDate = fechaPago instanceof Date ? fechaPago : new Date();
    actualizacionSocio.fechaPagoSeguro = Timestamp.fromDate(fechaPagoDate);

    // Seguro siempre es +6 meses
    const fechaVencimiento = new Date(fechaPagoDate);
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 6);
    actualizacionSocio.fechaVencimientoSeguro = Timestamp.fromDate(fechaVencimiento);
  }

  // Actualizar el socio con las nuevas fechas
  await actualizarSocio(socioId, actualizacionSocio);
}

/* =========================
   OBTENER TODOS LOS PAGOS
========================= */
export async function obtenerPagos() {
  const q = query(pagosRef, orderBy("creadoEn", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
