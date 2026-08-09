import { supabase } from '../lib/supabase'
import type { CartItem, CustomerData, OrderStatus, PaymentMethod } from '../types'
import { normalizePhone, isValidPhone } from '../utils/phone'

const paymentMethods: PaymentMethod[] = ['transferencia', 'contraentrega']
const orderStatuses: OrderStatus[] = ['pendiente_pago', 'pendiente_coordinacion', 'pago_confirmado', 'completado', 'cancelado']

export interface CreatedOrder {
  pedidoId: string
  codigo: string
  total: number
  estado: OrderStatus
  metodoPago: PaymentMethod
  stockReservado: true
}

interface CreateOrderRow {
  pedido_id?: unknown
  codigo?: unknown
  total?: unknown
  estado?: unknown
  metodo_pago?: unknown
  stock_reservado?: unknown
}

export class CreateOrderError extends Error {
  constructor(message: string, public readonly reason: 'stock' | 'payment_method' | 'phone' | 'unknown' = 'unknown') {
    super(message)
    this.name = 'CreateOrderError'
  }
}

export function buildOrderItems(items: CartItem[]) {
  return items.map(({ product, quantity }) => {
    const productoId = Number(product.id)

    if (!Number.isInteger(productoId) || productoId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
      throw new CreateOrderError('El pedido contiene un producto o una cantidad inválida.')
    }

    return { producto_id: productoId, cantidad: quantity }
  })
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === 'string' && paymentMethods.includes(value as PaymentMethod)
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && orderStatuses.includes(value as OrderStatus)
}

export function parseCreatedOrder(data: unknown): CreatedOrder {
  const row = (Array.isArray(data) ? data[0] : data) as CreateOrderRow | null
  const total = Number(row?.total)
  const pedidoId = row?.pedido_id

  if (!row || (typeof pedidoId !== 'string' && typeof pedidoId !== 'number') || !String(pedidoId) || typeof row.codigo !== 'string' || !row.codigo || !Number.isFinite(total) || !isOrderStatus(row.estado) || !isPaymentMethod(row.metodo_pago) || row.stock_reservado !== true) {
    throw new CreateOrderError('Supabase devolvió una respuesta de pedido incompleta.')
  }

  return { pedidoId: String(pedidoId), codigo: row.codigo, total, estado: row.estado, metodoPago: row.metodo_pago, stockReservado: true }
}

function getErrorText(error: { message?: string; details?: string; hint?: string }): string {
  return `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`.toLocaleLowerCase('es-AR')
}

export async function createOrder(customer: CustomerData, items: CartItem[]): Promise<CreatedOrder> {
  if (items.length === 0) throw new CreateOrderError('El carrito está vacío.')
  if (!isPaymentMethod(customer.metodoPago)) throw new CreateOrderError('Elegí un método de pago válido para continuar.', 'payment_method')
  if (!isValidPhone(customer.telefono)) throw new CreateOrderError('Ingresá un número de celular válido.', 'phone')

  const { data, error } = await supabase.rpc('crear_pedido_v4', {
    p_nombre: customer.nombre,
    p_apellido: customer.apellido,
    p_telefono: normalizePhone(customer.telefono),
    p_metodo_pago: customer.metodoPago,
    p_items: buildOrderItems(items),
  })

  if (error) {
    const errorText = getErrorText(error)
    if (/stock|insuficiente|insufficient|existencias|disponible/.test(errorText)) {
      throw new CreateOrderError('No hay stock suficiente para completar el pedido. Revisá las cantidades e intentá nuevamente.', 'stock')
    }
    if (/m[eé]todo.{0,20}pago|payment.{0,20}method|transferencia|contraentrega/.test(errorText)) {
      throw new CreateOrderError('El método de pago seleccionado no es válido. Elegí una opción e intentá nuevamente.', 'payment_method')
    }
    if (/tel[eé]fono|celular|phone/.test(errorText)) {
      throw new CreateOrderError('El número de celular no es válido. Revisalo e intentá nuevamente.', 'phone')
    }
    throw new CreateOrderError('No pudimos crear el pedido. Intentá nuevamente en unos instantes.')
  }

  return parseCreatedOrder(data)
}
