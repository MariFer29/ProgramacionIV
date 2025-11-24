using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BC.Entidades;

namespace BancaOnline.DA.Interfaces
{
    public interface IAuditoriaRepositorioDA
    {
        Task RegistrarAsync(Auditoria auditoria);
        Task<IEnumerable<Auditoria>> BuscarAsync(
            DateTime? desde,
            DateTime? hasta,
            int? usuarioId,
            string? tipoOperacion);
    }
}
