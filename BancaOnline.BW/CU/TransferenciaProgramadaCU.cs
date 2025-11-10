using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BC.Entidades;
using BancaOnline.BW.Interfaces;
using BancaOnline.DA.Interfaces;

namespace BancaOnline.BW.CU
{
    public class TransferenciaProgramadaCU : ITransferenciaProgramadaBW
    {
        private readonly ITransferenciaProgramadaDA _da;

        public TransferenciaProgramadaCU(ITransferenciaProgramadaDA da)
        {
            _da = da;
        }

        public Task<List<TransferenciaProgramada>> ObtenerTransferenciasProgramadasAsync()
            => _da.ListarAsync();

        public async Task CrearTransferenciaProgramadaAsync(TransferenciaProgramada tp)
        {
            if (tp.Id == Guid.Empty) tp.Id = Guid.NewGuid();
            if (tp.FechaCreacion == default) tp.FechaCreacion = DateTime.UtcNow;

            await _da.CrearAsync(tp);
        }
    }
}
