import type { CartItem, CustomerData, Order } from '../types'
import { getCartTotal } from '../context/cartReducer'

export function generateOrderCode(date = new Date(), random = Math.random): string {
  const stamp = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('')
  const suffix = Math.floor(random() * 0x10000).toString(16).toUpperCase().padStart(4, '0')
  return `PED-${stamp}-${suffix}`
}

export function createOrder(customer: CustomerData, items: CartItem[]): Order {
  return {
    code: generateOrderCode(), customer: { ...customer }, items: items.map((item) => ({ ...item })),
    total: getCartTotal(items), createdAt: new Date().toISOString(),
  }
}
