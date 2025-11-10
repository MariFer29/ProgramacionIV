using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BC.Entidades;
using BancaOnline.DA.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BancaOnline.DA.Acciones
{
    public class ProveedorServicioDA : IProveedorServicioDA
    {
        private readonly AppDbContext _db;
        public ProveedorServicioDA(AppDbContext db) => _db = db;

        public Task<List<ProveedorServicio>> ListarAsync()
            => _db.ProveedoresServicios.OrderBy(x => x.Nombre).ToListAsync();

        public Task<ProveedorServicio?> ObtenerAsync(Guid id)
            => _db.ProveedoresServicios.FirstOrDefaultAsync(x => x.Id == id);

        public Task<bool> ExisteNombreAsync(string nombre)
            => _db.ProveedoresServicios.AnyAsync(x => x.Nombre == nombre);

        public async Task CrearAsync(ProveedorServicio entity)
        {
            _db.ProveedoresServicios.Add(entity);
            await _db.SaveChangesAsync();
        }
    }
}
