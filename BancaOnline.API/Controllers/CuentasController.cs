using Microsoft.AspNetCore.Mvc;
using BancaOnline.BW.Interfaces;
using BancaOnline.BW.DTOs;

namespace BancaOnline.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CuentasController : ControllerBase
    {
        private readonly IAccountBW _service;

        public CuentasController(IAccountBW service)
        {
            _service = service;
        }

        // POST api/cuentas/abrir
        [HttpPost("abrir")]
        public async Task<IActionResult> AbrirCuenta([FromBody] AbrirCuentaDTO request)
        {
            var result = await _service.AbrirCuentaAsync(request);
            return Ok(result);
        }

        // GET api/cuentas
        [HttpGet]
        public async Task<IActionResult> Consultar([FromQuery] FiltroCuentasDTO filtro)
        {
            var result = await _service.ConsultarCuentasAsync(filtro);
            return Ok(result);
        }

        // PUT api/cuentas/bloquear/{id}
        [HttpPut("bloquear/{id}")]
        public async Task<IActionResult> Bloquear(Guid id)
        {
            var ok = await _service.BloquearCuentaAsync(id);
            return ok ? Ok() : NotFound();
        }

        // PUT api/cuentas/cerrar/{id}
        [HttpPut("cerrar/{id}")]
        public async Task<IActionResult> Cerrar(Guid id)
        {
            var ok = await _service.CerrarCuentaAsync(id);
            return ok ? Ok() : NotFound();
        }
    }
}
