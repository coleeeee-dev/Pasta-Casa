import { act, type ReactElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { Footer } from '../components/Footer'
import { ContactPage } from '../pages/ContactPage'
import { PrivacyPage } from '../pages/PrivacyPage'

const publicConfig = {
  id: 1,
  nombre_negocio: 'Nombre dinámico desde Supabase',
  whatsapp: '+54 9 11 5555 0101',
  cbu: 'CBU-TEST',
  identificacion_fiscal: 'DATO-FISCAL-OCULTO',
  titular: 'Titular de prueba',
  horas_limite_pago: 6,
  updated_at: '2026-08-09T00:00:00Z',
}

vi.mock('../context/BusinessConfigContext', () => ({ useBusinessConfig: () => ({
  config: publicConfig,
  loading: false,
  error: null,
  success: true,
  refreshConfig: vi.fn(),
}) }))

let root: Root
let container: HTMLDivElement
const actEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }

beforeAll(() => { actEnvironment.IS_REACT_ACT_ENVIRONMENT = true })
afterAll(() => { delete actEnvironment.IS_REACT_ACT_ENVIRONMENT })

function render(component: ReactElement) {
  act(() => root.render(<MemoryRouter>{component}</MemoryRouter>))
}

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => { act(() => root.unmount()); container.remove() })

describe('información pública', () => {
  it('incluye el enlace a privacidad en el footer', () => {
    render(<Footer />)
    const link = container.querySelector<HTMLAnchorElement>('a[href="/privacidad"]')
    expect(link?.textContent).toBe('Política de Privacidad')
  })

  it('muestra la información real de contacto, pedidos y entrega gratuita', () => {
    render(<ContactPage />)
    expect(container.textContent).toContain(publicConfig.whatsapp)
    expect(container.querySelector<HTMLAnchorElement>('a[href="mailto:ulises_santy@live.com.ar"]')).not.toBeNull()
    expect(container.textContent).toContain('San Martín 2681')
    expect(container.textContent).toContain('Concepción')
    expect(container.textContent).toContain('Pedidos y entregas')
    expect(container.textContent).toContain('Sábados y domingos')
    expect(container.textContent).toContain('09:00 — 12:00')
    expect(container.textContent).toContain('16:00 — 20:00')
    expect(container.textContent).toContain('Entrega sin costo. La coordinación se realiza por WhatsApp.')
    expect(container.textContent).not.toContain(publicConfig.identificacion_fiscal)
  })

  it('presenta la política vigente con nombre y WhatsApp dinámicos', () => {
    render(<PrivacyPage />)
    expect(container.querySelector('h1')?.textContent).toBe('Política de Privacidad')
    expect(container.textContent).toContain('Última actualización: 9 de agosto de 2026')
    expect(container.textContent).toContain('Versión: 2026-08')
    expect(container.textContent).toContain(publicConfig.nombre_negocio)
    expect(container.textContent).toContain(publicConfig.whatsapp)
    expect(container.textContent).toContain('Almacenamiento y transferencia internacional')
    expect(container.textContent).not.toContain(publicConfig.identificacion_fiscal)
  })
})
