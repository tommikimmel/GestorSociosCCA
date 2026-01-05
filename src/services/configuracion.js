import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";

const configRef = doc(db, "configuracion", "precios");

/* =========================
   GET CONFIG
========================= */
export async function obtenerConfiguracion() {
  const snap = await getDoc(configRef);

  if (!snap.exists()) {
    // Valores por defecto si no existe la configuración
    const defaultConfig = {
      cuotaTrimestral: 110000,
      cuotaMensual: 45000,
      cuotaMensualVencida: 50000,
      seguro: 15000,
    };
    await setDoc(configRef, defaultConfig);
    return defaultConfig;
  }

  return snap.data();
}

/* =========================
   UPDATE CONFIG
========================= */
export async function actualizarConfiguracion(datos) {
  await setDoc(configRef, datos);
}
