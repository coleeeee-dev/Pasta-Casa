import { describe, expect, it } from 'vitest'
import { products } from '../data/products'
import { cartReducer, getCartTotal, getItemSubtotal, initialCartState } from '../context/cartReducer'

describe('carrito', () => {
  it('ofrece únicamente las tres variedades vendidas por docena', () => { expect(products).toHaveLength(3); expect(products.every((product) => product.presentacion === 'Presentación: 1 docena')).toBe(true) })
  it('agrega un producto', () => { const state = cartReducer(initialCartState, { type:'ADD', product:products[0], quantity:2 }); expect(state.items[0].quantity).toBe(2) })
  it('aumenta y disminuye cantidades', () => { let state = cartReducer(initialCartState,{ type:'ADD',product:products[0],quantity:1 }); state=cartReducer(state,{ type:'SET_QUANTITY',productId:products[0].id,quantity:3 }); expect(state.items[0].quantity).toBe(3); state=cartReducer(state,{ type:'SET_QUANTITY',productId:products[0].id,quantity:2 }); expect(state.items[0].quantity).toBe(2) })
  it('evita superar el stock', () => { const state=cartReducer(initialCartState,{ type:'ADD',product:products[0],quantity:products[0].stock+5 }); expect(state.items[0].quantity).toBe(products[0].stock); expect(state.notice).not.toBe('') })
  it('elimina un producto', () => { let state=cartReducer(initialCartState,{ type:'ADD',product:products[0],quantity:1 }); state=cartReducer(state,{ type:'REMOVE',productId:products[0].id }); expect(state.items).toHaveLength(0) })
  it('calcula el subtotal como precio por docena por cantidad de docenas', () => { expect(getItemSubtotal({ product:products[0],quantity:3 })).toBe(products[0].precio*3) })
  it('calcula el total general de las docenas', () => { const items=[{ product:products[0],quantity:2 },{ product:products[1],quantity:1 }]; expect(getCartTotal(items)).toBe(products[0].precio*2+products[1].precio) })
})
