import { useState } from "react";
import { login, register, resendVerificationEmail, resetPassword } from "../services/auth";
import { useNavigate } from "react-router-dom";
import logoCCA from "../assets/logoCCA.svg";
import Alert from "../components/layout/Alert";
import { useAlert } from "../hooks/useAlert";
import { motion, AnimatePresence } from "framer-motion";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();
  const { alert, showSuccess, showError, hideAlert } = useAlert();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (isRegister) {
        await register(email, password, nombre, apellido);
        setVerificationEmail(email);
        setNeedsVerification(true);
        setEmail("");
        setPassword("");
        setNombre("");
        setApellido("");
        return; // No navegar, mostrar mensaje de verificación
      } else {
        await login(email, password);
        // Si login es exitoso, navegar al dashboard
        navigate("/");
      }
    } catch (error) {
      // Manejar errores de autenticación
      let errorMessage = "Error al autenticar";
      
      if (error.code === 'auth/email-not-verified') {
        setVerificationEmail(email);
        setNeedsVerification(true);
        errorMessage = "Debés verificar tu email antes de iniciar sesión. Te enviamos un correo de verificación.";
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        errorMessage = "Email o contraseña incorrectos";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "No existe una cuenta con este email";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "El formato del email es inválido";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este email ya está registrado";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "La contraseña debe tener al menos 6 caracteres";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Demasiados intentos fallidos. Intentá más tarde";
      }
      
      showError(
        "Error de autenticación",
        errorMessage,
        error.code === 'auth/email-not-verified' ? 7000 : 5000
      );
    }
  }

  async function handleResendVerification() {
    try {
      await resendVerificationEmail(verificationEmail, password);
      showSuccess(
        "Éxito",
        "Email de verificación reenviado correctamente. Revisá tu bandeja de entrada.",
        5000
      );
    } catch (error) {
      let errorMessage = "Error al reenviar email de verificación";
      
      if (error.code === 'auth/email-already-verified') {
        errorMessage = "Tu email ya está verificado. Podés iniciar sesión.";
        setNeedsVerification(false);
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Credenciales incorrectas. Probá iniciar sesión nuevamente.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Demasiados intentos. Intentá más tarde.";
      }
      
      showError(
        "Error",
        errorMessage,
        5000
      );
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    
    try {
      await resetPassword(resetEmail);
      showSuccess(
        "Éxito",
        "Te enviamos un correo con instrucciones para restablecer tu contraseña. Revisá tu bandeja de entrada.",
        7000
      );
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error) {
      let errorMessage = "Error al enviar email de recuperación";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No existe una cuenta con este email";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "El formato del email es inválido";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Demasiados intentos. Intentá más tarde";
      }
      
      showError(
        "Error",
        errorMessage,
        5000
      );
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 pt-32 sm:pt-32"
    >
      {/* Alert Component */}
      <Alert 
        type={alert.type}
        title={alert.title}
        message={alert.message}
        show={alert.show}
        onClose={hideAlert}
        autoCloseDuration={alert.autoCloseDuration}
      />

      {/* Mensaje de verificación de email */}
      <AnimatePresence>
      {needsVerification && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-100/30 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¡Cuenta creada con éxito!
              </h3>
              <p className="text-gray-600 mb-4">
                Te enviamos un correo de verificación a:
              </p>
              <p className="font-semibold text-gray-900 mb-4">
                {verificationEmail}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Por favor, revisá tu bandeja de entrada y hacé click en el enlace de verificación. Una vez verificado, podrás iniciar sesión.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleResendVerification}
                  className="w-full text-white py-2.5 rounded-lg font-medium transition-colors"
                  style={{backgroundColor: '#03a9f4'}}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#0288d1'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#03a9f4'}
                >
                  Reenviar email de verificación
                </button>
                <button
                  onClick={() => setNeedsVerification(false)}
                  className="w-full bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
      
      {/* Modal de Recuperación de Contraseña */}
      <AnimatePresence>
      {showForgotPassword && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-100/30 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Olvidaste tu contraseña?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                    style={{"--tw-ring-color": "#03a9f4"}}
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    className="w-full text-white py-2.5 rounded-lg font-medium transition-colors"
                    style={{backgroundColor: '#03a9f4'}}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#0288d1'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#03a9f4'}
                  >
                    Enviar email de recuperación
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail("");
                    }}
                    className="w-full bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
      
      {/* Logo y título */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute top-4 sm:top-8 left-1/2 transform -translate-x-1/2 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-4 z-10"
      >
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
      </motion.div>

      {/* Vista Mobile - Un solo formulario con toggle */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="sm:hidden w-full max-w-md mt-4"
      >
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                    style={{"--tw-ring-color": "#03a9f4"}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm hover:underline"
                    style={{color: '#03a9f4'}}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </motion.div>

      {/* Vista Desktop - Dos tarjetas lado a lado */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="hidden sm:flex gap-4 sm:gap-6 max-w-4xl w-full"
      >
        {/* Tarjeta de Login */}
        <motion.div 
          onClick={() => setIsRegister(false)}
          whileHover={{ scale: isRegister ? 1.02 : 1 }}
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                    style={{"--tw-ring-color": "#03a9f4"}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm hover:underline"
                  style={{color: '#03a9f4'}}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>
          )}

          {isRegister && (
            <div className="flex items-center justify-center flex-1 text-gray-400 transition-opacity duration-300">
              <p className="text-sm">Hacé click aquí para iniciar sesión</p>
            </div>
          )}
        </motion.div>

        {/* Tarjeta de Registro */}
        <motion.div 
          onClick={() => setIsRegister(true)}
          whileHover={{ scale: !isRegister ? 1.02 : 1 }}
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                    style={{"--tw-ring-color": "#03a9f4"}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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
        </motion.div>
      </motion.div>

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
    </motion.div>
  );
}
