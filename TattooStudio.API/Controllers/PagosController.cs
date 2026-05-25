using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;
using System.Security.Claims;
using TattooStudio.API.Data;

namespace TattooStudio.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PagosController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public PagosController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    // POST api/pagos/crear-sesion — crea sesión de pago en Stripe
    [Authorize]
    [HttpPost("crear-sesion")]
    public async Task<IActionResult> CrearSesion([FromBody] SesionPagoRequest request)
    {
        var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value;
        var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.Email == emailClaim);
        if (usuario == null) return Unauthorized();

        // Construir los line items para Stripe
        var lineItems = new List<SessionLineItemOptions>();

        foreach (var linea in request.Lineas)
        {
            var producto = await _db.Productos.FindAsync(linea.ProductoId);
            if (producto == null || !producto.Activo)
                return BadRequest(new { mensaje = $"Producto {linea.ProductoId} no encontrado" });

            lineItems.Add(new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "eur",
                    UnitAmount = (long)(producto.Precio * 100), // Stripe usa céntimos
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = producto.Nombre,
                        Images = producto.ImagenUrl != null
                            ? new List<string> { $"http://dd778m1o5ady2mlcnncvjctm.178.105.206.238.sslip.io{producto.ImagenUrl}" }
                            : null
                    }
                },
                Quantity = linea.Cantidad
            });
        }

        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = lineItems,
            Mode = "payment",
            SuccessUrl = "http://dd778m1o5ady2mlcnncvjctm.178.105.206.238.sslip.io/pago-exitoso?session_id={CHECKOUT_SESSION_ID}",
            CancelUrl = "http://dd778m1o5ady2mlcnncvjctm.178.105.206.238.sslip.io/pago-cancelado",
            CustomerEmail = usuario.Email,
            Metadata = new Dictionary<string, string>
            {
                { "usuarioId",  usuario.Id.ToString() },
                { "direccion",  request.Direccion },
                { "telefono",   request.Telefono }
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options);

        return Ok(new { sessionUrl = session.Url, sessionId = session.Id });
    }

    // POST api/pagos/webhook — Stripe llama aquí al completar el pago
    [HttpPost("webhook")]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> Webhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var webhookSecret = _config["Stripe:WebhookSecret"];

        Event stripeEvent;
        try
        {
            if (string.IsNullOrEmpty(webhookSecret))
            {
                stripeEvent = EventUtility.ParseEvent(json);
            }
            else
            {
                stripeEvent = EventUtility.ConstructEvent(
                    json,
                    Request.Headers["Stripe-Signature"],
                    webhookSecret,
                    throwOnApiVersionMismatch: false
                );
            }
        }
        catch (Exception e)
        {
            Console.WriteLine($"Webhook error: {e.Message}");
            return BadRequest(new { mensaje = e.Message });
        }

        if (stripeEvent.Type == "checkout.session.completed")
        {
            var session = stripeEvent.Data.Object as Session;
            if (session == null) return Ok();

            var usuarioId = int.Parse(session.Metadata["usuarioId"]);
            var usuario = await _db.Usuarios.FindAsync(usuarioId);
            if (usuario == null) return Ok();

            var lineItemService = new SessionLineItemService();
            var stripeLineas = await lineItemService.ListAsync(session.Id);

            var lineas = new List<TattooStudio.API.Models.LineaPedido>();
            foreach (var item in stripeLineas)
            {
                var producto = await _db.Productos
                    .FirstOrDefaultAsync(p => p.Nombre == item.Description);
                if (producto == null) continue;

                lineas.Add(new TattooStudio.API.Models.LineaPedido
                {
                    ProductoId = producto.Id,
                    Cantidad = (int)item.Quantity,
                    PrecioUnitario = item.Price?.UnitAmount != null
                        ? item.Price.UnitAmount.Value / 100m
                        : producto.Precio
                });
            }

            var pedido = new TattooStudio.API.Models.Pedido
            {
                UsuarioId = usuarioId,
                NombreCliente = usuario.Nombre,
                EmailCliente = usuario.Email,
                Direccion = session.Metadata.GetValueOrDefault("direccion", ""),
                Telefono = session.Metadata.GetValueOrDefault("telefono", ""),
                Total = session.AmountTotal.HasValue ? session.AmountTotal.Value / 100m : 0,
                Estado = "pagado",
                StripePaymentId = session.PaymentIntentId,
                CreadoEn = DateTime.UtcNow,
                Lineas = lineas
            };

            _db.Pedidos.Add(pedido);
            await _db.SaveChangesAsync();
        }

        return Ok();
    }

    // DTOs
    public record LineaSesionRequest(int ProductoId, int Cantidad);
    public record SesionPagoRequest(
        string Direccion,
        string Telefono,
        List<LineaSesionRequest> Lineas
    );
}