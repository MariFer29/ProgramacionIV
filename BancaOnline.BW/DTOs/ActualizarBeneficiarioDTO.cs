using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System;
using BancaOnline.BC.Enums;

namespace BancaOnline.BW.DTOs
{
    public class ActualizarBeneficiarioDTO
    {
        public Guid Id { get; set; }  

        public string Alias { get; set; } = null!;
        public string Bank { get; set; } = null!;
        public CurrencyType Currency { get; set; }
        public string AccountNumber { get; set; } = null!;
        public string Country { get; set; } = null!;
        public BeneficiaryStatus Status { get; set; }
    }
}
