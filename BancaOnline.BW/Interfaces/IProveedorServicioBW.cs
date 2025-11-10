using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BC.Entidades;

namespace BancaOnline.BW.Interfaces
{
    public interface IProveedorServicioBW
    {
        Task<List<ProveedorServicio>> ObtenerProveedoresAsync();
        Task CrearProveedorAsync(ProveedorServicio proveedor);
    }
}
