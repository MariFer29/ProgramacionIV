using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BancaOnline.BW.DTOs
{
    public class ReporteTotalesDTO
    {
        public DateTime Desde { get; set; }
        public DateTime Hasta { get; set; }
        public decimal TotalOperaciones { get; set; }
    }
}
