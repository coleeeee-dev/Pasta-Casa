export interface Product {
  id: string
  codigo: string
  nombre: string
  variante: string
  descripcion: string
  presentacion: string
  precio: number
  stock: number
  imagen: string
  activo: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface CustomerData {
  nombre: string
  apellido: string
  dni: string
  email: string
  reviewed: boolean
}

export interface Order {
  code: string
  customer: CustomerData
  items: CartItem[]
  total: number
  createdAt: string
}

export interface EmailPreview {
  subject: string
  recipient: string
  body: string
}
