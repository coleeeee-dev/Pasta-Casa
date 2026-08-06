import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { Product } from '../types'
import { cartReducer, getCartCount, getCartTotal, initialCartState, type CartState } from './cartReducer'

const STORAGE_KEY = 'pasta-casa-cart'

interface CartContextValue extends CartState {
  total: number; count: number
  addItem: (product: Product, quantity: number) => void
  setQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  dismissNotice: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function restoreCart(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const items = raw ? JSON.parse(raw) : []
    return Array.isArray(items) ? { items, notice: '' } : initialCartState
  } catch { return initialCartState }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState, restoreCart)
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items)) }, [state.items])
  const value = useMemo<CartContextValue>(() => ({
    ...state, total: getCartTotal(state.items), count: getCartCount(state.items),
    addItem: (product, quantity) => dispatch({ type: 'ADD', product, quantity }),
    setQuantity: (productId, quantity) => dispatch({ type: 'SET_QUANTITY', productId, quantity }),
    removeItem: (productId) => dispatch({ type: 'REMOVE', productId }),
    clearCart: () => dispatch({ type: 'CLEAR' }),
    dismissNotice: () => dispatch({ type: 'DISMISS_NOTICE' }),
  }), [state])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe utilizarse dentro de CartProvider')
  return context
}
