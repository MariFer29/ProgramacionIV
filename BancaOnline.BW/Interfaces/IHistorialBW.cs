using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BW.DTOs;

namespace BancaOnline.BW.Interfaces
{
    public interface IHistorialBW
    {
        Task<IEnumerable<MovimientoHistorialDTO>> ObtenerHistorialPorClienteAsync(
            int clienteId,
            HistorialFiltroDTO filtro);

        Task<IEnumerable<MovimientoHistorialDTO>> ObtenerHistorialPorCuentaAsync(
            Guid cuentaId,
            HistorialFiltroDTO filtro);

        Task<ExtractoMensualDTO> GenerarExtractoMensualAsync(
            Guid cuentaId,
            int anio,
            int mes);
    }
}
