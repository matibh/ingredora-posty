import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 pt-24 pb-32">
        {/* Background gradient decoration */}
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-50 to-slate-50 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-8">
            Sube un video.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Publícalo en todas partes.
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-600 mb-10">
            Posty es la herramienta que necesitas para llevar tu contenido a YouTube, Instagram, Facebook y TikTok en menos de 3 minutos. Automatiza tu presencia en redes sociales.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              Comenzar ahora
            </Link>
          </div>

          {/* Abstract Hero Image / Mockup Placeholder */}
          <div className="mt-20 mx-auto max-w-4xl relative">
            <div className="aspect-[16/9] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden relative">
              <div className="absolute inset-0 bg-slate-50/50 flex flex-col">
                <div className="h-12 border-b border-slate-200 flex items-center px-4 gap-2 bg-white">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex items-center justify-center p-8">
                  {/* Mock UI inside */}
                  <div className="w-full max-w-lg space-y-4">
                    <div className="h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center px-4 gap-4 animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-blue-100" />
                      <div className="flex-1 h-4 bg-slate-100 rounded" />
                      <div className="w-16 h-6 bg-green-100 rounded-full" />
                    </div>
                    <div className="h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center px-4 gap-4 animate-pulse" style={{ animationDelay: '150ms' }}>
                      <div className="w-8 h-8 rounded-lg bg-pink-100" />
                      <div className="flex-1 h-4 bg-slate-100 rounded" />
                      <div className="w-16 h-6 bg-green-100 rounded-full" />
                    </div>
                    <div className="h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center px-4 gap-4 animate-pulse" style={{ animationDelay: '300ms' }}>
                      <div className="w-8 h-8 rounded-lg bg-slate-200" />
                      <div className="flex-1 h-4 bg-slate-100 rounded" />
                      <div className="w-16 h-6 bg-green-100 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Cómo funciona</h2>
            <p className="text-lg text-slate-600">Tres simples pasos para multiplicar tu alcance</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">1. Sube tu video</h3>
              <p className="text-slate-600">Arrastra tu contenido original a nuestra plataforma de forma segura y rápida.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">2. Elige un template</h3>
              <p className="text-slate-600">Aplica textos y estilos predefinidos diseñados para captar la atención de tu audiencia.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">3. Publica automáticamente</h3>
              <p className="text-slate-600">Posty renderiza el video y lo distribuye a todas tus redes conectadas con un clic.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section id="features" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">¿Por qué usar Posty?</h2>
            <p className="text-lg text-slate-600">Diseñado para creadores que valoran su tiempo</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Renderizado automático</h3>
              <p className="text-slate-600">Tu video, con el estilo que elijas, procesado y listo en segundos en la nube. No dependas de la potencia de tu PC.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center mb-6">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Publicación en 4 redes</h3>
              <p className="text-slate-600">Alcance masivo sin esfuerzo extra. Sincronizamos con las APIs oficiales de YouTube, Instagram, Facebook y TikTok.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-6">
                <span className="text-2xl">🔥</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Racha de días</h3>
              <p className="text-slate-600">Mantén la constancia con nuestro sistema de rachas. Gamificamos tu proceso de publicación para que no pierdas el ritmo.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-6">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Sin marca de agua</h3>
              <p className="text-slate-600">Contenido profesional, sin distracciones. Tus videos son tuyos y tu audiencia solo verá tu marca.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Precios (Placeholder) */}
      <section id="pricing" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Planes simples y transparentes</h2>
            <p className="text-lg text-slate-600">Empieza gratis, mejora cuando estés listo</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="border border-slate-200 rounded-3xl p-8 flex flex-col">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Free</h3>
              <p className="text-slate-500 mb-6">Perfecto para probar la plataforma</p>
              <div className="mb-6">
                <span className="text-5xl font-extrabold text-slate-900">$0</span>
                <span className="text-slate-500">/mes</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <span className="text-slate-600">5 videos por mes</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <span className="text-slate-600">Todas las redes sociales</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  <span className="text-slate-500 line-through">Sin marca de agua</span>
                </li>
              </ul>
              <Link href="/register" className="w-full block text-center rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-slate-50 transition-colors">
                Crear cuenta
              </Link>
            </div>

            {/* Pro */}
            <div className="border-2 border-blue-600 rounded-3xl p-8 flex flex-col relative shadow-xl shadow-blue-900/5">
              <div className="absolute top-0 right-8 -translate-y-1/2">
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Recomendado
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro</h3>
              <p className="text-slate-500 mb-6">Para creadores comprometidos</p>
              <div className="mb-6">
                <span className="text-5xl font-extrabold text-slate-900">$15</span>
                <span className="text-slate-500">/mes</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <span className="text-slate-600">Videos ilimitados</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <span className="text-slate-600">Todas las redes sociales</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <span className="text-slate-600 font-medium">Sin marca de agua</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <span className="text-slate-600">Soporte prioritario</span>
                </li>
              </ul>
              <Link href="/register" className="w-full block text-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow-md shadow-blue-500/20 active:scale-95">
                Mejorar a Pro
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
