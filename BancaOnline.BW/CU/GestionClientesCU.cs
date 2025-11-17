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

            // Validar correo único entre clientes
            var clientePorCorreo = await _clientesRepo.ObtenerPorCorreoAsync(dto.Correo);
            if (clientePorCorreo != null && clientePorCorreo.Id != id)
                return "Ya existe un cliente con ese correo.";

            // Asignar cambios
            cliente.NombreCompleto = dto.NombreCompleto;
            cliente.Telefono = dto.Telefono;
            cliente.Correo = dto.Correo;

            await _clientesRepo.ActualizarAsync(cliente);
            return "Cliente actualizado correctamente.";
        }

        public async Task<string> AsignarUsuario(int idCliente, int idUsuario)
        {
            var cliente = await _clientesRepo.ObtenerPorIdAsync(idCliente);
            if (cliente == null)
                return "Cliente no encontrado.";

            // Validación 1: cliente ya tiene un usuario
            if (cliente.UsuarioId != null)
                return "Este cliente ya tiene un usuario asociado.";

            var usuario = await _usuariosRepo.ObtenerPorIdAsync(idUsuario);
            if (usuario == null)
                return "Usuario no encontrado.";

            // Validación 2: solo rol Cliente
            if (usuario.Rol != "Cliente")
                return "Solo se pueden asociar usuarios con rol 'Cliente'.";

            // Validación 3: usuario ya está asociado a otro cliente
            var clienteExistente = await _clientesRepo.ObtenerPorIdentificacionAsync(cliente.Identificacion);
            if (clienteExistente != null && clienteExistente.UsuarioId == usuario.Id)
                return "Este usuario ya está asociado a otro cliente.";

            // Asignar
            cliente.UsuarioId = usuario.Id;

            await _clientesRepo.ActualizarAsync(cliente);
            return "Usuario asignado correctamente.";
        }
    }
}



