import Link from 'next/link'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import TopNavbar from '@/components/TopNavbar'

export const metadata: Metadata = {
  title: 'Planes y Precios | Posty',
  description: 'Elegí el plan ideal para vos. Empezá gratis y escalá a medida que crecen tus proyectos.',
}

const FAQ = [
  {
    q: '¿Puedo cambiar de plan cuando quiera?',
    a: 'Sí. Podés actualizar o cambiar tu plan en cualquier momento desde tu cuenta. El cambio se reflejará automáticamente en el próximo ciclo de facturación.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Aceptamos tarjetas de crédito y débito mediante Mercado Pago y Stripe. Para el plan Agency también ofrecemos transferencia bancaria.',
  },
  {
    q: '¿Existe un descuento anual?',
    a: 'Sí. Al contratar un plan anual obtenés un 20% de descuento sobre el valor mensual.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. No existen contratos de permanencia. Podés cancelar cuando quieras y conservarás el acceso hasta finalizar el período abonado.',
  },
  {
    q: '¿Qué sucede cuando alcanzo el límite del plan Free?',
    a: 'No podrás realizar nuevas publicaciones hasta el siguiente mes o hasta actualizar a un plan superior.',
  },
]

export default async function PreciosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userPlan = 'free'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
    if (profile?.plan) userPlan = profile.plan.toLowerCase()
  }

  return (
    <div className="flex flex-col w-full">
      <TopNavbar user={user ? { email: user.email } : null} />

      <main className="flex-1 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

        {/* HERO */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-5" style={{ color: '#F0F4F8' }}>
            Planes y Precios
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: '#A8B8C8' }}>
            Elegí el plan ideal para vos. Empezá gratis y escalá a medida que crecen tus proyectos.
          </p>
        </div>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-24 max-w-6xl mx-auto items-start">

          {/* FREE */}
          <PlanCard
            badge="Para empezar"
            badgeColor="#6A7E94"
            name="Free"
            price="$0"
            period="/ mes"
            description="Ideal para conocer Posty."
            isActive={userPlan === 'free'}
            buttonHref="/register"
            buttonLabel="Comenzar gratis"
            buttonStyle="outline"
            features={[
              { text: '1 cliente' },
              { text: '5 publicaciones por mes' },
              { text: 'YouTube e Instagram' },
              { text: 'Firma "✨ Publicado con Posty"', muted: true },
              { text: 'Soporte por email' },
            ]}
          />

          {/* STARTER */}
          <PlanCard
            badge="Ideal para creadores"
            badgeColor="#F59E0B"
            name="Starter"
            price="$4.990"
            period="ARS / mes"
            description="Para creadores que recién comienzan."
            isActive={userPlan === 'starter'}
            buttonHref="/checkout?plan=starter"
            buttonLabel="Elegir Starter"
            buttonStyle="outline"
            features={[
              { text: 'Hasta 3 clientes' },
              { text: '50 publicaciones por mes' },
              { text: 'YouTube, Instagram, Facebook, TikTok' },
              { text: 'Sin firma de Posty' },
              { text: 'Estadísticas básicas' },
              { text: 'Soporte por email' },
            ]}
          />

          {/* PRO — destacado */}
          <PlanCard
            badge="Más popular"
            badgeColor="#7AD0E8"
            name="Pro"
            price="$14.990"
            period="ARS / mes"
            description="Para community managers y profesionales."
            isActive={userPlan === 'pro'}
            isPro
            buttonHref="/checkout?plan=pro"
            buttonLabel="Suscribirme"
            buttonStyle="primary"
            features={[
              { text: 'Clientes ilimitados' },
              { text: 'Publicaciones ilimitadas' },
              { text: 'Todas las redes disponibles' },
              { text: 'Sin firma de Posty' },
              { text: 'Estadísticas básicas' },
              { text: 'Publicación simultánea' },
              { text: 'Soporte prioritario' },
            ]}
          />

          {/* AGENCY */}
          <PlanCard
            badge="Para equipos"
            badgeColor="#A78BFA"
            name="Agency"
            price="$39.990"
            period="ARS / mes"
            description="Pensado para agencias y equipos."
            isActive={userPlan === 'agency'}
            buttonHref="/contacto"
            buttonLabel="Contactar ventas"
            buttonStyle="outline"
            features={[
              { text: 'Todo lo del plan Pro' },
              { text: 'Hasta 5 usuarios' },
              { text: 'Analytics avanzados' },
              { text: 'API pública (MCP)' },
              { text: 'Programa de afiliados' },
              { text: 'Acceso anticipado a nuevas funciones' },
              { text: 'Soporte prioritario 24/7' },
            ]}
          />
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-24 max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-10" style={{ color: '#F0F4F8' }}>
            Compará los planes a fondo
          </h2>
          <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: '#334155', backgroundColor: '#181E26' }}>
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b" style={{ borderColor: '#334155', backgroundColor: '#1C2430' }}>
                  <th className="py-5 px-6 font-bold text-sm" style={{ color: '#F0F4F8' }}>Característica</th>
                  <th className="py-5 px-4 font-bold text-sm text-center" style={{ color: '#6A7E94' }}>Free</th>
                  <th className="py-5 px-4 font-bold text-sm text-center" style={{ color: '#F59E0B' }}>Starter</th>
                  <th className="py-5 px-4 font-bold text-sm text-center" style={{ color: '#7AD0E8' }}>Pro</th>
                  <th className="py-5 px-4 font-bold text-sm text-center" style={{ color: '#A78BFA' }}>Agency</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#1E2A38]">
                <TableRow label="Clientes" free="1" starter="3" pro="Ilimitados" agency="Ilimitados" />
                <TableRow label="Publicaciones/mes" free="5" starter="50" pro="Ilimitadas" agency="Ilimitadas" />
                <TableRow label="YouTube" free={true} starter={true} pro={true} agency={true} />
                <TableRow label="Instagram" free={true} starter={true} pro={true} agency={true} />
                <TableRow label="Facebook" free={false} starter={true} pro={true} agency={true} />
                <TableRow label="TikTok" free={false} starter={true} pro={true} agency={true} />
                <TableRow label="Próximas redes" free={false} starter={true} pro={true} agency={true} />
                <TableRow label='Firma "Publicado con Posty"' free={true} starter={false} pro={false} agency={false} />
                <TableRow label="Estadísticas" free={false} starter="Básicas" pro="Básicas" agency="Avanzadas" />
                <TableRow label="Colaboración" free={false} starter={false} pro={false} agency="Hasta 5 usuarios" />
                <TableRow label="API (MCP)" free={false} starter={false} pro={false} agency={true} />
                <TableRow label="Programa de afiliados" free={false} starter={false} pro={false} agency={true} />
                <TableRow label="Soporte" free="Email" starter="Email" pro="Prioritario" agency="24/7" />
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl font-extrabold text-center mb-10" style={{ color: '#F0F4F8' }}>
            Preguntas frecuentes
          </h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <details key={i} className="group rounded-2xl border overflow-hidden" style={{ borderColor: '#334155', backgroundColor: '#181E26' }}>
                <summary className="flex items-center justify-between cursor-pointer p-5 font-semibold list-none select-none" style={{ color: '#F0F4F8' }}>
                  {item.q}
                  <span className="transition-transform group-open:rotate-180 ml-4 shrink-0" style={{ color: '#1A6B8A' }}>
                    <svg fill="none" height="20" viewBox="0 0 24 24" width="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: '#A8B8C8' }}>
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}

/* ─── Plan Card Component ─────────────────────────── */
function PlanCard({
  badge, badgeColor, name, price, period, description,
  isActive, isPro, buttonHref, buttonLabel, buttonStyle, features,
}: {
  badge: string
  badgeColor: string
  name: string
  price: string
  period: string
  description: string
  isActive?: boolean
  isPro?: boolean
  buttonHref: string
  buttonLabel: string
  buttonStyle: 'primary' | 'outline'
  features: { text: string; muted?: boolean }[]
}) {
  return (
    <div
      className={`relative flex flex-col rounded-3xl p-7 border transition-all ${isPro ? 'md:-translate-y-4 md:shadow-2xl' : ''}`}
      style={{
        backgroundColor: isPro ? '#1C2736' : '#181E26',
        borderColor: isPro ? '#1A6B8A' : isActive ? '#6BCB77' : '#334155',
        boxShadow: isPro ? '0 0 40px rgba(26,107,138,0.15)' : undefined,
      }}
    >
      {/* Badge */}
      <div className="mb-5">
        <span
          className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ backgroundColor: `${badgeColor}18`, color: badgeColor, border: `1px solid ${badgeColor}40` }}
        >
          {badge}
        </span>
      </div>

      {/* Name + description */}
      <h3 className="text-xl font-bold mb-1" style={{ color: '#F0F4F8' }}>{name}</h3>
      <p className="text-sm mb-6 h-9" style={{ color: '#6A7E94' }}>{description}</p>

      {/* Price */}
      <div className="mb-1">
        <span className="text-4xl font-extrabold" style={{ color: '#F0F4F8' }}>{price}</span>
        <span className="text-sm ml-1" style={{ color: '#6A7E94' }}>{period}</span>
      </div>
      <p className="text-xs mb-7" style={{ color: '#6A7E94' }}>Sin costos ocultos · Cancelá cuando quieras.</p>

      {/* Button */}
      {isActive ? (
        <div className="w-full py-3.5 rounded-xl text-sm font-bold text-center mb-8 flex items-center justify-center border"
          style={{ color: '#6BCB77', borderColor: '#6BCB77', backgroundColor: 'rgba(107,203,119,0.08)' }}>
          Plan actual activo ✓
        </div>
      ) : (
        <Link
          href={buttonHref}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-center mb-8 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          style={
            buttonStyle === 'primary'
              ? { backgroundColor: '#1A6B8A', color: '#FFFFFF' }
              : { backgroundColor: '#232B36', color: '#F0F4F8', border: '1px solid #334155' }
          }
        >
          {buttonLabel}
        </Link>
      )}

      {/* Features */}
      <ul className="space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              style={{ color: '#6BCB77' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span style={{ color: f.muted ? '#6A7E94' : '#A8B8C8' }}>{f.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─── Table Row Component ─────────────────────────── */
function TableRow({ label, free, starter, pro, agency }: {
  label: string
  free: string | boolean
  starter: string | boolean
  pro: string | boolean
  agency: string | boolean
}) {
  const cell = (val: string | boolean) => {
    if (val === true) return (
      <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: '#6BCB77' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    )
    if (val === false) return <span style={{ color: '#334155' }}>—</span>
    return <span style={{ color: '#A8B8C8' }}>{val}</span>
  }
  return (
    <tr className="hover:bg-[#1C2430] transition-colors">
      <td className="py-3.5 px-6 font-medium text-sm" style={{ color: '#F0F4F8' }}>{label}</td>
      <td className="py-3.5 px-4 text-center text-sm">{cell(free)}</td>
      <td className="py-3.5 px-4 text-center text-sm">{cell(starter)}</td>
      <td className="py-3.5 px-4 text-center text-sm font-semibold">{cell(pro)}</td>
      <td className="py-3.5 px-4 text-center text-sm">{cell(agency)}</td>
    </tr>
  )
}
