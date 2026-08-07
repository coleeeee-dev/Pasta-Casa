import type { CartItem, Product } from '../types'

export interface CartState { items: CartItem[]; notice: string }
export type CartAction =
  | { type: 'ADD'; product: Product; quantity: number }
  | { type: 'SET_QUANTITY'; productId: string; quantity: number }
  | { type: 'REMOVE'; productId: string }
  | { type: 'CLEAR' }
  | { type: 'DISMISS_NOTICE' }

export const initialCartState: CartState = { items: [], notice: '' }

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find((item) => item.product.id === action.product.id)
      const current = existing?.quantity ?? 0
      const requested = current + Math.max(1, action.quantity)
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
export const getCartCount = (items: CartItem[]) => items.reduce((total, item) => total + item.quantity, 0)
