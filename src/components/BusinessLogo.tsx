import logoConcepcion from '../assets/branding/logo-concepcion.jpeg'
import { useBusinessConfig } from '../context/BusinessConfigContext'

export function BusinessLogo({ className = '' }: { className?: string }) {
  const { config } = useBusinessConfig()
  const alt = config
    ? `Logo de ${config.nombre_negocio}`
    : 'Logo del negocio de pastas caseras'

  return <img className={`business-logo ${className}`.trim()} src={logoConcepcion} alt={alt} />
}
