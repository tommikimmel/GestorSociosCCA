import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Socios from "./pages/Socios";
import Pagos from "./pages/Pagos";
import Administracion from "./pages/Administracion";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import Gastos from "./pages/Gastos";

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/socios"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Socios />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/pagos"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Pagos />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/administracion"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Administracion />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/gastos"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Gastos />
            </AdminLayout>
          </ProtectedRoute>
        }
      /> 

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

