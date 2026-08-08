import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import type { Product } from '../types'
import { cartReducer, getCartCount, getCartTotal, initialCartState, type CartState } from './cartReducer'
import { useProducts } from './ProductContext'

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

function restoreCart(products: Product[]): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const storedItems = raw ? JSON.parse(raw) : []
    if (!Array.isArray(storedItems)) return initialCartState
    const items = storedItems.flatMap((item) => {
      const product = products.find((candidate) => candidate.id === item?.product?.id && candidate.activo)
      if (!product || product.stock < 1 || !Number.isFinite(item?.quantity) || item.quantity < 1) return []
      return [{ product, quantity: Math.min(Math.floor(item.quantity), product.stock) }]
    })
    return { items, notice: '' }
  } catch { return initialCartState }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { products, loading, error } = useProducts()
  const [state, dispatch] = useReducer(cartReducer, initialCartState)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (hydrated || loading || error) return
    dispatch({ type: 'HYDRATE', items: restoreCart(products).items })
    setHydrated(true)
  }, [products, loading, error, hydrated])

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
  }, [state.items, hydrated])
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
