import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getActiveProducts } from '../services/productService'
import type { Product } from '../types'

interface ProductContextValue {
  products: Product[]
  loading: boolean
  error: string | null
  reloadProducts: () => void
}

const ProductContext = createContext<ProductContextValue | null>(null)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  const loadProducts = useCallback(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setLoading(true)
    setError(null)

    void getActiveProducts(controller.signal)
      .then((nextProducts) => {
        if (!controller.signal.aborted) setProducts(nextProducts)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setProducts([])
          setError('No pudimos cargar el catálogo. Intentá nuevamente en unos instantes.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
  }, [])

  useEffect(() => {
    loadProducts()
    return () => controllerRef.current?.abort()
  }, [loadProducts])

  const value = useMemo(() => ({ products, loading, error, reloadProducts: loadProducts }), [products, loading, error, loadProducts])
  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (!context) throw new Error('useProducts debe utilizarse dentro de ProductProvider')
  return context
}
