'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { login } from '@/app/actions/auth'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      id="login-submit-btn"
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-4 px-4 rounded-xl text-sm font-bold text-white transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
      style={{ backgroundColor: '#1A6B8A' }}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Iniciando sesión…
        </span>
      ) : 'Iniciar sesión'}
    </button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, null)

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ backgroundColor: '#181E26' }}
    >
      {/* Blobs decorativos (Glow) muy sutiles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(122,208,232,0.03)', filter: 'blur(80px)' }} />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(26,107,138,0.05)', filter: 'blur(80px)' }} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex justify-center mb-8">
          <div className="flex items-center gap-3 group">
            <img src="/postylogo2.png" alt="Posty" className="h-12 w-auto shrink-0 rounded-2xl shadow-md transition-transform duration-200 group-hover:scale-105" />
            <span className="text-3xl font-extrabold tracking-tight" style={{ color: '#F0F4F8' }}>Posty</span>
          </div>
        </Link>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: '#F0F4F8' }}>Bienvenido de vuelta</h2>
          <p className="mt-2 text-sm" style={{ color: '#A8B8C8' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-bold underline underline-offset-2 transition-colors" style={{ color: '#1A6B8A' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#7AD0E8'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#1A6B8A'}
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="py-10 px-8 rounded-3xl shadow-xl" style={{ backgroundColor: '#232B36', border: '1px solid #334155' }}>
          <form action={formAction} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#F0F4F8' }}>
                Correo electrónico
              </label>
              <input
                id="email" name="email" type="email" autoComplete="email" required
                placeholder="tu@email.com"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  border: '1px solid #334155',
                  color: '#F0F4F8',
                  backgroundColor: '#181E26',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#1A6B8A'; e.target.style.boxShadow = '0 0 0 1px #1A6B8A'; }}
                onBlur={(e) => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: '#F0F4F8' }}>
                Contraseña
              </label>
              <input
                id="password" name="password" type="password" autoComplete="current-password" required
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  border: '1px solid #334155',
                  color: '#F0F4F8',
                  backgroundColor: '#181E26',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#1A6B8A'; e.target.style.boxShadow = '0 0 0 1px #1A6B8A'; }}
                onBlur={(e) => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {state?.error && (
              <div className="flex items-start gap-2 p-4 rounded-xl text-sm border shadow-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: '#EF4444', color: '#F87171' }}>
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{state.error}</span>
              </div>
            )}

            <div className="pt-2">
              <SubmitButton />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
