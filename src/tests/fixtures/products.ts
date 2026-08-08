import type { Product } from '../../types'

// Fixtures exclusivas de pruebas. El catálogo de la aplicación no importa este archivo.
export const products: Product[] = [
  {
    id: '1',
    codigo: 'SOR-JYQ-DOC',
    nombre: 'Sorrentinos de jamón y queso',
    descripcion: 'Relleno cremoso.',
    presentacion: 'Presentación: 1 docena',
    precio: 8800,
    stock: 10,
    imagen: 'https://example.com/sorrentinos-jyq.jpg',
    activo: true,
  },
  {
    id: '2',
    codigo: 'SOR-CAM-DOC',
    nombre: 'Sorrentinos de calabaza y mozzarella',
    descripcion: 'Relleno suave y equilibrado.',
    presentacion: 'Presentación: 1 docena',
    precio: 9000,
    stock: 8,
    imagen: null,
    activo: true,
  },
  {
    id: '3',
    codigo: 'SOR-MRN-DOC',
    nombre: 'Sorrentinos de mozzarella, ricota y nuez',
    descripcion: 'Relleno delicado con nuez.',
    presentacion: 'Presentación: 1 docena',
    precio: 9800,
    stock: 6,
    imagen: null,
    activo: true,
  },
]
