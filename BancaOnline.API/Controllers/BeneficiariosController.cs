using Microsoft.AspNetCore.Mvc;
using BancaOnline.BW.DTOs;
using BancaOnline.BW.Interfaces;

namespace BancaOnline.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BeneficiariosController : ControllerBase
    {
        private readonly IBeneficiaryCU _service;

        public BeneficiariosController(IBeneficiaryCU service)
        {
            _service = service;
        }

        // POST api/beneficiarios
        [HttpPost]
        public async Task<IActionResult> Registrar([FromBody] RegistrarBeneficiarioDTO request)
        {
            var result = await _service.RegistrarAsync(request);
            return Ok(result);
        }

        // PUT api/beneficiarios
        [HttpPut]
        public async Task<IActionResult> Actualizar([FromBody] ActualizarBeneficiarioDTO request)
        {
            var result = await _service.ActualizarAsync(request);
            return result is null ? NotFound() : Ok(result);
        }

        // DELETE api/beneficiarios/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(Guid id)
        {
            var ok = await _service.EliminarAsync(id);
            return ok ? Ok() : NotFound();
        }

        // PUT api/beneficiarios/confirmar/{id}
        [HttpPut("confirmar/{id}")]
        public async Task<IActionResult> Confirmar(Guid id)
        {
            var ok = await _service.ConfirmarAsync(id);
            return ok ? Ok() : NotFound();
        }

        // GET api/beneficiarios
        [HttpGet]
        public async Task<IActionResult> Consultar([FromQuery] FiltroBeneficiariosDTO filtro)
        {
            var result = await _service.ConsultarAsync(filtro);
            return Ok(result);
        }
    }
}
