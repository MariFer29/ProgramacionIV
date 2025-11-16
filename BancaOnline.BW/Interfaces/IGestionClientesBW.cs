using BancaOnline.BC.Entidades;

namespace BancaOnline.BW.Interfaces
{
    public interface IGestionClientesBW
    {
        Task<(bool Exito, string Mensaje)> CrearClienteAsync(Cliente cliente);
        Task<Cliente?> ObtenerClientePorIdentificacionAsync(string identificacion);
        Task<IEnumerable<Cliente>> ObtenerTodosClientesAsync();
        Task<(bool Exito, string Mensaje)> ActualizarClienteAsync(Cliente cliente);
    }
}
