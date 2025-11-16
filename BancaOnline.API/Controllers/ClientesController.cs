using BancaOnline.BW.CU;
using BancaOnline.BW.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace BancaOnline.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientesController : ControllerBase
    {
        private readonly GestionClientesCU _gestionClientesCU;

        public ClientesController(GestionClientesCU gestionClientesCU)
        {
            _gestionClientesCU = gestionClientesCU;
        }

        [HttpGet]
        public async Task<IActionResult> GetTodos()
        {
            var clientes = await _gestionClientesCU.ObtenerTodos();
            return Ok(clientes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPorId(int id)
        {
            var cliente = await _gestionClientesCU.ObtenerPorId(id);
            if (cliente == null)
                return NotFound("Cliente no encontrado.");

            return Ok(cliente);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] ActualizarClienteDTO dto)
        {
            var resultado = await _gestionClientesCU.Actualizar(id, dto);
            return Ok(resultado);
        }

        [HttpPut("{id}/asignar-usuario")]
        public async Task<IActionResult> AsignarUsuario(int id, [FromBody] AsignarUsuarioDTO dto)
        {
            var resultado = await _gestionClientesCU.AsignarUsuario(id, dto.IdUsuario);
            return Ok(resultado);
        }
    }
}



