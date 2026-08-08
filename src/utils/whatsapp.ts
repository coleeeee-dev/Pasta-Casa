import { businessConfig } from '../config/business'

export function getWhatsAppUrlNumber(): string {
  return businessConfig.whatsapp.displayNumber.replace(/\D/g, '')
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${getWhatsAppUrlNumber()}?text=${encodeURIComponent(message)}`
}

export function getTransferWhatsAppMessage(orderCode: string): string {
  return `Hola, realicé el pago del pedido ${orderCode}.\nAdjunto mi comprobante.`
}

export function getDeliveryWhatsAppMessage(orderCode: string): string {
  return `Hola, quiero coordinar la entrega del pedido ${orderCode}.\n\nDirección:\nPago con:`
}
