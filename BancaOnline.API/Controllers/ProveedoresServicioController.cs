using BancaOnline.BC.Entidades;
using BancaOnline.BW.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BancaOnline.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProveedoresServicioController : ControllerBase
    {
        private readonly IProveedorServicioBW _bw;
        public ProveedoresServicioController(IProveedorServicioBW bw) => _bw = bw;

        [HttpGet]
        public Task<List<ProveedorServicio>> Get()
            => _bw.ObtenerProveedoresAsync();

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ProveedorServicio p)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _bw.CrearProveedorAsync(p);

            return CreatedAtAction(nameof(Get), new { p.Id }, p);
        }
    }
}
