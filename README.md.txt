# 🌿 Aguja Verde Tattoo Studio

Plataforma de e-commerce desarrollada a medida para un estudio de tatuajes ubicado en Alcoy (Alicante). Permite gestionar y vender merchandising y productos relacionados con la cultura del tatuaje, con panel de administración, autenticación JWT y pasarela de pago integrada con Stripe.

> *«Arte permanente. Cada pieza, única.»*

---

## ✨ ¿Qué incluye?

- **Tienda online** con catálogo filtrable por categoría, selector de talla y stock en tiempo real
- **Carrito de compra** persistente en sesión (sin necesidad de login)
- **Checkout seguro** mediante Stripe Checkout con confirmación por webhook
- **Autenticación JWT** con registro, login y roles (cliente / admin)
- **Panel de administración** con CRUD de productos, subida de imágenes y gestión de pedidos
- **Historial de pedidos** para clientes autenticados con estado actualizado
- **API REST documentada** con Swagger UI en `/swagger`

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Backend | ASP.NET Core 9 (API REST) |
| Base de datos | MySQL 8 + Entity Framework Core (Pomelo) |
| Autenticación | JWT + BCrypt |
| Pagos | Stripe Checkout + Webhooks |
| Despliegue | Docker + Coolify + Hetzner VPS |

---

## 📁 Estructura del repositorio

```
/
├── TattooStudio.API/       # Backend ASP.NET Core
│   ├── Controllers/        # AuthController, ProductosController, PedidosController...
│   ├── Models/             # Entidades EF Core
│   ├── Data/               # AppDbContext
│   └── Program.cs
├── tattoo-frontend/        # Frontend React
│   ├── src/
│   │   ├── pages/          # Home, Tienda, Pedidos, Perfil, Admin
│   │   ├── components/     # Nav, CartDrawer, LoginModal, ProductCard...
│   │   ├── context/        # AppContext (estado global)
│   │   └── api/            # Módulos de llamadas a la API
│   └── vite.config.js
└── Dockerfile              # Build multi-stage (frontend + backend)
```

---

## 🚀 Puesta en marcha local

### Requisitos previos

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9)
- [Node.js 20+](https://nodejs.org/)
- MySQL 8 corriendo en local (recomendado: `127.0.0.1`, no `localhost`)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Juuzou-shyny/Aguja-Verde-Studio.git
cd Aguja-Verde-Studio
```

### 2. Configurar variables de entorno del backend

Crea un archivo `appsettings.Development.json` dentro de `TattooStudio.API/` (o usa variables de entorno) con el siguiente contenido:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=127.0.0.1;Database=tattoo_db;User=tu_usuario;Password=tu_password;"
  },
  "Jwt": {
    "Key": "tu_clave_secreta_muy_larga",
    "Issuer": "TattooStudio",
    "Audience": "TattooStudioClients"
  },
  "Stripe": {
    "SecretKey": "sk_test_...",
    "WebhookSecret": "whsec_..."
  }
}
```

### 3. Aplicar migraciones y crear la base de datos

```bash
cd TattooStudio.API
dotnet ef database update
```

### 4. Arrancar el backend

```bash
# Desde TattooStudio.API/
dotnet run
```

El backend quedará escuchando en `http://localhost:5087`.  
Swagger disponible en `http://localhost:5087/swagger`.

### 5. Arrancar el frontend

```bash
# Desde tattoo-frontend/
npm install
npm run dev
```

La app estará disponible en `http://localhost:5173`.

> El proxy de Vite redirige automáticamente `/api` e `/imagenes` al backend en el puerto 5087.

---

##  Despliegue con Docker

El proyecto incluye un Dockerfile multi-stage en la raíz que compila el frontend y el backend en una sola imagen:

```bash
docker build -t aguja-verde .
docker run -p 8080:8080 --env-file .env aguja-verde
```

En producción se usa **Coolify** como plataforma de despliegue sobre un VPS Hetzner, con certificado HTTPS automático vía Let's Encrypt. Cada push a `main` desencadena un redeploy automático.

---

##  Modelo de datos

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Registro de usuarios con rol `admin` o `cliente` |
| `productos` | Catálogo con soft delete via campo `activo` |
| `producto_tallas` | Stock por talla para productos de ropa |
| `pedidos` | Estados: `pendiente` → `pagado` → `enviado` → `entregado` |
| `lineas_pedido` | Detalle de productos por pedido |

---

##  Seguridad

- Contraseñas cifradas con **BCrypt** (factor de coste 10)
- Tokens **JWT** stateless con expiración configurable
- Endpoints de admin protegidos con `[Authorize(Roles = "admin")]`
- **CORS** restringido al origen del frontend
- Datos sensibles en variables de entorno, nunca en el código fuente

---

##  Autora

**Sheila Reche Lloret** — 2º DAW Semi-presencial · Curso 2025-2026

[github.com/Juuzou-shyny](https://github.com/Juuzou-shyny)
