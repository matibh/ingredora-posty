import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos y Condiciones | Posty',
  description: 'Lee los términos y condiciones de uso de Posty, la plataforma de publicación automatizada en redes sociales.',
}

export default function TerminosPage() {
  return (
    <div style={{ backgroundColor: '#181E26' }} className="flex-1">
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="mb-10">
          <Link href="/" className="text-xs font-semibold text-[#1A6B8A] hover:text-[#7AD0E8] transition-colors mb-6 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tighter text-[#F0F4F8] mb-3">Términos y Condiciones</h1>
          <p className="text-sm text-[#6A7E94]">Última actualización: 25 de junio de 2025</p>
        </div>

        <div className="prose-posty space-y-10">
          <Section title="1. Aceptación de los términos">
            <p>Al acceder y utilizar Posty (&quot;la Plataforma&quot;), aceptás estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no podrás usar nuestros servicios.</p>
          </Section>

          <Section title="2. Descripción del servicio">
            <p>Posty es una plataforma SaaS que permite a <strong>community managers y agencias</strong> gestionar la publicación automatizada de contenido en múltiples redes sociales (YouTube, Instagram, Facebook, TikTok, Pinterest, X y Threads) para distintos clientes desde un único panel de control.</p>
          </Section>

          <Section title="3. Registro y cuenta">
            <ul>
              <li>Debés tener al menos 18 años para usar Posty.</li>
              <li>Sos responsable de mantener la confidencialidad de tus credenciales de acceso.</li>
              <li>Nos reservamos el derecho de suspender cuentas que infrinjan estos términos.</li>
              <li>Cada cuenta es personal e intransferible.</li>
            </ul>
          </Section>

          <Section title="4. Uso aceptable">
            <p>Al usar Posty, te comprometés a:</p>
            <ul>
              <li>No publicar contenido ilegal, ofensivo, discriminatorio o que viole derechos de terceros.</li>
              <li>No intentar acceder a cuentas ajenas o comprometer la seguridad de la plataforma.</li>
              <li>Respetar los Términos de Servicio de cada red social integrada.</li>
              <li>No usar la plataforma para envío masivo de spam.</li>
            </ul>
          </Section>

          <Section title="5. Propiedad intelectual">
            <p>Todo el contenido publicado por vos a través de Posty sigue siendo tuyo. Al subirlo, nos otorgás una licencia limitada y no exclusiva para procesarlo y distribuirlo en tu nombre. Posty y sus logos, diseño e interfaz son propiedad de Posty SAS y están protegidos por las leyes de propiedad intelectual.</p>
          </Section>

          <Section title="6. Planes y pagos">
            <ul>
              <li>Los precios de cada plan se detallan en la página de Precios y pueden cambiar con previo aviso de 30 días.</li>
              <li>Los planes se renuevan automáticamente al vencimiento.</li>
              <li>No ofrecemos reembolsos por períodos ya utilizados, salvo que la ley lo exija.</li>
            </ul>
          </Section>

          <Section title="7. Limitación de responsabilidad">
            <p>Posty no garantiza la disponibilidad ininterrumpida del servicio. En la máxima medida permitida por la ley, Posty no será responsable por daños indirectos, incidentales o pérdida de datos derivados del uso de la plataforma.</p>
          </Section>

          <Section title="8. Modificaciones">
            <p>Posty puede actualizar estos términos en cualquier momento. Los cambios serán notificados por correo electrónico y/o mediante un aviso en la plataforma. El uso continuado del servicio implica la aceptación de los nuevos términos.</p>
          </Section>

          <Section title="9. Ley aplicable">
            <p>Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa se someterá a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.</p>
          </Section>

          <Section title="10. Contacto">
            <p>Para consultas sobre estos términos, escribinos a <a href="mailto:legal@posty.app" className="text-[#1A6B8A] hover:underline">legal@posty.app</a>.</p>
          </Section>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="p-7 rounded-2xl border border-[#334155] bg-[#232B36]">
      <h2 className="text-lg font-bold text-[#F0F4F8] mb-4">{title}</h2>
      <div className="text-sm text-[#A8B8C8] leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_strong]:text-[#F0F4F8] [&_a]:text-[#1A6B8A]">
        {children}
      </div>
    </section>
  )
}
