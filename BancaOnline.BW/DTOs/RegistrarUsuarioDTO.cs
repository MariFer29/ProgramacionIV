namespace BancaOnline.BW.DTOs
{
    public class RegistrarUsuarioDTO
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string Rol { get; set; }   // Administrador, Gestor, Cliente

        // Solo se usa si el rol = Cliente
        public string? Identificacion { get; set; }
        public string? NombreCompleto { get; set; }
        public string? Telefono { get; set; }
    }
}

