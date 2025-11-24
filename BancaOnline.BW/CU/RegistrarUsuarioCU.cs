using BancaOnline.BC.Entidades;
using BancaOnline.BW.DTOs;
using BancaOnline.DA.Interfaces;
using Microsoft.AspNetCore.Identity;
using System.Text.RegularExpressions;

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
            // -------------------------------
            // VALIDACIONES GENERALES
            // -------------------------------

            // Validar correo único
            var existe = await _usuariosRepo.ObtenerPorEmailAsync(dto.Email);
            if (existe != null)
                return "El correo ya está registrado.";

            // Validar formato email válido
            if (!Regex.IsMatch(dto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                return "El correo electrónico no tiene un formato válido.";

            // Validar contraseña fuerte
            if (!ValidarPassword(dto.Password))
                return "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.";

            // Validar rol
            string[] rolesValidos = { "Administrador", "Gestor", "Cliente" };
            if (!rolesValidos.Contains(dto.Rol))
                return "Rol inválido.";

            // -------------------------------
            // CREAR USUARIO
            // -------------------------------

            var usuario = new Usuario
            {
                Email = dto.Email,
                Rol = dto.Rol,
                IntentosFallidos = 0,
                FechaBloqueoHasta = null
            };

            usuario.ContrasenaHash = _passwordHasher.HashPassword(usuario, dto.Password);

            usuario = await _usuariosRepo.CrearAsync(usuario);

            // -------------------------------
            // REGISTRAR CLIENTE SI ROL = CLIENTE
            // -------------------------------

            if (dto.Rol == "Cliente")
            {
                // Validar identificación única
                var clienteExistente = await _clientesRepo.ObtenerPorIdentificacionAsync(dto.Identificacion!);
                if (clienteExistente != null)
                    return "La identificación ya está registrada en otro cliente.";

                // Validar que no exista otro usuario con rol Cliente asociado a ese email
                var clientePorCorreo = await _clientesRepo.ObtenerPorCorreoAsync(dto.Email);
                if (clientePorCorreo != null)
                    return "Ya existe un cliente asociado a este correo electrónico.";

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

        // --------------------------------
        // MÉTODO: VALIDAR CONTRASEÑA FUERTE
        // --------------------------------
        private bool ValidaCaracteres(string pattern, string input)
            => Regex.IsMatch(input, pattern);

        private bool ValidarPassword(string password)
        {
            return
                password.Length >= 8 &&
                ValidaCaracteres(@"[A-Z]", password) &&     // al menos una mayúscula
                ValidaCaracteres(@"\d", password) &&        // al menos un número
                ValidaCaracteres(@"[\W_]", password);        // al menos un símbolo
        }
    }
}





