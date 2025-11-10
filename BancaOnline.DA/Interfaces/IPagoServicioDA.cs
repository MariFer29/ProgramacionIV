using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BC.Entidades;

namespace BancaOnline.DA.Interfaces
{
    public interface IPagoServicioDA
    {
        Task<List<PagoServicio>> ListarAsync();
        Task<PagoServicio?> ObtenerAsync(Guid id);
        Task CrearAsync(PagoServicio entity);
    }
}
