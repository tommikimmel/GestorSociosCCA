import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedAdmin from "./components/ProtectedAdmin";
import { useAuth } from "../context/AuthContext";

export default function App() {
  const { user, loading } = useAuth();

  if (!user && !loading) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<Login />} />

      {/* App protegida (solo admins) */}
      <Route
        path="/"
        element={
          <ProtectedAdmin>
            <Dashboard />
          </ProtectedAdmin>
        }
      />

      {/* Cualquier otra cosa */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
