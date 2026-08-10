import { beforeEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '../lib/supabase'
import { createOrder, parseCreatedOrder } from '../services/orderService'
import type { CustomerData, PaymentMethod } from '../types'
import { products } from './fixtures/products'

vi.mock('../lib/supabase', () => ({ supabase: { rpc: vi.fn(), from: vi.fn() } }))

const rpcMock = vi.mocked(supabase.rpc)
const fromMock = vi.mocked(supabase.from)
const items = [{ product: products[0], quantity: 2 }]
const customer = (metodoPago: PaymentMethod, telefono = '+54 9 11 1234 5678'): CustomerData => ({
  nombre: 'Ana',
  apellido: 'Díaz',
  telefono,
  metodoPago,
})

function rpcResponse(metodoPago: PaymentMethod = 'transferencia') {
  return {
    data: [{
      pedido_id: 44,
      codigo: 'PED-100',
      total: '17600',
      estado: metodoPago === 'transferencia' ? 'pendiente_pago' : 'pendiente_coordinacion',
      metodo_pago: metodoPago,
      stock_reservado: true,
    }],
    error: null,
  }
}

describe('servicio de pedidos', () => {
  beforeEach(() => {
    rpcMock.mockReset()
    fromMock.mockReset()
  })

  it.each<PaymentMethod>(['transferencia', 'contraentrega'])('envía %s a crear_pedido_v5 con teléfono normalizado y consentimiento expreso', async (metodoPago) => {
    rpcMock.mockResolvedValue(rpcResponse(metodoPago) as never)

    await createOrder(customer(metodoPago), items, true)

    expect(rpcMock).toHaveBeenCalledWith('crear_pedido_v5', {
      p_nombre: 'Ana',
      p_apellido: 'Díaz',
      p_telefono: '5491112345678',
      p_metodo_pago: metodoPago,
      p_items: [{ producto_id: 1, cantidad: 2 }],
      p_consentimiento_transferencia: true,
    })
    expect(rpcMock).toHaveBeenCalledTimes(1)
    const rpcPayload = rpcMock.mock.calls[0]?.[1] as Record<string, unknown>
    expect(Object.keys(rpcPayload)).not.toEqual(expect.arrayContaining([
      'p_stock', 'p_precio', 'p_subtotal', 'p_total', 'p_estado',
    ]))
    expect(rpcPayload.p_items).toEqual([{ producto_id: 1, cantidad: 2 }])
  })

  it('rechaza el teléfono antes de invocar Supabase', async () => {
    await expect(createOrder(customer('transferencia', '123'), items, true)).rejects.toEqual(expect.objectContaining({ reason: 'phone' }))
    expect(rpcMock).not.toHaveBeenCalled()
  })

  it('rechaza la creación sin consentimiento antes de invocar Supabase', async () => {
    await expect(createOrder(customer('transferencia'), items, false)).rejects.toEqual(expect.objectContaining({ reason: 'consent' }))
    expect(rpcMock).not.toHaveBeenCalled()
  })

  it('crea el pedido con una sola RPC y no realiza updates manuales de stock', async () => {
    rpcMock.mockResolvedValue(rpcResponse() as never)
    await createOrder(customer('transferencia'), items, true)
    expect(rpcMock).toHaveBeenCalledTimes(1)
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('utiliza la respuesta completa y confirma la reserva de stock', () => {
    expect(parseCreatedOrder({
      pedido_id: '55',
      codigo: 'PED-200',
      total: 9000,
      estado: 'pago_confirmado',
      metodo_pago: 'transferencia',
      stock_reservado: true,
    })).toEqual({
      pedidoId: '55',
      codigo: 'PED-200',
      total: 9000,
      estado: 'pago_confirmado',
      metodoPago: 'transferencia',
      stockReservado: true,
    })
  })

  it.each([false, undefined])('rechaza una respuesta con stock_reservado igual a %s', (stockReservado) => {
    expect(() => parseCreatedOrder({
      pedido_id: '55',
      codigo: 'PED-200',
      total: 9000,
      estado: 'pendiente_pago',
      metodo_pago: 'transferencia',
      stock_reservado: stockReservado,
    })).toThrow(/incompleta/)
  })

  it('rechaza respuestas incompletas', () => {
    expect(() => parseCreatedOrder({ codigo: 'PED-200', total: 9000, estado: 'pendiente_pago' })).toThrow(/incompleta/)
  })

  it('identifica claramente un error de stock insuficiente', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'Stock insuficiente para el producto 1' } } as never)
    await expect(createOrder(customer('transferencia'), items, true)).rejects.toEqual(expect.objectContaining({ reason: 'stock' }))
  })

  it('explica un método de pago rechazado por Supabase', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'Método de pago inválido' } } as never)
    await expect(createOrder(customer('transferencia'), items, true)).rejects.toEqual(expect.objectContaining({ reason: 'payment_method' }))
  })

  it('explica un consentimiento rechazado por Supabase', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'Consentimiento de transferencia internacional requerido' } } as never)
    await expect(createOrder(customer('transferencia'), items, true)).rejects.toEqual(expect.objectContaining({
      reason: 'consent',
      message: 'Debe autorizar el tratamiento indicado para poder registrar el pedido.',
    }))
  })
})
