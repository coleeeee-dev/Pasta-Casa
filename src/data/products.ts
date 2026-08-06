import type { Product } from '../types'

export const products: Product[] = [
  {
    id: 'ravioles-pollo', codigo: 'RAV-POL-500', nombre: 'Ravioles', variante: 'Pollo',
    descripcion: 'Masa suave al huevo con un relleno sabroso y delicado.', presentacion: 'Caja de 500 g',
    precio: 7600, stock: 12, imagen: '/images/ravioles-pollo.svg', activo: true,
  },
  {
    id: 'ravioles-carne', codigo: 'RAV-CAR-500', nombre: 'Ravioles', variante: 'Carne',
    descripcion: 'Un clásico de mesa familiar, con relleno cocido lentamente.', presentacion: 'Caja de 500 g',
    precio: 7900, stock: 8, imagen: '/images/ravioles-carne.svg', activo: true,
  },
  {
    id: 'sorrentinos-jyq', codigo: 'SOR-JYQ-500', nombre: 'Sorrentinos', variante: 'Jamón y queso',
    descripcion: 'Generosos, cremosos y pensados para una salsa bien simple.', presentacion: 'Caja de 500 g',
    precio: 8800, stock: 10, imagen: '/images/sorrentinos-jyq.svg', activo: true,
  },
  {
    id: 'sorrentinos-espinaca', codigo: 'SOR-ERI-500', nombre: 'Sorrentinos', variante: 'Espinaca y ricota',
    descripcion: 'Relleno fresco y equilibrado con un toque de nuez moscada.', presentacion: 'Caja de 500 g',
    precio: 8500, stock: 6, imagen: '/images/sorrentinos-espinaca.svg', activo: true,
  },
  {
    id: 'tallarines', codigo: 'TAL-FRE-500', nombre: 'Tallarines frescos', variante: 'Al huevo',
    descripcion: 'Cintas finas, porosas y listas para abrazar tu salsa favorita.', presentacion: 'Nido de 500 g',
    precio: 5900, stock: 15, imagen: '/images/tallarines.svg', activo: true,
  },
  {
    id: 'noquis', codigo: 'NOQ-PAP-500', nombre: 'Ñoquis de papa', variante: 'Receta tradicional',
    descripcion: 'Tiernos y livianos, elaborados con papa seleccionada.', presentacion: 'Bandeja de 500 g',
    precio: 6200, stock: 9, imagen: '/images/noquis.svg', activo: true,
  },
]
