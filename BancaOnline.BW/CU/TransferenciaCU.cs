using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using BancaOnline.BC.Entidades;
using BancaOnline.BC.Enums;
using BancaOnline.BW.Interfaces;
using BancaOnline.DA;
using BancaOnline.DA.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BancaOnline.BW.CU
{
    public class TransferenciaCU : ITransferenciaBW
    {
        private readonly ITransferenciaDA _da;
        private readonly IClientesRepositorioDA _clientesRepo;
        private readonly AppDbContext _db;
        private readonly IAuditoriaBW _auditoriaBW;

        private const int ESTADO_PENDIENTE_APROBACION = 0;
        private const int ESTADO_EXITOSA = 1;
        private const int ESTADO_FALLIDA = 2;
        private const int ESTADO_RECHAZADA = 3;

        private const decimal UMBRAL_APROBACION = 100_000m;
        private const decimal PORCENTAJE_COMISION = 0.005m;

        public TransferenciaCU(
            ITransferenciaDA da,
            IClientesRepositorioDA clientesRepo,
            AppDbContext db,
            IAuditoriaBW auditoriaBW)
        {
            _da = da;
            _clientesRepo = clientesRepo;
            _db = db;
            _auditoriaBW = auditoriaBW;
        }

        public Task<List<Transferencia>> ObtenerTransferenciasAsync()
            => _da.ListarAsync();

        public async Task CrearTransferenciaAsync(Transferencia t)
        {
            if (t == null)
                throw new ArgumentNullException(nameof(t));

            if (t.Monto <= 0)
                throw new ArgumentException("El monto de la transferencia debe ser mayor que cero.");

            var cuentaOrigen = await _db.Accounts
                .FirstOrDefaultAsync(a => a.Id == t.CuentaOrigenId);

            if (cuentaOrigen is null)
            {
                await RegistrarAuditoriaTransferenciaAsync(
                    t,
                    cliente: null,
                    tipoOperacion: "TransferenciaFallida",
                    razonFalla: "Cuenta origen inexistente");
                throw new InvalidOperationException("La cuenta origen no existe.");
            }

            if (cuentaOrigen.Status != AccountStatus.Active)
            {
                await RegistrarAuditoriaTransferenciaAsync(
                    t,
                    cliente: null,
                    tipoOperacion: "TransferenciaFallida",
                    razonFalla: "Cuenta origen no está activa");
                throw new InvalidOperationException("La cuenta origen no está activa.");
            }

            var cliente = await _clientesRepo.ObtenerPorIdAsync(cuentaOrigen.ClientId);
            if (cliente is null)
            {
                await RegistrarAuditoriaTransferenciaAsync(
                    t,
                    cliente: null,
                    tipoOperacion: "TransferenciaFallida",
                    razonFalla: "Cliente asociado a la cuenta no existe");
                throw new InvalidOperationException("El cliente asociado a la cuenta no existe.");
            }

            t.SaldoAntes = cuentaOrigen.Balance;

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
            {
                await RegistrarAuditoriaTransferenciaAsync(
                    t,
                    cliente,
                    tipoOperacion: "TransferenciaFallida",
                    razonFalla: "Saldo insuficiente");
                throw new InvalidOperationException("Saldo insuficiente para realizar la transferencia.");
            }

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

            if (t.Estado == ESTADO_EXITOSA)
            {
                cuentaOrigen.Balance = t.SaldoDespues;

                var cuentaDestino = await _db.Accounts
                    .FirstOrDefaultAsync(a => a.Id == t.CuentaDestinoId);

                if (cuentaDestino != null && cuentaDestino.Status == AccountStatus.Active)
                {
                    cuentaDestino.Balance += t.Monto;
                }

                await _db.SaveChangesAsync();
            }

            await _da.CrearAsync(t);

            var tipo = t.Estado == ESTADO_EXITOSA
                ? "TransferenciaExitosa"
                : "TransferenciaPendienteAprobacion";

            await RegistrarAuditoriaTransferenciaAsync(
                t,
                cliente,
                tipoOperacion: tipo,
                razonFalla: null);
        }


        private async Task RegistrarAuditoriaTransferenciaAsync(
            Transferencia t,
            Cliente? cliente,
            string tipoOperacion,
            string? razonFalla)
        {
            var auditoria = new Auditoria
            {
                Id = Guid.NewGuid(),
                Fecha = DateTime.UtcNow,
                UsuarioId = cliente?.UsuarioId,
                UsuarioEmail = cliente?.Correo,
                TipoOperacion = tipoOperacion,
                Entidad = "Transferencia",
                EntidadId = t.Id == Guid.Empty ? null : t.Id.ToString(),
                DatosNuevos = JsonSerializer.Serialize(new
                {
                    t.CuentaOrigenId,
                    t.CuentaDestinoId,
                    t.Monto,
                    t.Comision,
                    t.SaldoAntes,
                    t.SaldoDespues,
                    t.Estado,
                    t.FechaCreacion,
                    t.FechaEjecucion,
                    RazonFalla = razonFalla ?? t.RazonFalla
                })
            };

            await _auditoriaBW.RegistrarAsync(auditoria);
        }
    }
}