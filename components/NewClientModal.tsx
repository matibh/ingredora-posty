'use client'

import { useState } from 'react'

interface NewClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function NewClientModal({ isOpen, onClose, onSuccess }: NewClientModalProps) {
  const [nameInput, setNameInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nameInput.trim()) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.trim() }),
      })
      
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      
      setNameInput('')
      onSuccess()
      onClose()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 rounded-3xl border border-[#334155] shadow-2xl bg-[#232B36]">
        <h3 className="text-xl font-bold mb-5 text-[#F0F4F8]">Crear Nuevo Cliente</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2 text-[#F0F4F8]">Nombre del cliente</label>
            <input
              type="text"
              required
              placeholder="ej. Gimnasio Zona Fit"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-[#334155] bg-[#181E26] text-[#F0F4F8] focus:border-[#1A6B8A] transition-colors"
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-[#334155]/60 mt-6 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#A8B8C8] hover:bg-[#334155] hover:text-[#F0F4F8] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: '#1A6B8A' }}
            >
              {submitting ? 'Creando…' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
