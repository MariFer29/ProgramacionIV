using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BC.Entidades;
using BancaOnline.BW.DTOs;
using BancaOnline.BW.Interfaces;
using BancaOnline.DA;
using BancaOnline.DA.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BancaOnline.BW.CU
{
    public class HistorialCU : IHistorialBW
    {
        private readonly IReportesDA _reportesDA;
        private readonly AppDbContext _context;

        public HistorialCU(IReportesDA reportesDA, AppDbContext context)
        {
            _reportesDA = reportesDA;
            _context = context;
        }

        public async Task<IEnumerable<MovimientoHistorialDTO>> ObtenerHistorialPorClienteAsync(
            int clienteId,
            HistorialFiltroDTO filtro)
        {
            var transferencias = await _reportesDA.ObtenerTransferenciasHistorialAsync(
                clienteId,
                filtro.CuentaId,
                filtro.Desde,
                filtro.Hasta,
                filtro.Estado);

            var pagos = await _reportesDA.ObtenerPagosHistorialAsync(
                clienteId,
                filtro.CuentaId,
                filtro.Desde,
                filtro.Hasta,
                filtro.Estado);

            return await MapearMovimientosAsync(transferencias, pagos, filtro.Tipo);
        }

        public async Task<IEnumerable<MovimientoHistorialDTO>> ObtenerHistorialPorCuentaAsync(
            Guid cuentaId,
            HistorialFiltroDTO filtro)
        {
            var transferencias = await _reportesDA.ObtenerTransferenciasHistorialAsync(
                null,
                cuentaId,
                filtro.Desde,
                filtro.Hasta,
                filtro.Estado);

            var pagos = await _reportesDA.ObtenerPagosHistorialAsync(
                null,
                cuentaId,
                filtro.Desde,
                filtro.Hasta,
                filtro.Estado);

            return await MapearMovimientosAsync(transferencias, pagos, filtro.Tipo);
        }

        private async Task<IEnumerable<MovimientoHistorialDTO>> MapearMovimientosAsync(
            IEnumerable<Transferencia> transferencias,
            IEnumerable<PagoServicio> pagos,
            int? tipo)
        {
            var movimientos = new List<MovimientoHistorialDTO>();

            var cuentasIds = new HashSet<Guid>(
                transferencias.SelectMany(t => new[] { t.CuentaOrigenId, t.CuentaDestinoId })
                              .Concat(pagos.Select(p => p.CuentaOrigenId)));

            var cuentas = await _context.Accounts
                .Where(a => cuentasIds.Contains(a.Id))
                .ToListAsync();

            var cuentasDict = cuentas.ToDictionary(a => a.Id);

            bool incluirTransferencias = !tipo.HasValue || tipo.Value == 1;
            bool incluirPagos = !tipo.HasValue || tipo.Value == 2;

            if (incluirTransferencias)
            {
                movimientos.AddRange(
                    transferencias.Select(t =>
                    {
                        cuentasDict.TryGetValue(t.CuentaOrigenId, out var cuentaOrigen);
                        cuentasDict.TryGetValue(t.CuentaDestinoId, out var cuentaDestino);

                        return new MovimientoHistorialDTO
                        {
                            Fecha = t.FechaEjecucion ?? t.FechaCreacion,
                            Tipo = "Transferencia",
                            TransferenciaId = t.Id,
                            CuentaOrigenId = t.CuentaOrigenId,
                            CuentaDestinoId = t.CuentaDestinoId,
                            NumeroCuentaOrigen = cuentaOrigen?.AccountNumber,
                            NumeroCuentaDestino = cuentaDestino?.AccountNumber,
                            Monto = t.Monto,
                            Comision = t.Comision,
                            Estado = t.Estado,
                            Descripcion = $"Transferencia de {cuentaOrigen?.AccountNumber} a {cuentaDestino?.AccountNumber}"
                        };
                    }));
            }

            if (incluirPagos)
            {
                movimientos.AddRange(
                    pagos.Select(p =>
                    {
                        cuentasDict.TryGetValue(p.CuentaOrigenId, out var cuentaOrigen);

                        return new MovimientoHistorialDTO
                        {
                            Fecha = p.FechaPago ?? p.FechaCreacion,
                            Tipo = "PagoServicio",
                            PagoServicioId = p.Id,
                            CuentaOrigenId = p.CuentaOrigenId,
                            NumeroCuentaOrigen = cuentaOrigen?.AccountNumber,
                            Monto = p.Monto,
                            Comision = 0m, 
                            Estado = p.Estado,
                            Descripcion = $"Pago de servicio desde {cuentaOrigen?.AccountNumber} (contrato {p.NumeroContrato})"
                        };
                    }));
            }

            return movimientos
                .OrderByDescending(m => m.Fecha)
                .ToList();
        }

        public async Task<ExtractoMensualDTO> GenerarExtractoMensualAsync(
            Guid cuentaId,
            int anio,
            int mes)
        {
            var cuenta = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == cuentaId);

            if (cuenta == null)
                throw new InvalidOperationException("La cuenta no existe.");

            var desde = new DateTime(anio, mes, 1);
            var hasta = desde.AddMonths(1).AddTicks(-1);

            var filtro = new HistorialFiltroDTO
            {
                Desde = desde,
                Hasta = hasta,
                CuentaId = cuentaId
            };

            var movimientos = (await ObtenerHistorialPorCuentaAsync(cuentaId, filtro))
                .OrderBy(m => m.Fecha)
                .ToList();

            var saldoFinal = cuenta.Balance;

            var transferenciasMes = await _reportesDA.ObtenerTransferenciasHistorialAsync(
                null,
                cuentaId,
                desde,
                hasta,
                null);

            decimal saldoInicial;
            var transferenciasOrdenadas = transferenciasMes
                .OrderBy(t => t.FechaCreacion)
                .ToList();

            if (transferenciasOrdenadas.Any())
            {
                saldoInicial = transferenciasOrdenadas.First().SaldoAntes;
            }
            else
            {

                saldoInicial = saldoFinal;
            }

            var totalComisiones = movimientos.Sum(m => m.Comision);

            return new ExtractoMensualDTO
            {
                CuentaId = cuenta.Id,
                NumeroCuenta = cuenta.AccountNumber,
                Anio = anio,
                Mes = mes,
                SaldoInicial = saldoInicial,
                SaldoFinal = saldoFinal,
                TotalComisiones = totalComisiones,
                Movimientos = movimientos
            };
        }
    }
}
