import { describe, expect, it } from 'vitest'
import { mapProductoRow } from '../services/productService'

describe('servicio de productos', () => {
  it('adapta stock_docenas al formato que usa el catálogo y el carrito', () => {
    const product = mapProductoRow({
      id: 12,
      codigo: 'SOR-001',
      nombre: 'Sorrentinos de prueba',
      descripcion: null,
      precio: '12500.50',
      stock_docenas: 7,
      imagen_url: ' https://example.com/producto.jpg ',
      activo: true,
    })

    expect(product).toEqual({
      id: '12',
      codigo: 'SOR-001',
      nombre: 'Sorrentinos de prueba',
      descripcion: '',
      presentacion: 'Presentación: 1 docena',
      precio: 12500.5,
      stock: 7,
      imagen: 'https://example.com/producto.jpg',
      activo: true,
    })
  })

  it('normaliza stock negativo a cero', () => {
    const product = mapProductoRow({ id: 13, codigo: 'SOR-002', nombre: 'Sin stock', descripcion: '', precio: 1000, stock_docenas: -2, imagen_url: null, activo: true })
    expect(product.stock).toBe(0)
  })
})
