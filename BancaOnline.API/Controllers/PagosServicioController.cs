using BancaOnline.BC.Entidades;
using BancaOnline.BW.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BancaOnline.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PagoServicioController : ControllerBase
    {
        private readonly IPagoServicioBW _bw;
        public PagoServicioController(IPagoServicioBW bw) => _bw = bw;

        [HttpGet]
        public Task<List<PagoServicio>> Get()
            => _bw.ObtenerPagosAsync();

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] PagoServicio pago)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _bw.RegistrarPagoServicioAsync(pago);

            return CreatedAtAction(nameof(Get), new { pago.Id }, pago);
        }
    }
}
