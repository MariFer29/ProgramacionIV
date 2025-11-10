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
    public class TransferenciaCU : ITransferenciaBW
    {
        private readonly ITransferenciaDA _da;

        public TransferenciaCU(ITransferenciaDA da)
        {
            _da = da;
        }

        public Task<List<Transferencia>> ObtenerTransferenciasAsync()
            => _da.ListarAsync();

        public async Task CrearTransferenciaAsync(Transferencia t)
        {
            if (t.Id == Guid.Empty) t.Id = Guid.NewGuid();
            if (t.FechaCreacion == default) t.FechaCreacion = DateTime.UtcNow;

            // Si usas idempotencia:
            if (!string.IsNullOrWhiteSpace(t.IdempotencyKey))
            {
                var existe = await _da.ExisteIdempotenciaAsync(t.IdempotencyKey);
                if (existe) return; // ya existe, no repetir
            }

            await _da.CrearAsync(t);
        }
    }
}
