import Link from 'next/link'
import FlowSection from '@/components/FlowSection'
import TopNavbar from '@/components/TopNavbar'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="flex-1 flex flex-col" style={{ backgroundColor: '#181E26' }}>
      <TopNavbar user={user ? { email: user.email } : null} />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 md:pt-12 pb-32">
        {/* Glow decorativo sutil (único lugar donde usamos el cian) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 70% 30%, rgba(122,208,232,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
            style={{ backgroundColor: 'rgba(26,107,138,0.15)', color: '#7AD0E8', border: '1px solid rgba(26,107,138,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#7AD0E8' }} />
            Ya disponible — distribuye a todas tus redes a la vez
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-6"
            style={{ color: '#F0F4F8', lineHeight: '1.1' }}
          >
            Publicá una vez.<br />
            <span style={{ color: '#1A6B8A' }}>Llegá a todas tus redes.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xl leading-relaxed mb-10" style={{ color: '#A8B8C8' }}>
            Administrá todas tus redes sociales desde un solo lugar. Publicá simultáneamente en YouTube, Instagram, Facebook, TikTok y las nuevas plataformas que iremos incorporando.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
              style={{ backgroundColor: '#1A6B8A' }}
            >
              Comenzar gratis
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/precios"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-200 hover:bg-[#334155]"
              style={{ color: '#F0F4F8', border: '1px solid #334155', backgroundColor: '#232B36' }}
            >
              Ver precios
            </Link>
          </div>

          {/* Flow visual artístico */}
          <div className="mt-20">
            <FlowSection />
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────────────── */}
      <section className="py-24 border-t" style={{ borderColor: '#334155', backgroundColor: '#181E26' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold mb-3 tracking-tight" style={{ color: '#F0F4F8' }}>Tres pasos. Nada más.</h2>
            <p className="text-lg leading-relaxed" style={{ color: '#A8B8C8' }}>No necesitas conocimientos técnicos ni hacer malabarismos entre apps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: '1',
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                ),
                title: 'Conecta tus redes',
                desc: 'Vincula YouTube, Instagram, Facebook y TikTok una sola vez con OAuth seguro.',
              },
              {
                step: '2',
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                ),
                title: 'Sube tu video',
                desc: 'Arrastra tu video ya editado. Soportamos MP4, MOV, AVI y más hasta 500 MB.',
              },
              {
                step: '3',
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                ),
                title: 'Publica en un clic',
                desc: 'Posty distribuye en paralelo a todas tus plataformas en menos de 10 segundos.',
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="text-center flex flex-col items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
                  style={{ backgroundColor: '#232B36', color: '#1A6B8A', border: '1px solid #334155' }}
                >
                  {icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 tracking-tight" style={{ color: '#F0F4F8' }}>{title}</h3>
                  <p className="leading-relaxed" style={{ color: '#A8B8C8' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARACTERÍSTICAS ──────────────────────────────────────── */}
      <section id="features" className="py-24 border-t" style={{ borderColor: '#334155', backgroundColor: '#181E26' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold mb-3 tracking-tight" style={{ color: '#F0F4F8' }}>¿Por qué Posty?</h2>
            <p className="text-lg leading-relaxed" style={{ color: '#A8B8C8' }}>Diseñado para creadores que valoran su tiempo y su marca.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { emoji: '⚡', title: 'Publicación instantánea', desc: 'Distribuimos en paralelo — el tiempo total es el de la red más lenta, no la suma de todas.' },
              { emoji: '🔒', title: 'OAuth seguro', desc: 'Usamos OAuth 2.0 oficial. Nunca guardamos tus contraseñas; solo los tokens necesarios.' },
              { emoji: '🌍', title: '4 plataformas, 1 clic', desc: 'YouTube, Instagram, Facebook y TikTok. Tu contenido llega a donde está tu audiencia.' },
              { emoji: '📊', title: 'Historial completo', desc: 'Ve el estado de cada publicación, cuándo se hizo y en qué plataformas fue exitosa.' },
            ].map(({ emoji, title, desc }) => (
              <div
                key={title}
                className="p-8 rounded-2xl shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ backgroundColor: '#232B36', border: '1px solid #334155' }}
              >
                <div className="text-4xl mb-4">{emoji}</div>
                <h3 className="text-xl font-bold mb-2 tracking-tight" style={{ color: '#F0F4F8' }}>{title}</h3>
                <p className="leading-relaxed" style={{ color: '#A8B8C8' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANES Y PRECIOS ─────────────────────────────────────────── */}
      <section id="pricing" className="py-24 border-t" style={{ borderColor: '#334155', backgroundColor: '#0B1E33' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold mb-3 tracking-tight" style={{ color: '#F0F4F8' }}>Planes y Precios</h2>
            <p className="text-lg leading-relaxed" style={{ color: '#A8B8C8' }}>Empezá gratis y escalá a medida que crecen tus proyectos.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {/* FREE */}
            <div className="p-7 rounded-3xl flex flex-col" style={{ backgroundColor: '#181E26', border: '1px solid #334155' }}>
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5 self-start" style={{ backgroundColor: 'rgba(106,126,148,0.15)', color: '#6A7E94', border: '1px solid rgba(106,126,148,0.3)' }}>Para empezar</span>
              <h3 className="text-xl font-bold mb-1" style={{ color: '#F0F4F8' }}>Free</h3>
              <p className="text-sm mb-5" style={{ color: '#6A7E94' }}>Ideal para conocer Posty.</p>
              <div className="mb-1"><span className="text-4xl font-extrabold" style={{ color: '#F0F4F8' }}>$0</span><span className="text-sm ml-1" style={{ color: '#6A7E94' }}>/mes</span></div>
              <p className="text-xs mb-7" style={{ color: '#6A7E94' }}>Sin costos ocultos · Cancelá cuando quieras.</p>
              <ul className="space-y-2.5 mb-8 flex-1 text-sm" style={{ color: '#A8B8C8' }}>
                {['1 cliente', '5 publicaciones/mes', 'YouTube e Instagram', 'Firma automática Posty', 'Soporte por email'].map(f => (
                  <li key={f} className="flex items-start gap-2"><svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: '#6BCB77' }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{f}</li>
                ))}
              </ul>
              <Link href="/register" className="w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all duration-200" style={{ border: '1px solid #334155', color: '#F0F4F8', backgroundColor: '#232B36' }}>Comenzar gratis</Link>
            </div>

            {/* STARTER */}
            <div className="p-7 rounded-3xl flex flex-col" style={{ backgroundColor: '#181E26', border: '1px solid #334155' }}>
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5 self-start" style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>Ideal para creadores</span>
              <h3 className="text-xl font-bold mb-1" style={{ color: '#F0F4F8' }}>Starter</h3>
              <p className="text-sm mb-5" style={{ color: '#6A7E94' }}>Para creadores que recién comienzan.</p>
              <div className="mb-1"><span className="text-4xl font-extrabold" style={{ color: '#F0F4F8' }}>$4.990</span><span className="text-sm ml-1" style={{ color: '#6A7E94' }}>ARS/mes</span></div>
              <p className="text-xs mb-7" style={{ color: '#6A7E94' }}>Sin costos ocultos · Cancelá cuando quieras.</p>
              <ul className="space-y-2.5 mb-8 flex-1 text-sm" style={{ color: '#A8B8C8' }}>
                {['Hasta 3 clientes', '50 publicaciones/mes', 'YouTube, IG, FB, TikTok', 'Sin firma de Posty', 'Estadísticas básicas'].map(f => (
                  <li key={f} className="flex items-start gap-2"><svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: '#6BCB77' }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{f}</li>
                ))}
              </ul>
              <Link href="/precios" className="w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all duration-200" style={{ border: '1px solid #334155', color: '#F0F4F8', backgroundColor: '#232B36' }}>Elegir Starter</Link>
            </div>

            {/* PRO */}
            <div className="p-7 rounded-3xl flex flex-col relative lg:-translate-y-3 shadow-2xl" style={{ backgroundColor: '#1C2736', border: '1px solid #1A6B8A', boxShadow: '0 0 40px rgba(26,107,138,0.2)' }}>
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5 self-start" style={{ backgroundColor: 'rgba(122,208,232,0.12)', color: '#7AD0E8', border: '1px solid rgba(122,208,232,0.3)' }}>⭐ Más popular</span>
              <h3 className="text-xl font-bold mb-1" style={{ color: '#F0F4F8' }}>Pro</h3>
              <p className="text-sm mb-5" style={{ color: '#6A7E94' }}>Para community managers y profesionales.</p>
              <div className="mb-1"><span className="text-4xl font-extrabold" style={{ color: '#F0F4F8' }}>$14.990</span><span className="text-sm ml-1" style={{ color: '#6A7E94' }}>ARS/mes</span></div>
              <p className="text-xs mb-7" style={{ color: '#6A7E94' }}>Sin costos ocultos · Cancelá cuando quieras.</p>
              <ul className="space-y-2.5 mb-8 flex-1 text-sm" style={{ color: '#A8B8C8' }}>
                {['Clientes ilimitados', 'Publicaciones ilimitadas', 'Todas las redes disponibles', 'Sin firma de Posty', 'Publicación simultánea', 'Soporte prioritario'].map(f => (
                  <li key={f} className="flex items-start gap-2"><svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: '#6BCB77' }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{f}</li>
                ))}
              </ul>
              <Link href="/precios" className="w-full text-center py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg" style={{ backgroundColor: '#1A6B8A' }}>Suscribirme</Link>
            </div>

            {/* AGENCY */}
            <div className="p-7 rounded-3xl flex flex-col" style={{ backgroundColor: '#181E26', border: '1px solid #334155' }}>
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5 self-start" style={{ backgroundColor: 'rgba(167,139,250,0.12)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.3)' }}>Para equipos</span>
              <h3 className="text-xl font-bold mb-1" style={{ color: '#F0F4F8' }}>Agency</h3>
              <p className="text-sm mb-5" style={{ color: '#6A7E94' }}>Pensado para agencias y equipos.</p>
              <div className="mb-1"><span className="text-4xl font-extrabold" style={{ color: '#F0F4F8' }}>$39.990</span><span className="text-sm ml-1" style={{ color: '#6A7E94' }}>ARS/mes</span></div>
              <p className="text-xs mb-7" style={{ color: '#6A7E94' }}>Sin costos ocultos · Cancelá cuando quieras.</p>
              <ul className="space-y-2.5 mb-8 flex-1 text-sm" style={{ color: '#A8B8C8' }}>
                {['Todo lo del plan Pro', 'Hasta 5 usuarios', 'Analytics avanzados', 'API pública (MCP)', 'Programa de afiliados', 'Soporte 24/7'].map(f => (
                  <li key={f} className="flex items-start gap-2"><svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: '#6BCB77' }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{f}</li>
                ))}
              </ul>
              <Link href="/contacto" className="w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all duration-200" style={{ border: '1px solid #334155', color: '#F0F4F8', backgroundColor: '#232B36' }}>Contactar ventas</Link>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/precios" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-white" style={{ color: '#7AD0E8' }}>
              Ver comparativa completa de planes
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </div>
      </section>


    </main>
  )
}
