import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar alertas
 * @returns {Object} Objeto con estado de la alerta y funciones para mostrarla
 */
export function useAlert() {
  const [alert, setAlert] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    autoCloseDuration: null
  });

  /**
   * Muestra una alerta de éxito
   * @param {string} title - Título de la alerta
   * @param {string} message - Mensaje de la alerta
   * @param {number} autoCloseDuration - Duración en ms antes de cerrar automáticamente
   */
  const showSuccess = useCallback((title, message, autoCloseDuration = 3000) => {
    setAlert({
      show: true,
      type: 'success',
      title,
      message,
      autoCloseDuration
    });
  }, []);

  /**
   * Muestra una alerta de error
   * @param {string} title - Título de la alerta
   * @param {string} message - Mensaje de la alerta
   * @param {number} autoCloseDuration - Duración en ms antes de cerrar automáticamente (null = no auto-cerrar)
   */
  const showError = useCallback((title, message, autoCloseDuration = null) => {
    setAlert({
      show: true,
      type: 'error',
      title,
      message,
      autoCloseDuration
    });
  }, []);

  /**
   * Muestra una alerta de advertencia
   * @param {string} title - Título de la alerta
   * @param {string} message - Mensaje de la alerta
   * @param {number} autoCloseDuration - Duración en ms antes de cerrar automáticamente
   */
  const showWarning = useCallback((title, message, autoCloseDuration = 4000) => {
    setAlert({
      show: true,
      type: 'warning',
      title,
      message,
      autoCloseDuration
    });
  }, []);

  /**
   * Muestra una alerta informativa
   * @param {string} title - Título de la alerta
   * @param {string} message - Mensaje de la alerta
   * @param {number} autoCloseDuration - Duración en ms antes de cerrar automáticamente
   */
  const showInfo = useCallback((title, message, autoCloseDuration = 3000) => {
    setAlert({
      show: true,
      type: 'info',
      title,
      message,
      autoCloseDuration
    });
  }, []);

  /**
   * Cierra la alerta actual
   */
  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, show: false }));
  }, []);

  return {
    alert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideAlert
  };
}
