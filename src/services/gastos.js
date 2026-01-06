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
    // Determinar el ID de cuenta basándose en método de pago y quien realizó el gasto
    let cuentaId;
    if (gastoData.metodoPago === 'Efectivo') {
      cuentaId = gastoData.realizadoPor === 'Bernardo Fioramonti' ? 'efectivoBernardo' : 'efectivoDaniel';
    } else {
      cuentaId = gastoData.realizadoPor === 'Bernardo Fioramonti' ? 'transferenciaBernardo' : 'transferenciaDaniel';
    }
    
    // Verificar saldo antes de crear el gasto
    const cuenta = await obtenerCuenta(cuentaId);
    if (!cuenta) {
      throw new Error("La cuenta no existe");
    }
    
    if (cuenta.saldo < gastoData.monto) {
      const nombreCuenta = gastoData.metodoPago === 'Efectivo' ? 'efectivo' : 'débito';
      const propietario = gastoData.realizadoPor === 'Bernardo Fioramonti' ? 'Bernardo' : 'Daniel';
      throw new Error(`Saldo insuficiente en ${nombreCuenta} de ${propietario}. Saldo disponible: $${cuenta.saldo.toLocaleString()}`);
    }
    
    const docRef = await addDoc(gastosCollection, {
      ...gastoData,
      fechaCreacion: Timestamp.now()
    });

    // Actualizar el saldo de la cuenta correspondiente (restar el gasto)
    try {
      const nuevoSaldo = cuenta.saldo - gastoData.monto;
      await actualizarSaldoCuenta(cuentaId, nuevoSaldo);
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
        let cuentaIdAnterior;
        if (gastoAnterior.metodoPago === 'Efectivo') {
          cuentaIdAnterior = gastoAnterior.realizadoPor === 'Bernardo Fioramonti' ? 'efectivoBernardo' : 'efectivoDaniel';
        } else {
          cuentaIdAnterior = gastoAnterior.realizadoPor === 'Bernardo Fioramonti' ? 'transferenciaBernardo' : 'transferenciaDaniel';
        }
        
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
        let cuentaIdNueva;
        if (gastoData.metodoPago === 'Efectivo') {
          cuentaIdNueva = gastoData.realizadoPor === 'Bernardo Fioramonti' ? 'efectivoBernardo' : 'efectivoDaniel';
        } else {
          cuentaIdNueva = gastoData.realizadoPor === 'Bernardo Fioramonti' ? 'transferenciaBernardo' : 'transferenciaDaniel';
        }
        
        const cuentaNueva = await obtenerCuenta(cuentaIdNueva);
        if (cuentaNueva) {
          // Verificar saldo antes de aplicar el nuevo gasto
          if (cuentaNueva.saldo < gastoData.monto) {
            const nombreCuenta = gastoData.metodoPago === 'Efectivo' ? 'efectivo' : 'débito';
            const propietario = gastoData.realizadoPor === 'Bernardo Fioramonti' ? 'Bernardo' : 'Daniel';
            throw new Error(`Saldo insuficiente en ${nombreCuenta} de ${propietario}. Saldo disponible: $${cuentaNueva.saldo.toLocaleString()}`);
          }
          
          const nuevoSaldo = cuentaNueva.saldo - gastoData.monto;
          await actualizarSaldoCuenta(cuentaIdNueva, nuevoSaldo);
        }
      } catch (error) {
        console.error("Error al aplicar nuevo gasto:", error);
        throw error;
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
        let cuentaId;
        if (gasto.metodoPago === 'Efectivo') {
          cuentaId = gasto.realizadoPor === 'Bernardo Fioramonti' ? 'efectivoBernardo' : 'efectivoDaniel';
        } else {
          cuentaId = gasto.realizadoPor === 'Bernardo Fioramonti' ? 'transferenciaBernardo' : 'transferenciaDaniel';
        }
        
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
