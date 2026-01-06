import { db } from "../firebase/config";
import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";

const CUENTAS_COLLECTION = "cuentas";

// Obtener todas las cuentas
export const obtenerCuentas = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, CUENTAS_COLLECTION));
    const cuentas = {};
    
    querySnapshot.forEach((doc) => {
      cuentas[doc.id] = {
        id: doc.id,
        ...doc.data()
      };
    });

    return cuentas;
  } catch (error) {
    console.error("Error al obtener cuentas:", error);
    throw error;
  }
};

// Obtener una cuenta específica
export const obtenerCuenta = async (cuentaId) => {
  try {
    const docRef = doc(db, CUENTAS_COLLECTION, cuentaId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al obtener cuenta:", error);
    throw error;
  }
};

// Actualizar saldo de una cuenta
export const actualizarSaldoCuenta = async (cuentaId, nuevoSaldo) => {
  try {
    const docRef = doc(db, CUENTAS_COLLECTION, cuentaId);
    await updateDoc(docRef, {
      saldo: nuevoSaldo,
      ultimaModificacion: serverTimestamp()
    });
  } catch (error) {
    console.error("Error al actualizar saldo:", error);
    throw error;
  }
};

// Inicializar cuentas (crear si no existen)
export const inicializarCuentas = async () => {
  try {
    const cuentasDefault = [
      { id: "efectivoBernardo", nombre: "Efectivo - Bernardo Fioramonti", saldo: 0, tipo: "efectivo", propietario: "Bernardo Fioramonti" },
      { id: "efectivoDaniel", nombre: "Efectivo - Daniel Carranza", saldo: 0, tipo: "efectivo", propietario: "Daniel Carranza" },
      { id: "transferenciaBernardo", nombre: "Transferencia - Bernardo Fioramonti", saldo: 0, tipo: "transferencia", propietario: "Bernardo Fioramonti" },
      { id: "transferenciaDaniel", nombre: "Transferencia - Daniel Carranza", saldo: 0, tipo: "transferencia", propietario: "Daniel Carranza" },
      { id: "plazoFijo", nombre: "Plazo Fijo", saldo: 0, tipo: "plazoFijo", propietario: "Compartido" }
    ];

    for (const cuenta of cuentasDefault) {
      const docRef = doc(db, CUENTAS_COLLECTION, cuenta.id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          nombre: cuenta.nombre,
          saldo: cuenta.saldo,
          tipo: cuenta.tipo,
          propietario: cuenta.propietario,
          ultimaModificacion: serverTimestamp()
        });
      }
    }

    return await obtenerCuentas();
  } catch (error) {
    console.error("Error al inicializar cuentas:", error);
    throw error;
  }
};

// Realizar transferencia entre cuentas
export const realizarTransferencia = async (origenId, destinoId, monto) => {
  try {
    const cuentaOrigen = await obtenerCuenta(origenId);
    const cuentaDestino = await obtenerCuenta(destinoId);

    if (!cuentaOrigen || !cuentaDestino) {
      throw new Error("Una o ambas cuentas no existen");
    }

    if (cuentaOrigen.saldo < monto) {
      throw new Error("Saldo insuficiente en la cuenta de origen");
    }

    // Actualizar ambas cuentas
    await actualizarSaldoCuenta(origenId, cuentaOrigen.saldo - monto);
    await actualizarSaldoCuenta(destinoId, cuentaDestino.saldo + monto);

    return {
      exito: true,
      mensaje: `Transferencia exitosa de ${monto} de ${cuentaOrigen.nombre} a ${cuentaDestino.nombre}`
    };
  } catch (error) {
    console.error("Error al realizar transferencia:", error);
    throw error;
  }
};
