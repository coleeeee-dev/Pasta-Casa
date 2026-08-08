import type { OrderStatus, PaymentMethod } from '../types'

export interface OrderFulfillmentConfig {
  whatsappUrl: string | null
  transferAlias: string | null
  transferCbuCvu: string | null
  transferQrUrl: string | null
  paymentWindowHours: number
}

// Configuración local pendiente de reemplazo por valores administrados desde Supabase.
export const pendingOrderFulfillmentConfig: OrderFulfillmentConfig = {
  whatsappUrl: null,
  transferAlias: null,
  transferCbuCvu: null,
  transferQrUrl: null,
  paymentWindowHours: 2,
}

export function formatPaymentMethod(method: PaymentMethod): string {
  return method === 'transferencia' ? 'Transferencia bancaria' : 'Pago contraentrega'
}

const orderStatusLabels: Record<OrderStatus, string> = {
  pendiente_pago: 'Pendiente de pago',
  pendiente_coordinacion: 'Pendiente de coordinación',
  pago_confirmado: 'Pago confirmado',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

export function formatOrderStatus(status: OrderStatus): string {
  return orderStatusLabels[status]
}
