using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System;
using BancaOnline.BC.Enums;

namespace BancaOnline.BW.DTOs
{
    public class FiltroCuentasDTO
    {
        public int? ClientId { get; set; }
        public AccountType? Type { get; set; }
        public CurrencyType? Currency { get; set; }
        public AccountStatus? Status { get; set; }
    }
}
