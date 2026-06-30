'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GlobalYouTubeDisconnect() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDisconnect = async () => {
    if (!confirm('¿Estás seguro de que quieres desconectar esta cuenta de YouTube? Esta cuenta no está asignada a ningún cliente. Luego podrás volver a conectarla desde el cliente correspondiente.')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/youtube/global', { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('Error al desconectar')
      }
      router.refresh()
    } catch (err) {
      alert('Hubo un error al intentar desconectar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleDisconnect}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-[#E87A7A] border border-[#E87A7A] hover:bg-[#E87A7A] hover:text-white transition-colors disabled:opacity-50"
    >
      Desconectar {loading ? '...' : '✕'}
    </button>
  )
}
