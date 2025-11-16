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
            if (proveedor == null)
                throw new ArgumentNullException(nameof(proveedor));

            if (string.IsNullOrWhiteSpace(proveedor.Nombre))
                throw new ArgumentException("El nombre del proveedor es obligatorio.");

            proveedor.Nombre = proveedor.Nombre.Trim();

            if (proveedor.MinContrato <= 0)
                throw new ArgumentException("La longitud mínima de contrato debe ser mayor a 0.");

            if (proveedor.MaxContrato <= 0)
                throw new ArgumentException("La longitud máxima de contrato debe ser mayor a 0.");

            if (proveedor.MinContrato > proveedor.MaxContrato)
                throw new ArgumentException("La longitud mínima de contrato no puede ser mayor que la máxima.");

            if (proveedor.MinContrato < 4 || proveedor.MaxContrato > 20)
                throw new ArgumentException("El rango de longitud de contrato debe ser razonable (entre 4 y 20 caracteres).");

            if (proveedor.Id == Guid.Empty)
                proveedor.Id = Guid.NewGuid();

            if (await _da.ExisteNombreAsync(proveedor.Nombre))
                throw new InvalidOperationException("Ya existe un proveedor con ese nombre.");

            await _da.CrearAsync(proveedor);
        }
    }
}