import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase/config";
import { obtenerCuenta, actualizarSaldoCuenta } from "./cuentas";

const gastosCollection = collection(db, "gastos");

// Crear un nuevo gasto
export const crearGasto = async (gastoData) => {
  try {
    const docRef = await addDoc(gastosCollection, {
      ...gastoData,
      fechaCreacion: Timestamp.now()
    });

    // Actualizar el saldo de la cuenta correspondiente (restar el gasto)
    try {
      const cuentaId = gastoData.metodoPago === 'Efectivo' ? 'efectivo' : 'transferencia';
      const cuenta = await obtenerCuenta(cuentaId);
      if (cuenta) {
        const nuevoSaldo = cuenta.saldo - gastoData.monto;
        await actualizarSaldoCuenta(cuentaId, nuevoSaldo);
      }
    } catch (error) {
      console.error("Error al actualizar cuenta:", error);
      // No lanzamos el error para no bloquear el registro del gasto
    }

    return { id: docRef.id, success: true };
  } catch (error) {
    console.error("Error al crear gasto:", error);
    throw error;
  }
};

// Obtener todos los gastos
export const obtenerGastos = async () => {
  try {
    const q = query(gastosCollection, orderBy("fechaRealizacion", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener gastos:", error);
    throw error;
  }
};

// Actualizar un gasto
export const actualizarGasto = async (id, gastoData) => {
  try {
    // Obtener el gasto anterior para revertir su impacto en la cuenta
    const gastoRef = doc(db, "gastos", id);
    const gastoDoc = await getDoc(gastoRef);
    
    if (gastoDoc.exists()) {
      const gastoAnterior = gastoDoc.data();
      
      // Revertir el gasto anterior (sumar de vuelta a la cuenta)
      try {
        const cuentaIdAnterior = gastoAnterior.metodoPago === 'Efectivo' ? 'efectivo' : 'transferencia';
        const cuentaAnterior = await obtenerCuenta(cuentaIdAnterior);
        if (cuentaAnterior) {
          const saldoRevertido = cuentaAnterior.saldo + gastoAnterior.monto;
          await actualizarSaldoCuenta(cuentaIdAnterior, saldoRevertido);
        }
      } catch (error) {
        console.error("Error al revertir gasto anterior:", error);
      }
      
      // Aplicar el nuevo gasto (restar de la cuenta)
      try {
        const cuentaIdNueva = gastoData.metodoPago === 'Efectivo' ? 'efectivo' : 'transferencia';
        const cuentaNueva = await obtenerCuenta(cuentaIdNueva);
        if (cuentaNueva) {
          const nuevoSaldo = cuentaNueva.saldo - gastoData.monto;
          await actualizarSaldoCuenta(cuentaIdNueva, nuevoSaldo);
        }
      } catch (error) {
        console.error("Error al aplicar nuevo gasto:", error);
      }
    }
    
    // Actualizar el documento del gasto
    await updateDoc(gastoRef, gastoData);
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar gasto:", error);
    throw error;
  }
};

// Eliminar un gasto
export const eliminarGasto = async (id) => {
  try {
    // Obtener el gasto antes de eliminarlo para revertir su impacto en la cuenta
    const gastoRef = doc(db, "gastos", id);
    const gastoDoc = await getDoc(gastoRef);
    
    if (gastoDoc.exists()) {
      const gasto = gastoDoc.data();
      
      // Revertir el gasto (sumar de vuelta a la cuenta)
      try {
        const cuentaId = gasto.metodoPago === 'Efectivo' ? 'efectivo' : 'transferencia';
        const cuenta = await obtenerCuenta(cuentaId);
        if (cuenta) {
          const nuevoSaldo = cuenta.saldo + gasto.monto;
          await actualizarSaldoCuenta(cuentaId, nuevoSaldo);
        }
      } catch (error) {
        console.error("Error al revertir gasto en cuenta:", error);
      }
    }
    
    // Eliminar el documento del gasto
    await deleteDoc(gastoRef);
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar gasto:", error);
    throw error;
  }
};
