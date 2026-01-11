import { useState, useEffect } from "react";
import { Settings, DollarSign, Calendar, AlertCircle, Shield, Edit2, Save, X, ArrowRightLeft, Wallet, CreditCard, PiggyBank } from "lucide-react";
import { obtenerConfiguracion, actualizarConfiguracion } from "../services/configuracion";
import { obtenerCuentas, realizarTransferencia as realizarTransferenciaCuentas, inicializarCuentas } from "../services/cuentas";
import { motion, AnimatePresence } from "framer-motion";

export default function Administracion() {
  const [config, setConfig] = useState(null); 
  const [cuentas, setCuentas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [valorTemporal, setValorTemporal] = useState("");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [propietarioEfectivo, setPropietarioEfectivo] = useState("Bernardo");
  const [propietarioTransferencia, setPropietarioTransferencia] = useState("Bernardo");
  const [savingConfig, setSavingConfig] = useState(false);
  const [submittingTransfer, setSubmittingTransfer] = useState(false);
  const [transferData, setTransferData] = useState({
    origen: "",
    destino: "",
    monto: ""
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Inicializar cuentas si es necesario
      await inicializarCuentas();
      
      const [configData, cuentasData] = await Promise.all([
        obtenerConfiguracion(),
        obtenerCuentas()
      ]);
      setConfig(configData);
      setCuentas(cuentasData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
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
    if (savingConfig) return;
    
    const nuevoValor = parseInt(valorTemporal);
    if (isNaN(nuevoValor) || nuevoValor <= 0) {
      alert("Por favor ingresa un valor numérico válido");
      return;
    }

    try {
      setSavingConfig(true);
      const nuevaConfig = {
        ...config,
        [campo]: nuevoValor,
      };
      await actualizarConfiguracion(nuevaConfig);
      setConfig(nuevaConfig);
      setEditando(null);
      setValorTemporal("");
      
      // Cooldown de 1.5 segundos
      setTimeout(() => {
        setSavingConfig(false);
      }, 1500);
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      alert("Error al guardar los cambios");
      setSavingConfig(false);
    }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(precio);
  };

  // Obtener saldos directos de las cuentas (ya incluyen pagos y gastos actualizados automáticamente)
  const calcularCuentas = () => {
    if (!cuentas) {
      return { 
        efectivoBernardo: 0, 
        efectivoDaniel: 0, 
        transferenciaBernardo: 0, 
        transferenciaDaniel: 0, 
        plazoFijo: 0 
      };
    }

    const efectivoBernardo = cuentas.efectivoBernardo?.saldo || 0;
    const efectivoDaniel = cuentas.efectivoDaniel?.saldo || 0;
    const transferenciaBernardo = cuentas.transferenciaBernardo?.saldo || 0;
    const transferenciaDaniel = cuentas.transferenciaDaniel?.saldo || 0;
    const plazoFijo = cuentas.plazoFijo?.saldo || 0;

    return { efectivoBernardo, efectivoDaniel, transferenciaBernardo, transferenciaDaniel, plazoFijo };
  };

  const resetTransferForm = () => {
    setTransferData({
      origen: "",
      destino: "",
      monto: ""
    });
    setShowTransferModal(false);
  };

  const handleTransferChange = (e) => {
    const { name, value } = e.target;
    setTransferData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const realizarTransferencia = async (e) => {
    e.preventDefault();

    if (submittingTransfer) return;

    if (!transferData.origen || !transferData.destino || !transferData.monto) {
      alert("Por favor completa todos los campos");
      return;
    }

    if (transferData.origen === transferData.destino) {
      alert("Las cuentas de origen y destino no pueden ser la misma");
      return;
    }

    const monto = parseFloat(transferData.monto);
    if (isNaN(monto) || monto <= 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }

    // Mapear los nombres de campos a IDs de cuentas
    const mapeoIds = {
      'cuentaEfectivoBernardo': 'efectivoBernardo',
      'cuentaEfectivoDaniel': 'efectivoDaniel',
      'cuentaTransferenciaBernardo': 'transferenciaBernardo',
      'cuentaTransferenciaDaniel': 'transferenciaDaniel',
      'cuentaPlazoFijo': 'plazoFijo'
    };

    const origenId = mapeoIds[transferData.origen];
    const destinoId = mapeoIds[transferData.destino];

    try {
      setSubmittingTransfer(true);
      
      // Obtener saldos actuales directamente de las cuentas
      const cuentaOrigen = cuentas[origenId];
      const cuentaDestino = cuentas[destinoId];

      if (!cuentaOrigen || !cuentaDestino) {
        alert("Error: No se pudieron obtener las cuentas");
        setSubmittingTransfer(false);
        return;
      }

      // Verificar saldo suficiente en la cuenta de origen
      if (cuentaOrigen.saldo < monto) {
        alert(`Saldo insuficiente en ${getNombreCuenta(transferData.origen)}. Saldo disponible: ${formatearPrecio(cuentaOrigen.saldo)}`);
        setSubmittingTransfer(false);
        return;
      }

      // Realizar la transferencia: restar de origen y sumar a destino
      await realizarTransferenciaCuentas(origenId, destinoId, monto);
      
      alert(`Transferencia exitosa: ${formatearPrecio(monto)} de ${getNombreCuenta(transferData.origen)} a ${getNombreCuenta(transferData.destino)}`);
      resetTransferForm();
      cargarDatos(); // Recargar datos para actualizar saldos
      
      // Cooldown de 1.5 segundos
      setTimeout(() => {
        setSubmittingTransfer(false);
      }, 1500);
    } catch (error) {
      console.error("Error al realizar transferencia:", error);
      alert("Error al realizar la transferencia: " + error.message);
      setSubmittingTransfer(false);
    }
  };

  const getNombreCuenta = (cuenta) => {
    const nombres = {
      cuentaEfectivoBernardo: "Efectivo - Bernardo",
      cuentaEfectivoDaniel: "Efectivo - Daniel",
      cuentaTransferenciaBernardo: "Transferencia - Bernardo",
      cuentaTransferenciaDaniel: "Transferencia - Daniel",
      cuentaPlazoFijo: "Plazo Fijo"
    };
    return nombres[cuenta] || cuenta;
  };

  const getIconoCuenta = (cuenta) => {
    const iconos = {
      cuentaEfectivoBernardo: <Wallet className="w-4 h-4" />,
      cuentaEfectivoDaniel: <Wallet className="w-4 h-4" />,
      cuentaTransferenciaBernardo: <CreditCard className="w-4 h-4" />,
      cuentaTransferenciaDaniel: <CreditCard className="w-4 h-4" />,
      cuentaPlazoFijo: <PiggyBank className="w-4 h-4" />
    };
    return iconos[cuenta] || null;
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

  const saldosCuentas = calcularCuentas();

  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Settings className="w-6 h-6 sm:w-8 sm:h-8" style={{color: '#03a9f4'}} />
              Administración
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Configuración de pagos y cuotas del club</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Cuotas Section */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
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

          <div className="p-6 space-y-6">
            {/* Cuota Trimestral */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5" style={{color: '#03a9f4'}} />
                    Cuota Trimestral
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mb-3">Pago cada 3 meses</p>
                <div className="flex items-center gap-2">
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
                        disabled={savingConfig}
                        className="p-1.5 rounded bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-5 pt-4 border-t-2 border-gray-100 bg-linear-to-r from-blue-50/50 to-transparent rounded-b-lg -mx-6 -mb-6 px-6 py-4">
                <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-lg">💰</span> Ahorro de {formatearPrecio(config.cuotaMensual * 3 - config.cuotaTrimestral)} vs pago mensual
                </p>
              </div>
            </motion.div>

            {/* Cuota Mensual */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    Cuota Mensual
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mb-3">Hasta el día 15 de cada mes</p>
                <div className="flex items-center gap-2">
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
                        disabled={savingConfig}
                        className="p-1.5 rounded bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-5 pt-4 border-t-2 border-gray-100 bg-linear-to-r from-green-50/50 to-transparent rounded-b-lg -mx-6 -mb-6 px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  Precio regular si se paga antes del día 15
                </div>
              </div>
            </motion.div>

            {/* Cuota Mensual Vencida */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    Cuota Mensual Vencida
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mb-3">Después del día 15 del mes</p>
                <div className="flex items-center gap-2">
                  {editando === 'cuotaMensualVencida' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={valorTemporal}
                        onChange={(e) => setValorTemporal(e.target.value)}
                        className="w-32 px-2 py-1 border border-gray-300 rounded text-right font-bold text-orange-600"
                        autoFocus
                      />
                      <button
                        onClick={() => guardarCambio('cuotaMensualVencida')}
                        disabled={savingConfig}
                        className="p-1.5 rounded bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <p className="text-2xl font-bold text-orange-600">
                        {formatearPrecio(config.cuotaMensualVencida)}
                      </p>
                      <button
                        onClick={() => iniciarEdicion('cuotaMensualVencida', config.cuotaMensualVencida)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-5 pt-4 border-t-2 border-gray-100 bg-linear-to-r from-orange-50/50 to-transparent rounded-b-lg -mx-6 -mb-6 px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-orange-700 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  Recargo de {formatearPrecio(config.cuotaMensualVencida - config.cuotaMensual)} por pago fuera de término
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Seguro Section */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
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
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Seguro Semestral
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mb-3">Vigencia: 6 meses</p>
                <div className="flex items-center gap-2">
                  {editando === 'seguro' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={valorTemporal}
                        onChange={(e) => setValorTemporal(e.target.value)}
                        className="w-32 px-2 py-1 border border-gray-300 rounded text-right font-bold text-blue-600"
                        autoFocus
                      />
                      <button
                        onClick={() => guardarCambio('seguro')}
                        disabled={savingConfig}
                        className="p-1.5 rounded bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <p className="text-2xl font-bold text-blue-600">
                        {formatearPrecio(config.seguro)}
                      </p>
                      <button
                        onClick={() => iniciarEdicion('seguro', config.seguro)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-5 pt-4 border-t-2 border-gray-100 bg-linear-to-r from-blue-50/50 to-transparent rounded-b-lg -mx-6 -mb-6 px-6 py-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-lg">🛡️</span> Cobertura incluida:
                  </p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>Responsabilidad civil</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>Válido para todas las actividades</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Transferencias entre Cuentas */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-purple-100">
              <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Transferencias entre Cuentas</h2>
              <p className="text-xs sm:text-sm text-gray-500">Mueve dinero entre cuentas</p>
            </div>
          </div>
          <button
            onClick={() => setShowTransferModal(true)}
            className="w-full text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transition-all"
            style={{backgroundColor: '#03a9f4'}}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Nueva Transferencia
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Efectivo con Toggle */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              whileHover={{ y: -5, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              className="border border-gray-200 rounded-lg p-4 bg-linear-to-br from-green-50 to-white"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Wallet className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Efectivo</h3>
                    <p className="text-xs text-gray-600">{propietarioEfectivo === "Bernardo" ? "Bernardo F." : "Daniel C."}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPropietarioEfectivo(prev => prev === "Bernardo" ? "Daniel" : "Bernardo")}
                  className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                >
                  Cambiar
                </button>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatearPrecio(propietarioEfectivo === "Bernardo" ? saldosCuentas.efectivoBernardo : saldosCuentas.efectivoDaniel)}
              </p>
            </motion.div>

            {/* Transferencia con Toggle */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              whileHover={{ y: -5, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              className="border border-gray-200 rounded-lg p-4 bg-linear-to-br from-blue-50 to-white"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Transferencia</h3>
                    <p className="text-xs text-gray-600">{propietarioTransferencia === "Bernardo" ? "Bernardo F." : "Daniel C."}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPropietarioTransferencia(prev => prev === "Bernardo" ? "Daniel" : "Bernardo")}
                  className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                >
                  Cambiar
                </button>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {formatearPrecio(propietarioTransferencia === "Bernardo" ? saldosCuentas.transferenciaBernardo : saldosCuentas.transferenciaDaniel)}
              </p>
            </motion.div>

            {/* Plazo Fijo */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
              whileHover={{ y: -5, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              className="border border-gray-200 rounded-lg p-4 bg-linear-to-br from-purple-50 to-white"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <PiggyBank className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Plazo Fijo</h3>
                  <p className="text-xs text-gray-600">Compartido</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {formatearPrecio(saldosCuentas.plazoFijo)}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Resumen de fechas importantes */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" style={{color: '#03a9f4'}} />
          Fechas Importantes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <span className="text-green-600 font-bold text-sm">15</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Límite de pago mensual</p>
              <p className="text-xs text-gray-500">Hasta el día 15 para mantener precio regular</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <span className="text-orange-600 font-bold text-sm">16+</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Pago con recargo</p>
              <p className="text-xs text-gray-500">Después del día 15 aplica recargo de $5.000</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Renovación de seguro</p>
              <p className="text-xs text-gray-500">Cada 6 meses desde la fecha de pago</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal de Transferencia */}
      <AnimatePresence>
      {showTransferModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              resetTransferForm();
            }
          }}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6" style={{color: '#03a9f4'}} />
                  Transferir Dinero
                </h2>
                <button
                  onClick={resetTransferForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={realizarTransferencia}>
                {/* Cuenta Origen */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuenta Origen *
                  </label>
                  <select
                    name="origen"
                    value={transferData.origen}
                    onChange={handleTransferChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                    style={{"--tw-ring-color": "#03a9f4"}}
                    required
                  >
                    <option value="">Seleccionar cuenta...</option>
                    <option value="cuentaEfectivoBernardo">💵 Efectivo - Bernardo ({formatearPrecio(saldosCuentas.efectivoBernardo)})</option>
                    <option value="cuentaEfectivoDaniel">💵 Efectivo - Daniel ({formatearPrecio(saldosCuentas.efectivoDaniel)})</option>
                    <option value="cuentaTransferenciaBernardo">💳 Transferencia - Bernardo ({formatearPrecio(saldosCuentas.transferenciaBernardo)})</option>
                    <option value="cuentaTransferenciaDaniel">💳 Transferencia - Daniel ({formatearPrecio(saldosCuentas.transferenciaDaniel)})</option>
                    <option value="cuentaPlazoFijo">🏦 Plazo Fijo ({formatearPrecio(saldosCuentas.plazoFijo)})</option>
                  </select>
                </div>

                {/* Cuenta Destino */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuenta Destino *
                  </label>
                  <select
                    name="destino"
                    value={transferData.destino}
                    onChange={handleTransferChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                    style={{"--tw-ring-color": "#03a9f4"}}
                    required
                  >
                    <option value="">Seleccionar cuenta...</option>
                    <option value="cuentaEfectivoBernardo" disabled={transferData.origen === 'cuentaEfectivoBernardo'}>
                      💵 Efectivo - Bernardo
                    </option>
                    <option value="cuentaEfectivoDaniel" disabled={transferData.origen === 'cuentaEfectivoDaniel'}>
                      💵 Efectivo - Daniel
                    </option>
                    <option value="cuentaTransferenciaBernardo" disabled={transferData.origen === 'cuentaTransferenciaBernardo'}>
                      💳 Transferencia - Bernardo
                    </option>
                    <option value="cuentaTransferenciaDaniel" disabled={transferData.origen === 'cuentaTransferenciaDaniel'}>
                      💳 Transferencia - Daniel
                    </option>
                    <option value="cuentaPlazoFijo" disabled={transferData.origen === 'cuentaPlazoFijo'}>
                      🏦 Plazo Fijo
                    </option>
                  </select>
                </div>

                {/* Monto */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto a Transferir *
                  </label>
                  <input
                    type="number"
                    name="monto"
                    value={transferData.monto}
                    onChange={handleTransferChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                    style={{"--tw-ring-color": "#03a9f4"}}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                {/* Resumen */}
                {transferData.origen && transferData.destino && transferData.monto && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Resumen de la transferencia:</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        {getIconoCuenta(transferData.origen)}
                        <span>{getNombreCuenta(transferData.origen)}</span>
                        <ArrowRightLeft className="w-3 h-3 mx-2" />
                        {getIconoCuenta(transferData.destino)}
                        <span>{getNombreCuenta(transferData.destino)}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-300">
                        <span className="font-bold text-lg" style={{color: '#03a9f4'}}>
                          {formatearPrecio(parseFloat(transferData.monto))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetTransferForm}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingTransfer}
                    className="text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{backgroundColor: '#03a9f4'}}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    {submittingTransfer ? "Transfiriendo..." : "Transferir"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}