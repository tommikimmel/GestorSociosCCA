import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Plus, 
  X, 
  Save, 
  Calendar,
  DollarSign,
  User,
  Clock,
  Banknote,
  ArrowRightLeft
} from "lucide-react";
import { obtenerPagos, registrarPago } from "../services/pagos";
import { obtenerSocios } from "../services/socios";
import { obtenerConfiguracion } from "../services/configuracion";

export default function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [socios, setSocios] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    socioId: "",
    tipoCuota: "",
    tipoSeguro: "",
    metodoPago: "efectivo",
    fechaPago: "",
    usarFechaHoy: true,
    realizadoPor: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [pagosData, sociosData, configData] = await Promise.all([
        obtenerPagos(),
        obtenerSocios(),
        obtenerConfiguracion(),
      ]);
      setPagos(pagosData);
      setSocios(sociosData);
      setConfig(configData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      socioId: "",
      tipoCuota: "",
      tipoSeguro: "",
      metodoPago: "efectivo",
      fechaPago: "",
      usarFechaHoy: true,
      realizadoPor: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleFechaHoy = () => {
    setFormData(prev => ({
      ...prev,
      usarFechaHoy: !prev.usarFechaHoy,
      fechaPago: !prev.usarFechaHoy ? "" : prev.fechaPago
    }));
  };

  const calcularMontos = () => {
    let montoCuota = 0;
    let montoSeguro = 0;

    if (formData.tipoCuota === "mensual") {
      montoCuota = config.cuotaMensual;
    } else if (formData.tipoCuota === "mensualVencida") {
      montoCuota = config.cuotaMensualVencida;
    } else if (formData.tipoCuota === "trimestral") {
      montoCuota = config.cuotaTrimestral;
    }

    if (formData.tipoSeguro === "semestral") {
      montoSeguro = config.seguro;
    }

    return { montoCuota, montoSeguro, total: montoCuota + montoSeguro };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.socioId) {
      alert("Debes seleccionar un socio");
      return;
    }

    if (!formData.tipoCuota && !formData.tipoSeguro) {
      alert("Debes seleccionar al menos un tipo de pago (cuota o seguro)");
      return;
    }

    if (!formData.realizadoPor) {
      alert("Debes seleccionar quién realizó el pago");
      return;
    }

    try {
      const socio = socios.find(s => s.id === formData.socioId);
      const { montoCuota, montoSeguro } = calcularMontos();
      
      const fechaPago = formData.usarFechaHoy 
        ? new Date() 
        : new Date(formData.fechaPago + "T12:00:00");

      await registrarPago({
        socioId: formData.socioId,
        socioNombre: `${socio.nombre} ${socio.apellido}`,
        tipoCuota: formData.tipoCuota || null,
        montoCuota,
        tipoSeguro: formData.tipoSeguro || null,
        montoSeguro,
        metodoPago: formData.metodoPago,
        fechaPago,
        realizadoPor: formData.realizadoPor,
      });

      await cargarDatos();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error al registrar pago:", error);
      alert("Error al registrar el pago");
    }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(precio);
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "-";
    const fecha = timestamp.toDate();
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const montos = formData.socioId ? calcularMontos() : { montoCuota: 0, montoSeguro: 0, total: 0 };

  if (loading || !config) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{borderBottomColor: '#03a9f4'}}></div>
          <p className="mt-4 text-gray-600">Cargando pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <CreditCard className="w-8 h-8" style={{color: '#03a9f4'}} />
          Gestión de Pagos
        </h1>
        <p className="text-gray-600">Registra y consulta los pagos de cuotas y seguros</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Pagos</p>
          <p className="text-3xl font-bold" style={{color: '#03a9f4'}}>{pagos.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Este Mes</p>
          <p className="text-3xl font-bold text-green-600">
            {pagos.filter(p => {
              const fecha = p.fechaPago?.toDate();
              const hoy = new Date();
              return fecha?.getMonth() === hoy.getMonth() && fecha?.getFullYear() === hoy.getFullYear();
            }).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Recaudado</p>
          <p className="text-2xl font-bold text-green-600">
            {formatearPrecio(pagos.reduce((sum, p) => sum + (p.montoTotal || 0), 0))}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={openCreateModal}
          className="text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all"
          style={{backgroundColor: '#03a9f4'}}
        >
          <Plus className="w-5 h-5" />
          Registrar Pago
        </button>
      </div>

      {/* Pagos Table */}
      {pagos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No hay pagos registrados</p>
          <p className="text-gray-500 mt-2">Comienza registrando el primer pago</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Socio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seguro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Realizado Por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatearFecha(pago.fechaPago)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#e0f7fa'}}>
                          <User className="w-4 h-4" style={{color: '#03a9f4'}} />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {pago.socioNombre}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pago.tipoCuota ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 capitalize">
                            {pago.tipoCuota === "mensualVencida" ? "Mensual Vencida" : pago.tipoCuota}
                          </div>
                          <div className="text-gray-500">{formatearPrecio(pago.montoCuota)}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pago.tipoSeguro ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 capitalize">{pago.tipoSeguro}</div>
                          <div className="text-gray-500">{formatearPrecio(pago.montoSeguro)}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                        {pago.realizadoPor || "No especificado"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        pago.metodoPago === 'efectivo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {pago.metodoPago === 'efectivo' ? (
                          <><Banknote className="w-3 h-3" /> Efectivo</>
                        ) : (
                          <><ArrowRightLeft className="w-3 h-3" /> Transferencia</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold" style={{color: '#03a9f4'}}>
                        {formatearPrecio(pago.montoTotal)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              resetForm();
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Registrar Pago</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Seleccionar Socio */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Socio *
                  </label>
                  <select
                    name="socioId"
                    value={formData.socioId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                    style={{"--tw-ring-color": "#03a9f4"}}
                  >
                    <option value="">Seleccionar socio...</option>
                    {socios
                      .filter(s => s.activo)
                      .sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`))
                      .map(socio => (
                        <option key={socio.id} value={socio.id}>
                          {socio.apellido}, {socio.nombre}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Realizado Por */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Realizado Por *
                  </label>
                  <select
                    name="realizadoPor"
                    value={formData.realizadoPor}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                    style={{"--tw-ring-color": "#03a9f4"}}
                  >
                    <option value="">Seleccione quien realizó el pago...</option>
                    <option value="Bernardo Fioramonti">Bernardo Fioramonti</option>
                    <option value="Daniel Carranza">Daniel Carranza</option>
                  </select>
                </div>

                {/* Método de Pago */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, metodoPago: 'efectivo'}))}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.metodoPago === 'efectivo'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                      <span className="font-medium">Efectivo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, metodoPago: 'transferencia'}))}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.metodoPago === 'transferencia'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <ArrowRightLeft className="w-5 h-5" />
                      <span className="font-medium">Transferencia</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Tipo de Cuota */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Cuota
                    </label>
                    <select
                      name="tipoCuota"
                      value={formData.tipoCuota}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                      style={{"--tw-ring-color": "#03a9f4"}}
                    >
                      <option value="">Sin cuota</option>
                      <option value="mensual">Mensual ({formatearPrecio(config.cuotaMensual)})</option>
                      <option value="mensualVencida">Mensual Vencida ({formatearPrecio(config.cuotaMensualVencida)})</option>
                      <option value="trimestral">Trimestral ({formatearPrecio(config.cuotaTrimestral)})</option>
                    </select>
                  </div>

                  {/* Tipo de Seguro */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seguro
                    </label>
                    <select
                      name="tipoSeguro"
                      value={formData.tipoSeguro}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                      style={{"--tw-ring-color": "#03a9f4"}}
                    >
                      <option value="">Sin seguro</option>
                      <option value="semestral">Semestral ({formatearPrecio(config.seguro)})</option>
                    </select>
                  </div>
                </div>

                {/* Fecha de Pago */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Pago
                  </label>
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      type="button"
                      onClick={toggleFechaHoy}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        formData.usarFechaHoy
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      Hoy
                    </button>
                    <button
                      type="button"
                      onClick={toggleFechaHoy}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        !formData.usarFechaHoy
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      Otra fecha
                    </button>
                  </div>
                  {!formData.usarFechaHoy && (
                    <input
                      type="date"
                      name="fechaPago"
                      value={formData.fechaPago}
                      onChange={handleInputChange}
                      required={!formData.usarFechaHoy}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                      style={{"--tw-ring-color": "#03a9f4"}}
                    />
                  )}
                </div>

                {/* Resumen */}
                {formData.socioId && (formData.tipoCuota || formData.tipoSeguro) && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-700 mb-3">Resumen del Pago</h3>
                    <div className="space-y-2 text-sm">
                      {formData.tipoCuota && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cuota:</span>
                          <span className="font-medium">{formatearPrecio(montos.montoCuota)}</span>
                        </div>
                      )}
                      {formData.tipoSeguro && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Seguro:</span>
                          <span className="font-medium">{formatearPrecio(montos.montoSeguro)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-gray-300">
                        <span className="font-semibold text-gray-800">Total:</span>
                        <span className="font-bold text-xl" style={{color: '#03a9f4'}}>
                          {formatearPrecio(montos.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all"
                    style={{backgroundColor: '#03a9f4'}}
                  >
                    <Save className="w-4 h-4" />
                    Registrar Pago
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}