using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BancaOnline.BW.DTOs
{
    public class MovimientoHistorialDTO
    {
        public DateTime Fecha { get; set; }
        public string Tipo { get; set; } = null!;

        public Guid? TransferenciaId { get; set; }
        public Guid? PagoServicioId { get; set; }

        public Guid CuentaOrigenId { get; set; }
        public Guid? CuentaDestinoId { get; set; }

        public string? NumeroCuentaOrigen { get; set; }
        public string? NumeroCuentaDestino { get; set; }

        public decimal Monto { get; set; }
        public decimal Comision { get; set; }
        public int Estado { get; set; }

        public string? Descripcion { get; set; }
    }
}
