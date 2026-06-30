'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  // Resolvemos params de Next.js
  const resolvedParams = use(params)
  const id = resolvedParams.id

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchClient() {
      try {
        const res = await fetch('/api/clients')
        if (res.ok) {
          const clients = await res.json()
          const client = clients.find((c: any) => c.id === id)
          if (client) {
            setName(client.name)
          } else {
            setError('Cliente no encontrado')
          }
        } else {
          setError('Error al cargar cliente')
        }
      } catch (err) {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }
    fetchClient()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = name.trim()

    // Validaciones
    if (!trimmedName) {
      setError('El nombre del cliente no puede estar vacío.')
      return
    }
    if (trimmedName.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: trimmedName })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al actualizar')
      }

      router.push('/dashboard/accounts')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="flex-1" style={{ backgroundColor: '#181E26' }}>
      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: '#6A7E94' }}>
          <Link href="/dashboard" className="font-medium transition-colors hover:text-[#F0F4F8]" style={{ color: '#6A7E94' }}>
            Dashboard
          </Link>
          <span className="opacity-50">/</span>
          <Link href="/dashboard/accounts" className="font-medium transition-colors hover:text-[#F0F4F8]" style={{ color: '#6A7E94' }}>
            Mis Clientes
          </Link>
          <span className="opacity-50">/</span>
          <span className="font-semibold" style={{ color: '#F0F4F8' }}>Editar cliente</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl font-extrabold mb-3 tracking-tighter" style={{ color: '#F0F4F8' }}>
            Editar Cliente
          </h1>
          <p className="leading-relaxed font-medium" style={{ color: '#A8B8C8' }}>
            Modifica la información básica de este cliente.
          </p>
        </div>

        <div className="p-8 rounded-3xl shadow-md border" style={{ backgroundColor: '#232B36', borderColor: '#334155' }}>
          {loading ? (
            <div className="text-center py-10">
              <span className="text-[#A8B8C8]">Cargando cliente...</span>
            </div>
          ) : error && !name ? (
            <div className="text-center py-10">
              <span className="text-[#E87A7A] font-bold">{error}</span>
              <div className="mt-4">
                <Link href="/dashboard/accounts" className="text-[#1A6B8A] hover:underline">
                  Volver a mis clientes
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#F0F4F8] mb-1.5">
                  Nombre del cliente
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. GymRasta"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-[#F0F4F8] placeholder-[#6A7E94] focus:outline-none focus:ring-2 transition-all"
                  style={{ backgroundColor: '#181E26', border: '1px solid #334155', outlineColor: '#1A6B8A' }}
                  disabled={saving}
                />
              </div>

              {error && (
                <div className="text-sm font-bold text-[#E87A7A]">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t border-[#334155]">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/accounts')}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#A8B8C8] bg-transparent border border-[#334155] hover:bg-[#334155] hover:text-[#F0F4F8] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#1A6B8A' }}
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
