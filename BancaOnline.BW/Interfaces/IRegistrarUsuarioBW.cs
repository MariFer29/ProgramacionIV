using BancaOnline.BC.Entidades;

namespace BancaOnline.BW.Interfaces
{
    public interface IRegistrarUsuarioBW
    {
        Task<(bool Exito, string Mensaje)> RegistrarUsuarioAsync(string email, string password, string rol);
    }
}
