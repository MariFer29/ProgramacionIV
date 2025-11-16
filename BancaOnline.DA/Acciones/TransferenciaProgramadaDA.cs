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
    public class TransferenciaProgramadaDA : ITransferenciaProgramadaDA
    {
        private readonly AppDbContext _db;
        public TransferenciaProgramadaDA(AppDbContext db) => _db = db;

        public Task<List<TransferenciaProgramada>> ListarAsync()
            => _db.TransferenciasProgramadas
                  .OrderByDescending(x => x.FechaCreacion)
                  .ToListAsync();

        public Task<TransferenciaProgramada?> ObtenerAsync(Guid id)
            => _db.TransferenciasProgramadas.FirstOrDefaultAsync(x => x.Id == id);

        public async Task CrearAsync(TransferenciaProgramada entity)
        {
            _db.TransferenciasProgramadas.Add(entity);
            await _db.SaveChangesAsync();
        }

        public async Task CancelarAsync(Guid id)
        {
            var tp = await _db.TransferenciasProgramadas.FindAsync(id);
            if (tp is null) return;


            tp.Estado = 3;

            await _db.SaveChangesAsync();
        }
    }
}