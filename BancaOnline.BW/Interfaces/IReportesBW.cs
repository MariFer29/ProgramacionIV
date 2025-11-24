using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BW.DTOs;

namespace BancaOnline.BW.Interfaces
{
    public interface IReportesBW
    {
        Task<ReporteTotalesDTO> ObtenerTotalesPeriodoAsync(DateTime desde, DateTime hasta);

        Task<IEnumerable<ClienteTopDTO>> ObtenerTopClientesAsync(
            DateTime desde,
            DateTime hasta,
            int top);

        Task<IEnumerable<VolumenDiarioDTO>> ObtenerVolumenDiarioAsync(
            DateTime desde,
            DateTime hasta);
    }
}
