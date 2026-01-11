import {
  setPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "../firebase/config";

// 🔐 Persistencia SOLO por sesión
setPersistence(auth, browserSessionPersistence);

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  
  // Verificar si el email está verificado
  if (!cred.user.emailVerified) {
    await signOut(auth);
    const error = new Error("Email no verificado");
    error.code = "auth/email-not-verified";
    throw error;
  }
  
  return cred;
}

export async function register(email, password, nombre, apellido) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(cred.user, {
    displayName: `${nombre} ${apellido}`,
  });

  // Enviar email de verificación
  await sendEmailVerification(cred.user);

  // Cerrar sesión inmediatamente después del registro
  await signOut(auth);

  return cred.user;
}

export function logout() {
  return signOut(auth);
}

export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function resendVerificationEmail(email, password) {
  // Iniciar sesión temporalmente para poder reenviar el email
  const cred = await signInWithEmailAndPassword(auth, email, password);
  
  if (cred.user.emailVerified) {
    await signOut(auth);
    const error = new Error("El email ya está verificado");
    error.code = "auth/email-already-verified";
    throw error;
  }
  
  await sendEmailVerification(cred.user);
  await signOut(auth);
  
  return true;
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
  return true;
}
