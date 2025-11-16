using BancaOnline.BC.Entidades;

namespace BancaOnline.DA.Interfaces
{
    public interface IClientesRepositorioDA
    {
        Task<Cliente> CrearAsync(Cliente cliente);
        Task<List<Cliente>> ListarTodosAsync();
        Task<Cliente> ObtenerPorIdAsync(int id);
        Task<Cliente> ObtenerPorIdentificacionAsync(string identificacion);
        Task ActualizarAsync(Cliente cliente);
    }
}

