# Backend — Tienda Virtual

API REST construida con Node.js, Express y TypeScript.

## Funcionalidades
- Catálogo de productos y categorías.
- CRUD de productos.
- Registro e inicio de sesión de usuarios.
- Carrito por usuario.
- Creación y consulta de pedidos.
- Actualización de estados de pedidos.
- Control de stock.
- CORS y validación de datos con Zod.

## Ejecutar
```bash
cd backend
npm install
npm run dev
```

API: `http://localhost:3001`

### Endpoints principales
- GET /api/health
- GET /api/categories
- GET /api/products
- GET /api/products/:id
- POST/PUT/DELETE /api/products/:id
- POST /api/users
- POST /api/auth/login
- GET/POST /api/cart/:userId
- PUT/DELETE /api/cart/:userId/:productId
- POST/GET /api/orders/:userId
- GET /api/orders
- PATCH /api/orders/:id/status

> La persistencia actual es en memoria para facilitar el arranque. Para producción se recomienda conectar MySQL/PostgreSQL y usar contraseñas con hash + JWT.
