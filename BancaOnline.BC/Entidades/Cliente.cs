namespace BancaOnline.BC.Entidades
{
    public class Cliente
    {
        public int Id { get; set; }  // PK
        public string Identificacion { get; set; } // unica
        public string NombreCompleto { get; set; }
        public string Telefono { get; set; }
        public string Correo { get; set; }
        public int? UsuarioId { get; set; } // FK opcional
        public Usuario? Usuario { get; set; } // navegación
    }
}



