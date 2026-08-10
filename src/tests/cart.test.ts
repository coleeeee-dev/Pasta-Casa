import { describe, expect, it } from 'vitest'
import { products } from './fixtures/products'
import { CART_LIMIT_MESSAGE, cartReducer, getCartTotal, getItemSubtotal, getMaxProductQuantity, initialCartState } from '../context/cartReducer'

describe('carrito', () => {
  it('trabaja con productos vendidos por docena', () => { expect(products.every((product) => product.presentacion === 'Presentación: 1 docena')).toBe(true) })
  it('agrega un producto', () => { const state = cartReducer(initialCartState, { type:'ADD', product:products[0], quantity:2 }); expect(state.items[0].quantity).toBe(2) })
  it('aumenta y disminuye cantidades', () => { let state = cartReducer(initialCartState,{ type:'ADD',product:products[0],quantity:1 }); state=cartReducer(state,{ type:'SET_QUANTITY',productId:products[0].id,quantity:3 }); expect(state.items[0].quantity).toBe(3); state=cartReducer(state,{ type:'SET_QUANTITY',productId:products[0].id,quantity:2 }); expect(state.items[0].quantity).toBe(2) })
  it('evita superar el stock', () => { const product = { ...products[0], stock: 5 }; const state=cartReducer(initialCartState,{ type:'ADD',product,quantity:7 }); expect(state.items[0].quantity).toBe(5); expect(state.notice).not.toBe('') })
  it('calcula el máximo usando stock y el total de otros productos', () => {
    const product = { ...products[0], stock: 30 }
    expect(getMaxProductQuantity([], product)).toBe(10)
    expect(getMaxProductQuantity([], { ...product, stock: 5 })).toBe(5)
    expect(getMaxProductQuantity([{ product: products[1], quantity: 6 }], product)).toBe(4)
  })
  it('ignora la cantidad propia al calcular el máximo editable', () => {
    const product = { ...products[0], stock: 30 }
    const items = [{ product, quantity: 4 }, { product: products[1], quantity: 3 }]
    expect(getMaxProductQuantity(items, product)).toBe(7)
  })
  it('no modifica el carrito al intentar agregar más de 10 docenas', () => {
    const initial = { items: [{ product: products[0], quantity: 6 }], notice: '' }
    const result = cartReducer(initial, { type: 'ADD', product: products[1], quantity: 5 })
    expect(result.items).toBe(initial.items)
    expect(result.notice).toBe(CART_LIMIT_MESSAGE)
  })
  it('no modifica el carrito al intentar superar 10 con SET_QUANTITY', () => {
    const initial = { items: [{ product: products[0], quantity: 6 }, { product: products[1], quantity: 4 }], notice: '' }
    const result = cartReducer(initial, { type: 'SET_QUANTITY', productId: products[1].id, quantity: 5 })
    expect(result.items).toBe(initial.items)
    expect(result.notice).toBe(CART_LIMIT_MESSAGE)
  })
  it('permite reducir y eliminar productos cuando el carrito tiene 10 docenas', () => {
    const initial = { items: [{ product: products[0], quantity: 6 }, { product: products[1], quantity: 4 }], notice: '' }
    const reduced = cartReducer(initial, { type: 'SET_QUANTITY', productId: products[0].id, quantity: 5 })
    expect(reduced.items.find((item) => item.product.id === products[0].id)?.quantity).toBe(5)
    const removed = cartReducer(initial, { type: 'REMOVE', productId: products[1].id })
    expect(removed.items).toEqual([{ product: products[0], quantity: 6 }])
  })
  it('reconcilia las cantidades con el stock actualizado de Supabase', () => {
    const state = { items: [{ product: products[0], quantity: 3 }], notice: '' }
    const updatedProduct = { ...products[0], stock: 1 }
    const result = cartReducer(state, { type: 'SYNC_PRODUCTS', products: [updatedProduct] })
    expect(result.items).toEqual([{ product: updatedProduct, quantity: 1 }])
    expect(result.notice).toContain('stock disponible')
  })
  it('elimina un producto', () => { let state=cartReducer(initialCartState,{ type:'ADD',product:products[0],quantity:1 }); state=cartReducer(state,{ type:'REMOVE',productId:products[0].id }); expect(state.items).toHaveLength(0) })
  it('calcula el subtotal como precio por docena por cantidad de docenas', () => { expect(getItemSubtotal({ product:products[0],quantity:3 })).toBe(products[0].precio*3) })
  it('calcula el total general de las docenas', () => { const items=[{ product:products[0],quantity:2 },{ product:products[1],quantity:1 }]; expect(getCartTotal(items)).toBe(products[0].precio*2+products[1].precio) })
})
