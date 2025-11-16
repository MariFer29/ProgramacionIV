using BancaOnline.BC.Entidades;
using BancaOnline.BW.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BancaOnline.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransferenciasProgramadasController : ControllerBase
    {
        private readonly ITransferenciaProgramadaBW _bw;
        public TransferenciasProgramadasController(ITransferenciaProgramadaBW bw) => _bw = bw;

        [HttpGet]
        public Task<List<TransferenciaProgramada>> Get()
            => _bw.ObtenerTransferenciasProgramadasAsync();

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] TransferenciaProgramada t)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _bw.CrearTransferenciaProgramadaAsync(t);

            return CreatedAtAction(nameof(Get), new { t.Id }, t);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Cancelar(Guid id)
        {
            try
            {
                await _bw.CancelarTransferenciaProgramadaAsync(id);
                return NoContent(); // 204
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
