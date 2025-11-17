using BancaOnline.BW.CU;
using BancaOnline.BW.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace BancaOnline.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        // Caso de uso para registrar usuarios
        private readonly RegistrarUsuarioCU _registrarUsuarioCU;

        // Caso de uso para login y generación de token JWT
        private readonly LoginCU _loginCU;

        public UsuariosController(RegistrarUsuarioCU registrarUsuarioCU, LoginCU loginCU)
        {
            _registrarUsuarioCU = registrarUsuarioCU;
            _loginCU = loginCU;
        }

        // Endpoint para registrar un nuevo usuario
        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] RegistrarUsuarioDTO dto)
        {
            // Se envía el DTO al caso de uso encargado del registro
            var resultado = await _registrarUsuarioCU.Ejecutar(dto);

            return Ok(resultado); // Devuelve mensaje con el resultado
        }

        // Endpoint para iniciar sesión
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            // Se valida usuario y contraseña y se genera un token JWT
            var token = await _loginCU.Ejecutar(dto);

            // Si token es null, las credenciales son incorrectas o el usuario está bloqueado
            if (token == null)
                return Unauthorized("Credenciales incorrectas o usuario bloqueado.");

            // Si todo es correcto, se devuelve el token al cliente
            return Ok(new { Token = token });
        }
    }
}



