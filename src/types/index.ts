export interface Product {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  presentacion: string
  precio: number
  stock: number
  imagen: string | null
  activo: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export type PaymentMethod = 'transferencia' | 'contraentrega'
export type OrderStatus = 'pendiente_pago' | 'pendiente_coordinacion' | 'pago_confirmado' | 'completado' | 'cancelado'

export interface CustomerData {
  nombre: string
  apellido: string
  telefono: string
  metodoPago: PaymentMethod | null
}

export interface Order {
  id: string
  code: string
  status: OrderStatus
  metodoPago: PaymentMethod
  customer: CustomerData
  items: CartItem[]
  total: number
}

export interface PublicBusinessConfig {
  id: number
  nombre_negocio: string
  whatsapp: string
  cbu: string
  identificacion_fiscal: string
  titular: string
  horas_limite_pago: number
  updated_at: string
}
