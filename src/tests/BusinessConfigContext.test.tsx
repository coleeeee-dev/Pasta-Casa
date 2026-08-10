import { act, type ReactElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { BusinessConfigProvider, useBusinessConfig } from '../context/BusinessConfigContext'

const getPublicBusinessConfig = vi.hoisted(() => vi.fn())
vi.mock('../services/configService', () => ({ getPublicBusinessConfig }))

let root: Root
let container: HTMLDivElement
const actEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }

beforeAll(() => { actEnvironment.IS_REACT_ACT_ENVIRONMENT = true })
afterAll(() => { delete actEnvironment.IS_REACT_ACT_ENVIRONMENT })

function render(component: ReactElement) { act(() => root.render(component)) }
function Consumer() {
  const { config, success } = useBusinessConfig()
  return <span>{success ? config?.nombre_negocio : 'cargando'}</span>
}

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  getPublicBusinessConfig.mockReset()
  getPublicBusinessConfig.mockResolvedValue({
    id: 1,
    nombre_negocio: 'Única consulta',
    whatsapp: '+54 9 11 4000 5000',
    cbu: 'CBU-TEST',
    identificacion_fiscal: 'FISCAL-TEST',
    titular: 'Titular de prueba',
    horas_limite_pago: 4,
    updated_at: '2026-08-09T00:00:00Z',
  })
})

afterEach(() => { act(() => root.unmount()); container.remove(); vi.restoreAllMocks() })

describe('BusinessConfigProvider', () => {
  it('comparte una sola carga entre varios consumidores sin usar localStorage', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem')
    const setItem = vi.spyOn(Storage.prototype, 'setItem')

    await act(async () => render(<BusinessConfigProvider><Consumer /><Consumer /></BusinessConfigProvider>))

    expect(getPublicBusinessConfig).toHaveBeenCalledTimes(1)
    expect(container.textContent).toBe('Única consultaÚnica consulta')
    expect(getItem).not.toHaveBeenCalled()
    expect(setItem).not.toHaveBeenCalled()
  })
})
