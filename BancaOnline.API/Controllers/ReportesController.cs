using BancaOnline.BW.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BancaOnline.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportesController : ControllerBase
    {
        private readonly IReportesBW _reportesBW;

        public ReportesController(IReportesBW reportesBW)
        {
            _reportesBW = reportesBW;
        }

        // GET => api/reportes/totales?desde=2025-01-01&hasta=2025-01-31
        [HttpGet("totales")]
        public async Task<IActionResult> GetTotales(
            [FromQuery] DateTime desde,
            [FromQuery] DateTime hasta)
        {
            var result = await _reportesBW.ObtenerTotalesPeriodoAsync(desde, hasta);
            return Ok(result);
        }

        // GET => api/reportes/top-clientes?desde=2025-01-01&hasta=2025-01-31&top=5
        [HttpGet("top-clientes")]
        public async Task<IActionResult> GetTopClientes(
            [FromQuery] DateTime desde,
            [FromQuery] DateTime hasta,
            [FromQuery] int top = 10)
        {
            var result = await _reportesBW.ObtenerTopClientesAsync(desde, hasta, top);
            return Ok(result);
        }

        // GET => api/reportes/volumen-diario?desde=2025-01-01&hasta=2025-01-31
        [HttpGet("volumen-diario")]
        public async Task<IActionResult> GetVolumenDiario(
            [FromQuery] DateTime desde,
            [FromQuery] DateTime hasta)
        {
            var result = await _reportesBW.ObtenerVolumenDiarioAsync(desde, hasta);
            return Ok(result);
        }
    }
}
