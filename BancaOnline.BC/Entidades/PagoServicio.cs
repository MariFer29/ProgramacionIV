using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BancaOnline.BC.Entidades
{
    public class PagoServicio
    {
        public Guid Id { get; set; }
        public Guid ProveedorId { get; set; }
        public Guid CuentaOrigenId { get; set; }
        public string NumeroContrato { get; set; } = default!;
        public string Moneda { get; set; } = "CRC";
        public decimal Monto { get; set; }
        public DateTime Fecha { get; set; }
        public bool Exitoso { get; set; }
        public string? RazonFalla { get; set; }
    }
}
