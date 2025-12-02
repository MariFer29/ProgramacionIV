using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BancaOnline.BW.Interfaces
{
    public interface IComprobantesBW
    {
        Task<byte[]> GenerarComprobanteTransferenciaAsync(Guid transferenciaId);
        Task<byte[]> GenerarComprobantePagoServicioAsync(Guid pagoServicioId);
        Task<byte[]> GenerarComprobanteExtractoMensualAsync(Guid cuentaId, int anio, int mes);

    }
}
