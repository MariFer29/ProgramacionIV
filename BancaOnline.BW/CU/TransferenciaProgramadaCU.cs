using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using BancaOnline.BC.Entidades;
using BancaOnline.BW.Interfaces;
using BancaOnline.DA;
using BancaOnline.DA.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BancaOnline.BW.CU
{
    public class TransferenciaProgramadaCU : ITransferenciaProgramadaBW
    {
        private readonly ITransferenciaProgramadaDA _da;
        private readonly AppDbContext _db;
        private readonly IClientesRepositorioDA _clientesRepo;
        private readonly IAuditoriaBW _auditoriaBW;

        private const int ESTADO_PROGRAMADA = 0;
        private const int ESTADO_EXITOSA = 1;
        private const int ESTADO_FALLIDA = 2;
        private const int ESTADO_CANCELADA = 3;

        public TransferenciaProgramadaCU(
            ITransferenciaProgramadaDA da,
            AppDbContext db,
            IClientesRepositorioDA clientesRepo,
            IAuditoriaBW auditoriaBW)
        {
            _da = da;
            _db = db;
            _clientesRepo = clientesRepo;
            _auditoriaBW = auditoriaBW;
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

            if (tp.Id == Guid.Empty)
                tp.Id = Guid.NewGuid();

            if (tp.FechaCreacion == default)
                tp.FechaCreacion = DateTime.UtcNow;

            tp.Estado = ESTADO_PROGRAMADA;
            tp.FechaEjecucionReal = null;

            await _da.CrearAsync(tp);

            // Buscar cliente dueño de la cuenta (si existe)
            Cliente? cliente = null;
            var cuenta = await _db.Accounts.FirstOrDefaultAsync(a => a.Id == tp.CuentaOrigenId);
            if (cuenta != null)
            {
                cliente = await _clientesRepo.ObtenerPorIdAsync(cuenta.ClientId);
            }

            await RegistrarAuditoriaTransferenciaProgramadaAsync(
                tp,
                cliente,
                tipoOperacion: "TransferenciaProgramadaCreada",
                razonFalla: null);
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

            // Buscar cliente dueño de la cuenta (si existe)
            Cliente? cliente = null;
            var cuenta = await _db.Accounts.FirstOrDefaultAsync(a => a.Id == tp.CuentaOrigenId);
            if (cuenta != null)
            {
                cliente = await _clientesRepo.ObtenerPorIdAsync(cuenta.ClientId);
            }

            await RegistrarAuditoriaTransferenciaProgramadaAsync(
                tp,
                cliente,
                tipoOperacion: "TransferenciaProgramadaCancelada",
                razonFalla: null);
        }

        private async Task RegistrarAuditoriaTransferenciaProgramadaAsync(
            TransferenciaProgramada tp,
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
                Entidad = "TransferenciaProgramada",
                EntidadId = tp.Id.ToString(),
                DatosNuevos = JsonSerializer.Serialize(new
                {
                    tp.CuentaOrigenId,
                    tp.CuentaDestinoId,
                    tp.Monto,
                    tp.Moneda,
                    tp.Estado,
                    tp.FechaCreacion,
                    tp.FechaEjecucion,
                    tp.FechaEjecucionReal,
                    RazonFalla = razonFalla
                })
            };

            await _auditoriaBW.RegistrarAsync(auditoria);
        }

    }
}