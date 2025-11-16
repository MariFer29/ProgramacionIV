using BancaOnline.BC.Entidades;
using BancaOnline.BW.DTOs;
using BancaOnline.DA.Interfaces;

namespace BancaOnline.BW.CU
{
    public class GestionClientesCU
    {
        private readonly IClientesRepositorio _clientesRepo;
        private readonly IUsuariosRepositorio _usuariosRepo;

        public GestionClientesCU(IClientesRepositorio clientesRepo, IUsuariosRepositorio usuariosRepo)
        {
            _clientesRepo = clientesRepo;
            _usuariosRepo = usuariosRepo;
        }

        // Obtener todos los clientes
        public async Task<IEnumerable<Cliente>> ObtenerTodos()
        {
            return await _clientesRepo.ListarTodosAsync();
        }

        // Obtener cliente por ID
        public async Task<Cliente?> ObtenerPorId(int id)
        {
            return await _clientesRepo.ObtenerPorIdAsync(id);
        }

        // Actualizar datos del cliente
        public async Task<string> Actualizar(int id, ActualizarClienteDTO dto)
        {
            var cliente = await _clientesRepo.ObtenerPorIdAsync(id);
            if (cliente == null)
                return "Cliente no encontrado.";

            cliente.NombreCompleto = dto.NombreCompleto;
            cliente.Telefono = dto.Telefono;
            cliente.Correo = dto.Correo;

            await _clientesRepo.ActualizarAsync(cliente);
            return "Cliente actualizado correctamente.";
        }

        // Asignar usuario existente a cliente (1:1)
        public async Task<string> AsignarUsuario(int idCliente, int idUsuario)
        {
            var cliente = await _clientesRepo.ObtenerPorIdAsync(idCliente);
            if (cliente == null)
                return "Cliente no encontrado.";

            // Validación 1 usuario máximo
            if (cliente.UsuarioId != null)
                return "Este cliente ya tiene un usuario asociado.";

            var usuario = await _usuariosRepo.ObtenerPorIdAsync(idUsuario);
            if (usuario == null)
                return "Usuario no encontrado.";

            // Validación: solo usuarios con rol Cliente
            if (usuario.Rol != "Cliente")
                return "Solo se pueden asociar usuarios con rol 'Cliente'.";

            // Asignar relación 1:1
            cliente.UsuarioId = usuario.Id;

            await _clientesRepo.ActualizarAsync(cliente);
            return "Usuario asignado correctamente.";
        }
    }
}


