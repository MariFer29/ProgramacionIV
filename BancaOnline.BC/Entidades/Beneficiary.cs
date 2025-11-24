using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using BancaOnline.BC.Enums;

namespace BancaOnline.BC.Entities
{
    public class Beneficiary
    {
        public Guid Id { get; set; }

        // dueño del beneficiario (cliente)
        public int ClientId { get; set; }

        public string Alias { get; set; } = null!;
        public string Bank { get; set; } = null!;
        public CurrencyType Currency { get; set; }
        public string AccountNumber { get; set; } = null!;
        public string Country { get; set; } = null!;

        public BeneficiaryStatus Status { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
