import {
  setPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

import { auth } from "../firebase/config";

// 🔐 Persistencia SOLO por sesión
setPersistence(auth, browserSessionPersistence);

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function register(email, password, nombre, apellido) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(cred.user, {
    displayName: `${nombre} ${apellido}`,
  });

  return cred.user;
}

export function logout() {
  return signOut(auth);
}

export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
