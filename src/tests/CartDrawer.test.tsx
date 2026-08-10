import { act, type ReactElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { CartDrawer } from '../components/CartDrawer'
import type { CartItem } from '../types'
import { products } from './fixtures/products'

const doubles = vi.hoisted(() => ({
  cart: {
    items: [] as CartItem[],
    count: 0,
    total: 0,
    notice: '',
    setQuantity: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
    dismissNotice: vi.fn(),
  },
}))

vi.mock('../context/CartContext', () => ({ useCart: () => doubles.cart }))

let root: Root
let container: HTMLDivElement
const actEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }

beforeAll(() => { actEnvironment.IS_REACT_ACT_ENVIRONMENT = true })
afterAll(() => { delete actEnvironment.IS_REACT_ACT_ENVIRONMENT })

function render(component: ReactElement) { act(() => root.render(component)) }

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  doubles.cart.items = []
  doubles.cart.count = 0
  doubles.cart.total = 0
  Object.values(doubles.cart).forEach((value) => { if (typeof value === 'function' && 'mockReset' in value) value.mockReset() })
})

afterEach(() => { act(() => root.unmount()); container.remove() })

describe('CartDrawer', () => {
  it('ofrece explorar el catálogo cuando el carrito está vacío y ejecuta la acción', () => {
    const onExploreCatalog = vi.fn()
    render(<CartDrawer open onClose={vi.fn()} onCheckout={vi.fn()} onExploreCatalog={onExploreCatalog} />)

    expect(container.textContent).toContain('Tu mesa todavía está vacía')
    const explore = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Explorar el catálogo')
    expect(explore).toBeDefined()
    act(() => explore?.click())
    expect(onExploreCatalog).toHaveBeenCalledTimes(1)
  })

  it('no muestra el aviso antiguo ni referencias de demostración debajo del total', () => {
    doubles.cart.items = [{ product: products[0], quantity: 1 }]
    doubles.cart.count = 1
    doubles.cart.total = products[0].precio
    render(<CartDrawer open onClose={vi.fn()} onCheckout={vi.fn()} onExploreCatalog={vi.fn()} />)

    const legacyNotice = ['El pago no se realiza en este pro', 'totipo.'].join('')
    expect(container.textContent).not.toContain(legacyNotice)
    expect(container.textContent).not.toMatch(new RegExp(['proto', 'tipo'].join(''), 'i'))
    expect(container.textContent).toContain('Proceder con la compra')
    expect(container.textContent).toContain('Máximo 10 docenas por pedido.')
  })

  it('bloquea aumentar al llegar a 10 pero permite reducir y eliminar', () => {
    doubles.cart.items = [{ product: products[0], quantity: 6 }, { product: products[1], quantity: 4 }]
    doubles.cart.count = 10
    doubles.cart.total = products[0].precio * 6 + products[1].precio * 4
    render(<CartDrawer open onClose={vi.fn()} onCheckout={vi.fn()} onExploreCatalog={vi.fn()} />)

    const increaseButtons = [...container.querySelectorAll<HTMLButtonElement>('button[aria-label="Aumentar cantidad"]')]
    expect(increaseButtons).toHaveLength(2)
    expect(increaseButtons.every((button) => button.disabled)).toBe(true)

    const decreaseButton = container.querySelector<HTMLButtonElement>('button[aria-label="Disminuir cantidad"]')
    expect(decreaseButton?.disabled).toBe(false)
    act(() => decreaseButton?.click())
    expect(doubles.cart.setQuantity).toHaveBeenCalledWith(products[0].id, 5)

    const removeButton = [...container.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent === 'Eliminar')
    expect(removeButton?.disabled).toBe(false)
    act(() => removeButton?.click())
    expect(doubles.cart.removeItem).toHaveBeenCalledWith(products[0].id)
  })
})
