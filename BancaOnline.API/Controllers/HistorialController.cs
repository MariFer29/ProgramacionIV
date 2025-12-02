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
            DateTime? desdeNorm = null;
            DateTime? hastaNorm = null;

            if (desde.HasValue)
                desdeNorm = desde.Value.Date; 

            if (hasta.HasValue)
                hastaNorm = hasta.Value.Date.AddDays(1).AddTicks(-1); 

            var filtro = new HistorialFiltroDTO
            {
                Desde = desdeNorm,
                Hasta = hastaNorm,
                Tipo = tipo,
                Estado = estado,
                CuentaId = cuentaId
            };

            var result = await _historialBW.ObtenerHistorialPorClienteAsync(clienteId, filtro);
            return Ok(result);
        }

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
