import { createContext, useContext, useEffect, useState } from "react";
import { observarSesion } from "../services/auth";
import { esAdmin } from "../services/admins";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = observarSesion(async (firebaseUser) => {
      if (firebaseUser) {
        const ok = await esAdmin(firebaseUser.uid);
        setUser(firebaseUser);
        setAdmin(ok);
      } else {
        setUser(null);
        setAdmin(false);
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, admin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
