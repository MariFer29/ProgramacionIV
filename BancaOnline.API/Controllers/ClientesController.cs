using BancaOnline.BW.CU;
using BancaOnline.BW.DTOs;
using Microsoft.AspNetCore.Authorization;
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

        // ============================
        // GET: api/clientes
        // ============================
        [HttpGet]
        [Authorize(Roles = "Administrador,Gestor")]
        public async Task<IActionResult> GetTodos()
        {
            var clientes = await _gestionClientesCU.ObtenerTodos();
            return Ok(clientes);
        }

        // ============================
        // GET: api/clientes/{id}
        // ============================
        [HttpGet("{id}")]
        [Authorize(Roles = "Administrador,Gestor")]
        public async Task<IActionResult> GetPorId(int id)
        {
            var cliente = await _gestionClientesCU.ObtenerPorId(id);
            if (cliente == null)
                return NotFound("Cliente no encontrado.");

            return Ok(cliente);
        }

        // ============================
        // PUT: api/clientes/{id}
        // ============================
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador,Gestor")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] ActualizarClienteDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var resultado = await _gestionClientesCU.Actualizar(id, dto);

            if (resultado.Contains("no encontrado"))
                return NotFound(resultado);

            if (resultado.Contains("existe"))
                return Conflict(resultado);

            return Ok(resultado);
        }
    }
}



