using BancaOnline.BW.DTOs;
using BancaOnline.BW.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BancaOnline.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HistorialController : ControllerBase
    {
        private readonly IHistorialBW _historialBW;

        public HistorialController(IHistorialBW historialBW)
        {
            _historialBW = historialBW;
        }

        // GET api/historial/cliente/123?desde=...&hasta=...&tipo=1&estado=1&cuentaId=...
        [HttpGet("cliente/{clienteId:int}")]
        // [Authorize(Roles = "Cliente,Gestor,Administrador")]
        public async Task<IActionResult> GetPorCliente(
            int clienteId,
            [FromQuery] DateTime? desde,
            [FromQuery] DateTime? hasta,
            [FromQuery] int? tipo,
            [FromQuery] int? estado,
            [FromQuery] Guid? cuentaId)
        {
            var filtro = new HistorialFiltroDTO
            {
                Desde = desde,
                Hasta = hasta,
                Tipo = tipo,
                Estado = estado,
                CuentaId = cuentaId
            };

            var result = await _historialBW.ObtenerHistorialPorClienteAsync(clienteId, filtro);
            return Ok(result);
        }

        // GET api/historial/cuenta/{cuentaId}?desde=...&hasta=...&tipo=2&estado=1
        [HttpGet("cuenta/{cuentaId:guid}")]
        // [Authorize(Roles = "Cliente,Gestor,Administrador")]
        public async Task<IActionResult> GetPorCuenta(
            Guid cuentaId,
            [FromQuery] DateTime? desde,
            [FromQuery] DateTime? hasta,
            [FromQuery] int? tipo,
            [FromQuery] int? estado)
        {
            var filtro = new HistorialFiltroDTO
            {
                Desde = desde,
                Hasta = hasta,
                Tipo = tipo,
                Estado = estado,
                CuentaId = cuentaId
            };

            var result = await _historialBW.ObtenerHistorialPorCuentaAsync(cuentaId, filtro);
            return Ok(result);
        }

        // GET api/historial/extracto/{cuentaId}?anio=2025&mes=11
        [HttpGet("extracto/{cuentaId:guid}")]
        // [Authorize(Roles = "Cliente,Gestor,Administrador")]
        public async Task<IActionResult> GetExtracto(
            Guid cuentaId,
            [FromQuery] int anio,
            [FromQuery] int mes)
        {
            var extracto = await _historialBW.GenerarExtractoMensualAsync(cuentaId, anio, mes);
            return Ok(extracto);
        }
    }
}
