import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from "firebase/firestore";
import { db } from "../firebase/config";

const gastosCollection = collection(db, "gastos");

// Crear un nuevo gasto
export const crearGasto = async (gastoData) => {
  try {
    const docRef = await addDoc(gastosCollection, {
      ...gastoData,
      fechaCreacion: Timestamp.now()
    });
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
    const gastoRef = doc(db, "gastos", id);
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
    await deleteDoc(doc(db, "gastos", id));
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar gasto:", error);
    throw error;
  }
};
