using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System;
using BancaOnline.BC.Enums;

namespace BancaOnline.BW.DTOs
{
    public class FiltroBeneficiariosDTO
    {
        public int? ClientId { get; set; }
        public BeneficiaryStatus? Status { get; set; }
        public string? Bank { get; set; }
        public CurrencyType? Currency { get; set; }
    }
}
