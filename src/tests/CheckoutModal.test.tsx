import { act, type ReactElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckoutModal } from '../components/CheckoutModal'
import type { CartItem, PaymentMethod } from '../types'
import { products } from './fixtures/products'

const doubles = vi.hoisted(() => ({ createOrder: vi.fn(), clearCart: vi.fn(), cart: { items: [] as CartItem[], total: 0 } }))

vi.mock('../context/CartContext', () => ({ useCart: () => ({ items: doubles.cart.items, total: doubles.cart.total, clearCart: doubles.clearCart }) }))
vi.mock('../services/orderService', () => {
  class MockCreateOrderError extends Error {}
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
function submit() {
  const form = container.querySelector('form')
  if (!form) throw new Error('No se encontró el formulario')
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
}
async function completeOrder(method: PaymentMethod) {
  doubles.createOrder.mockResolvedValue({ pedidoId: '77', codigo: 'PED-77', total: 17600, estado: method === 'transferencia' ? 'pendiente_pago' : 'pendiente_coordinacion', metodoPago: method })
  fillCustomer(method)
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

  it('mantiene datos y carrito cuando el RPC falla', async () => {
    doubles.createOrder.mockRejectedValue(new Error('fallo RPC'))
    fillCustomer('contraentrega')
    await act(async () => submit())
    expect(doubles.clearCart).not.toHaveBeenCalled()
    expect(container.querySelector<HTMLInputElement>('#telefono')?.value).toBe('+54 9 11 1234 5678')
    expect(button('Reintentar pedido')).toBeDefined()
  })

  it('bloquea llamadas duplicadas mientras el RPC está pendiente', async () => {
    let resolveOrder!: (value: unknown) => void
    doubles.createOrder.mockReturnValue(new Promise((resolve) => { resolveOrder = resolve }))
    fillCustomer('transferencia')
    act(() => { submit(); submit() })
    expect(doubles.createOrder).toHaveBeenCalledTimes(1)
    await act(async () => { resolveOrder({ pedidoId: '77', codigo: 'PED-77', total: 17600, estado: 'pendiente_pago', metodoPago: 'transferencia' }); await Promise.resolve() })
    expect(doubles.clearCart).toHaveBeenCalledTimes(1)
  })

  it('muestra instrucciones de transferencia y placeholders pendientes', async () => {
    await completeOrder('transferencia')
    expect(container.textContent).toContain('Tenés 2 horas para realizar el pago')
    expect(container.textContent).toContain('QR pendiente de configuración')
    expect(container.textContent).toContain('Datos de transferencia próximamente configurables')
  })

  it('muestra instrucciones para coordinar contraentrega', async () => {
    await completeOrder('contraentrega')
    expect(container.textContent).toContain('Para coordinar la entrega, comunicate con nosotros por WhatsApp')
    expect(container.textContent).toContain('Dirección de entrega')
    expect(container.textContent).toContain('Monto con el que vas a pagar')
  })

  it('copia el código del pedido y muestra feedback', async () => {
    await completeOrder('transferencia')
    await act(async () => button('Copiar código').click())
    expect(clipboardWrite).toHaveBeenCalledWith('PED-77')
    expect(container.textContent).toContain('Código copiado')
  })
})
