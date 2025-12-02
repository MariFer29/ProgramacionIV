using System;
using System.Text.Json;
using BancaOnline.BC.Entidades;
using BancaOnline.BW.Interfaces;
using BancaOnline.DA;
using BancaOnline.DA.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BancaOnline.BW.CU
{
    public class PagoServicioCU : IPagoServicioBW
    {
        private readonly IPagoServicioDA _da;
        private readonly AppDbContext _db;
        private readonly IClientesRepositorioDA _clientesRepo;
        private readonly IAuditoriaBW _auditoriaBW;

        public PagoServicioCU(
            IPagoServicioDA da,
            AppDbContext db,
            IClientesRepositorioDA clientesRepo,
            IAuditoriaBW auditoriaBW)
        {
            _da = da;
            _db = db;
            _clientesRepo = clientesRepo;
            _auditoriaBW = auditoriaBW;
        }

        public Task<List<PagoServicio>> ObtenerPagosAsync()
            => _da.ListarAsync();

        public async Task RegistrarPagoServicioAsync(PagoServicio pago)
        {
            if (pago == null)
                throw new ArgumentNullException(nameof(pago));

            if (string.IsNullOrWhiteSpace(pago.NumeroContrato))
                throw new ArgumentException("El número de contrato es obligatorio.");

            if (pago.NumeroContrato.Length < 8 || pago.NumeroContrato.Length > 12)
                throw new ArgumentException("El número de contrato debe tener entre 8 y 12 caracteres.");

            var cuenta = await _db.Accounts
                .FirstOrDefaultAsync(a => a.Id == pago.CuentaOrigenId);

            if (cuenta == null)
                throw new InvalidOperationException("La cuenta origen no existe.");

            pago.SaldoAntes = cuenta.Balance;

            if (cuenta.Balance < pago.Monto)
            {
                pago.Estado = 3; 
                pago.SaldoDespues = cuenta.Balance;
                pago.RazonFalla = "Saldo insuficiente";

                await RegistrarAuditoriaPagoAsync(pago, null, "PagoServicioFallido", pago.RazonFalla);
                throw new InvalidOperationException("Saldo insuficiente para realizar el pago.");
            }

            var ahora = DateTime.UtcNow;
            pago.FechaCreacion = ahora;

            bool esProgramado = pago.FechaProgramada.HasValue &&
                                pago.FechaProgramada.Value > ahora;

            if (esProgramado)
            {
                pago.Estado = 1; 
                pago.FechaPago = null;
                pago.SaldoDespues = null; 
            }
            else
            {
                pago.Estado = 2; 
                pago.FechaProgramada = null;

                cuenta.Balance -= pago.Monto;

                pago.FechaPago = ahora;
                pago.SaldoDespues = cuenta.Balance;

                _db.Accounts.Update(cuenta);
            }

            if (string.IsNullOrWhiteSpace(pago.Referencia))
                pago.Referencia = $"PAG-{Guid.NewGuid().ToString("N")[..10]}";

            await _da.CrearAsync(pago);

            await RegistrarAuditoriaPagoAsync(
                pago,
                await _clientesRepo.ObtenerPorIdAsync(cuenta.ClientId),
                esProgramado ? "PagoServicioProgramado" : "PagoServicioEjecutado",
                null
            );
        }

        private async Task RegistrarAuditoriaPagoAsync(
            PagoServicio pago,
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
                Entidad = "PagoServicio",
                EntidadId = pago.Id.ToString(),
                DatosNuevos = JsonSerializer.Serialize(new
                {
                    pago.ProveedorId,
                    pago.CuentaOrigenId,
                    pago.NumeroContrato,
                    pago.Monto,
                    pago.Moneda,
                    pago.Estado,
                    pago.FechaCreacion,
                    pago.FechaProgramada,
                    pago.FechaPago,
                    pago.Referencia,
                    pago.SaldoAntes,
                    pago.SaldoDespues,
                    RazonFalla = razonFalla ?? pago.RazonFalla
                })
            };

            await _auditoriaBW.RegistrarAsync(auditoria);
        }
    }
}
