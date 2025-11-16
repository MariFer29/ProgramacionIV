using BancaOnline.BC.Entidades;
using BancaOnline.BW.DTOs;
using BancaOnline.DA.Interfaces;
using Microsoft.AspNet.Identity;
using Microsoft.AspNetCore.Identity;

namespace BancaOnline.BW.CU
{
    public class RegistrarUsuarioCU
    {
        private readonly IUsuariosRepositorioDA _usuariosRepo;
        private readonly IClientesRepositorioDA _clientesRepo;

        private readonly PasswordHasher<Usuario> _passwordHasher = new PasswordHasher<Usuario>();

        public RegistrarUsuarioCU(IUsuariosRepositorioDA usuariosRepo, IClientesRepositorioDA clientesRepo)
        {
            _usuariosRepo = usuariosRepo;
            _clientesRepo = clientesRepo;
        }

        public async Task<string> Ejecutar(RegistrarUsuarioDTO dto)
        {
            // Validar correo único
            var existe = await _usuariosRepo.ObtenerPorEmailAsync(dto.Email);
            if (existe != null)
                return "El correo ya está registrado.";

            // Validar rol
            string[] rolesValidos = { "Administrador", "Gestor", "Cliente" };
            if (!rolesValidos.Contains(dto.Rol))
                return "Rol inválido.";

            // Crear usuario
            var usuario = new Usuario
            {
                Email = dto.Email,
                Rol = dto.Rol,
                IntentosFallidos = 0,
                FechaBloqueoHasta = null
            };

            // Hashear contraseña
            usuario.ContrasenaHash = _passwordHasher.HashPassword(usuario, dto.Password);

            // Guardar usuario
            usuario = await _usuariosRepo.CrearAsync(usuario);

            // Si es rol Cliente, crear ficha cliente asociada
            if (dto.Rol == "Cliente")
            {
                var cliente = new Cliente
                {
                    Identificacion = dto.Identificacion!,
                    NombreCompleto = dto.NombreCompleto!,
                    Telefono = dto.Telefono!,
                    Correo = dto.Email,
                    UsuarioId = usuario.Id
                };

                await _clientesRepo.CrearAsync(cliente);
            }

            return "Usuario creado correctamente.";
        }
    }
}





