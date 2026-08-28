# Frontend — Tienda Virtual

Frontend en React + Vite conectado al backend de `../backend`.

## Ejecutar

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Configuración

Puedes copiar `.env.example` como `.env` si el backend no está en `http://localhost:3001/api`.

## Flujo
1. Consulta el catálogo desde `GET /api/products`.
2. Regístrate o inicia sesión.
3. Agrega productos al carrito.
4. Modifica cantidades o elimina productos.
5. Realiza el pedido.
6. Consulta tus pedidos desde **Mis pedidos**.

El frontend utiliza directamente los endpoints creados en el backend.
