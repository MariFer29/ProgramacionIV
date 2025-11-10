using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BancaOnline.BC.Entidades
{
    public class Transferencia
    {
        public Guid Id { get; set; }
        public Guid CuentaOrigenId { get; set; }
        public Guid CuentaDestinoId { get; set; }
        public Guid? TerceroId { get; set; }
        public string Moneda { get; set; } = "CRC";
        public decimal Monto { get; set; }
        public decimal Comision { get; set; }
        public DateTime FechaCreacion { get; set; }
        public int Estado { get; set; }
        public string? IdempotencyKey { get; set; }
        public string? RazonFalla { get; set; }
    }
}
