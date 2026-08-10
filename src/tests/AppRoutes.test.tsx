import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

vi.mock('../components/Header', () => ({ Header: ({ onCartOpen }: { onCartOpen: () => void }) => <button onClick={onCartOpen}>Abrir carrito</button> }))
vi.mock('../components/Footer', () => ({ Footer: () => null }))
vi.mock('../components/CartDrawer', () => ({ CartDrawer: ({ open, onExploreCatalog }: { open: boolean; onExploreCatalog: () => void }) => open ? <aside><button onClick={onExploreCatalog}>Explorar el catálogo</button></aside> : null }))
vi.mock('../components/CheckoutModal', () => ({ CheckoutModal: () => null }))
vi.mock('../pages/HomePage', () => ({ HomePage: () => <main><section id="catalogo"><h2>Nuestros sorrentinos</h2></section></main> }))
vi.mock('../pages/AboutPage', () => ({ AboutPage: () => <main>Quiénes somos</main> }))
vi.mock('../pages/ContactPage', () => ({ ContactPage: () => <main>Contacto</main> }))
vi.mock('../context/BusinessConfigContext', () => ({ useBusinessConfig: () => ({
  config: { nombre_negocio: 'Tienda de prueba', whatsapp: '+54 9 11 5555 0101' },
  loading: false,
  error: null,
  success: true,
  refreshConfig: vi.fn(),
}) }))

let root: Root
let container: HTMLDivElement
const actEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
const scrollIntoView = vi.fn()

function LocationProbe() {
  const location = useLocation()
  return <output data-location>{location.pathname}{location.hash}</output>
}

beforeAll(() => { actEnvironment.IS_REACT_ACT_ENVIRONMENT = true })
afterAll(() => { delete actEnvironment.IS_REACT_ACT_ENVIRONMENT })

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  scrollIntoView.mockReset()
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView })
  Object.defineProperty(window, 'requestAnimationFrame', { configurable: true, value: (callback: FrameRequestCallback) => { callback(0); return 1 } })
})

afterEach(() => { act(() => root.unmount()); container.remove() })

describe('rutas públicas', () => {
  it('expone la Política de Privacidad en /privacidad', () => {
    act(() => root.render(<MemoryRouter initialEntries={['/privacidad']}><App /></MemoryRouter>))
    expect(container.querySelector('h1')?.textContent).toBe('Política de Privacidad')
    expect(container.textContent).toContain('Versión: 2026-08')
  })

  it.each(['/', '/quienes-somos', '/contacto', '/privacidad', '/ruta-publica'])('desde %s cierra el carrito, navega a Inicio y muestra el catálogo', (initialPath) => {
    act(() => root.render(<MemoryRouter initialEntries={[initialPath]}><App /><LocationProbe /></MemoryRouter>))
    const openCart = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Abrir carrito')
    act(() => openCart?.click())
    expect(container.textContent).toContain('Explorar el catálogo')

    const explore = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Explorar el catálogo')
    act(() => explore?.click())

    expect(container.textContent).not.toContain('Explorar el catálogo')
    expect(container.querySelector('[data-location]')?.textContent).toBe('/#catalogo')
    expect(container.textContent).toContain('Nuestros sorrentinos')
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })
})
