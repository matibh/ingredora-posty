import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad | Posty',
  description: 'Conocé cómo Posty recopila, usa y protege tu información personal de acuerdo con la normativa vigente.',
}

export default function PrivacidadPage() {
  return (
    <div style={{ backgroundColor: '#181E26' }} className="flex-1">
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="mb-10">
          <Link href="/" className="text-xs font-semibold text-[#1A6B8A] hover:text-[#7AD0E8] transition-colors mb-6 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tighter text-[#F0F4F8] mb-3">Política de Privacidad</h1>
          <p className="text-sm text-[#6A7E94]">Última actualización: 25 de junio de 2025</p>
        </div>

        <div className="space-y-10">
          <Section title="1. Responsable del tratamiento">
            <p>El responsable del tratamiento de tus datos personales es <strong>Posty SAS</strong>, con domicilio en la Ciudad Autónoma de Buenos Aires, Argentina. Contacto de privacidad: <a href="mailto:privacidad@posty.app">privacidad@posty.app</a>.</p>
          </Section>

          <Section title="2. Datos que recopilamos">
            <p>Recopilamos los siguientes datos cuando utilizás la plataforma:</p>
            <ul>
              <li><strong>Datos de cuenta:</strong> nombre, correo electrónico y contraseña cifrada.</li>
              <li><strong>Datos de uso:</strong> páginas visitadas, funciones usadas, y registros de actividad.</li>
              <li><strong>Tokens de autenticación:</strong> para conectar tus cuentas de redes sociales de forma segura.</li>
              <li><strong>Contenido subido:</strong> videos e imágenes que procesamos para publicar.</li>
              <li><strong>Datos de facturación:</strong> procesados directamente por nuestro proveedor de pagos, Stripe. No almacenamos datos de tarjetas.</li>
            </ul>
          </Section>

          <Section title="3. Finalidades del tratamiento">
            <ul>
              <li>Proveer y mantener el servicio de Posty.</li>
              <li>Gestionar tu cuenta y autenticación.</li>
              <li>Procesar pagos y emitir facturas.</li>
              <li>Enviarte comunicaciones relacionadas con el servicio (actualizaciones, alertas de seguridad).</li>
              <li>Mejorar la plataforma mediante análisis de uso.</li>
            </ul>
          </Section>

          <Section title="4. Base legal del tratamiento">
            <p>El tratamiento de tus datos se basa en:</p>
            <ul>
              <li><strong>Ejecución de contrato:</strong> para prestarte el servicio contratado.</li>
              <li><strong>Consentimiento:</strong> para el envío de comunicaciones opcionales.</li>
              <li><strong>Interés legítimo:</strong> para mejorar la seguridad y calidad de la plataforma.</li>
            </ul>
          </Section>

          <Section title="5. Almacenamiento y seguridad">
            <p>Tus datos se almacenan en servidores seguros provistos por Supabase y Vercel, con cifrado en tránsito (TLS) y en reposo. Aplicamos medidas técnicas y organizativas para proteger tu información frente a accesos no autorizados.</p>
          </Section>

          <Section title="6. Compartición de datos">
            <p>No vendemos tus datos. Solo los compartimos con:</p>
            <ul>
              <li>Proveedores de infraestructura (Supabase, Vercel, Stripe).</li>
              <li>APIs de redes sociales, en la medida necesaria para publicar tu contenido.</li>
              <li>Autoridades legales, si fuera requerido por ley.</li>
            </ul>
          </Section>

          <Section title="7. Retención de datos">
            <p>Conservamos tus datos mientras tu cuenta esté activa. Al eliminar tu cuenta, los datos son borrados en un plazo de 30 días, salvo obligación legal de conservación.</p>
          </Section>

          <Section title="8. Tus derechos">
            <p>Tenés derecho a acceder, rectificar, suprimir, portar y oponerte al tratamiento de tus datos. Para ejercerlos, escribinos a <a href="mailto:privacidad@posty.app">privacidad@posty.app</a>. Respondemos en un plazo máximo de 30 días hábiles.</p>
          </Section>

          <Section title="9. Cookies">
            <p>Usamos cookies esenciales para el funcionamiento de la plataforma y cookies analíticas para entender el uso. Consultá nuestra <Link href="/legal/cookies">Política de Cookies</Link> para más información.</p>
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
      <div className="text-sm text-[#A8B8C8] leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_strong]:text-[#F0F4F8] [&_a]:text-[#1A6B8A] [&_a]:hover:underline">
        {children}
      </div>
    </section>
  )
}
