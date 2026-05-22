using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TattooStudio.API.Data;
using TattooStudio.API.Models;

namespace TattooStudio.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProductosController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/productos — público
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var productos = await _db.Productos
            .Include(p => p.Tallas)
            .Where(p => p.Activo)
            .OrderByDescending(p => p.CreadoEn)
            .ToListAsync();

        return Ok(productos);
    }

    // GET api/productos/5 — público
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var producto = await _db.Productos
            .Include(p => p.Tallas)
            .FirstOrDefaultAsync(p => p.Id == id && p.Activo);

        if (producto == null)
            return NotFound(new { mensaje = "Producto no encontrado" });

        return Ok(producto);
    }

    // POST api/productos — solo admin
    [Authorize(Roles = "admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProductoRequest request)
    {
        var producto = new Producto
        {
            Nombre = request.Nombre,
            Descripcion = request.Descripcion,
            Precio = request.Precio,
            Stock = request.Stock,
            Categoria = request.Categoria,
            ImagenUrl = request.ImagenUrl,
            Activo = true,
            CreadoEn = DateTime.UtcNow
        };

        _db.Productos.Add(producto);
        await _db.SaveChangesAsync();

        // Añadir tallas si es prenda o accesorio
        if (request.Tallas != null && request.Tallas.Any())
        {
            foreach (var t in request.Tallas)
            {
                _db.ProductoTallas.Add(new ProductoTalla
                {
                    ProductoId = producto.Id,
                    Talla = t.Talla,
                    Stock = t.Stock
                });
            }
            await _db.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetById), new { id = producto.Id }, producto);
    }

    // PUT api/productos/5 — solo admin
    [Authorize(Roles = "admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductoRequest request)
    {
        var producto = await _db.Productos
            .Include(p => p.Tallas)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (producto == null)
            return NotFound(new { mensaje = "Producto no encontrado" });

        producto.Nombre = request.Nombre;
        producto.Descripcion = request.Descripcion;
        producto.Precio = request.Precio;
        producto.Stock = request.Stock;
        producto.Categoria = request.Categoria;
        producto.ImagenUrl = request.ImagenUrl ?? producto.ImagenUrl;

        // Actualizar tallas sin borrar las que tienen pedidos
        if (request.Tallas != null)
        {
            foreach (var tallaRequest in request.Tallas)
            {
                var tallaExistente = producto.Tallas.FirstOrDefault(t => t.Talla == tallaRequest.Talla);
                if (tallaExistente != null)
                {
                    // Actualizar stock de la talla existente
                    tallaExistente.Stock = tallaRequest.Stock;
                }
                else
                {
                    // Añadir talla nueva
                    _db.ProductoTallas.Add(new ProductoTalla
                    {
                        ProductoId = producto.Id,
                        Talla = tallaRequest.Talla,
                        Stock = tallaRequest.Stock
                    });
                }
            }

            // Solo borrar tallas que no tienen pedidos asociados
            var tallasAEliminar = producto.Tallas
                .Where(t => !request.Tallas.Any(r => r.Talla == t.Talla))
                .ToList();

            foreach (var talla in tallasAEliminar)
            {
                var tieneLineas = await _db.LineasPedido.AnyAsync(l => l.ProductoTallaId == talla.Id);
                if (!tieneLineas)
                    _db.ProductoTallas.Remove(talla);
            }
        }

        await _db.SaveChangesAsync();
        return Ok(producto);
    }

    // DELETE api/productos/5 — solo admin (soft delete)
    [Authorize(Roles = "admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var producto = await _db.Productos.FindAsync(id);

        if (producto == null)
            return NotFound(new { mensaje = "Producto no encontrado" });

        producto.Activo = false;
        await _db.SaveChangesAsync();

        return Ok(new { mensaje = "Producto desactivado" });
    }

    // POST api/productos/5/imagen — solo admin
    [Authorize(Roles = "admin")]
    [HttpPost("{id}/imagen")]
    public async Task<IActionResult> UploadImagen(int id, IFormFile archivo)
    {
        var producto = await _db.Productos.FindAsync(id);
        if (producto == null)
            return NotFound(new { mensaje = "Producto no encontrado" });

        if (archivo == null || archivo.Length == 0)
            return BadRequest(new { mensaje = "No se ha enviado ningún archivo" });

        // Validar que sea imagen
        var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
        if (!extensionesPermitidas.Contains(extension))
            return BadRequest(new { mensaje = "Formato no permitido. Usa jpg, png o webp" });

        // Crear carpeta si no existe
        var carpeta = Path.Combine("wwwroot", "imagenes", "productos");
        Directory.CreateDirectory(carpeta);

        // Nombre único para evitar colisiones
        var nombreArchivo = $"producto_{id}_{Guid.NewGuid()}{extension}";
        var rutaCompleta = Path.Combine(carpeta, nombreArchivo);

        // Borrar imagen anterior si existía
        if (!string.IsNullOrEmpty(producto.ImagenUrl))
        {
            var rutaAnterior = Path.Combine("wwwroot", producto.ImagenUrl.TrimStart('/'));
            if (System.IO.File.Exists(rutaAnterior))
                System.IO.File.Delete(rutaAnterior);
        }

        // Guardar archivo
        using (var stream = new FileStream(rutaCompleta, FileMode.Create))
        {
            await archivo.CopyToAsync(stream);
        }

        // Guardar ruta en BD
        producto.ImagenUrl = $"/imagenes/productos/{nombreArchivo}";
        await _db.SaveChangesAsync();

        return Ok(new { imagenUrl = producto.ImagenUrl });
    }
}

// DTOs
public record TallaRequest(string Talla, int Stock);

public record ProductoRequest(
    string Nombre,
    string? Descripcion,
    decimal Precio,
    int Stock,
    string Categoria,
    string? ImagenUrl,
    List<TallaRequest>? Tallas
);