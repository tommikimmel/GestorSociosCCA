import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Componente de Alerta reutilizable
 * @param {Object} props
 * @param {string} props.type - Tipo de alerta: 'success', 'error', 'warning', 'info'
 * @param {string} props.title - Título de la alerta
 * @param {string} props.message - Mensaje de la alerta
 * @param {boolean} props.show - Controla si la alerta se muestra
 * @param {function} props.onClose - Función que se ejecuta al cerrar
 * @param {number} props.autoCloseDuration - Duración en ms antes de cerrar automáticamente (opcional)
 */
export default function Alert({ 
  type = 'info', 
  title, 
  message, 
  show = false, 
  onClose,
  autoCloseDuration = null 
}) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);

    // Auto-cerrar si se especifica duración
    if (show && autoCloseDuration) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [show, autoCloseDuration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(() => onClose(), 300); // Esperar a que termine la animación
    }
  };

  if (!isVisible) return null;

  // Configuraciones por tipo
  const configs = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      messageColor: 'text-green-700',
      closeHoverColor: 'hover:bg-green-100'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
      closeHoverColor: 'hover:bg-red-100'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600',
      titleColor: 'text-orange-900',
      messageColor: 'text-orange-700',
      closeHoverColor: 'hover:bg-orange-100'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
      closeHoverColor: 'hover:bg-blue-100'
    }
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-md w-full transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div 
        className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl shadow-lg overflow-hidden`}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icono */}
            <div className="shrink-0">
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
                  {title}
                </h3>
              )}
              {message && (
                <p className={`text-sm ${config.messageColor}`}>
                  {message}
                </p>
              )}
            </div>

            {/* Botón cerrar */}
            <button
              onClick={handleClose}
              className={`shrink-0 p-1 rounded-lg transition-colors ${config.closeHoverColor}`}
              aria-label="Cerrar alerta"
            >
              <X className={`w-5 h-5 ${config.iconColor}`} />
            </button>
          </div>
        </div>

        {/* Barra de progreso si hay auto-cierre */}
        {autoCloseDuration && (
          <div className="h-1 bg-white bg-opacity-30 overflow-hidden">
            <div 
              className={`h-full ${config.iconColor.replace('text-', 'bg-')} opacity-70`}
              style={{
                animation: `alertProgress ${autoCloseDuration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>

      {/* Estilos para la animación de la barra de progreso */}
      <style>{`
        @keyframes alertProgress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
