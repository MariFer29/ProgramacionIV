using BancaOnline.BC.Entidades;

namespace BancaOnline.DA.Interfaces
{
    public interface IUsuariosRepositorioDA
    {
        Task<Usuario> CrearAsync(Usuario usuario);
        Task<Usuario> ObtenerPorEmailAsync(string email);
        Task<Usuario> ObtenerPorIdAsync(int id);
        Task ActualizarAsync(Usuario usuario);
    }
}

