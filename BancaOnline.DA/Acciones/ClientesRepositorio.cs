using BancaOnline.BC.Entidades;
using BancaOnline.DA.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BancaOnline.DA.Acciones
{
    public class ClientesRepositorio : IClientesRepositorio
    {
        private readonly AppDbContext _context;

        public ClientesRepositorio(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Cliente> CrearAsync(Cliente cliente)
        {
            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();
            return cliente;
        }

        public async Task<List<Cliente>> ListarTodosAsync()
        {
            return await _context.Clientes
                .Include(c => c.Usuario)
                .ToListAsync();
        }

        public async Task<Cliente> ObtenerPorIdAsync(int id)
        {
            return await _context.Clientes
                .Include(c => c.Usuario)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Cliente> ObtenerPorIdentificacionAsync(string identificacion)
        {
            return await _context.Clientes
                .FirstOrDefaultAsync(c => c.Identificacion == identificacion);
        }

        public async Task ActualizarAsync(Cliente cliente)
        {
            _context.Clientes.Update(cliente);
            await _context.SaveChangesAsync();
        }
    }
}


