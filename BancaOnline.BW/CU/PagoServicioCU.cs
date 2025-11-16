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
    public class PagoServicioCU : IPagoServicioBW
    {
        private readonly IPagoServicioDA _da;

        public PagoServicioCU(IPagoServicioDA da)
        {
            _da = da;
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
                throw new ArgumentException("El número de contrato debe tener entre 8 y 12 caracteres.");

            if (pago.Id == Guid.Empty)
                pago.Id = Guid.NewGuid();

            pago.FechaCreacion = DateTime.UtcNow;

            var ahora = DateTime.UtcNow;

            if (pago.FechaProgramada.HasValue && pago.FechaProgramada.Value > ahora)
            {
                pago.Estado = 1;
                pago.FechaPago = null;
            }
            else
            {
                pago.Estado = 2;
                pago.FechaProgramada = null;
                pago.FechaPago = ahora;
            }

            if (string.IsNullOrWhiteSpace(pago.Referencia))
            {
                pago.Referencia = $"PAG-{Guid.NewGuid().ToString("N").Substring(0, 10)}";
            }

            await _da.CrearAsync(pago);
        }
    }
}