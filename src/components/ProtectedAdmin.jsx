import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedAdmin({ children }) {
  const { user, admin, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;

  if (!user || !admin) {
    return <Navigate to="/login" />;
  }

  return children;
}
