using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BC.Entidades;

namespace BancaOnline.DA.Interfaces
{
    public interface IProveedorServicioDA
    {
        Task<List<ProveedorServicio>> ListarAsync();
        Task<ProveedorServicio?> ObtenerAsync(Guid id);
        Task<bool> ExisteNombreAsync(string nombre);
        Task CrearAsync(ProveedorServicio entity);
    }
}
