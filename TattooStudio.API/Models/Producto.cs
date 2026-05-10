using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace TattooStudio.API.Models;

[Table("productos")]
public class Producto
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("descripcion")]
    public string? Descripcion { get; set; }

    [Column("precio")]
    public decimal Precio { get; set; }

    [Column("stock")]
    public int Stock { get; set; } = 0;

    [Column("categoria")]
    public string Categoria { get; set; } = string.Empty; // 'prenda' | 'ilustracion' | 'accesorio'

    [Column("imagen_url")]
    public string? ImagenUrl { get; set; }

    [Column("activo")]
    public bool Activo { get; set; } = true;

    [Column("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    public ICollection<ProductoTalla> Tallas { get; set; } = new List<ProductoTalla>();
    [JsonIgnore]
    public ICollection<LineaPedido> LineasPedido { get; set; } = new List<LineaPedido>();
}