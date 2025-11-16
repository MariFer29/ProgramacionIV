using System;

namespace BancaOnline.BC.Entidades
{
    public class Usuario
    {
        public int Id { get; set; }   // PK
        public string Email { get; set; }
        public string ContrasenaHash { get; set; }
        public string Rol { get; set; } // Administrador, Gestor, Cliente
        public int IntentosFallidos { get; set; } = 0;
        public DateTime? FechaBloqueoHasta { get; set; }
        public Cliente? Cliente { get; set; } // navegación 1:1
    }
}

