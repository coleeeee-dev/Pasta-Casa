import { beforeEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { createOrder, parseCreatedOrder } from '../services/orderService'
import type { CustomerData, PaymentMethod } from '../types'
import { products } from './fixtures/products'

vi.mock('../lib/supabase', () => ({ supabase: { rpc: vi.fn() } }))

const rpcMock = vi.mocked(supabase.rpc)
const items = [{ product: products[0], quantity: 2 }]
const customer = (metodoPago: PaymentMethod, telefono = '+54 9 11 1234 5678'): CustomerData => ({ nombre: 'Ana', apellido: 'Díaz', telefono, metodoPago })

describe('servicio de pedidos', () => {
  beforeEach(() => rpcMock.mockReset())

  it.each<PaymentMethod>(['transferencia', 'contraentrega'])('envía %s a crear_pedido_v3 con teléfono normalizado', async (metodoPago) => {
    rpcMock.mockResolvedValue({ data: [{ pedido_id: 44, codigo: 'PED-100', total: '17600', estado: metodoPago === 'transferencia' ? 'pendiente_pago' : 'pendiente_coordinacion', metodo_pago: metodoPago }], error: null } as never)

    await createOrder(customer(metodoPago), items)

    expect(rpcMock).toHaveBeenCalledWith('crear_pedido_v3', {
      p_nombre: 'Ana',
      p_apellido: 'Díaz',
      p_telefono: '5491112345678',
      p_metodo_pago: metodoPago,
      p_items: [{ producto_id: 1, cantidad: 2 }],
    })
    const payload = JSON.stringify(rpcMock.mock.calls[0])
    expect(payload).not.toMatch(/dni|email|precio|subtotal|total|estado/)
  })

  it('rechaza el teléfono antes de invocar Supabase', async () => {
    await expect(createOrder(customer('transferencia', '123'), items)).rejects.toEqual(expect.objectContaining({ reason: 'phone' }))
    expect(rpcMock).not.toHaveBeenCalled()
  })

  it('utiliza estado y método devueltos por Supabase', () => {
    expect(parseCreatedOrder({ pedido_id: '55', codigo: 'PED-200', total: 9000, estado: 'pago_confirmado', metodo_pago: 'transferencia' })).toEqual({
      pedidoId: '55', codigo: 'PED-200', total: 9000, estado: 'pago_confirmado', metodoPago: 'transferencia',
    })
  })

  it('rechaza respuestas incompletas', () => {
    expect(() => parseCreatedOrder({ codigo: 'PED-200', total: 9000, estado: 'pendiente_pago' })).toThrow(/incompleta/)
  })

  it('identifica claramente un error de stock insuficiente', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'Stock insuficiente para el producto 1' } } as never)
    await expect(createOrder(customer('transferencia'), items)).rejects.toEqual(expect.objectContaining({ reason: 'stock' }))
  })

  it('explica un método de pago rechazado por Supabase', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'Método de pago inválido' } } as never)
    await expect(createOrder(customer('transferencia'), items)).rejects.toEqual(expect.objectContaining({ reason: 'payment_method' }))
  })
})
