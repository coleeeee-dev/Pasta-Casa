export function getWhatsAppUrlNumber(whatsapp: string): string {
  return whatsapp.replace(/\D/g, '')
}

export function buildWhatsAppUrl(whatsapp: string, message: string): string {
  return `https://wa.me/${getWhatsAppUrlNumber(whatsapp)}?text=${encodeURIComponent(message)}`
}

export function getTransferWhatsAppMessage(orderCode: string): string {
  return `Hola, realicé el pago del pedido ${orderCode}.\nAdjunto mi comprobante.`
}

export function getDeliveryWhatsAppMessage(orderCode: string): string {
  return `Hola, quiero coordinar la entrega del pedido ${orderCode}.\n\nDirección:\nPago con:`
}
