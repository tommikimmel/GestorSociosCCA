import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";
import { esDeudor } from "../utils/estadoSocio";

const sociosRef = collection(db, "socios");
/* =========================
  CREATE
========================= */
export async function crearSocio(data) {
  const socio = {
    nombre: data.nombre,
    apellido: data.apellido,

    fechaPagoCuota: null,
    fechaVencimientoCuota: null,

    fechaPagoSeguro: null,
    fechaVencimientoSeguro: null,

    deudorCuota: false,
    deudorSeguro: false,

    activo: true,
    creadoEn: Timestamp.now(),
  };

  await addDoc(sociosRef, socio);
}

/* =========================
   READ (todos)
========================= */
export async function obtenerSocios() {
  const snapshot = await getDocs(sociosRef);

  return snapshot.docs.map((docu) => ({
    id: docu.id,
    ...docu.data(),
  }));
}

/* =========================
   READ (uno)
========================= */
export async function obtenerSocioPorId(id) {
  const ref = doc(db, "socios", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}

/* =========================
   UPDATE (datos y fechas)
========================= */
export async function actualizarSocio(id, data) {
  const ref = doc(db, "socios", id);

  const actualizado = {
    ...data,
    deudorCuota: esDeudor(data.fechaVencimientoCuota),
    deudorSeguro: esDeudor(data.fechaVencimientoSeguro),
  };

  await updateDoc(ref, actualizado);
}

/* =========================
   TOGGLE ACTIVO / INACTIVO
========================= */
export async function toggleEstadoSocio(id, estadoActual) {
  const ref = doc(db, "socios", id);

  await updateDoc(ref, {
    activo: !estadoActual,
  });
}

/* =========================
   DELETE (opcional)
   ⚠️ Mejor NO usar en prod
========================= */
export async function eliminarSocio(id) {
  const ref = doc(db, "socios", id);
  await deleteDoc(ref);
}
