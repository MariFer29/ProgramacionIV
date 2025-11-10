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
    public class ProveedorServicioCU : IProveedorServicioBW
    {
        private readonly IProveedorServicioDA _da;

        public ProveedorServicioCU(IProveedorServicioDA da)
        {
            _da = da;
        }

        public Task<List<ProveedorServicio>> ObtenerProveedoresAsync()
            => _da.ListarAsync();

        public async Task CrearProveedorAsync(ProveedorServicio proveedor)
        {
            if (proveedor.Id == Guid.Empty) proveedor.Id = Guid.NewGuid();
            if (string.IsNullOrWhiteSpace(proveedor.Nombre))
                throw new ArgumentException("El nombre del proveedor es obligatorio.");

            if (await _da.ExisteNombreAsync(proveedor.Nombre))
                throw new InvalidOperationException("El proveedor ya existe.");

            await _da.CrearAsync(proveedor);
        }
    }
}
