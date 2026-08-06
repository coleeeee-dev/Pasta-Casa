import type { CustomerData } from '../types'

export type CustomerErrors = Partial<Record<keyof CustomerData, string>>

export function validateCustomer(data: CustomerData): CustomerErrors {
  const errors: CustomerErrors = {}
  if (data.nombre.trim().length < 2) errors.nombre = 'Ingresá un nombre de al menos 2 caracteres.'
  if (data.apellido.trim().length < 2) errors.apellido = 'Ingresá un apellido de al menos 2 caracteres.'
  if (!/^\d{7,9}$/.test(data.dni)) errors.dni = 'El DNI debe contener entre 7 y 9 números.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = 'Ingresá un correo electrónico válido.'
  if (!data.reviewed) errors.reviewed = 'Necesitamos que confirmes la revisión del pedido.'
  return errors
}
