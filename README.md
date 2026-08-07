# Pasta Casa

Primera versión funcional de una tienda web de pastas frescas orientada a clientes de Argentina. Permite explorar tres variedades de sorrentinos vendidos por docena, administrar un carrito persistente y completar un checkout simulado de tres pasos.

## Tecnologías

- React 19, TypeScript y Vite
- React Router
- CSS propio y responsive
- Vitest

## Uso local

```bash
npm install
npm run dev
```

Vite mostrará la dirección local para abrir el sitio en el navegador.

## Pruebas y build

```bash
npm run test
npm run build
```

## Contenido y estructura

Los productos se editan en `src/data/products.ts`. Sus ilustraciones locales están en `public/images`. La lógica del carrito vive en `src/context`, las validaciones y generación de pedidos en `src/utils`, y la simulación del correo en `src/services/emailService.ts`.

## Alcance simulado

El prototipo no envía correos, no hace pagos ni solicitudes HTTP y no utiliza backend ni base de datos. Solo el carrito se guarda en `localStorage`; el nombre, apellido, DNI y correo permanecen en memoria durante el checkout y se descartan al finalizar o recargar.

## Próximas etapas posibles

- Incorporar datos, fotografías y canales reales del emprendimiento.
- Definir logística, zonas y turnos de entrega.
- Agregar un backend seguro para pedidos e inventario.
- Integrar un proveedor de pagos y correo transaccional, luego de definir requisitos legales y de privacidad.
- Sumar pruebas de interfaz y accesibilidad automatizadas.
