using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BancaOnline.BC.Entidades;
using Microsoft.EntityFrameworkCore;


namespace BancaOnline.DA
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<Transferencia> Transferencias => Set<Transferencia>();
        public DbSet<TransferenciaProgramada> TransferenciasProgramadas => Set<TransferenciaProgramada>();
        public DbSet<PagoServicio> PagosServicios => Set<PagoServicio>();
        public DbSet<ProveedorServicio> ProveedoresServicios => Set<ProveedorServicio>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Transferencia>().ToTable("Transferencia");
            modelBuilder.Entity<TransferenciaProgramada>().ToTable("TransferenciaProgramada");
            modelBuilder.Entity<PagoServicio>().ToTable("PagoServicio");
            modelBuilder.Entity<ProveedorServicio>().ToTable("ProveedorServicio");
        }
    }
}
