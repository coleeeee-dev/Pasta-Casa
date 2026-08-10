# Pasta Casa

Tienda web de pastas frescas para clientes de Argentina. El catálogo se obtiene desde la tabla `public.productos` de Supabase y permite administrar un carrito persistente y completar un checkout simulado de tres pasos.

## Tecnologías

- React 18, TypeScript y Vite
- Supabase (`@supabase/supabase-js`)
- React Router
- CSS propio y responsive
- Vitest

## Configuración local

1. Instalá las dependencias:

   ```bash
   npm install
   ```

2. Creá un archivo `.env.local` en la raíz del proyecto:

   ```dotenv
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anon
   ```

   `VITE_SUPABASE_URL` debe ser la URL base del proyecto, sin `/rest/v1`. Usá únicamente la clave pública `anon`/publishable. Nunca agregues una `service_role`, Secret key u otra credencial privada al frontend. Los archivos `*.local` están ignorados por Git.

3. Iniciá Vite:

   ```bash
   npm run dev
   ```

## Catálogo en Supabase

La aplicación consulta `public.productos`, filtra por `activo = true` y ordena por `id` ascendente. `stock_docenas` representa la cantidad de docenas disponibles y limita tanto el selector del catálogo como las cantidades del carrito.

El rol público usado por la clave `anon` debe tener permiso de lectura sobre la tabla y, si RLS está habilitado, una política `SELECT` adecuada. El frontend no crea ni modifica productos, pedidos o detalles de pedido, y no implementa autenticación.

## Netlify

El build y los redirects para SPA permanecen configurados en `netlify.toml`. En **Site configuration → Environment variables** configurá también:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Después de crear o cambiar esas variables, ejecutá un nuevo deploy para que Vite las incorpore al build.

## Pruebas y build

```bash
npm test
npm run build
```

## Estructura relevante

- `src/lib/supabase.ts`: cliente público y reutilizable de Supabase.
- `src/services/productService.ts`: lectura y adaptación de productos activos.
- `src/services/configService.ts`: lectura de la fila pública `configuracion_publica` con `id = 1`.
- `src/services/orderService.ts`: creación de pedidos mediante la función RPC `crear_pedido_v5`.
- `src/context/ProductContext.tsx`: estados de carga, error y catálogo.
- `src/context/BusinessConfigContext.tsx`: carga centralizada y reintento de los datos públicos del negocio.
- `src/context/CartContext.tsx`: carrito persistente, revalidado con el stock recibido de Supabase.
- `src/tests/fixtures/products.ts`: datos aislados usados solo por las pruebas; no alimentan el catálogo.

El checkout solicita nombre, apellido, celular, método de pago y el consentimiento expreso para la transferencia internacional de los datos. Registra el pedido mediante `crear_pedido_v5`; el backend calcula precios y totales, valida y reserva el stock, y devuelve el estado del pedido. El frontend no actualiza stock ni inserta directamente en `pedidos` o `detalle_pedido`. Después de crear el pedido, vuelve a consultar el catálogo para reflejar las existencias disponibles.
