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
            if (pago.Id == Guid.Empty) pago.Id = Guid.NewGuid();
            if (pago.Fecha == default) pago.Fecha = DateTime.UtcNow;

            await _da.CrearAsync(pago);
        }
    }
}
