import { act, type ReactElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProductCard } from '../components/ProductCard'
import type { CartItem } from '../types'
import { products } from './fixtures/products'

const doubles = vi.hoisted(() => ({
  items: [] as CartItem[],
  addItem: vi.fn(),
  setQuantity: vi.fn(),
}))

vi.mock('../context/CartContext', () => ({ useCart: () => ({
  items: doubles.items,
  addItem: doubles.addItem,
  setQuantity: doubles.setQuantity,
}) }))

let root: Root
let container: HTMLDivElement
const actEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
const productWithStock = (stock: number) => ({ ...products[0], stock })

beforeAll(() => { actEnvironment.IS_REACT_ACT_ENVIRONMENT = true })
afterAll(() => { delete actEnvironment.IS_REACT_ACT_ENVIRONMENT })

function render(component: ReactElement) { act(() => root.render(component)) }
function quantitySelect() {
  const select = container.querySelector<HTMLSelectElement>(`#quantity-${products[0].id}`)
  if (!select) throw new Error('No se encontró el selector de cantidad')
  return select
}

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  doubles.items = []
  doubles.addItem.mockReset()
  doubles.setQuantity.mockReset()
})

afterEach(() => { act(() => root.unmount()); container.remove() })

describe('selector de ProductCard', () => {
  it('limita stock 30 a un máximo de 10 opciones', () => {
    render(<ProductCard product={productWithStock(30)} onAdded={vi.fn()} />)
    expect(quantitySelect().options).toHaveLength(10)
    expect(quantitySelect().options[9].textContent).toBe('10 docenas')
  })

  it('limita las opciones al stock cuando es menor que 10', () => {
    render(<ProductCard product={productWithStock(5)} onAdded={vi.fn()} />)
    expect(quantitySelect().options).toHaveLength(5)
  })

  it('ofrece solo 4 docenas cuando otros productos ya suman 6', () => {
    doubles.items = [{ product: products[1], quantity: 6 }]
    render(<ProductCard product={productWithStock(30)} onAdded={vi.fn()} />)
    expect(quantitySelect().options).toHaveLength(4)
  })

  it('al editar ignora las 4 docenas propias y permite llegar a 7', () => {
    const product = productWithStock(30)
    doubles.items = [{ product, quantity: 4 }, { product: products[1], quantity: 3 }]
    render(<ProductCard product={product} onAdded={vi.fn()} />)
    const select = quantitySelect()
    expect(select.options).toHaveLength(7)
    expect(select.value).toBe('4')

    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set
    act(() => { setter?.call(select, '7'); select.dispatchEvent(new Event('change', { bubbles: true })) })
    const updateButton = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Actualizar')
    act(() => updateButton?.click())
    expect(doubles.setQuantity).toHaveBeenCalledWith(product.id, 7)
    expect(doubles.addItem).not.toHaveBeenCalled()
  })
})
