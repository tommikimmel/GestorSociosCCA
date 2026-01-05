import { useState, useEffect } from "react";
import { Settings, DollarSign, Calendar, AlertCircle, Shield, Edit2, Save, X } from "lucide-react";
import { obtenerConfiguracion, actualizarConfiguracion } from "../services/configuracion";

export default function Administracion() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [valorTemporal, setValorTemporal] = useState("");

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const datos = await obtenerConfiguracion();
      setConfig(datos);
    } catch (error) {
      console.error("Error al cargar configuración:", error);
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicion = (campo, valorActual) => {
    setEditando(campo);
    setValorTemporal(valorActual.toString());
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setValorTemporal("");
  };

  const guardarCambio = async (campo) => {
    const nuevoValor = parseInt(valorTemporal);
    if (isNaN(nuevoValor) || nuevoValor <= 0) {
      alert("Por favor ingresa un valor numérico válido");
      return;
    }

    try {
      const nuevaConfig = {
        ...config,
        [campo]: nuevoValor,
      };
      await actualizarConfiguracion(nuevaConfig);
      setConfig(nuevaConfig);
      setEditando(null);
      setValorTemporal("");
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      alert("Error al guardar los cambios");
    }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(precio);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{borderBottomColor: '#03a9f4'}}></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Settings className="w-8 h-8" style={{color: '#03a9f4'}} />
          Administración
        </h1>
        <p className="text-gray-600">Configuración de pagos y cuotas del club</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cuotas Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{backgroundColor: '#e0f7fa'}}>
                <DollarSign className="w-6 h-6" style={{color: '#03a9f4'}} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Cuotas Sociales</h2>
                <p className="text-sm text-gray-500">Modalidades de pago disponibles</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Cuota Trimestral */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4" style={{color: '#03a9f4'}} />
                    Cuota Trimestral
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Pago cada 3 meses</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  {editando === 'cuotaTrimestral' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={valorTemporal}
                        onChange={(e) => setValorTemporal(e.target.value)}
                        className="w-32 px-2 py-1 border border-gray-300 rounded text-right font-bold"
                        style={{color: '#03a9f4'}}
                        autoFocus
                      />
                      <button
                        onClick={() => guardarCambio('cuotaTrimestral')}
                        className="p-1.5 rounded bg-green-100 text-green-600 hover:bg-green-200"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold" style={{color: '#03a9f4'}}>
                        {formatearPrecio(config.cuotaTrimestral)}
                      </p>
                      <button
                        onClick={() => iniciarEdicion('cuotaTrimestral', config.cuotaTrimestral)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600">
                  💰 Ahorro de {formatearPrecio(config.cuotaMensual * 3 - config.cuotaTrimestral)} vs pago mensual
                </p>
              </div>
            </div>

            {/* Cuota Mensual */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    Cuota Mensual
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Hasta el día 15 de cada mes</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  {editando === 'cuotaMensual' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={valorTemporal}
                        onChange={(e) => setValorTemporal(e.target.value)}
                        className="w-32 px-2 py-1 border border-gray-300 rounded text-right font-bold text-green-600"
                        autoFocus
                      />
                      <button
                        onClick={() => guardarCambio('cuotaMensual')}
                        className="p-1.5 rounded bg-green-100 text-green-600 hover:bg-green-200"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-green-600">
                        {formatearPrecio(config.cuotaMensual)}
                      </p>
                      <button
                        onClick={() => iniciarEdicion('cuotaMensual', config.cuotaMensual)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <AlertCircle className="w-3 h-3" />
                  Precio regular si se paga antes del día 15
                </div>
              </div>
            </div>

            {/* Cuota Mensual Vencida */}
            <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    Cuota Mensual Vencida
                  </h3>
                  <p className="text-xs text-orange-600 mt-1">Después del día 15 del mes</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  {editando === 'cuotaMensualVencida' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={valorTemporal}
                        onChange={(e) => setValorTemporal(e.target.value)}
                        className="w-32 px-2 py-1 border border-orange-300 rounded text-right font-bold text-orange-600 bg-white"
                        autoFocus
                      />
                      <button
                        onClick={() => guardarCambio('cuotaMensualVencida')}
                        className="p-1.5 rounded bg-green-100 text-green-600 hover:bg-green-200"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        className="p-1.5 rounded bg-white text-gray-600 hover:bg-gray-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatearPrecio(config.cuotaMensualVencida)}
                      </p>
                      <button
                        onClick={() => iniciarEdicion('cuotaMensualVencida', config.cuotaMensualVencida)}
                        className="p-1.5 rounded hover:bg-orange-100 text-orange-400 hover:text-orange-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-orange-200">
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <AlertCircle className="w-3 h-3" />
                  Recargo de {formatearPrecio(config.cuotaMensualVencida - config.cuotaMensual)} por pago fuera de término
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seguro Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Seguro</h2>
                <p className="text-sm text-gray-500">Cobertura semestral</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Seguro Semestral
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">Vigencia: 6 meses</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  {editando === 'seguro' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={valorTemporal}
                        onChange={(e) => setValorTemporal(e.target.value)}
                        className="w-32 px-2 py-1 border border-blue-300 rounded text-right font-bold text-blue-600 bg-white"
                        autoFocus
                      />
                      <button
                        onClick={() => guardarCambio('seguro')}
                        className="p-1.5 rounded bg-green-100 text-green-600 hover:bg-green-200"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        className="p-1.5 rounded bg-white text-gray-600 hover:bg-gray-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-blue-600">
                        {formatearPrecio(config.seguro)}
                      </p>
                      <button
                        onClick={() => iniciarEdicion('seguro', config.seguro)}
                        className="p-1.5 rounded hover:bg-blue-100 text-blue-400 hover:text-blue-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-200 space-y-2">
                <p className="text-sm text-gray-700 font-medium">Cobertura incluida:</p>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Cobertura de responsabilidad civil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Válido para todas las actividades del club</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Renovación semestral automática</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Info adicional */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong className="text-gray-700">Nota:</strong> El seguro debe estar al día para poder participar en las actividades del club. Se renueva cada 6 meses.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de fechas importantes */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" style={{color: '#03a9f4'}} />
          Fechas Importantes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-bold text-sm">15</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Límite de pago mensual</p>
              <p className="text-xs text-gray-500">Hasta el día 15 para mantener precio regular</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <span className="text-orange-600 font-bold text-sm">16+</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Pago con recargo</p>
              <p className="text-xs text-gray-500">Después del día 15 aplica recargo de $5.000</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Renovación de seguro</p>
              <p className="text-xs text-gray-500">Cada 6 meses desde la fecha de pago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}