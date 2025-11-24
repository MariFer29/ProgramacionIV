using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BancaOnline.BW.DTOs
{
    public class HistorialFiltroDTO
    {
        public DateTime? Desde { get; set; }
        public DateTime? Hasta { get; set; }
        public int? Tipo { get; set; }
        public int? Estado { get; set; }
        public Guid? CuentaId { get; set; }
    }
}
