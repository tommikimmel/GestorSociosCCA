import { useState, useEffect } from "react";
import { crearSocio, obtenerSocios, actualizarSocio, toggleEstadoSocio } from "../services/socios";
import { Timestamp } from "firebase/firestore";
import { 
  UserPlus, 
  Edit, 
  Save, 
  X, 
  Search,
  Power,
  AlertCircle,
  CheckCircle,
  Users
} from "lucide-react";
import Alert from "../components/layout/Alert";
import { useAlert } from "../hooks/useAlert";

export default function Socios() {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingState, setTogglingState] = useState(null);
  const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
  
  // Form state
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    fechaPagoCuota: "",
    fechaVencimientoCuota: "",
    fechaPagoSeguro: "",
    fechaVencimientoSeguro: ""
  });

  // Load socios on mount
  useEffect(() => {
    cargarSocios();
  }, []);

  const cargarSocios = async () => {
    try {
      setLoading(true);
      const data = await obtenerSocios();
      setSocios(data);
    } catch (error) {
      console.error("Error al cargar socios:", error);
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

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      fechaPagoCuota: "",
      fechaVencimientoCuota: "",
      fechaPagoSeguro: "",
      fechaVencimientoSeguro: ""
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return;
    
    try {
      setSubmitting(true);
      
      if (editingId) {
        // Update existing socio
        const updateData = {
          nombre: formData.nombre,
          apellido: formData.apellido,
        };

        // Solo agregar fechas si tienen valor
        if (formData.fechaPagoCuota) {
          updateData.fechaPagoCuota = Timestamp.fromDate(new Date(formData.fechaPagoCuota));
        }
        if (formData.fechaVencimientoCuota) {
          updateData.fechaVencimientoCuota = Timestamp.fromDate(new Date(formData.fechaVencimientoCuota));
        }
        if (formData.fechaPagoSeguro) {
          updateData.fechaPagoSeguro = Timestamp.fromDate(new Date(formData.fechaPagoSeguro));
        }
        if (formData.fechaVencimientoSeguro) {
          updateData.fechaVencimientoSeguro = Timestamp.fromDate(new Date(formData.fechaVencimientoSeguro));
        }

        await actualizarSocio(editingId, updateData);
      } else {
        // Create new socio
        await crearSocio({
          nombre: formData.nombre,
          apellido: formData.apellido
        });
      }
      
      await cargarSocios();
      setShowModal(false);
      resetForm();
      
      // Mostrar alerta de éxito
      showSuccess(
        editingId ? 'Socio actualizado' : 'Socio creado',
        editingId 
          ? `Los datos de ${formData.nombre} ${formData.apellido} se actualizaron correctamente`
          : `${formData.nombre} ${formData.apellido} se agregó correctamente`,
        3000
      );
      
      // Cooldown de 1.5 segundos
      setTimeout(() => {
        setSubmitting(false);
      }, 1500);
    } catch (error) {
      console.error("Error al guardar socio:", error);
      showError(
        'Error al guardar',
        'No se pudo guardar el socio. Por favor intenta nuevamente.'
      );
      setSubmitting(false);
    }
  };

  const handleEdit = (socio) => {
    setEditingId(socio.id);
    setFormData({
      nombre: socio.nombre,
      apellido: socio.apellido,
      fechaPagoCuota: socio.fechaPagoCuota?.toDate?.()?.toISOString().split('T')[0] || "",
      fechaVencimientoCuota: socio.fechaVencimientoCuota?.toDate?.()?.toISOString().split('T')[0] || "",
      fechaPagoSeguro: socio.fechaPagoSeguro?.toDate?.()?.toISOString().split('T')[0] || "",
      fechaVencimientoSeguro: socio.fechaVencimientoSeguro?.toDate?.()?.toISOString().split('T')[0] || ""
    });
    setShowModal(true);
  };

  const handleToggleEstado = async (id, estadoActual) => {
    if (togglingState === id) return;
    
    try {
      setTogglingState(id);
      const socio = socios.find(s => s.id === id);
      await toggleEstadoSocio(id, estadoActual);
      await cargarSocios();
      
      // Mostrar alerta warning
      if (estadoActual) {
        // Estaba activo, ahora se desactiva
        showWarning(
          'Socio desactivado',
          `${socio.nombre} ${socio.apellido} ha sido desactivado`,
          4000
        );
      } else {
        // Estaba inactivo, ahora se activa
        showWarning(
          'Socio activado',
          `${socio.nombre} ${socio.apellido} ha sido activado`,
          4000
        );
      }
      
      // Cooldown de 1.5 segundos
      setTimeout(() => {
        setTogglingState(null);
      }, 1500);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      showError(
        'Error al cambiar estado',
        'No se pudo cambiar el estado del socio'
      );
      setTogglingState(null);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Filter socios based on search term
  const filteredSocios = socios.filter(socio => 
    socio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    socio.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sociosActivos = socios.filter(s => s.activo).length;
  const sociosInactivos = socios.filter(s => !s.activo).length;
  const deudoresCuota = socios.filter(s => s.deudorCuota).length;
  const deudoresSeguro = socios.filter(s => s.deudorSeguro).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Componente de Alerta */}
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        show={alert.show}
        onClose={hideAlert}
        autoCloseDuration={alert.autoCloseDuration}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Users className="w-8 h-8" style={{color: '#03a9f4'}} />
          Gestión de Socios
        </h1>
        <p className="text-gray-600">Administra todos los socios del club</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total</p>
          <p className="text-3xl font-bold" style={{color: '#03a9f4'}}>{socios.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Activos</p>
          <p className="text-3xl font-bold text-green-600">{sociosActivos}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Deuda Cuota</p>
          <p className="text-3xl font-bold text-orange-600">{deudoresCuota}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Deuda Seguro</p>
          <p className="text-3xl font-bold text-red-600">{deudoresSeguro}</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o apellido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none shadow-sm"
            style={{"--tw-ring-color": "#03a9f4"}}
          />
        </div>
        <button
          onClick={openCreateModal}
          className="text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all"
          style={{backgroundColor: '#03a9f4'}}
        >
          <UserPlus className="w-5 h-5" />
          Nuevo Socio
        </button>
      </div>

      {/* Socios Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{borderBottomColor: '#03a9f4'}}></div>
          <p className="mt-4 text-gray-600">Cargando socios...</p>
        </div>
      ) : filteredSocios.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No se encontraron socios</p>
          {searchTerm && (
            <p className="text-gray-500 mt-2">Intenta con otro término de búsqueda</p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Socio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado Cuota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado Seguro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSocios.map((socio) => (
                  <tr key={socio.id} className={!socio.activo ? "bg-gray-50 opacity-75" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center" style={{backgroundColor: '#e0f7fa'}}>
                          <span className="font-semibold text-sm" style={{color: '#03a9f4'}}>
                            {socio.nombre.charAt(0)}{socio.apellido.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {socio.nombre} {socio.apellido}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {socio.deudorCuota ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <AlertCircle className="w-3 h-3" />
                          Deudor
                        </span>
                      ) : socio.fechaVencimientoCuota ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                          Al día
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Sin datos</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {socio.deudorSeguro ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle className="w-3 h-3" />
                          Deudor
                        </span>
                      ) : socio.fechaVencimientoSeguro ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                          Al día
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Sin datos</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleEstado(socio.id, socio.activo)}
                        disabled={togglingState === socio.id}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                          socio.activo
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {togglingState === socio.id ? "Procesando..." : (socio.activo ? "Activo" : "Inactivo")}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(socio)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                        style={{color: '#03a9f4'}}
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
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
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingId ? "Editar Socio" : "Nuevo Socio"}
                </h2>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                      style={{"--tw-ring-color": "#03a9f4"}}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                      style={{"--tw-ring-color": "#03a9f4"}}
                    />
                  </div>
                </div>

                {editingId && (
                  <>
                    <div className="border-t pt-4 mb-4">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Información de Cuota</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Pago Cuota
                          </label>
                          <input
                            type="date"
                            name="fechaPagoCuota"
                            value={formData.fechaPagoCuota}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                            style={{"--tw-ring-color": "#03a9f4"}}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Vencimiento Cuota
                          </label>
                          <input
                            type="date"
                            name="fechaVencimientoCuota"
                            value={formData.fechaVencimientoCuota}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                            style={{"--tw-ring-color": "#03a9f4"}}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Información de Seguro</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Pago Seguro
                          </label>
                          <input
                            type="date"
                            name="fechaPagoSeguro"
                            value={formData.fechaPagoSeguro}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                            style={{"--tw-ring-color": "#03a9f4"}}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Vencimiento Seguro
                          </label>
                          <input
                            type="date"
                            name="fechaVencimientoSeguro"
                            value={formData.fechaVencimientoSeguro}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                            style={{"--tw-ring-color": "#03a9f4"}}
                          />
                        </div>
                      </div>
                    </div>
                  </>
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
                    disabled={submitting}
                    className="text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{backgroundColor: '#03a9f4'}}
                  >
                    <Save className="w-4 h-4" />
                    {submitting ? "Guardando..." : (editingId ? "Actualizar" : "Crear")}
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