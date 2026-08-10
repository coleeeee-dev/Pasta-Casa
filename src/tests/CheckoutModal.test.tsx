import { act, type ReactElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckoutModal } from '../components/CheckoutModal'
import { CreateOrderError } from '../services/orderService'
import type { CartItem, PaymentMethod, PublicBusinessConfig } from '../types'
import { formatARS } from '../utils/currency'
import { products } from './fixtures/products'

const publicConfig: PublicBusinessConfig = {
  id: 1,
  nombre_negocio: 'Negocio desde Supabase',
  whatsapp: '+54 9 11 5555 0101',
  cbu: 'CBU-DESDE-SUPABASE',
  identificacion_fiscal: 'FISCAL-DESDE-SUPABASE',
  titular: 'Titular desde Supabase',
  horas_limite_pago: 6,
  updated_at: '2026-08-09T00:00:00Z',
}

const doubles = vi.hoisted(() => ({
  createOrder: vi.fn(),
  clearCart: vi.fn(),
  reloadProducts: vi.fn(),
  refreshConfig: vi.fn(),
  business: { config: null as PublicBusinessConfig | null, loading: false, error: null as string | null },
  cart: { items: [] as CartItem[], total: 0 },
}))

vi.mock('../context/CartContext', () => ({ useCart: () => ({ items: doubles.cart.items, total: doubles.cart.total, clearCart: doubles.clearCart }) }))
vi.mock('../context/ProductContext', () => ({ useProducts: () => ({ reloadProducts: doubles.reloadProducts }) }))
vi.mock('../context/BusinessConfigContext', () => ({ useBusinessConfig: () => ({
  ...doubles.business,
  success: Boolean(doubles.business.config) && !doubles.business.loading && !doubles.business.error,
  refreshConfig: doubles.refreshConfig,
}) }))
vi.mock('../services/orderService', () => {
  class MockCreateOrderError extends Error {
    constructor(message: string, public readonly reason: 'stock' | 'payment_method' | 'phone' | 'consent' | 'unknown' = 'unknown') {
      super(message)
    }
  }
  return { createOrder: doubles.createOrder, CreateOrderError: MockCreateOrderError }
})

let root: Root
let container: HTMLDivElement
let clipboardWrite: ReturnType<typeof vi.fn>
const actEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }

beforeAll(() => { actEnvironment.IS_REACT_ACT_ENVIRONMENT = true })
afterAll(() => { delete actEnvironment.IS_REACT_ACT_ENVIRONMENT })

function render(component: ReactElement) { act(() => root.render(component)) }
function button(text: string): HTMLButtonElement {
  const match = [...container.querySelectorAll('button')].find((item) => item.textContent?.includes(text))
  if (!match) throw new Error(`No se encontró el botón ${text}`)
  return match
}
function setInput(name: string, value: string) {
  const input = container.querySelector<HTMLInputElement>(`#${name}`)
  if (!input) throw new Error(`No se encontró el campo ${name}`)
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  act(() => { setter?.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })) })
}
function fillCustomer(paymentMethod?: PaymentMethod, phone = '+54 9 11 1234 5678') {
  setInput('nombre', 'Ana')
  setInput('apellido', 'Díaz')
  setInput('telefono', phone)
  if (paymentMethod) act(() => container.querySelector<HTMLInputElement>(`input[value="${paymentMethod}"]`)?.click())
}
function acceptPrivacy() {
  act(() => container.querySelector<HTMLInputElement>('#consentimiento-transferencia')?.click())
}
function submit() {
  const form = container.querySelector('form')
  if (!form) throw new Error('No se encontró el formulario')
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
}
async function completeOrder(method: PaymentMethod) {
  doubles.createOrder.mockResolvedValue({ pedidoId: '77', codigo: 'PED-77', total: 17600, estado: method === 'transferencia' ? 'pendiente_pago' : 'pendiente_coordinacion', metodoPago: method, stockReservado: true })
  fillCustomer(method)
  acceptPrivacy()
  await act(async () => submit())
}

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  doubles.cart.items = [{ product: products[0], quantity: 2 }]
  doubles.cart.total = products[0].precio * 2
  doubles.createOrder.mockReset()
  doubles.clearCart.mockReset()
  doubles.reloadProducts.mockReset()
  doubles.reloadProducts.mockResolvedValue(undefined)
  doubles.refreshConfig.mockReset()
  doubles.refreshConfig.mockResolvedValue(undefined)
  doubles.business.config = publicConfig
  doubles.business.loading = false
  doubles.business.error = null
  clipboardWrite = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: clipboardWrite } })
  render(<CheckoutModal open onClose={vi.fn()} onBackToCart={vi.fn()} onFinished={vi.fn()} />)
  act(() => button('Continuar con mis datos').click())
})

afterEach(() => { act(() => root.unmount()); container.remove() })

describe('CheckoutModal', () => {
  it('ya no contiene campos de DNI ni email', () => {
    expect(container.querySelector('#dni')).toBeNull()
    expect(container.querySelector('#email')).toBeNull()
    expect(container.querySelector('#telefono')).not.toBeNull()
  })

  it('muestra el aviso y el consentimiento comienza desmarcado sin usar localStorage', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem')
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const checkbox = container.querySelector<HTMLInputElement>('#consentimiento-transferencia')

    expect(container.textContent).toContain('Utilizaremos su nombre, apellido y número de celular únicamente para registrar, gestionar y coordinar su pedido.')
    expect(container.textContent).toContain('Autorizo que los datos necesarios para gestionar mi pedido sean transferidos y almacenados fuera de Argentina.')
    expect(checkbox?.checked).toBe(false)
    expect(checkbox?.required).toBe(true)
    expect(container.querySelector<HTMLAnchorElement>('a[href="/privacidad"]')?.textContent).toBe('Política de Privacidad')
    acceptPrivacy()
    expect(checkbox?.checked).toBe(true)
    expect(getItem).not.toHaveBeenCalled()
    expect(setItem).not.toHaveBeenCalled()
  })

  it('bloquea el pedido y muestra un mensaje si falta el consentimiento', async () => {
    fillCustomer('transferencia')
    await act(async () => submit())

    expect(doubles.createOrder).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Debe autorizar el tratamiento indicado para poder registrar el pedido.')
    expect(container.querySelector<HTMLInputElement>('#consentimiento-transferencia')?.getAttribute('aria-invalid')).toBe('true')
  })

  it('comunica true al servicio cuando el consentimiento fue marcado', async () => {
    doubles.createOrder.mockResolvedValue({ pedidoId: '77', codigo: 'PED-77', total: 17600, estado: 'pendiente_pago', metodoPago: 'transferencia', stockReservado: true })
    fillCustomer('transferencia')
    acceptPrivacy()
    await act(async () => submit())

    expect(doubles.createOrder).toHaveBeenCalledWith(expect.any(Object), doubles.cart.items, true)
  })

  it('mantiene datos y carrito cuando el RPC falla', async () => {
    doubles.createOrder.mockRejectedValue(new Error('fallo RPC'))
    fillCustomer('contraentrega')
    acceptPrivacy()
    await act(async () => submit())
    expect(doubles.clearCart).not.toHaveBeenCalled()
    expect(container.querySelector<HTMLInputElement>('#telefono')?.value).toBe('+54 9 11 1234 5678')
    expect(container.querySelector<HTMLInputElement>('#consentimiento-transferencia')?.checked).toBe(true)
    expect(button('Reintentar pedido')).toBeDefined()
  })

  it('refresca productos y conserva el carrito cuando falta stock', async () => {
    doubles.createOrder.mockRejectedValue(new CreateOrderError('No hay stock suficiente.', 'stock'))
    fillCustomer('contraentrega')
    acceptPrivacy()
    await act(async () => submit())
    expect(doubles.clearCart).not.toHaveBeenCalled()
    expect(doubles.reloadProducts).toHaveBeenCalledTimes(1)
    expect(container.textContent).toContain('No hay stock suficiente')
    expect(container.querySelector<HTMLInputElement>('#telefono')?.value).toBe('+54 9 11 1234 5678')
  })

  it('bloquea llamadas duplicadas mientras el RPC está pendiente', async () => {
    let resolveOrder!: (value: unknown) => void
    doubles.createOrder.mockReturnValue(new Promise((resolve) => { resolveOrder = resolve }))
    fillCustomer('transferencia')
    acceptPrivacy()
    act(() => { submit(); submit() })
    expect(doubles.createOrder).toHaveBeenCalledTimes(1)
    await act(async () => { resolveOrder({ pedidoId: '77', codigo: 'PED-77', total: 17600, estado: 'pendiente_pago', metodoPago: 'transferencia', stockReservado: true }); await Promise.resolve() })
    expect(doubles.clearCart).toHaveBeenCalledTimes(1)
    expect(doubles.reloadProducts).toHaveBeenCalledTimes(1)
  })

  it('muestra los datos reales de transferencia sin medios visuales obsoletos', async () => {
    await completeOrder('transferencia')
    expect(doubles.reloadProducts).toHaveBeenCalledTimes(1)
    expect(container.textContent).toContain('Los productos de tu pedido quedaron reservados')
    expect(container.textContent).toContain(publicConfig.cbu)
    expect(container.textContent).toContain(publicConfig.titular)
    expect(container.textContent).toContain(formatARS(17600))
    expect(container.textContent).toContain(publicConfig.whatsapp)
    expect(container.textContent).not.toContain(publicConfig.identificacion_fiscal)
    expect(container.textContent).not.toContain('Identificación fiscal')
    expect(container.textContent).toContain(`Tenés ${publicConfig.horas_limite_pago} horas`)
    expect(container.textContent).not.toContain(String.fromCharCode(81, 82))
  })

  it('copia el CBU y muestra feedback', async () => {
    await completeOrder('transferencia')
    await act(async () => button('Copiar CBU').click())
    expect(clipboardWrite).toHaveBeenCalledWith(publicConfig.cbu)
    expect(container.textContent).toContain('Copiado')
  })

  it('crea el enlace de transferencia con el número normalizado y el código real', async () => {
    await completeOrder('transferencia')
    const link = [...container.querySelectorAll<HTMLAnchorElement>('a')].find((item) => item.textContent?.includes('Enviar comprobante'))
    expect(link?.href).toContain('wa.me/5491155550101')
    const message = new URL(link!.href).searchParams.get('text')
    expect(message).toContain('realicé el pago del pedido PED-77')
    expect(message).toContain('Adjunto mi comprobante')
  })

  it('muestra los datos de coordinación y crea el mensaje de contraentrega', async () => {
    await completeOrder('contraentrega')
    expect(container.textContent).toContain('Coordinación de entrega')
    expect(container.textContent).toContain('Tu pedido fue registrado correctamente')
    expect(container.textContent).toContain('Para coordinar la entrega, comunicate con nosotros por WhatsApp')
    expect(container.textContent).toContain('Código: PED-77')
    expect(container.textContent).toContain('Dirección de entrega')
    expect(container.textContent).toContain('Con cuánto dinero vas a pagar')
    expect(container.textContent).not.toContain('Dirección:')
    expect(container.textContent).not.toContain('Pago con:')
    const link = [...container.querySelectorAll<HTMLAnchorElement>('a')].find((item) => item.textContent?.includes('Coordinar entrega'))
    expect(link?.href).toContain('wa.me/5491155550101')
    const message = new URL(link!.href).searchParams.get('text')
    expect(message).toContain('coordinar la entrega del pedido PED-77')
    expect(message).toContain('Dirección:')
    expect(message).toContain('Pago con:')
  })

  it('copia el código del pedido y muestra feedback', async () => {
    await completeOrder('transferencia')
    await act(async () => button('Copiar código').click())
    expect(clipboardWrite).toHaveBeenCalledWith('PED-77')
    expect(container.textContent).toContain('Código copiado')
  })

  it('no muestra datos bancarios cuando falla la configuración y permite reintentar', async () => {
    doubles.business.config = null
    doubles.business.error = 'fallo de configuración'
    await completeOrder('transferencia')
    expect(container.textContent).toContain('No pudimos cargar los datos de pago')
    expect(container.textContent).not.toContain(publicConfig.cbu)
    expect(container.querySelector('a[href*="wa.me"]')).toBeNull()
    await act(async () => button('Reintentar').click())
    expect(doubles.refreshConfig).toHaveBeenCalledTimes(1)
  })
})
