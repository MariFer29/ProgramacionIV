using BancaOnline.BC.Entidades;
using BancaOnline.DA.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BancaOnline.DA.Acciones
{
    public class UsuariosRepositorio : IUsuariosRepositorioDA
    {
        private readonly AppDbContext _context;

        public UsuariosRepositorio(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Usuario> CrearAsync(Usuario usuario)
        {
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }

        public async Task<Usuario> ObtenerPorEmailAsync(string email)
        {
            return await _context.Usuarios
                .Include(u => u.Cliente)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<Usuario> ObtenerPorIdAsync(int id)
        {
            return await _context.Usuarios
                .Include(u => u.Cliente)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task ActualizarAsync(Usuario usuario)
        {
            _context.Usuarios.Update(usuario);
            await _context.SaveChangesAsync();
        }
    }
}

