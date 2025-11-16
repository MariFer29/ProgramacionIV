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
    public class PagoServicioDA : IPagoServicioDA
    {
        private readonly AppDbContext _db;
        public PagoServicioDA(AppDbContext db) => _db = db;

        public Task<List<PagoServicio>> ListarAsync()
            => _db.PagosServicios
                  .OrderByDescending(x => x.FechaCreacion)
                  .ToListAsync();

        public Task<PagoServicio?> ObtenerAsync(Guid id)
            => _db.PagosServicios.FirstOrDefaultAsync(x => x.Id == id);

        public async Task CrearAsync(PagoServicio entity)
        {
            _db.PagosServicios.Add(entity);
            await _db.SaveChangesAsync();
        }
    }
}