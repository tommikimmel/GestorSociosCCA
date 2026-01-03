import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export async function esAdmin(uid) {
  const ref = doc(db, "admins", uid);
  const snap = await getDoc(ref);

  return snap.exists() && snap.data().activo === true;
}
