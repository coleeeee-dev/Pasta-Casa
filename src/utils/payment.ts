import type { OrderStatus, PaymentMethod } from '../types'

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
