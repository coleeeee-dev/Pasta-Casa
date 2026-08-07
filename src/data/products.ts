import type { Product } from '../types'

export const products: Product[] = [
  {
    id: 'sorrentinos-jyq', codigo: 'SOR-JYQ-DOC', nombre: 'Sorrentinos', variante: 'Jamón y queso',
    descripcion: 'Generosos, cremosos y pensados para acompañar con una salsa bien simple.', presentacion: 'Presentación: 1 docena',
    precio: 8800, stock: 10, imagen: '/images/sorrentinos-jyq.svg', activo: true,
  },
  {
    id: 'sorrentinos-calabaza-mozzarella', codigo: 'SOR-CAM-DOC', nombre: 'Sorrentinos', variante: 'Calabaza y mozzarella',
    descripcion: 'Un relleno suave y equilibrado que combina dulzura y cremosidad.', presentacion: 'Presentación: 1 docena',
    precio: 9000, stock: 8, imagen: '/images/sorrentinos-calabaza.svg', activo: true,
  },
  {
    id: 'sorrentinos-mozzarella-ricota-nuez', codigo: 'SOR-MRN-DOC', nombre: 'Sorrentinos', variante: 'Mozzarella, ricota y nuez',
    descripcion: 'Cremosos, delicados y con el toque crocante de la nuez.', presentacion: 'Presentación: 1 docena',
    precio: 9800, stock: 6, imagen: '/images/sorrentinos-nuez.svg', activo: true,
  },
]

// IMPORTANTE: los precios y el stock son valores temporales del prototipo.
// Reemplazarlos aquí cuando el negocio defina sus valores reales por docena.
