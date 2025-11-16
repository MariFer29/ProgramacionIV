using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BC.Entidades;

namespace BancaOnline.BW.Interfaces
{
    public interface ITransferenciaProgramadaBW
    {
        Task<List<TransferenciaProgramada>> ObtenerTransferenciasProgramadasAsync();
        Task CrearTransferenciaProgramadaAsync(TransferenciaProgramada tp);
        Task CancelarTransferenciaProgramadaAsync(Guid id);

    }
}