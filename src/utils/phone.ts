export function normalizePhone(phone: string): string {
  return phone.replace(/[\s()+-]/g, '')
}

export function isValidPhone(phone: string): boolean {
  return /^\d{8,15}$/.test(normalizePhone(phone))
}
