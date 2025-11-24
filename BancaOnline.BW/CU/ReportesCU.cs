using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BC.Entidades;
using BancaOnline.BW.DTOs;
using BancaOnline.BW.Interfaces;
using BancaOnline.DA.Interfaces;

namespace BancaOnline.BW.CU
{
    public class ReportesCU : IReportesBW
    {
        private readonly IReportesDA _reportesDA;
        private readonly IClientesRepositorioDA _clientesRepo;

        public ReportesCU(IReportesDA reportesDA, IClientesRepositorioDA clientesRepo)
        {
            _reportesDA = reportesDA;
            _clientesRepo = clientesRepo;
        }

        public async Task<ReporteTotalesDTO> ObtenerTotalesPeriodoAsync(DateTime desde, DateTime hasta)
        {
            var total = await _reportesDA.ObtenerTotalOperacionesAsync(desde, hasta);

            return new ReporteTotalesDTO
            {
                Desde = desde,
                Hasta = hasta,
                TotalOperaciones = total
            };
        }

        public async Task<IEnumerable<ClienteTopDTO>> ObtenerTopClientesAsync(DateTime desde,DateTime hasta,int top)
        {
            var datos = await _reportesDA.ObtenerTopClientesAsync(desde, hasta, top);

            var ids = datos.Select(x => x.ClientId).Distinct().ToList();

            var listaClientes = new List<Cliente>();

            foreach (var id in ids)
            {
                var cli = await _clientesRepo.ObtenerPorIdAsync(id);
                if (cli != null)
                {
                    listaClientes.Add(cli);
                }
            }

            var dictClientes = listaClientes.ToDictionary(c => c.Id);

            return datos.Select(x => new ClienteTopDTO
            {
                ClientId = x.ClientId,
                NombreCliente = dictClientes.TryGetValue(x.ClientId, out var cli)
                    ? cli.NombreCompleto
                    : "N/D",
                MontoTotal = x.MontoTotal
            });
        }
        public async Task<IEnumerable<VolumenDiarioDTO>> ObtenerVolumenDiarioAsync(DateTime desde,DateTime hasta)
        {
            var datos = await _reportesDA.ObtenerVolumenDiarioAsync(desde, hasta);

            return datos.Select(x => new VolumenDiarioDTO
            {
                Dia = x.Dia,
                MontoTotal = x.MontoTotal
            });
        }


    }
}
