using System.Text.Json;
using System.Text.RegularExpressions;
using BancaOnline.BC.Entidades;
using BancaOnline.BW.DTOs;
using BancaOnline.BW.Interfaces;
using BancaOnline.DA.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace BancaOnline.BW.CU
{
    public class RegistrarUsuarioCU
    {
        private readonly IUsuariosRepositorioDA _usuariosRepo;
        private readonly IClientesRepositorioDA _clientesRepo;
        private readonly IAuditoriaBW _auditoriaBW;

        private readonly PasswordHasher<Usuario> _passwordHasher = new PasswordHasher<Usuario>();

        public RegistrarUsuarioCU(
            IUsuariosRepositorioDA usuariosRepo,
            IClientesRepositorioDA clientesRepo,
            IAuditoriaBW auditoriaBW)
        {
            _usuariosRepo = usuariosRepo;
            _clientesRepo = clientesRepo;
            _auditoriaBW = auditoriaBW;
        }

        public async Task<string> Ejecutar(RegistrarUsuarioDTO dto)
        {

            // Validar correo único
            var existe = await _usuariosRepo.ObtenerPorEmailAsync(dto.Email);
            if (existe != null)
            {
                await RegistrarAuditoriaUsuarioAsync(
                    usuario: null,
                    dto,
                    tipoOperacion: "RegistroUsuarioFallido",
                    razonFalla: "Correo ya registrado");
                return "El correo ya está registrado.";
            }

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


            var usuario = new Usuario
            {
                Email = dto.Email,
                Rol = dto.Rol,
                IntentosFallidos = 0,
                FechaBloqueoHasta = null
            };

            usuario.ContrasenaHash = _passwordHasher.HashPassword(usuario, dto.Password);

            usuario = await _usuariosRepo.CrearAsync(usuario);


            if (dto.Rol == "Cliente")
            {
                // Validar identificación única
                var clienteExistente = await _clientesRepo.ObtenerPorIdentificacionAsync(dto.Identificacion!);
                if (clienteExistente != null)
                {
                    await RegistrarAuditoriaUsuarioAsync(
                        usuario,
                        dto,
                        tipoOperacion: "RegistroClienteFallido",
                        razonFalla: "Identificación ya registrada");
                    return "La identificación ya está registrada en otro cliente.";
                }

                // Validar que no exista otro usuario con rol Cliente asociado a ese email
                var clientePorCorreo = await _clientesRepo.ObtenerPorCorreoAsync(dto.Email);
                if (clientePorCorreo != null)
                {
                    await RegistrarAuditoriaUsuarioAsync(
                        usuario,
                        dto,
                        tipoOperacion: "RegistroClienteFallido",
                        razonFalla: "Ya existe un cliente asociado a este correo");
                    return "Ya existe un cliente asociado a este correo electrónico.";
                }

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

            await RegistrarAuditoriaUsuarioAsync(
                usuario,
                dto,
                tipoOperacion: "RegistroUsuarioExitoso",
                razonFalla: null);

            return "Usuario creado correctamente.";
        }


        private bool ValidaCaracteres(string pattern, string input)
            => Regex.IsMatch(input, pattern);

        private bool ValidarPassword(string password)
        {
            return
                password.Length >= 8 &&
                ValidaCaracteres(@"[A-Z]", password) &&     // al menos una mayúscula
                ValidaCaracteres(@"\d", password) &&        // al menos un número
                ValidaCaracteres(@"[\W_]", password);       // al menos un símbolo
        }

        private async Task RegistrarAuditoriaUsuarioAsync(
            Usuario? usuario,
            RegistrarUsuarioDTO dto,
            string tipoOperacion,
            string? razonFalla)
        {
            var auditoria = new Auditoria
            {
                Id = System.Guid.NewGuid(),
                Fecha = System.DateTime.UtcNow,
                UsuarioId = usuario?.Id,
                UsuarioEmail = dto.Email,
                TipoOperacion = tipoOperacion,
                Entidad = "Usuario",
                EntidadId = usuario?.Id.ToString(),
                DatosNuevos = JsonSerializer.Serialize(new
                {
                    dto.Email,
                    dto.Rol,
                    dto.Identificacion,
                    dto.NombreCompleto,
                    dto.Telefono,
                    RazonFalla = razonFalla
                })
            };

            await _auditoriaBW.RegistrarAsync(auditoria);
        }
    }
}





