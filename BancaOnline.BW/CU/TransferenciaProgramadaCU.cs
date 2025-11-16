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

        private const int ESTADO_PROGRAMADA = 0;
        private const int ESTADO_EXITOSA = 1;
        private const int ESTADO_FALLIDA = 2;
        private const int ESTADO_CANCELADA = 3;

        public TransferenciaProgramadaCU(ITransferenciaProgramadaDA da)
        {
            _da = da;
        }

        public Task<List<TransferenciaProgramada>> ObtenerTransferenciasProgramadasAsync()
            => _da.ListarAsync();

        public async Task CrearTransferenciaProgramadaAsync(TransferenciaProgramada tp)
        {
            if (tp == null)
                throw new ArgumentNullException(nameof(tp));

            if (tp.Monto <= 0)
                throw new ArgumentException("El monto debe ser mayor a cero.");

            if (tp.FechaEjecucion <= DateTime.UtcNow)
                throw new ArgumentException("La fecha de ejecución debe ser a futuro.");

            var maxFecha = DateTime.UtcNow.AddDays(90);
            if (tp.FechaEjecucion > maxFecha)
                throw new ArgumentException("La transferencia no puede programarse a más de 90 días.");

            // -------------------------------
            // VALIDACIONES DE OTROS MÓDULOS (NO IMPLEMENTAR AQUÍ)
            // Estas dependen de los módulos de Cuentas / Clientes:
            // - Verificar que la cuenta esté activa
            // - Validar que el tercero beneficiario esté confirmado
            // - Validar límites diarios
            // Estas reglas se integrarán cuando esos módulos estén implementados.
            // -------------------------------


            if (tp.Id == Guid.Empty)
                tp.Id = Guid.NewGuid();

            if (tp.FechaCreacion == default)
                tp.FechaCreacion = DateTime.UtcNow;

            tp.Estado = ESTADO_PROGRAMADA;

            tp.FechaEjecucionReal = null;

            await _da.CrearAsync(tp);
        }
        public async Task CancelarTransferenciaProgramadaAsync(Guid id)
        {
            var tp = await _da.ObtenerAsync(id);
            if (tp is null)
                throw new KeyNotFoundException("No existe la transferencia programada.");

            if (tp.Estado != ESTADO_PROGRAMADA)
                throw new InvalidOperationException("Solo se pueden cancelar transferencias en estado Programada.");

            var ahora = DateTime.UtcNow;

            if (tp.FechaEjecucion <= ahora.AddHours(24))
                throw new InvalidOperationException("Solo se puede cancelar hasta 24 horas antes de la fecha de ejecución.");

            tp.Estado = ESTADO_CANCELADA;
            tp.FechaEjecucionReal = null;

            await _da.CancelarAsync(id);
        }

    }
}