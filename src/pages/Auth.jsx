import { useNavigate } from "react-router-dom";

export default function Login() {
const navigate = useNavigate();

return (
    <div>
        <h1>Login</h1>

        <button onClick={() => navigate("/admin")}>
            Entrar como Admin (mock)
        </button>

        <button onClick={() => navigate("/socio")}>
            Entrar como Socio (mock)
        </button>
    </div>
);
}
