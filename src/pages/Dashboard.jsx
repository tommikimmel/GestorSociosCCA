import { useState, useEffect } from "react";
import { obtenerPagos } from "../services/pagos";
import { obtenerGastos } from "../services/gastos";
import { obtenerSocios } from "../services/socios";
import { obtenerCuentas, actualizarSaldoCuenta, inicializarCuentas } from "../services/cuentas";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  CreditCard,
  PiggyBank,
  AlertCircle,
  DollarSign,
  Calendar,
  Edit2,
  Save,
  X
} from "lucide-react";

export default function Dashboard() {
  const [pagos, setPagos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [socios, setSocios] = useState([]);
  const [cuentas, setCuentas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vistaActiva, setVistaActiva] = useState("pagos");
  const [editandoCuenta, setEditandoCuenta] = useState(null); // "efectivo", "transferencia", "plazoFijo"
  const [valorTemporal, setValorTemporal] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Inicializar cuentas si es necesario
      await inicializarCuentas();
      
      const [pagosData, gastosData, sociosData, cuentasData] = await Promise.all([
        obtenerPagos(),
        obtenerGastos(),
        obtenerSocios(),
        obtenerCuentas(),
      ]);
      setPagos(pagosData);
      setGastos(gastosData);
      setSocios(sociosData);
      setCuentas(cuentasData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
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
      return { efectivo: 0, transferencia: 0, plazoFijo: 0, total: 0 };
    }

    const efectivo = cuentas.efectivo?.saldo || 0;
    const transferencia = cuentas.transferencia?.saldo || 0;
    const plazoFijo = cuentas.plazoFijo?.saldo || 0;

    return { efectivo, transferencia, plazoFijo, total: efectivo + transferencia + plazoFijo };
  };

  // Calcular datos mensuales
  const calcularDatosMensuales = () => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const añoActual = new Date().getFullYear();
    const datosMensuales = meses.map((mes) => ({
      mes,
      monto: 0
    }));

    if (vistaActiva === 'pagos') {
      pagos.forEach(pago => {
        const fecha = pago.fechaPago?.toDate();
        if (fecha && fecha.getFullYear() === añoActual) {
          const mesIndex = fecha.getMonth();
          datosMensuales[mesIndex].monto += pago.montoTotal || 0;
        }
      });
    } else {
      gastos.forEach(gasto => {
        const fecha = gasto.fechaRealizacion?.toDate();
        if (fecha && fecha.getFullYear() === añoActual) {
          const mesIndex = fecha.getMonth();
          datosMensuales[mesIndex].monto += gasto.monto || 0;
        }
      });
    }

    return datosMensuales;
  };

  // Obtener deudores
  const obtenerDeudores = () => {
    return socios.filter(socio => socio.activo && (socio.deudorCuota || socio.deudorSeguro))
      .sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`));
  };

  const iniciarEdicionCuenta = (cuenta, valor) => {
    console.log('Editando cuenta:', cuenta, 'Saldo actual:', valor);
    setEditandoCuenta(cuenta);
    setValorTemporal(valor.toString());
  };

  const cancelarEdicionCuenta = () => {
    setEditandoCuenta(null);
    setValorTemporal("");
  };

  const guardarCuenta = async () => {
    const nuevoValor = parseFloat(valorTemporal);
    if (isNaN(nuevoValor)) {
      alert("Por favor ingresa un valor numérico válido");
      return;
    }

    try {
      await actualizarSaldoCuenta(editandoCuenta, nuevoValor);
      setEditandoCuenta(null);
      setValorTemporal("");
      cargarDatos(); // Recargar para actualizar todo
    } catch (error) {
      console.error("Error al guardar cuenta:", error);
      alert("Error al guardar los cambios");
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{borderBottomColor: '#03a9f4'}}></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const datosMensuales = calcularDatosMensuales();
  const maxMonto = Math.max(...datosMensuales.map(d => d.monto));
  const saldosCuentas = calcularCuentas();
  const deudores = obtenerDeudores();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <BarChart3 className="w-8 h-8" style={{color: '#03a9f4'}} />
          Dashboard
        </h1>
        <p className="text-gray-600">Resumen general del club</p>
      </div>

      {/* Cuentas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        {/* Efectivo */}
        <div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => editandoCuenta !== 'efectivo' && iniciarEdicionCuenta('efectivo', cuentas?.efectivo?.saldo || 0)}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-50">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Efectivo</p>
            {editandoCuenta !== 'efectivo' && (
              <Edit2 className="w-3 h-3 text-gray-400 ml-auto" />
            )}
          </div>
          {editandoCuenta === 'efectivo' ? (
            <>
            <p className="text-xs text-gray-400 mb-1">Saldo base (actual: {cuentas?.efectivo?.saldo || 0})</p>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="number"
                value={valorTemporal}
                onChange={(e) => setValorTemporal(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-lg font-bold text-green-600"
                autoFocus
                step="0.01"
                placeholder="0"
              />
              <button
                onClick={guardarCuenta}
                className="p-1.5 rounded bg-green-100 text-green-600 hover:bg-green-200"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={cancelarEdicionCuenta}
                className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            </>
          ) : (
            <p className="text-2xl font-bold text-green-600">{formatearPrecio(saldosCuentas.efectivo)}</p>
          )}
        </div>

        {/* Transferencia */}
        <div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => editandoCuenta !== 'transferencia' && iniciarEdicionCuenta('transferencia', cuentas?.transferencia?.saldo || 0)}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-50">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Transferencia</p>
            {editandoCuenta !== 'transferencia' && (
              <Edit2 className="w-3 h-3 text-gray-400 ml-auto" />
            )}
          </div>
          {editandoCuenta === 'transferencia' ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="number"
                value={valorTemporal}
                onChange={(e) => setValorTemporal(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-lg font-bold text-blue-600"
                autoFocus
                step="0.01"
                placeholder="0"
              />
              <button
                onClick={guardarCuenta}
                className="p-1.5 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={cancelarEdicionCuenta}
                className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-2xl font-bold text-blue-600">{formatearPrecio(saldosCuentas.transferencia)}</p>
          )}
        </div>

        {/* Plazo Fijo */}
        <div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => editandoCuenta !== 'plazoFijo' && iniciarEdicionCuenta('plazoFijo', cuentas?.plazoFijo?.saldo || 0)}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-50">
              <PiggyBank className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Plazo Fijo</p>
            {editandoCuenta !== 'plazoFijo' && (
              <Edit2 className="w-3 h-3 text-gray-400 ml-auto" />
            )}
          </div>
          {editandoCuenta === 'plazoFijo' ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="number"
                value={valorTemporal}
                onChange={(e) => setValorTemporal(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-lg font-bold text-purple-600"
                autoFocus
                step="0.01"
                placeholder="0"
              />
              <button
                onClick={guardarCuenta}
                className="p-1.5 rounded bg-purple-100 text-purple-600 hover:bg-purple-200"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={cancelarEdicionCuenta}
                className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-2xl font-bold text-purple-600">{formatearPrecio(saldosCuentas.plazoFijo)}</p>
          )}
        </div>

        {/* Total */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg" style={{backgroundColor: '#e0f7fa'}}>
              <DollarSign className="w-5 h-5" style={{color: '#03a9f4'}} />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
          </div>
          <p className="text-2xl font-bold" style={{color: '#03a9f4'}}>{formatearPrecio(saldosCuentas.total)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Mensual */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Gráfico Mensual</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setVistaActiva('pagos')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all ${
                    vistaActiva === 'pagos'
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={vistaActiva === 'pagos' ? {backgroundColor: '#03a9f4'} : {}}
                >
                  <TrendingUp className="w-4 h-4" />
                  Pagos
                </button>
                <button
                  onClick={() => setVistaActiva('gastos')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all ${
                    vistaActiva === 'gastos'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  Gastos
                </button>
              </div>
            </div>

            {/* Gráfico de Barras */}
            {maxMonto === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3" />
                <p>No hay {vistaActiva === 'pagos' ? 'pagos' : 'gastos'} registrados este año</p>
              </div>
            ) : (
              <div className="h-96">
                <div className="flex items-end justify-around gap-1 h-80 border-b-2 border-l-2 border-gray-300 px-2">
                  {datosMensuales.map((dato, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">
                      {dato.monto > 0 && (
                        <span className="text-xs font-semibold text-gray-700 mb-1">
                          {formatearPrecio(dato.monto)}
                        </span>
                      )}
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          vistaActiva === 'pagos' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'
                        }`}
                        style={{
                          height: `${(dato.monto / maxMonto) * 100}%`,
                          minHeight: dato.monto > 0 ? '4px' : '0'
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-around gap-1 mt-2 px-2">
                  {datosMensuales.map((dato, index) => (
                    <div key={index} className="flex-1 text-center">
                      <span className="text-xs font-medium text-gray-600">{dato.mes}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Deudores */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-800">Deudores</h2>
            </div>

            {deudores.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                <p className="text-sm">No hay deudores</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {deudores.map((socio) => (
                  <div
                    key={socio.id}
                    className="p-3 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {socio.apellido}, {socio.nombre}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {socio.deudorCuota && (
                            <span className="text-xs px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full">
                              Cuota
                            </span>
                          )}
                          {socio.deudorSeguro && (
                            <span className="text-xs px-2 py-0.5 bg-red-200 text-red-800 rounded-full">
                              Seguro
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}