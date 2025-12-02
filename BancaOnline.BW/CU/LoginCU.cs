using BancaOnline.BC.Entidades;
using BancaOnline.BW.DTOs;
using BancaOnline.DA.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace BancaOnline.BW.CU
{
    public class LoginCU
    {
        private readonly IUsuariosRepositorioDA _usuariosRepo;
        private readonly JwtService _jwtService;
        private readonly PasswordHasher<Usuario> _passwordHasher = new PasswordHasher<Usuario>();

        public LoginCU(IUsuariosRepositorioDA usuariosRepo, JwtService jwtService)
        {
            _usuariosRepo = usuariosRepo;
            _jwtService = jwtService;
        }

        public async Task<string?> Ejecutar(LoginDTO dto)
        {
            var usuario = await _usuariosRepo.ObtenerPorEmailAsync(dto.Email);

            if (usuario == null)
                return null;

            // Usuario bloqueado
            if (usuario.FechaBloqueoHasta != null &&
                usuario.FechaBloqueoHasta > DateTime.UtcNow)
            {
                return null; // <-- NO devolver string
            }

            // Verificar contraseña
            var resultado = _passwordHasher.VerifyHashedPassword(
                usuario,
                usuario.ContrasenaHash,
                dto.Password
            );

            if (resultado == PasswordVerificationResult.Failed)
            {
                usuario.IntentosFallidos++;

                if (usuario.IntentosFallidos >= 5)
                    usuario.FechaBloqueoHasta = DateTime.UtcNow.AddMinutes(15);

                await _usuariosRepo.ActualizarAsync(usuario);
                return null;
            }

            // Login exitoso
            usuario.IntentosFallidos = 0;
            usuario.FechaBloqueoHasta = null;

            await _usuariosRepo.ActualizarAsync(usuario);

            var token = _jwtService.GenerarToken(usuario);

            Console.WriteLine("======================================");
            Console.WriteLine("TOKEN GENERADO PARA LOGIN:");
            Console.WriteLine(token);
            Console.WriteLine("======================================");

            return token;

        }
    }
}


