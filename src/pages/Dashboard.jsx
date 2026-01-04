import { logout } from "../services/auth";

export default function Dashboard() {
  return (
    <button onClick={logout}>Cerrar sesión</button>
  );
}