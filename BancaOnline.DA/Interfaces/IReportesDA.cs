using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BC.Entidades;

namespace BancaOnline.DA.Interfaces
{
    public interface IReportesDA
    {
        Task<IEnumerable<Transferencia>> ObtenerTransferenciasHistorialAsync(
            int? clienteId,
            Guid? cuentaId,
            DateTime? desde,
            DateTime? hasta,
            int? estado);

        Task<IEnumerable<PagoServicio>> ObtenerPagosHistorialAsync(
            int? clienteId,
            Guid? cuentaId,
            DateTime? desde,
            DateTime? hasta,
            int? estado);

        Task<decimal> ObtenerTotalOperacionesAsync(DateTime desde, DateTime hasta);

        Task<IEnumerable<(int ClientId, decimal MontoTotal)>> ObtenerTopClientesAsync(
            DateTime desde,
            DateTime hasta,
            int top);

        Task<IEnumerable<(DateTime Dia, decimal MontoTotal)>> ObtenerVolumenDiarioAsync(
            DateTime desde,
            DateTime hasta);
    }
}
