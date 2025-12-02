using BancaOnline.BC.Entidades;
using BancaOnline.BW.DTOs;
using BancaOnline.DA.Interfaces;

namespace BancaOnline.BW.CU
{
    public class GestionClientesCU
    {
        private readonly IClientesRepositorioDA _clientesRepo;
        private readonly IUsuariosRepositorioDA _usuariosRepo;

        public GestionClientesCU(IClientesRepositorioDA clientesRepo, IUsuariosRepositorioDA usuariosRepo)
        {
            _clientesRepo = clientesRepo;
            _usuariosRepo = usuariosRepo;
        }

        public async Task<IEnumerable<Cliente>> ObtenerTodos()
        {
            return await _clientesRepo.ListarTodosAsync();
        }

        public async Task<Cliente?> ObtenerPorId(int id)
        {
            return await _clientesRepo.ObtenerPorIdAsync(id);
        }

        public async Task<string> Actualizar(int id, ActualizarClienteDTO dto)
        {
            var cliente = await _clientesRepo.ObtenerPorIdAsync(id);
            if (cliente == null)
                return "Cliente no encontrado.";

            var clientePorCorreo = await _clientesRepo.ObtenerPorCorreoAsync(dto.Correo);
            if (clientePorCorreo != null && clientePorCorreo.Id != id)
                return "Ya existe un cliente con ese correo.";

            cliente.NombreCompleto = dto.NombreCompleto;
            cliente.Telefono = dto.Telefono;
            cliente.Correo = dto.Correo;

            await _clientesRepo.ActualizarAsync(cliente);
            return "Cliente actualizado correctamente.";
        }
    }
}



