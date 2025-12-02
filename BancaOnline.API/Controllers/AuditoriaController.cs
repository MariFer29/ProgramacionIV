using BancaOnline.BW.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BancaOnline.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuditoriaController : ControllerBase
    {
        private readonly IAuditoriaBW _auditoriaBW;

        public AuditoriaController(IAuditoriaBW auditoriaBW)
        {
            _auditoriaBW = auditoriaBW;
        }

        //[Authorize(Roles = "Gestor,Administrador")]
        [HttpGet]
        public async Task<IActionResult> Get(
            [FromQuery] DateTime? desde,
            [FromQuery] DateTime? hasta,
            [FromQuery] int? usuarioId,
            [FromQuery] string? tipoOperacion)
        {
            var result = await _auditoriaBW.BuscarAsync(desde, hasta, usuarioId, tipoOperacion);
            return Ok(result);
        }
    }
}
