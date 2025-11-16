using BancaOnline.BC.Entidades;

namespace BancaOnline.BW.Interfaces
{
    public interface ILoginBW
    {
        Task<(bool Exito, string Mensaje, string Token)> LoginAsync(string email, string password);
    }
}

