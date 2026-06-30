import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contacto | Posty',
  description: 'Contactá al equipo de Posty para consultas, soporte técnico o propuestas comerciales.',
}

export default function ContactoPage() {
  return (
    <div style={{ backgroundColor: '#181E26' }} className="flex-1">
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tighter text-[#F0F4F8] mb-3">Contacto</h1>
          <p className="text-[#A8B8C8] max-w-lg mx-auto">¿Tenés dudas, necesitás soporte o querés hablar con el equipo? Elegí el canal que mejor te sirva.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <ContactCard
            icon="💬"
            title="Soporte técnico"
            desc="Problemas con la plataforma, errores o preguntas sobre funciones."
            action={{ label: 'soporte@posty.app', href: 'mailto:soporte@posty.app' }}
          />
          <ContactCard
            icon="💼"
            title="Comercial"
            desc="Planes para agencias, cuentas enterprise o integraciones a medida."
            action={{ label: 'ventas@posty.app', href: 'mailto:ventas@posty.app' }}
          />
          <ContactCard
            icon="⚖️"
            title="Legal y privacidad"
            desc="Consultas sobre términos, privacidad, cookies o solicitudes de datos."
            action={{ label: 'legal@posty.app', href: 'mailto:legal@posty.app' }}
          />
        </div>

        {/* Formulario de contacto */}
        <div className="p-8 rounded-3xl border border-[#334155] bg-[#232B36] max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-[#F0F4F8] mb-6">Envianos un mensaje</h2>
          <form className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#A8B8C8] mb-2">Nombre</label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 rounded-xl bg-[#181E26] border border-[#334155] text-[#F0F4F8] text-sm outline-none focus:border-[#1A6B8A] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#A8B8C8] mb-2">Correo electrónico</label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#181E26] border border-[#334155] text-[#F0F4F8] text-sm outline-none focus:border-[#1A6B8A] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#A8B8C8] mb-2">Asunto</label>
              <select className="w-full px-4 py-3 rounded-xl bg-[#181E26] border border-[#334155] text-[#A8B8C8] text-sm outline-none focus:border-[#1A6B8A] transition-colors">
                <option value="">Seleccioná una categoría</option>
                <option value="soporte">Soporte técnico</option>
                <option value="ventas">Consulta comercial</option>
                <option value="legal">Legal / Privacidad</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#A8B8C8] mb-2">Mensaje</label>
              <textarea
                rows={5}
                placeholder="Contanos en qué te podemos ayudar..."
                className="w-full px-4 py-3 rounded-xl bg-[#181E26] border border-[#334155] text-[#F0F4F8] text-sm outline-none focus:border-[#1A6B8A] transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1A6B8A' }}
            >
              Enviar mensaje
            </button>
          </form>
        </div>

        <div className="mt-10 text-center text-xs text-[#6A7E94]">
          También podés revisar nuestros{' '}
          <Link href="/legal/terminos" className="text-[#1A6B8A] hover:underline">Términos</Link>,{' '}
          <Link href="/legal/privacidad" className="text-[#1A6B8A] hover:underline">Privacidad</Link> y{' '}
          <Link href="/legal/cookies" className="text-[#1A6B8A] hover:underline">Cookies</Link>.
        </div>
      </main>
    </div>
  )
}

function ContactCard({ icon, title, desc, action }: {
  icon: string
  title: string
  desc: string
  action: { label: string; href: string }
}) {
  return (
    <div className="p-6 rounded-2xl border border-[#334155] bg-[#232B36] flex flex-col gap-4">
      <span className="text-3xl">{icon}</span>
      <div>
        <h3 className="text-sm font-bold text-[#F0F4F8] mb-1">{title}</h3>
        <p className="text-xs text-[#A8B8C8] leading-relaxed">{desc}</p>
      </div>
      <Link
        href={action.href}
        className="text-xs font-bold text-[#1A6B8A] hover:text-[#7AD0E8] transition-colors mt-auto"
      >
        {action.label} →
      </Link>
    </div>
  )
}
