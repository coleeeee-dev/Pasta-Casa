import type { CartItem, Product } from '../types'

export const MAX_ORDER_DOZENS = 10
export const CART_LIMIT_MESSAGE = 'Puedes agregar un máximo de 10 docenas por pedido.'

export interface CartState { items: CartItem[]; notice: string }
export type CartAction =
  | { type: 'ADD'; product: Product; quantity: number }
  | { type: 'HYDRATE'; items: CartItem[] }
  | { type: 'SYNC_PRODUCTS'; products: Product[] }
  | { type: 'SET_QUANTITY'; productId: string; quantity: number }
  | { type: 'REMOVE'; productId: string }
  | { type: 'CLEAR' }
  | { type: 'DISMISS_NOTICE' }

export const initialCartState: CartState = { items: [], notice: '' }

export const getCartCount = (items: CartItem[]) => items.reduce((total, item) => total + item.quantity, 0)

export function getMaxProductQuantity(items: CartItem[], product: Product): number {
  const otherProductsCount = items.reduce(
    (total, item) => item.product.id === product.id ? total : total + item.quantity,
    0,
  )
  return Math.max(0, Math.min(product.stock, MAX_ORDER_DOZENS - otherProductsCount))
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE': return { items: action.items, notice: '' }
    case 'SYNC_PRODUCTS': {
      const productsById = new Map(action.products.map((product) => [product.id, product]))
      let adjusted = false
      const items = state.items.flatMap((item) => {
        const product = productsById.get(item.product.id)
        if (!product || !product.activo || product.stock < 1) {
          adjusted = true
          return []
        }

        const quantity = Math.min(item.quantity, product.stock)
        if (quantity !== item.quantity) adjusted = true
        return [{ product, quantity }]
      })

      return {
        items,
        notice: adjusted ? 'Actualizamos tu carrito según el stock disponible.' : state.notice,
      }
    }
    case 'ADD': {
      if (action.product.stock <= 0) {
        return { ...state, notice: 'Este producto no tiene stock disponible.' }
      }
      const existing = state.items.find((item) => item.product.id === action.product.id)
      const current = existing?.quantity ?? 0
      const requested = current + Math.max(1, action.quantity)
      if (getCartCount(state.items) + Math.max(1, action.quantity) > MAX_ORDER_DOZENS) {
        return { ...state, notice: CART_LIMIT_MESSAGE }
      }
      const quantity = Math.min(requested, action.product.stock)
      const notice = requested > action.product.stock ? `Solo hay ${action.product.stock} ${action.product.stock === 1 ? 'docena disponible' : 'docenas disponibles'}.` : ''
      const items = existing
        ? state.items.map((item) => item.product.id === action.product.id ? { ...item, quantity } : item)
        : [...state.items, { product: action.product, quantity }]
      return { items, notice }
    }
    case 'SET_QUANTITY': {
      const target = state.items.find((item) => item.product.id === action.productId)
      if (!target) return state
      if (action.quantity <= 0) return { items: state.items.filter((item) => item.product.id !== action.productId), notice: '' }
      const otherProductsCount = state.items.reduce(
        (total, item) => item.product.id === action.productId ? total : total + item.quantity,
        0,
      )
      if (otherProductsCount + action.quantity > MAX_ORDER_DOZENS) {
        return { ...state, notice: CART_LIMIT_MESSAGE }
      }
      const quantity = Math.min(action.quantity, target.product.stock)
      return {
        items: state.items.map((item) => item.product.id === action.productId ? { ...item, quantity } : item),
        notice: action.quantity > target.product.stock ? `No podés superar el stock de ${target.product.stock} ${target.product.stock === 1 ? 'docena' : 'docenas'}.` : '',
      }
    }
    case 'REMOVE': return { items: state.items.filter((item) => item.product.id !== action.productId), notice: '' }
    case 'CLEAR': return initialCartState
    case 'DISMISS_NOTICE': return { ...state, notice: '' }
  }
}

export const getItemSubtotal = (item: CartItem) => item.product.precio * item.quantity
export const getCartTotal = (items: CartItem[]) => items.reduce((total, item) => total + getItemSubtotal(item), 0)
