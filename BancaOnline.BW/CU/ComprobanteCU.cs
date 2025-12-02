using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BW.Interfaces;
using BancaOnline.DA;
using BancaOnline.DA.Interfaces;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;

namespace BancaOnline.BW.CU
{
    public class ComprobanteCU : IComprobantesBW
    {
        private readonly ITransferenciaDA _transferenciasDA;
        private readonly IPagoServicioDA _pagosDA;
        private readonly AppDbContext _db;
        private readonly IHistorialBW _historialBW;

        public ComprobanteCU(
            ITransferenciaDA transferenciasDA,
            IPagoServicioDA pagosDA,
            AppDbContext db,
            IHistorialBW historialBW)
        {
            _transferenciasDA = transferenciasDA;
            _pagosDA = pagosDA;
            _db = db;
            _historialBW = historialBW;
        }

        public async Task<byte[]> GenerarComprobanteTransferenciaAsync(Guid transferenciaId)
        {
            var t = await _transferenciasDA.ObtenerAsync(transferenciaId);
            if (t == null)
                throw new InvalidOperationException("No existe la transferencia.");

            var cuentaOrigen = await _db.Accounts.FirstOrDefaultAsync(a => a.Id == t.CuentaOrigenId);
            var cuentaDestino = await _db.Accounts.FirstOrDefaultAsync(a => a.Id == t.CuentaDestinoId);

            var fecha = t.FechaEjecucion ?? t.FechaCreacion;

            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(40);
                    page.Header()
                        .Text("Comprobante de Transferencia")
                        .FontSize(20)
                        .Bold()
                        .AlignCenter();

                    page.Content().Column(col =>
                    {
                        col.Spacing(5);

                        col.Item().Text($"Fecha: {fecha:dd/MM/yyyy HH:mm}");
                        col.Item().Text($"Id Transferencia: {t.Id}");
                        col.Item().Text($"Moneda: {t.Moneda}");
                        col.Item().Text($"Monto: {t.Monto:N2}");
                        col.Item().Text($"Comisión: {t.Comision:N2}");
                        col.Item().Text($"Monto total debitado: {(t.Monto + t.Comision):N2}");
                        col.Item().Text($"Estado: {t.Estado}");

                        col.Item().Text($"Cuenta origen: {cuentaOrigen?.AccountNumber} (Saldo antes: {t.SaldoAntes:N2}, después: {t.SaldoDespues:N2})");
                        col.Item().Text($"Cuenta destino: {cuentaDestino?.AccountNumber}");

                        if (!string.IsNullOrWhiteSpace(t.RazonFalla))
                            col.Item().Text($"Razón de falla: {t.RazonFalla}");
                    });

                    page.Footer()
                        .AlignCenter()
                        .Text("BancaOnline - Comprobante generado automáticamente");
                });
            })
            .GeneratePdf();

            return pdf;
        }

        public async Task<byte[]> GenerarComprobantePagoServicioAsync(Guid pagoServicioId)
        {
            var p = await _pagosDA.ObtenerAsync(pagoServicioId);
            if (p == null)
                throw new InvalidOperationException("No existe el pago de servicio.");

            var cuentaOrigen = await _db.Accounts.FirstOrDefaultAsync(a => a.Id == p.CuentaOrigenId);
            var proveedor = await _db.ProveedoresServicios.FirstOrDefaultAsync(pr => pr.Id == p.ProveedorId);

            var fecha = p.FechaPago ?? p.FechaCreacion;

            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(40);
                    page.Header()
                        .Text("Comprobante de Pago de Servicio")
                        .FontSize(20)
                        .Bold()
                        .AlignCenter();

                    page.Content().Column(col =>
                    {
                        col.Spacing(5);

                        col.Item().Text($"Fecha: {fecha:dd/MM/yyyy HH:mm}");
                        col.Item().Text($"Id Pago: {p.Id}");
                        col.Item().Text($"Proveedor: {proveedor?.Nombre}");
                        col.Item().Text($"Número de contrato: {p.NumeroContrato}");
                        col.Item().Text($"Moneda: {p.Moneda}");
                        col.Item().Text($"Monto: {p.Monto:N2}");
                        col.Item().Text($"Estado: {p.Estado}");
                        col.Item().Text($"Referencia: {p.Referencia}");

                        col.Item().Text($"Cuenta origen: {cuentaOrigen?.AccountNumber}");

                        if (!string.IsNullOrWhiteSpace(p.RazonFalla))
                            col.Item().Text($"Razón de falla: {p.RazonFalla}");
                    });

                    page.Footer()
                        .AlignCenter()
                        .Text("BancaOnline - Comprobante generado automáticamente");
                });
            })
            .GeneratePdf();

            return pdf;
        }

        public async Task<byte[]> GenerarComprobanteExtractoMensualAsync(Guid cuentaId, int anio, int mes)
        {
            var extracto = await _historialBW.GenerarExtractoMensualAsync(cuentaId, anio, mes);

            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(40);
                    page.Header()
                        .Text("Extracto Mensual")
                        .FontSize(20)
                        .Bold()
                        .AlignCenter();

                    page.Content().Column(col =>
                    {
                        col.Spacing(5);

                        col.Item().Text($"Cuenta: {extracto.NumeroCuenta}");
                        col.Item().Text($"Periodo: {extracto.Mes:00}/{extracto.Anio}");
                        col.Item().Text($"Saldo inicial: {extracto.SaldoInicial:N2}");
                        col.Item().Text($"Saldo final: {extracto.SaldoFinal:N2}");
                        col.Item().Text($"Total comisiones: {extracto.TotalComisiones:N2}");

                        col.Item().LineHorizontal(1f);

                        foreach (var m in extracto.Movimientos)
                        {
                            col.Item().Text(
                                $"{m.Fecha:dd/MM/yyyy HH:mm} - {m.Tipo} - Monto: {m.Monto:N2} - Comisión: {m.Comision:N2} - Estado: {m.Estado}");
                        }
                    });

                    page.Footer()
                        .AlignCenter()
                        .Text("BancaOnline - Extracto generado automáticamente");
                });
            })
            .GeneratePdf();

            return pdf;
        }

    }
}
