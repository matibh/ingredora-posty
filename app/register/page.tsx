'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { register } from '@/app/actions/auth'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      id="register-submit-btn"
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-3 px-4 rounded-xl border border-transparent shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Creando cuenta...
        </span>
      ) : (
        'Crear cuenta gratis'
      )}
    </button>
  )
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(register, null)

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-400/10 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-blue-400/10 blur-[80px] pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex justify-center mb-6 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white group-hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Crea tu cuenta en Posty
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
            Inicia sesión aquí
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form action={formAction} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="tu@email.com"
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            {state?.error && (
              <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{state.error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <SubmitButton />
            </div>
            
            <p className="mt-4 text-center text-xs text-slate-500">
              Al registrarte aceptas nuestros{' '}
              <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                Términos de servicio
              </a>{' '}
              y{' '}
              <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                Política de privacidad
              </a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
