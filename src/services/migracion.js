import { obtenerPagos } from "./pagos";
import { obtenerGastos } from "./gastos";
import { obtenerCuentas, actualizarSaldoCuenta } from "./cuentas";

/**
 * Sincroniza los saldos de las cuentas basándose en los pagos y gastos existentes
 * Esta función debe ejecutarse UNA VEZ para migrar datos existentes al nuevo sistema de cuentas
 */
export const sincronizarSaldosCuentas = async () => {
  try {
    console.log("Iniciando sincronización de saldos...");

    // Obtener datos
    const [pagos, gastos, cuentas] = await Promise.all([
      obtenerPagos(),
      obtenerGastos(),
      obtenerCuentas()
    ]);

    // Calcular totales por método de pago
    let totalEfectivoPagos = 0;
    let totalTransferenciaPagos = 0;

    pagos.forEach(pago => {
      if (pago.metodoPago === 'efectivo') {
        totalEfectivoPagos += pago.montoTotal || 0;
      } else if (pago.metodoPago === 'transferencia') {
        totalTransferenciaPagos += pago.montoTotal || 0;
      }
    });

    // Calcular totales de gastos
    let totalEfectivoGastos = 0;
    let totalTransferenciaGastos = 0;

    gastos.forEach(gasto => {
      if (gasto.metodoPago === 'Efectivo') {
        totalEfectivoGastos += gasto.monto || 0;
      } else if (gasto.metodoPago === 'Transferencia') {
        totalTransferenciaGastos += gasto.monto || 0;
      }
    });

    // Calcular saldos netos (pagos - gastos)
    const saldoEfectivo = totalEfectivoPagos - totalEfectivoGastos;
    const saldoTransferencia = totalTransferenciaPagos - totalTransferenciaGastos;

    console.log("Totales calculados:");
    console.log("Efectivo: Pagos:", totalEfectivoPagos, "Gastos:", totalEfectivoGastos, "Saldo:", saldoEfectivo);
    console.log("Transferencia: Pagos:", totalTransferenciaPagos, "Gastos:", totalTransferenciaGastos, "Saldo:", saldoTransferencia);

    // Actualizar las cuentas
    await actualizarSaldoCuenta('efectivo', saldoEfectivo);
    await actualizarSaldoCuenta('transferencia', saldoTransferencia);

    console.log("Sincronización completada exitosamente");
    
    return {
      success: true,
      saldos: {
        efectivo: saldoEfectivo,
        transferencia: saldoTransferencia,
        plazoFijo: cuentas.plazoFijo?.saldo || 0
      }
    };
  } catch (error) {
    console.error("Error en la sincronización:", error);
    throw error;
  }
};
