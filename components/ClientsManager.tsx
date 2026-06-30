'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaYoutube, FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa'
import { SiPinterest, SiX, SiThreads } from 'react-icons/si'
import NewClientModal from '@/components/NewClientModal'

interface SocialAccount {
  id: string
  client_id: string
  platform: 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'pinterest' | 'x' | 'threads'
  username: string
  page_name: string | null
}

interface Client {
  id: string
  name: string
  logo_url: string | null
  created_at: string
  client_social_accounts: SocialAccount[]
}

const PLATFORM_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  youtube:   { label: 'YouTube',   icon: <FaYoutube className="w-4 h-4" style={{ color: '#FF0000' }} />, color: '#EF4444' },
  instagram: { label: 'Instagram', icon: <FaInstagram className="w-4 h-4" style={{ color: '#E1306C' }} />, color: '#EC4899' },
  facebook:  { label: 'Facebook',  icon: <FaFacebook className="w-4 h-4" style={{ color: '#1877F2' }} />, color: '#3B82F6' },
  tiktok:    { label: 'TikTok',    icon: <FaTiktok className="w-4 h-4" style={{ color: '#FFFFFF' }} />, color: '#A8B8C8' },
  pinterest: { label: 'Pinterest', icon: <SiPinterest className="w-4 h-4" style={{ color: '#E60023' }} />, color: '#E60023' },
  x:         { label: 'X',         icon: <SiX className="w-4 h-4" style={{ color: '#FFFFFF' }} />,  color: '#F0F4F8' },
  threads:   { label: 'Threads',   icon: <SiThreads className="w-4 h-4" style={{ color: '#FFFFFF' }} />, color: '#A8B8C8' },
}

export default function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch('/api/clients')
        if (res.ok) {
          const data = await res.json()
          setClients(data)
        }
      } catch (err) {
        console.error('Error fetching clients:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  const toggle = (id: string) =>
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }))

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex items-center gap-3">
          <svg className="w-5 h-5 animate-spin text-[#1A6B8A]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-sm font-medium text-[#A8B8C8]">Cargando clientes…</span>
        </div>
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <div
        className="text-center py-16 px-8 rounded-3xl border border-dashed"
        style={{ backgroundColor: '#232B36', borderColor: '#334155' }}
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 border border-[#334155] bg-[#181E26]">
          <svg className="w-7 h-7 text-[#1A6B8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-2 text-[#F0F4F8]">No tienes clientes aún</h3>
        <p className="text-sm mb-6 max-w-sm mx-auto leading-relaxed text-[#A8B8C8]">
          Crea uno para empezar a organizar tus cuentas de redes sociales y publicar contenido.
        </p>
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg"
          style={{ backgroundColor: '#1A6B8A' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Crear primer cliente
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {clients.map(client => {
        const accounts = client.client_social_accounts || []
        const isOpen = !!expandedIds[client.id]
        const connectedCount = accounts.length

        return (
          <div
            key={client.id}
            className="rounded-2xl overflow-hidden transition-all duration-200"
            style={{
              backgroundColor: '#232B36',
              border: isOpen ? '1px solid #1A6B8A' : '1px solid #334155',
            }}
          >
            {/* ── Collapsed Header ────────────────────────────── */}
            <button
              onClick={() => toggle(client.id)}
              className="w-full flex items-center justify-between p-5 text-left cursor-pointer select-none hover:bg-[#28323f] transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0 shadow uppercase" style={{ backgroundColor: '#1A6B8A' }}>
                  {client.name.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold text-[#F0F4F8] truncate leading-tight">{client.name}</h3>
                  {/* Mini platform dots row (visible when collapsed) */}
                  {!isOpen && connectedCount > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      {accounts.slice(0, 5).map(acc => {
                        const meta = PLATFORM_META[acc.platform]
                        return (
                          <span key={acc.id} className="text-xs" title={meta?.label}>
                            {meta?.icon}
                          </span>
                        )
                      })}
                      {accounts.length > 5 && (
                        <span className="text-[10px] font-bold text-[#6A7E94]">+{accounts.length - 5}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Network count badge */}
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold tabular-nums"
                  style={{
                    backgroundColor: connectedCount > 0 ? 'rgba(26,107,138,0.15)' : 'rgba(106,126,148,0.12)',
                    color: connectedCount > 0 ? '#7AD0E8' : '#6A7E94',
                    border: `1px solid ${connectedCount > 0 ? 'rgba(26,107,138,0.3)' : '#334155'}`,
                  }}
                >
                  {connectedCount} {connectedCount === 1 ? 'red' : 'redes'}
                </span>

                {/* Chevron */}
                <svg
                  className={`w-5 h-5 text-[#6A7E94] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* ── Expanded Body ───────────────────────────────── */}
            {isOpen && (
              <div className="border-t border-[#334155]">
                {/* Accounts list */}
                <div className="p-5 space-y-2.5" style={{ backgroundColor: '#1d2530' }}>
                  {accounts.length === 0 ? (
                    <p className="text-sm text-center py-4 text-[#A8B8C8]">
                      Sin redes conectadas. <Link href="/dashboard/accounts" className="font-bold text-[#1A6B8A] hover:underline">Conectar ahora →</Link>
                    </p>
                  ) : (
                    accounts.map(acc => {
                      const meta = PLATFORM_META[acc.platform] || { label: acc.platform, icon: <span className="text-sm">❓</span>, color: '#6A7E94' }
                      
                      return (
                        <div
                          key={acc.id}
                          className="flex items-center justify-between p-3 rounded-xl border"
                          style={{ backgroundColor: '#2B3544', borderColor: '#334155' }}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="flex-shrink-0 flex items-center justify-center">{meta.icon}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#F0F4F8] truncate">
                                {acc.page_name || meta.label}
                              </p>
                              <p className="text-xs text-[#A8B8C8] truncate">@{acc.username}</p>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(34,197,94,0.15)] text-[#4ADE80] border border-[#22C55E]/50 flex-shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                            Conectado
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Action bar */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-t border-[#334155]/60 bg-[#232B36]">
                  <Link
                    href={`/dashboard/upload?clientId=${client.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#1A6B8A' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    Publicar
                  </Link>
                  <Link
                    href="/dashboard/clients"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-[#A8B8C8] border border-[#334155] hover:bg-[#334155] hover:text-[#F0F4F8] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Editar
                  </Link>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
