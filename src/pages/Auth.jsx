import { useState } from "react";
import { login, register } from "../services/auth";
import { useNavigate } from "react-router-dom";
import logoCCA from "../assets/logoCCA.svg";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (isRegister) {
      await register(email, password, nombre, apellido);
    } else {
      await login(email, password);
    }

    // SIEMPRE va al dashboard
    navigate("/");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 pt-32 sm:pt-32">
      {/* Logo y título */}
      <div className="absolute top-4 sm:top-8 left-1/2 transform -translate-x-1/2 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-4 z-10">
        <img 
          src={logoCCA} 
          alt="Logo CCA" 
          className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
        />
        <div className="text-center sm:text-left">
          <h1 className="text-sm sm:text-lg font-bold text-gray-800">
            Círculo Cordobés de Aeromodelismo
          </h1>
          <p className="text-xs text-gray-500">
            Gestión de Socios
          </p>
        </div>
      </div>

      {/* Vista Mobile - Un solo formulario con toggle */}
      <div className="sm:hidden w-full max-w-md mt-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Botones Toggle */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-4 font-semibold transition-all ${
                !isRegister
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={!isRegister ? {backgroundColor: '#03a9f4'} : {}}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-4 font-semibold transition-all ${
                isRegister
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={isRegister ? {backgroundColor: '#03a9f4'} : {}}
            >
              Registrarse
            </button>
          </div>

          {/* Contenido del formulario */}
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {isRegister ? 'Registrarse' : 'Iniciar Sesión'}
              </h2>
              <p className="text-sm text-gray-500">
                {isRegister ? 'Creá tu cuenta nueva' : 'Accedé a tu cuenta'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 animate-[fadeIn_0.3s_ease-in-out]">
              {isRegister && (
                <div className="flex flex-col gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Ingresá tu nombre"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                      style={{"--tw-ring-color": "#03a9f4"}}
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido
                    </label>
                    <input
                      type="text"
                      placeholder="Ingresá tu apellido"
                      value={apellido}
                      onChange={e => setApellido(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                      style={{"--tw-ring-color": "#03a9f4"}}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                  style={{"--tw-ring-color": "#03a9f4"}}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                  style={{"--tw-ring-color": "#03a9f4"}}
                />
              </div>

              <button
                type="submit"
                className="w-full text-white py-2.5 rounded-lg font-medium transition-colors"
                style={{backgroundColor: '#03a9f4'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0288d1'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#03a9f4'}
              >
                {isRegister ? 'Crear Cuenta' : 'Entrar'}
              </button>

              {!isRegister && (
                <div className="text-center">
                  <a href="#" className="text-sm hover:underline" style={{color: '#03a9f4'}}>
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Vista Desktop - Dos tarjetas lado a lado */}
      <div className="hidden sm:flex gap-4 sm:gap-6 max-w-4xl w-full">
        {/* Tarjeta de Login */}
        <div 
          onClick={() => setIsRegister(false)}
          className={`flex flex-col flex-1 bg-white rounded-xl shadow-lg p-6 sm:p-8 cursor-pointer transition-all duration-500 min-h-75 sm:min-h-105 ${
            !isRegister 
              ? 'ring-2 sm:scale-105' 
              : 'opacity-60 hover:opacity-80'
          }`}
          style={!isRegister ? {"--tw-ring-color": "#03a9f4"} : {}}
        >
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Accedé a tu cuenta
            </p>
          </div>

          {!isRegister && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-[fadeIn_0.3s_ease-in-out]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                  style={{"--tw-ring-color": "#03a9f4"}}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                  style={{"--tw-ring-color": "#03a9f4"}}
                />
              </div>

              <button
                type="submit"
                className="w-full text-white py-2.5 rounded-lg font-medium transition-colors"
                style={{backgroundColor: '#03a9f4'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0288d1'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#03a9f4'}
              >
                Entrar
              </button>

              <div className="text-center">
                <a href="#" className="text-sm hover:underline" style={{color: '#03a9f4'}}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </form>
          )}

          {isRegister && (
            <div className="flex items-center justify-center flex-1 text-gray-400 transition-opacity duration-300">
              <p className="text-sm">Hacé click aquí para iniciar sesión</p>
            </div>
          )}
        </div>

        {/* Tarjeta de Registro */}
        <div 
          onClick={() => setIsRegister(true)}
          className={`flex flex-col flex-1 bg-white rounded-xl shadow-lg p-6 sm:p-8 cursor-pointer transition-all duration-500 min-h-75 sm:min-h-105 ${
            isRegister 
              ? 'ring-2 sm:scale-105' 
              : 'opacity-60 hover:opacity-80'
          }`}
          style={isRegister ? {"--tw-ring-color": "#03a9f4"} : {}}
        >
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Registrarse
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Creá tu cuenta nueva
            </p>
          </div>

          {isRegister && (
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 animate-[fadeIn_0.3s_ease-in-out]">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    placeholder="Ingresá tu nombre"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                    style={{"--tw-ring-color": "#03a9f4"}}
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    placeholder="Ingresá tu apellido"
                    value={apellido}
                    onChange={e => setApellido(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                    style={{"--tw-ring-color": "#03a9f4"}}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                  style={{"--tw-ring-color": "#03a9f4"}}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                  style={{"--tw-ring-color": "#03a9f4"}}
                />
              </div>

              <button
                type="submit"
                className="w-full text-white py-2.5 rounded-lg font-medium transition-colors"
                style={{backgroundColor: '#03a9f4'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0288d1'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#03a9f4'}
              >
                Crear Cuenta
              </button>
            </form>
          )}

          {!isRegister && (
            <div className="flex items-center justify-center flex-1 text-gray-400 transition-opacity duration-300">
              <p className="text-sm">Hacé click aquí para registrarte</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
