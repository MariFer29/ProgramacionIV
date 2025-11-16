using BancaOnline.BC.Entidades;
using BancaOnline.BW.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BancaOnline.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransferenciasController : ControllerBase
    {
        private readonly ITransferenciaBW _bw;
        public TransferenciasController(ITransferenciaBW bw) => _bw = bw;

        [HttpGet]
        public Task<List<Transferencia>> Get()
            => _bw.ObtenerTransferenciasAsync();

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Transferencia t)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _bw.CrearTransferenciaAsync(t);

            return CreatedAtAction(nameof(Get), new { t.Id }, t);
        }
    }
}
