using System;
using Microsoft.EntityFrameworkCore;
using BancaOnline.BC.Entidades;

namespace BancaOnline.DA
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // -----------------------------
        // Tablas existentes
        // -----------------------------
        public DbSet<Transferencia> Transferencias => Set<Transferencia>();
        public DbSet<TransferenciaProgramada> TransferenciasProgramadas => Set<TransferenciaProgramada>();
        public DbSet<PagoServicio> PagosServicios => Set<PagoServicio>();
        public DbSet<ProveedorServicio> ProveedoresServicios => Set<ProveedorServicio>();

        // -----------------------------
        // Módulo A – Usuarios y Clientes
        // -----------------------------
        public DbSet<Usuario> Usuarios => Set<Usuario>();
        public DbSet<Cliente> Clientes => Set<Cliente>();


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // -----------------------------
            // Tablas existentes
            // -----------------------------
            modelBuilder.Entity<Transferencia>().ToTable("Transferencia");
            modelBuilder.Entity<TransferenciaProgramada>().ToTable("TransferenciaProgramada");
            modelBuilder.Entity<PagoServicio>().ToTable("PagoServicio");
            modelBuilder.Entity<ProveedorServicio>().ToTable("ProveedorServicio");

            // -----------------------------
            // Usuario
            // -----------------------------
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.ToTable("Usuario");

                entity.HasKey(u => u.Id);

                entity.Property(u => u.Email)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.HasIndex(u => u.Email)
                      .IsUnique();  // Email único

                entity.Property(u => u.ContrasenaHash)
                      .IsRequired();

                entity.Property(u => u.Rol)
                      .IsRequired();
            });

            // -----------------------------
            // Cliente
            // -----------------------------
            modelBuilder.Entity<Cliente>(entity =>
            {
                entity.ToTable("Cliente");

                entity.HasKey(c => c.Id);

                entity.Property(c => c.Identificacion)
                      .IsRequired()
                      .HasMaxLength(20);

                entity.HasIndex(c => c.Identificacion)
                      .IsUnique();  // Identificación única

                entity.Property(c => c.NombreCompleto)
                      .IsRequired()
                      .HasMaxLength(150);

                entity.Property(c => c.Telefono)
                      .HasMaxLength(20);

                entity.Property(c => c.Correo)
                      .HasMaxLength(100);

                // Relación 1:1 Cliente → Usuario (opcional)
                entity.HasOne(c => c.Usuario)
                      .WithOne()
                      .HasForeignKey<Cliente>(c => c.UsuarioId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}


