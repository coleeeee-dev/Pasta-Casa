export interface BusinessConfig {
  transfer: {
    cbu: string
    taxId: string
    accountHolder: string
    paymentWindowHours: number
  }
  whatsapp: {
    displayNumber: string
  }
}

// Fuente única local. Puede sustituirse por configuración de Supabase sin cambiar el checkout.
export const businessConfig: BusinessConfig = {
  transfer: {
    cbu: '0070089430004269708416',
    taxId: '20-42468452-0',
    accountHolder: 'Ulises Santiago González',
    paymentWindowHours: 2,
  },
  whatsapp: {
    displayNumber: '+54 9 3865 38-5579',
  },
}
