using Microsoft.EntityFrameworkCore;
using TattooStudio.API.Models;

namespace TattooStudio.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<ProductoTalla> ProductoTallas => Set<ProductoTalla>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<LineaPedido> LineasPedido => Set<LineaPedido>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Índice único producto + talla
        modelBuilder.Entity<ProductoTalla>()
            .HasIndex(pt => new { pt.ProductoId, pt.Talla })
            .IsUnique();

        // Enum como string en MySQL
        modelBuilder.Entity<Usuario>()
            .Property(u => u.Rol)
            .HasColumnType("enum('admin')");

        modelBuilder.Entity<Producto>()
            .Property(p => p.Categoria)
            .HasColumnType("enum('prenda','ilustracion','accesorio')");

        modelBuilder.Entity<Pedido>()
            .Property(p => p.Estado)
            .HasColumnType("enum('pendiente','pagado','enviado','cancelado')");

        modelBuilder.Entity<ProductoTalla>()
            .Property(pt => pt.Talla)
            .HasColumnType("enum('XS','S','M','L','XL','XXL')");
    }
}