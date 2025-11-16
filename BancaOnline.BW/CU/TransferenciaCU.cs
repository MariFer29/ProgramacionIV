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

        private const int ESTADO_PENDIENTE_APROBACION = 0;
        private const int ESTADO_EXITOSA = 1;
        private const int ESTADO_FALLIDA = 2;
        private const int ESTADO_RECHAZADA = 3;

        private const decimal UMBRAL_APROBACION = 100_000m;

        private const decimal PORCENTAJE_COMISION = 0.005m;

        public TransferenciaCU(ITransferenciaDA da)
        {
            _da = da;
        }

        public Task<List<Transferencia>> ObtenerTransferenciasAsync()
            => _da.ListarAsync();

        public async Task CrearTransferenciaAsync(Transferencia t)
        {
            if (t == null)
                throw new ArgumentNullException(nameof(t));


            if (t.Monto <= 0)
                throw new ArgumentException("El monto de la transferencia debe ser mayor que cero.");

            if (t.SaldoAntes <= 0)
                throw new ArgumentException("El saldo antes de la transferencia debe ser mayor que cero.");

            // VALIDACIONES DE OTROS MÓDULOS (NO IMPLEMENTAR EN ESTE MÓDULO)
            // Estas validaciones se harán cuando se integren los módulos de Cuentas y Clientes.
            // Por ahora NO deben implementarse aquí:
            // - Cuenta origen activa
            // - Límite diario disponible
            // - Tercero confirmado


            if (!string.IsNullOrWhiteSpace(t.IdempotencyKey))
            {
                var existe = await _da.ExisteIdempotenciaAsync(t.IdempotencyKey);
                if (existe)
                {
                    return;
                }
            }

            t.Comision = Math.Round(t.Monto * PORCENTAJE_COMISION, 2);

            var montoTotal = t.Monto + t.Comision;

            if (t.SaldoAntes < montoTotal)
                throw new InvalidOperationException("Saldo insuficiente para realizar la transferencia.");

            t.SaldoDespues = t.SaldoAntes - montoTotal;

            if (t.Id == Guid.Empty)
                t.Id = Guid.NewGuid();

            if (t.FechaCreacion == default)
                t.FechaCreacion = DateTime.UtcNow;

            if (montoTotal > UMBRAL_APROBACION)
            {
                t.Estado = ESTADO_PENDIENTE_APROBACION;
                t.FechaEjecucion = null;
            }
            else
            {
                t.Estado = ESTADO_EXITOSA;
                t.FechaEjecucion = DateTime.UtcNow;
            }

            await _da.CrearAsync(t);
        }
    }
}