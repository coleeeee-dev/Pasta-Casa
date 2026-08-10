import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getPublicBusinessConfig } from '../services/configService'
import type { PublicBusinessConfig } from '../types'

interface BusinessConfigContextValue {
  config: PublicBusinessConfig | null
  loading: boolean
  error: string | null
  success: boolean
  refreshConfig: () => Promise<void>
}

const BusinessConfigContext = createContext<BusinessConfigContextValue | null>(null)

export function BusinessConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PublicBusinessConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  const refreshConfig = useCallback(async () => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setConfig(null)
    setLoading(true)
    setError(null)

    try {
      const nextConfig = await getPublicBusinessConfig(controller.signal)
      if (!controller.signal.aborted) setConfig(nextConfig)
    } catch {
      if (!controller.signal.aborted) {
        setConfig(null)
        setError('No pudimos cargar los datos públicos del negocio. Intentá nuevamente.')
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshConfig()
    return () => controllerRef.current?.abort()
  }, [refreshConfig])

  const value = useMemo<BusinessConfigContextValue>(() => ({
    config,
    loading,
    error,
    success: config !== null && !loading && error === null,
    refreshConfig,
  }), [config, error, loading, refreshConfig])

  return <BusinessConfigContext.Provider value={value}>{children}</BusinessConfigContext.Provider>
}

export function useBusinessConfig() {
  const context = useContext(BusinessConfigContext)
  if (!context) throw new Error('useBusinessConfig debe utilizarse dentro de BusinessConfigProvider')
  return context
}
