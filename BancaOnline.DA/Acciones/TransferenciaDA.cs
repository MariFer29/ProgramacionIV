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
    public class TransferenciaDA : ITransferenciaDA
    {
        private readonly AppDbContext _db;
        public TransferenciaDA(AppDbContext db) => _db = db;
        public Task<List<Transferencia>> ListarAsync()
            => _db.Transferencias.OrderByDescending(x => x.FechaCreacion).ToListAsync();
        public Task<Transferencia?> ObtenerAsync(Guid id)
            => _db.Transferencias.FirstOrDefaultAsync(x => x.Id == id);
        public Task<bool> ExisteIdempotenciaAsync(string key)
        => _db.Transferencias.AnyAsync(x => x.IdempotencyKey == key);
        public async Task CrearAsync(Transferencia entity)
        {
            _db.Transferencias.Add(entity);
            await _db.SaveChangesAsync();
        }
    }
}
