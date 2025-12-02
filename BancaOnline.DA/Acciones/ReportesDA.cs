using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BC.Entidades;
using BancaOnline.DA.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BancaOnline.DA.Acciones
{
    public class ReportesDA : IReportesDA
    {
        private readonly AppDbContext _context;

        private const int ESTADO_TRANSFERENCIA_EXITOSA = 1;
        private const int ESTADO_PAGOSERVICIO_PAGADO = 1;

        public ReportesDA(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Transferencia>> ObtenerTransferenciasHistorialAsync(
            int? clienteId,
            Guid? cuentaId,
            DateTime? desde,
            DateTime? hasta,
            int? estado)
        {
            var query = _context.Transferencias.AsQueryable();

            if (clienteId.HasValue)
            {
                int cid = clienteId.Value;
                query = query.Where(t =>
                    _context.Accounts.Any(a =>
                        a.Id == t.CuentaOrigenId &&
                        a.ClientId == cid));
            }

            if (cuentaId.HasValue)
            {
                Guid accId = cuentaId.Value;
                query = query.Where(t =>
                    t.CuentaOrigenId == accId ||
                    t.CuentaDestinoId == accId);
            }

            if (desde.HasValue)
                query = query.Where(t => t.FechaCreacion >= desde.Value);

            if (hasta.HasValue)
                query = query.Where(t => t.FechaCreacion <= hasta.Value);

            if (estado.HasValue)
                query = query.Where(t => t.Estado == estado.Value);

            return await query
                .OrderByDescending(t => t.FechaCreacion)
                .ToListAsync();
        }

        public async Task<IEnumerable<PagoServicio>> ObtenerPagosHistorialAsync(
            int? clienteId,
            Guid? cuentaId,
            DateTime? desde,
            DateTime? hasta,
            int? estado)
        {
            var query = _context.PagosServicios.AsQueryable();

            if (clienteId.HasValue)
            {
                int cid = clienteId.Value;
                query = query.Where(p =>
                    _context.Accounts.Any(a =>
                        a.Id == p.CuentaOrigenId &&
                        a.ClientId == cid));
            }

            if (cuentaId.HasValue)
            {
                Guid accId = cuentaId.Value;
                query = query.Where(p => p.CuentaOrigenId == accId);
            }

            if (desde.HasValue)
                query = query.Where(p => p.FechaCreacion >= desde.Value);

            if (hasta.HasValue)
                query = query.Where(p => p.FechaCreacion <= hasta.Value);

            if (estado.HasValue)
                query = query.Where(p => p.Estado == estado.Value);

            return await query
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();
        }

        public async Task<decimal> ObtenerTotalOperacionesAsync(DateTime desde, DateTime hasta)
        {
            var totalTransferencias = await _context.Transferencias
                .Where(t =>
                    t.FechaCreacion >= desde &&
                    t.FechaCreacion <= hasta &&
                    t.Estado == ESTADO_TRANSFERENCIA_EXITOSA)
                .SumAsync(t => t.Monto + t.Comision);

            var totalPagos = await _context.PagosServicios
                .Where(p =>
                    p.FechaCreacion >= desde &&
                    p.FechaCreacion <= hasta &&
                    p.Estado == ESTADO_PAGOSERVICIO_PAGADO)
                .SumAsync(p => p.Monto);

            return totalTransferencias + totalPagos;
        }

        public async Task<IEnumerable<(int ClientId, decimal MontoTotal)>> ObtenerTopClientesAsync(
            DateTime desde,
            DateTime hasta,
            int top)
        {
            var query = await
                (from t in _context.Transferencias
                 join a in _context.Accounts
                     on t.CuentaOrigenId equals a.Id
                 where t.FechaCreacion >= desde
                       && t.FechaCreacion <= hasta
                       && t.Estado == ESTADO_TRANSFERENCIA_EXITOSA
                 group new { t, a } by a.ClientId
                into grp
                 select new
                 {
                     ClientId = grp.Key,
                     MontoTotal = grp.Sum(x => x.t.Monto + x.t.Comision)
                 })
                .OrderByDescending(x => x.MontoTotal)
                .Take(top)
                .ToListAsync();

            return query.Select(x => (x.ClientId, x.MontoTotal));
        }

        public async Task<IEnumerable<(DateTime Dia, decimal MontoTotal)>> ObtenerVolumenDiarioAsync(
            DateTime desde,
            DateTime hasta)
        {
            var query = await _context.Transferencias
                .Where(t =>
                    t.FechaCreacion >= desde &&
                    t.FechaCreacion <= hasta &&
                    t.Estado == ESTADO_TRANSFERENCIA_EXITOSA)
                .GroupBy(t => t.FechaCreacion.Date)
                .Select(g => new
                {
                    Dia = g.Key,
                    MontoTotal = g.Sum(x => x.Monto + x.Comision)
                })
                .OrderBy(x => x.Dia)
                .ToListAsync();

            return query.Select(x => (x.Dia, x.MontoTotal));
        }
    }
}
