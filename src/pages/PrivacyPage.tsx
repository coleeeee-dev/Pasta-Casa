import { useBusinessConfig } from '../context/BusinessConfigContext'
import type { ReactNode } from 'react'

const EMAIL = 'ulises_santy@live.com.ar'

export function PrivacyPage() {
  const { config, loading } = useBusinessConfig()
  const businessName = config?.nombre_negocio ?? 'Pastas Caseras - Concepcion'
  const whatsapp = config?.whatsapp ?? (loading ? 'Cargando…' : 'WhatsApp no disponible')

  return <main className="inner-page privacy-page">
    <header className="page-hero privacy-hero">
      <p className="eyebrow">Privacidad y datos personales</p>
      <h1>Política de Privacidad</h1>
      <div className="privacy-metadata" aria-label="Información de vigencia">
        <span>Última actualización: 9 de agosto de 2026</span>
        <span>Versión: 2026-08</span>
      </div>
    </header>

    <article className="privacy-content">
      <PolicySection number="1" title="Responsable del tratamiento">
        <p>{businessName} es un emprendimiento gestionado por Ulises Santiago González.</p>
        <p>Para consultas relacionadas con esta Política de Privacidad o con el tratamiento de datos personales, el titular puede comunicarse mediante:</p>
        <dl className="privacy-contact-list">
          <div><dt>Domicilio</dt><dd>San Martín 2681, Concepción</dd></div>
          <div><dt>Correo electrónico</dt><dd><a href={`mailto:${EMAIL}`}>{EMAIL}</a></dd></div>
          <div><dt>WhatsApp</dt><dd aria-live="polite">{whatsapp}</dd></div>
        </dl>
      </PolicySection>

      <PolicySection number="2" title="Datos que recopilamos">
        <p>Al realizar un pedido mediante la tienda se recopila únicamente la información necesaria para gestionarlo:</p>
        <ul>
          <li>nombre;</li>
          <li>apellido;</li>
          <li>número de celular;</li>
          <li>productos y cantidades solicitadas;</li>
          <li>método de pago seleccionado;</li>
          <li>total y estado del pedido;</li>
          <li>código, fecha y hora asociados al pedido;</li>
          <li>registro de la autorización relativa a la transferencia internacional de los datos.</li>
        </ul>
        <p>La tienda no solicita DNI, datos de tarjetas, credenciales bancarias ni una dirección de correo electrónico para realizar pedidos.</p>
        <p>Si el usuario se comunica voluntariamente mediante correo electrónico o WhatsApp, podrá tratarse adicionalmente la información que proporcione mediante dichos canales.</p>
      </PolicySection>

      <PolicySection number="3" title="Finalidad del tratamiento">
        <p>Los datos personales recopilados mediante la tienda se utilizan exclusivamente para:</p>
        <ul>
          <li>registrar y gestionar el pedido;</li>
          <li>reservar los productos solicitados;</li>
          <li>gestionar y verificar el pago cuando corresponda;</li>
          <li>contactar al cliente en relación con su pedido;</li>
          <li>coordinar la entrega;</li>
          <li>atender consultas o inconvenientes relacionados con la compra.</li>
        </ul>
        <p>Los datos recopilados mediante el checkout no se utilizan para campañas publicitarias ni se venden a terceros.</p>
        <p>Los datos solicitados mediante el formulario son necesarios para registrar y gestionar el pedido. Si no son proporcionados, el pedido no podrá procesarse mediante la tienda.</p>
      </PolicySection>

      <PolicySection number="4" title="Almacenamiento y transferencia internacional">
        <p>Para almacenar y gestionar la información de los pedidos se utiliza Supabase como proveedor tecnológico.</p>
        <p>La base de datos principal utilizada por esta tienda se encuentra alojada en Oregon, Estados Unidos.</p>
        <p>En consecuencia, los datos necesarios para gestionar el pedido son transferidos y almacenados fuera de la República Argentina.</p>
        <p>Antes de confirmar un pedido, el usuario debe otorgar expresamente su autorización para esta transferencia internacional.</p>
        <p>Si dicha autorización no es otorgada, el pedido no podrá registrarse mediante el formulario de la tienda.</p>
      </PolicySection>

      <PolicySection number="5" title="Proveedores y servicios externos">
        <p>Para el funcionamiento de la tienda se utilizan servicios tecnológicos de terceros.</p>
        <dl className="provider-list">
          <div><dt>Supabase</dt><dd>Se utiliza para el almacenamiento de información de pedidos y el funcionamiento de la base de datos.</dd></div>
          <div><dt>Netlify</dt><dd>Se utiliza para el alojamiento y publicación de la tienda web.</dd></div>
          <div><dt>WhatsApp</dt><dd>Se utiliza para las comunicaciones relacionadas con pedidos, coordinación de entregas y envío de comprobantes cuando corresponda.</dd></div>
        </dl>
        <p>Cuando el usuario decide utilizar servicios de terceros, el tratamiento realizado por dichos proveedores también puede encontrarse sujeto a sus propias políticas de privacidad y condiciones de uso.</p>
      </PolicySection>

      <PolicySection number="6" title="Comprobantes de transferencia">
        <p>Los comprobantes de transferencia no se cargan ni almacenan dentro de la tienda web.</p>
        <p>Cuando corresponda, el comprobante es enviado directamente mediante WhatsApp.</p>
        <p>La información proporcionada voluntariamente mediante dicho canal será utilizada para identificar y verificar el pago del pedido y para las comunicaciones relacionadas con este.</p>
      </PolicySection>

      <PolicySection number="7" title="Seguridad de la información">
        <p>Se aplican medidas técnicas y controles de acceso destinados a proteger la información contra accesos, modificaciones o usos no autorizados.</p>
        <p>El acceso a la información de los pedidos se encuentra limitado a los administradores autorizados del emprendimiento.</p>
        <p>Ningún sistema informático puede garantizar una seguridad absoluta. No obstante, se mantienen medidas razonables de protección acordes con el tipo de información tratada.</p>
      </PolicySection>

      <PolicySection number="8" title="Conservación de los datos">
        <p>Los datos serán conservados durante el tiempo necesario para gestionar el pedido y atender consultas, reclamos u obligaciones que pudieran corresponder posteriormente.</p>
        <p>Cuando los datos hayan dejado de ser necesarios para las finalidades para las cuales fueron recopilados y no exista una obligación que requiera su conservación, podrán ser eliminados o anonimizados.</p>
      </PolicySection>

      <PolicySection number="9" title="Derechos del titular de los datos">
        <p>El titular puede solicitar el acceso a su información personal, así como su actualización, rectificación o, cuando corresponda, supresión.</p>
        <p>Las solicitudes pueden enviarse a:</p>
        <p><a className="privacy-email" href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
        <p>La solicitud deberá contener la información necesaria para identificar al titular y, cuando corresponda, el pedido relacionado.</p>
        <p>El derecho de acceso puede ejercerse gratuitamente conforme a la legislación aplicable.</p>
        <p>Las solicitudes de acceso deberán ser respondidas dentro de los plazos establecidos por la normativa vigente. Lo mismo será aplicable a las solicitudes de actualización, rectificación o supresión.</p>
        <p>La Agencia de Acceso a la Información Pública (AAIP) es la autoridad de control en materia de protección de datos personales en la República Argentina y se encuentra facultada para recibir denuncias y reclamos relacionados con el incumplimiento de las normas sobre protección de datos personales.</p>
      </PolicySection>

      <PolicySection number="10" title="Publicidad y seguimiento">
        <p>Actualmente los datos proporcionados al realizar pedidos no se utilizan para publicidad, elaboración de perfiles comerciales ni envío de promociones.</p>
        <p>Si en el futuro se incorporan nuevas finalidades de tratamiento, esta Política de Privacidad será actualizada y, cuando corresponda, se solicitarán las autorizaciones necesarias.</p>
      </PolicySection>

      <PolicySection number="11" title="Modificaciones de esta política">
        <p>La presente Política de Privacidad puede actualizarse cuando se modifiquen las funcionalidades de la tienda, los proveedores tecnológicos utilizados o las condiciones bajo las cuales se trata la información personal.</p>
        <p>La fecha y la versión de la política vigente estarán disponibles en esta misma página.</p>
      </PolicySection>
    </article>
  </main>
}

function PolicySection({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <section className="privacy-section" aria-labelledby={`privacy-section-${number}`}>
    <h2 id={`privacy-section-${number}`}><span>{number}.</span> {title}</h2>
    {children}
  </section>
}
