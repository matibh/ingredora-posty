import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Cookies | Posty',
  description: 'Información sobre el uso de cookies en Posty y cómo gestionarlas.',
}

export default function CookiesPage() {
  return (
    <div style={{ backgroundColor: '#181E26' }} className="flex-1">
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="mb-10">
          <Link href="/" className="text-xs font-semibold text-[#1A6B8A] hover:text-[#7AD0E8] transition-colors mb-6 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tighter text-[#F0F4F8] mb-3">Política de Cookies</h1>
          <p className="text-sm text-[#6A7E94]">Última actualización: 25 de junio de 2025</p>
        </div>

        <div className="space-y-10">
          <Section title="¿Qué son las cookies?">
            <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitás un sitio web. Permiten que el sitio recuerde tu sesión, preferencias y otros datos para mejorar la experiencia.</p>
          </Section>

          <Section title="Tipos de cookies que usamos">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Propósito</th>
                  <th>Duración</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Esenciales</strong></td>
                  <td>Mantener tu sesión iniciada y el funcionamiento básico de la plataforma</td>
                  <td>Sesión / 7 días</td>
                </tr>
                <tr>
                  <td><strong>Analíticas</strong></td>
                  <td>Entender cómo se usa la plataforma para mejorarla (datos anónimos)</td>
                  <td>13 meses</td>
                </tr>
                <tr>
                  <td><strong>Funcionales</strong></td>
                  <td>Recordar tus preferencias de idioma y vista</td>
                  <td>1 año</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title="Cookies de terceros">
            <p>Algunos de nuestros proveedores pueden instalar sus propias cookies:</p>
            <ul>
              <li><strong>Supabase:</strong> para autenticación y gestión de sesión.</li>
              <li><strong>Stripe:</strong> para el procesamiento seguro de pagos.</li>
              <li><strong>Vercel Analytics:</strong> para estadísticas de rendimiento.</li>
            </ul>
          </Section>

          <Section title="Cómo gestionar las cookies">
            <p>Podés controlar y eliminar cookies desde la configuración de tu navegador:</p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Chrome</a></li>
              <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-que-los-sitios-we" target="_blank" rel="noopener noreferrer">Firefox</a></li>
              <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
            </ul>
            <p className="mt-3">Tené en cuenta que deshabilitar cookies esenciales puede afectar el funcionamiento de la plataforma.</p>
          </Section>

          <Section title="Contacto">
            <p>Consultas sobre nuestra política de cookies: <a href="mailto:privacidad@posty.app">privacidad@posty.app</a></p>
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
      <div className="text-sm text-[#A8B8C8] leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_strong]:text-[#F0F4F8] [&_a]:text-[#1A6B8A] [&_a]:hover:underline [&_table]:w-full [&_table]:border-collapse [&_th]:text-left [&_th]:py-2 [&_th]:px-3 [&_th]:border-b [&_th]:border-[#334155] [&_th]:text-[#F0F4F8] [&_th]:font-semibold [&_td]:py-2 [&_td]:px-3 [&_td]:border-b [&_td]:border-[#334155]/50">
        {children}
      </div>
    </section>
  )
}
