using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TattooStudio.API.Models;

[Table("lineas_pedido")]
public class LineaPedido
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("pedido_id")]
    public int PedidoId { get; set; }

    [Column("producto_id")]
    public int ProductoId { get; set; }

    [Column("producto_talla_id")]
    public int? ProductoTallaId { get; set; }

    [Column("cantidad")]
    public int Cantidad { get; set; }

    [Column("precio_unitario")]
    public decimal PrecioUnitario { get; set; }

    // Navegación
    public Pedido Pedido { get; set; } = null!;
    public Producto Producto { get; set; } = null!;
    public ProductoTalla? ProductoTalla { get; set; }
}