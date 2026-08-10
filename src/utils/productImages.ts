import calabazaMozzarellaImage from '../assets/branding/sorrentinos-calabaza-mozzarella.jpeg'
import jamonQuesoImage from '../assets/branding/sorrentinos-jamon-queso.jpeg'
import mozzarellaRicotaNuezImage from '../assets/branding/sorrentinos-mozzarella-ricota-nuez.jpeg'

const productImages: Record<string, string> = {
  'Sorrentinos de jamón y queso': jamonQuesoImage,
  'Sorrentinos de calabaza y mozzarella': calabazaMozzarellaImage,
  'Sorrentinos de mozzarella, ricota y nuez': mozzarellaRicotaNuezImage,
}

export function getProductImage(productName: string): string | null {
  return productImages[productName] ?? null
}
