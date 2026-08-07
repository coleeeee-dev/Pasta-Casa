import type { EmailPreview, Order } from '../types'
import { formatARS } from '../utils/currency'
import { formatDozens, formatFullProductName } from '../utils/dozens'

export function simulateOrderEmail(order: Order): EmailPreview {
  const products = order.items.map(({ product, quantity }) =>
    `${formatDozens(quantity)} × ${formatFullProductName(product)}\nPrecio por docena: ${formatARS(product.precio)}\nSubtotal: ${formatARS(product.precio * quantity)}`
  ).join('\n')
  const preview = {
    subject: `Pedido ${order.code} recibido - Pendiente de pago`,
    recipient: order.customer.email,
    body: [
      'SIMULACIÓN — ESTE CORREO NO FUE ENVIADO', '',
      `Hola ${order.customer.nombre} ${order.customer.apellido},`, '',
      `Recibimos tu pedido ${order.code}.`, '', products, '',
      `Total: ${formatARS(order.total)}`, '',
      'En una próxima versión recibirías las instrucciones para realizar el pago.', '',
      'Gracias por elegir Pasta Casa.',
    ].join('\n'),
  }
  if (import.meta.env?.DEV) console.info('[Pasta Casa] Vista previa de correo simulado', preview)
  return preview
}
