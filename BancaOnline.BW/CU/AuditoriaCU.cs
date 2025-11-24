using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BancaOnline.BC.Entidades;
using BancaOnline.BW.Interfaces;
using BancaOnline.DA.Interfaces;

namespace BancaOnline.BW.CU
{
    public class AuditoriaCU : IAuditoriaBW
    {
        private readonly IAuditoriaRepositorioDA _auditoriaDA;

        public AuditoriaCU(IAuditoriaRepositorioDA auditoriaDA)
        {
            _auditoriaDA = auditoriaDA;
        }

        public Task RegistrarAsync(Auditoria auditoria)
        {
            if (auditoria == null) throw new ArgumentNullException(nameof(auditoria));
            return _auditoriaDA.RegistrarAsync(auditoria);
        }

        public Task<IEnumerable<Auditoria>> BuscarAsync(
            DateTime? desde,
            DateTime? hasta,
            int? usuarioId,
            string? tipoOperacion)
        {
            return _auditoriaDA.BuscarAsync(desde, hasta, usuarioId, tipoOperacion);
        }
    }
}
