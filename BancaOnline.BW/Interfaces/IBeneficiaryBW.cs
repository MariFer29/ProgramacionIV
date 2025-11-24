using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BancaOnline.BW.DTOs;

namespace BancaOnline.BW.Interfaces
{
    public interface IBeneficiaryBW
    {
        Task<BeneficiarioDTO> RegistrarAsync(RegistrarBeneficiarioDTO request);
        Task<BeneficiarioDTO?> ActualizarAsync(ActualizarBeneficiarioDTO request);
        Task<bool> EliminarAsync(Guid id);
        Task<bool> ConfirmarAsync(Guid id);
        Task<IReadOnlyList<BeneficiarioDTO>> ConsultarAsync(FiltroBeneficiariosDTO filtro);
    }
}
