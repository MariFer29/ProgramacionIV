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
    public class PagoServicioCU : IPagoServicioBW
    {
        private readonly IPagoServicioDA _da;
        private readonly AppDbContext _db;
        private readonly IClientesRepositorioDA _clientesRepo;
        private readonly IAuditoriaBW _auditoriaBW;

        public PagoServicioCU(IPagoServicioDA da, AppDbContext db,IClientesRepositorioDA clientesRepo,IAuditoriaBW auditoriaBW)
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

            var largoContrato = pago.NumeroContrato.Length;
            if (largoContrato < 8 || largoContrato > 12)
            {
                await RegistrarAuditoriaPagoAsync(pago, null,
                    "PagoServicioFallido", "Número de contrato inválido");
                throw new ArgumentException("El número de contrato debe tener entre 8 y 12 caracteres.");
            }

            if (pago.Id == Guid.Empty)
                pago.Id = Guid.NewGuid();

            pago.FechaCreacion = DateTime.UtcNow;

            var ahora = DateTime.UtcNow;

            if (pago.FechaProgramada.HasValue && pago.FechaProgramada.Value > ahora)
            {
                // Programado
                pago.Estado = 1;
                pago.FechaPago = null;
            }
            else
            {
                // Se paga de una vez
                pago.Estado = 2;
                pago.FechaProgramada = null;
                pago.FechaPago = ahora;
            }

            if (string.IsNullOrWhiteSpace(pago.Referencia))
            {
                pago.Referencia = $"PAG-{Guid.NewGuid().ToString("N")[..10]}";
            }

            await _da.CrearAsync(pago);

            // Buscar cliente dueño de la cuenta (si existe)
            Cliente? cliente = null;
            var cuenta = await _db.Accounts.FirstOrDefaultAsync(a => a.Id == pago.CuentaOrigenId);
            if (cuenta != null)
            {
                cliente = await _clientesRepo.ObtenerPorIdAsync(cuenta.ClientId);
            }

            var tipo = pago.Estado == 2 ? "PagoServicioEjecutado" : "PagoServicioProgramado";

            await RegistrarAuditoriaPagoAsync(pago, cliente, tipo, null);
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
                EntidadId = pago.Id == Guid.Empty ? null : pago.Id.ToString(),
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
                    RazonFalla = razonFalla ?? pago.RazonFalla
                })
            };

            await _auditoriaBW.RegistrarAsync(auditoria);
        }
    }
}