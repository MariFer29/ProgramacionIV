using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BancaOnline.BW.DTOs
{
    public class ExtractoMensualDTO
    {
        public Guid CuentaId { get; set; }
        public string NumeroCuenta { get; set; } = null!;

        public int Anio { get; set; }
        public int Mes { get; set; }

        public decimal SaldoInicial { get; set; }
        public decimal SaldoFinal { get; set; }
        public decimal TotalComisiones { get; set; }

        public List<MovimientoHistorialDTO> Movimientos { get; set; } = new();
    }
}
