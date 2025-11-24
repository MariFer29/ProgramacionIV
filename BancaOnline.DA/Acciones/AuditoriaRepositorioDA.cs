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
    public class AuditoriaRepositorioDA : IAuditoriaRepositorioDA
    {
        private readonly AppDbContext _context;

        public AuditoriaRepositorioDA(AppDbContext context)
        {
            _context = context;
        }

        public async Task RegistrarAsync(Auditoria auditoria)
        {
            _context.Auditorias.Add(auditoria);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Auditoria>> BuscarAsync(
            DateTime? desde,
            DateTime? hasta,
            int? usuarioId,
            string? tipoOperacion)
        {
            var query = _context.Auditorias.AsQueryable();

            if (desde.HasValue)
                query = query.Where(a => a.Fecha >= desde.Value);

            if (hasta.HasValue)
                query = query.Where(a => a.Fecha <= hasta.Value);

            if (usuarioId.HasValue)
                query = query.Where(a => a.UsuarioId == usuarioId);

            if (!string.IsNullOrWhiteSpace(tipoOperacion))
                query = query.Where(a => a.TipoOperacion == tipoOperacion);

            return await query
                .OrderByDescending(a => a.Fecha)
                .ToListAsync();
        }
    }
}
