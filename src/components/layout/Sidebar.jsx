import { NavLink } from "react-router-dom";
import { Home, Users, CreditCard, Settings, X, Menu, LogOut, Store } from "lucide-react";
import logoCCA from "../../assets/logoCCA.svg";
import { logout } from "../../services/auth";

const links = [
  { 
    to: "/", 
    label: "Dashboard",
    icon: Home
  },
  { 
    to: "/socios", 
    label: "Socios",
    icon: Users
  },
  { 
    to: "/pagos", 
    label: "Pagos",
    icon: CreditCard
  },
  {
    to: "/gastos",
    label : "Gastos",
    icon: Store
  },
  { 
    to: "/administracion", 
    label: "Administración",
    icon: Settings
  },
];

export default function Sidebar({ isOpen, setIsOpen }) {
return (
    <>
    {/* Overlay para cerrar sidebar en móvil */}
    {isOpen && (
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={() => setIsOpen(false)}
      />
    )}

    {/* Botón toggle */}
    <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 z-50 p-2 rounded-lg bg-white shadow-lg transition-all hover:shadow-xl"
        style={{
            color: '#03a9f4',
            left: isOpen ? (window.innerWidth >= 1024 ? '272px' : '16px') : '16px'
        }}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}>
        {isOpen ? (
            <X className="w-6 h-6" />
        ) : (
            <Menu className="w-6 h-6" />
        )}
    </button>

      {/* Sidebar */}
    <aside 
        className={`h-screen w-64 bg-white shadow-xl fixed left-0 top-0 transition-transform duration-300 ease-in-out z-40 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
        {/* Logo / Título */}
        <div className="h-20 flex items-center justify-center px-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
                <img 
                src={logoCCA} 
                alt="Logo CCA" 
                className="w-10 h-10 object-contain"
                />
                <div className="text-left">
                    <h2 className="text-sm font-bold text-gray-800">
                        Gestor de Socios
                    </h2>
                    <p className="text-xs text-gray-500">
                        CCA
                    </p>
                </div>
            </div>
        </div>

        {/* Navegación */}
        <nav className="mt-6 flex flex-col px-3">
            {links.map((link) => {
                const Icon = link.icon;
                return (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end
                        className={({ isActive }) =>
                            `px-4 py-3 mb-1 text-sm font-medium rounded-lg transition-all flex items-center gap-3
                            ${
                                isActive
                                ? "text-white shadow-md"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                        style={({ isActive }) => 
                            isActive ? { backgroundColor: '#03a9f4' } : {}}
                    >
                        <Icon className="w-5 h-5" />
                        <span>
                            {link.label}
                        </span>
                    </NavLink>
                );
            })}
        </nav>

        {/* Botón de cerrar sesión */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all">
                <LogOut className="w-5 h-5" />
                <span>Cerrar Sesión</span>
            </button>
        </div>
    </aside>
    </>
);
}
