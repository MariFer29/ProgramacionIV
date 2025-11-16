using BancaOnline.BW.CU;
using BancaOnline.BW.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace BancaOnline.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly RegistrarUsuarioCU _registrarUsuarioCU;
        private readonly LoginCU _loginCU;

        public UsuariosController(RegistrarUsuarioCU registrarUsuarioCU, LoginCU loginCU)
        {
            _registrarUsuarioCU = registrarUsuarioCU;
            _loginCU = loginCU;
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] RegistrarUsuarioDTO dto)
        {
            var resultado = await _registrarUsuarioCU.Ejecutar(dto);
            return Ok(resultado);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            var token = await _loginCU.Ejecutar(dto);

            if (token == null)
                return Unauthorized("Credenciales incorrectas o usuario bloqueado.");

            return Ok(new { Token = token });
        }
    }
}



