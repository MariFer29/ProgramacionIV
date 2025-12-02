using BancaOnline.BW.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BancaOnline.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComprobantesController : ControllerBase
    {
        private readonly IComprobantesBW _comprobantesBW;

        public ComprobantesController(IComprobantesBW comprobantesBW)
        {
            _comprobantesBW = comprobantesBW;
        }

        [HttpGet("transferencia/{id:guid}")]
        public async Task<IActionResult> GetComprobanteTransferencia(Guid id)
        {
            var pdfBytes = await _comprobantesBW.GenerarComprobanteTransferenciaAsync(id);
            var fileName = $"comprobante-transferencia-{id}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }

        [HttpGet("pago/{id:guid}")]
        public async Task<IActionResult> GetComprobantePago(Guid id)
        {
            var pdfBytes = await _comprobantesBW.GenerarComprobantePagoServicioAsync(id);
            var fileName = $"comprobante-pago-{id}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }

        [HttpGet("extracto/{cuentaId:guid}")]
        public async Task<IActionResult> GetExtractoMensualPdf(
        Guid cuentaId,
        [FromQuery] int anio,
        [FromQuery] int mes)
        {
            var pdfBytes = await _comprobantesBW.GenerarComprobanteExtractoMensualAsync(cuentaId, anio, mes);
            var fileName = $"extracto-{cuentaId}-{anio}-{mes:00}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }
    }
}
