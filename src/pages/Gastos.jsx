import { useState, useEffect } from "react";
import { crearGasto, obtenerGastos, eliminarGasto, actualizarGasto } from "../services/gastos";
import { Timestamp } from "firebase/firestore";
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  DollarSign,
  FileText,
  Calendar,
  CreditCard,
  TrendingDown
} from "lucide-react";

const TIPOS_GASTO = ["Luz", "Agua", "Limpieza", "Mantenimiento", "Corte de pasto"];
const METODOS_PAGO = ["Efectivo", "Transferencia"];
const REALIZADORES = ["Bernardo Fioramonti", "Daniel Carranza"];

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [gastoEditando, setGastoEditando] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    tipo: "",
    detalle: "",
    metodoPago: "",
    monto: "",
    fechaRealizacion: "",
    realizadoPor: ""
  });

  useEffect(() => {
    cargarGastos();
  }, []);

  const cargarGastos = async () => {
    try {
      setLoading(true);
      const data = await obtenerGastos();
      setGastos(data);
    } catch {
      alert("Error al cargar los gastos");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFormulario = () => {
    setFormData({
      tipo: "",
      detalle: "",
      metodoPago: "",
      monto: "",
      fechaRealizacion: "",
      realizadoPor: ""
    });
    setGastoEditando(null);
    setShowModal(false);
  };

  const openCreateModal = () => {
    resetFormulario();
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return;
    
    if (!formData.tipo || !formData.detalle || !formData.metodoPago || !formData.monto || !formData.fechaRealizacion || !formData.realizadoPor) {
      alert("Por favor complete todos los campos");
      return;
    }

    try {
      setSubmitting(true);
      
      const gastoData = {
        tipo: formData.tipo,
        detalle: formData.detalle,
        metodoPago: formData.metodoPago,
        monto: parseFloat(formData.monto),
        fechaRealizacion: Timestamp.fromDate(new Date(formData.fechaRealizacion)),
        realizadoPor: formData.realizadoPor
      };

      if (gastoEditando) {
        await actualizarGasto(gastoEditando.id, gastoData);
        alert("Gasto actualizado exitosamente");
      } else {
        await crearGasto(gastoData);
        alert("Gasto creado exitosamente");
      }
      
      resetFormulario();
      cargarGastos();
      
      // Cooldown de 1.5 segundos
      setTimeout(() => {
        setSubmitting(false);
      }, 1500);
    } catch {
      alert("Error al guardar el gasto");
      setSubmitting(false);
    }
  };

  const handleEditar = (gasto) => {
    setGastoEditando(gasto);
    setFormData({
      tipo: gasto.tipo,
      detalle: gasto.detalle,
      metodoPago: gasto.metodoPago,
      monto: gasto.monto.toString(),
      fechaRealizacion: gasto.fechaRealizacion.toDate().toISOString().split('T')[0],
      realizadoPor: gasto.realizadoPor || ""
    });
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Está seguro de eliminar este gasto?")) return;
    
    try {
      await eliminarGasto(id);
      alert("Gasto eliminado exitosamente");
      cargarGastos();
    } catch {
      alert("Error al eliminar el gasto");
    }
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "";
    return timestamp.toDate().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  };

  const calcularTotal = () => {
    return gastos.reduce((total, gasto) => total + gasto.monto, 0);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{borderBottomColor: '#03a9f4'}}></div>
          <p className="mt-4 text-gray-600">Cargando gastos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" style={{color: '#03a9f4'}} />
          Gestión de Gastos
        </h1>
        <p className="text-sm sm:text-base text-gray-600">Administra los gastos del club</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Gastos</p>
          <p className="text-2xl font-bold text-red-600">{formatearMonto(calcularTotal())}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cantidad</p>
          <p className="text-3xl font-bold" style={{color: '#03a9f4'}}>{gastos.length}</p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={openCreateModal}
          className="w-full text-white px-4 sm:px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transition-all"
          style={{backgroundColor: '#03a9f4'}}
        >
          <Plus className="w-5 h-5" />
          <span>Registrar Gasto</span>
        </button>
      </div>

      {/* Gastos Table */}
      {gastos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <TrendingDown className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No hay gastos registrados</p>
          <p className="text-gray-500 mt-2">Comienza registrando el primer gasto</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalle
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Realizado Por
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método de Pago
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gastos.map((gasto) => (
                  <tr key={gasto.id} className="hover:bg-gray-50">
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatearFecha(gasto.fechaRealizacion)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
                      <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {gasto.tipo}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-700">
                      {gasto.detalle}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                        {gasto.realizadoPor || "No especificado"}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                        gasto.metodoPago === 'Efectivo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        <CreditCard className="w-3 h-3" />
                        {gasto.metodoPago}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                      {formatearMonto(gasto.monto)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => handleEditar(gasto)}
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(gasto.id)}
                          className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
              resetFormulario();
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {gastoEditando ? "Editar Gasto" : "Registrar Gasto"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetFormulario();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Tipo de Gasto */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Gasto *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                    style={{"--tw-ring-color": "#03a9f4"}}
                  >
                    <option value="">Seleccione un tipo...</option>
                    {TIPOS_GASTO.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
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
                    <option value="">Seleccione quien realizó el gasto...</option>
                    {REALIZADORES.map(realizador => (
                      <option key={realizador} value={realizador}>{realizador}</option>
                    ))}
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
                      onClick={() => setFormData(prev => ({...prev, metodoPago: 'Efectivo'}))}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.metodoPago === 'Efectivo'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <DollarSign className="w-5 h-5" />
                      <span className="font-medium">Efectivo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, metodoPago: 'Transferencia'}))}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.metodoPago === 'Transferencia'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span className="font-medium">Transferencia</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Monto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto *
                    </label>
                    <input
                      type="number"
                      name="monto"
                      value={formData.monto}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                      style={{"--tw-ring-color": "#03a9f4"}}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  {/* Fecha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Realización *
                    </label>
                    <input
                      type="date"
                      name="fechaRealizacion"
                      value={formData.fechaRealizacion}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                      style={{"--tw-ring-color": "#03a9f4"}}
                      required
                    />
                  </div>
                </div>

                {/* Detalle */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detalle del Gasto *
                  </label>
                  <textarea
                    name="detalle"
                    value={formData.detalle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                    style={{"--tw-ring-color": "#03a9f4"}}
                    placeholder="Ej: Mantenimiento de aire acondicionado, reparación de grifo, etc."
                    rows="4"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetFormulario();
                    }}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{backgroundColor: '#03a9f4'}}
                  >
                    <Save className="w-4 h-4" />
                    {submitting ? "Guardando..." : (gastoEditando ? "Actualizar" : "Guardar")}
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