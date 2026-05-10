using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TattooStudio.API.Models;

[Table("pedidos")]
public class Pedido
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("nombre_cliente")]
    public string NombreCliente { get; set; } = string.Empty;

    [Column("email_cliente")]
    public string EmailCliente { get; set; } = string.Empty;

    [Column("direccion")]
    public string Direccion { get; set; } = string.Empty;

    [Column("total")]
    public decimal Total { get; set; }

    [Column("estado")]
    public string Estado { get; set; } = "pendiente";

    [Column("stripe_payment_id")]
    public string? StripePaymentId { get; set; }

    [Column("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    public ICollection<LineaPedido> Lineas { get; set; } = new List<LineaPedido>();
}