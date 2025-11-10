using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BC.Entidades;

namespace BancaOnline.BW.Interfaces
{
    public interface IPagoServicioBW
    {
        Task<List<PagoServicio>> ObtenerPagosAsync();
        Task RegistrarPagoServicioAsync(PagoServicio pago);
    }
}
