import type { Product } from '../types'

export function formatDozens(quantity: number): string {
  return `${quantity} ${quantity === 1 ? 'docena' : 'docenas'}`
}

export function formatFullProductName(product: Product): string {
  return product.nombre
}
