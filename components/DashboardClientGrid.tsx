'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaYoutube, FaInstagram, FaFacebook, FaTiktok, FaLinkedin } from 'react-icons/fa'
import { SiPinterest, SiX, SiThreads } from 'react-icons/si'
import NewClientModal from './NewClientModal'
import { ClientCardSkeleton } from './ui/ClientCardSkeleton'

interface SocialAccount {
  id: string
  platform: string
  username: string
}

interface SocialToken {
  id: string
  platform: string
  username: string
  page_name: string | null
  client_id: string
}

interface Client {
  id: string
  name: string
  client_social_accounts: SocialAccount[]
  social_tokens: SocialToken[]
}

const PLATFORM_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  youtube:   { icon: <FaYoutube className="w-4 h-4" style={{ color: '#FF0000' }} />, label: 'YouTube',   color: '#EF4444' },
  instagram: { icon: <FaInstagram className="w-4 h-4" style={{ color: '#E1306C' }} />, label: 'Instagram', color: '#EC4899' },
  facebook:  { icon: <FaFacebook className="w-4 h-4" style={{ color: '#1877F2' }} />, label: 'Facebook',  color: '#3B82F6' },
  tiktok:    { icon: <FaTiktok className="w-4 h-4" style={{ color: '#FFFFFF' }} />, label: 'TikTok',    color: '#A8B8C8' },
  pinterest: { icon: <SiPinterest className="w-4 h-4" style={{ color: '#E60023' }} />, label: 'Pinterest', color: '#E60023' },
  x:         { icon: <SiX className="w-4 h-4" style={{ color: '#FFFFFF' }} />, label: 'X',         color: '#F0F4F8' },
  threads:   { icon: <SiThreads className="w-4 h-4" style={{ color: '#FFFFFF' }} />, label: 'Threads',   color: '#A8B8C8' },
  linkedin:  { icon: <FaLinkedin className="w-4 h-4" style={{ color: '#0A66C2' }} />, label: 'LinkedIn',  color: '#0A66C2' },
  voxurn:    { icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
        <defs>
          <linearGradient id="voxGradGrid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8A2BE2" />
            <stop offset="100%" stopColor="#4A00E0" />
          </linearGradient>
          <linearGradient id="voxRingGradGrid" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4A00E0" />
            <stop offset="50%" stopColor="#6C63FF" />
            <stop offset="100%" stopColor="#00E1D9" />
          </linearGradient>
          <clipPath id="voxTopHalfGrid">
            <rect x="0" y="0" width="24" height="11.5" />
          </clipPath>
        </defs>
        <ellipse cx="12" cy="11.5" rx="10.5" ry="3.5" stroke="url(#voxRingGradGrid)" strokeWidth={2.5} transform="rotate(-15 12 11.5)" opacity="0.95" />
        <ellipse cx="12" cy="11.5" rx="8" ry="2.5" stroke="url(#voxRingGradGrid)" strokeWidth={1.5} transform="rotate(-15 12 11.5)" opacity="0.7" />
        <ellipse cx="12" cy="11.5" rx="5.5" ry="1.5" stroke="url(#voxRingGradGrid)" strokeWidth={1} transform="rotate(-15 12 11.5)" opacity="0.4" />
        <path d="M12 22 L1.5 2 h6.5 L12 12.5 L16 2 h6.5 L12 22 Z" fill="url(#voxGradGrid)" />
        <g clipPath="url(#voxTopHalfGrid)">
          <ellipse cx="12" cy="11.5" rx="10.5" ry="3.5" stroke="url(#voxRingGradGrid)" strokeWidth={2.5} transform="rotate(-15 12 11.5)" opacity="0.95" />
          <ellipse cx="12" cy="11.5" rx="8" ry="2.5" stroke="url(#voxRingGradGrid)" strokeWidth={1.5} transform="rotate(-15 12 11.5)" opacity="0.7" />
          <ellipse cx="12" cy="11.5" rx="5.5" ry="1.5" stroke="url(#voxRingGradGrid)" strokeWidth={1} transform="rotate(-15 12 11.5)" opacity="0.4" />
        </g>
      </svg>
    ), label: 'Voxurn', color: '#6C63FF' 
  },
}

export default function DashboardClientGrid() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

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
  }, [refreshKey])

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#F0F4F8]">Tus Clientes</h2>
          <p className="text-xs text-[#6A7E94] mt-0.5">{clients.length} {clients.length === 1 ? 'cliente' : 'clientes'} activos</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 hover:shadow-md"
          style={{ backgroundColor: '#1A6B8A' }}
        >
          <span className="text-base leading-none">+</span>
          Nuevo Cliente
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <ClientCardSkeleton key={i} />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 rounded-2xl border border-dashed border-[#334155] bg-[#232B36]">
          <div className="w-14 h-14 rounded-2xl bg-[#181E26] border border-[#334155] flex items-center justify-center text-2xl mb-4">
            👥
          </div>
          <p className="text-sm font-semibold text-[#F0F4F8] mb-1">Aún no tienes clientes</p>
          <p className="text-xs text-[#6A7E94] mb-5">Crea tu primer cliente para empezar a gestionar redes</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1A6B8A] transition-opacity hover:opacity-90"
          >
            Crear primer cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => {
            const genericAccounts = client.client_social_accounts || []
            const tokenAccounts = (client.social_tokens || []).map(t => ({ id: t.id, platform: t.platform, username: t.username }))
            const allAccounts = [...genericAccounts, ...tokenAccounts]
            const initials = client.name
              .split(' ')
              .slice(0, 2)
              .map(w => w[0])
              .join('')
              .toUpperCase()

            return (
              <div
                key={client.id}
                className="flex flex-col rounded-2xl border border-[#334155] bg-[#232B36] transition-all hover:border-[#1A6B8A] hover:shadow-lg hover:shadow-black/20"
              >
                {/* Card Header */}
                <div className="flex items-center gap-3 p-5 pb-4">
                  {/* Avatar con iniciales */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #1A6B8A, #0e4a61)' }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#F0F4F8] truncate leading-tight">{client.name}</h3>
                    <p className="text-[11px] text-[#6A7E94] mt-0.5">
                      {allAccounts.length === 0
                        ? 'Sin redes conectadas'
                        : `${allAccounts.length} ${allAccounts.length === 1 ? 'red conectada' : 'redes conectadas'}`}
                    </p>
                  </div>
                </div>

                {/* Íconos de redes */}
                <div className="px-5 pb-4 min-h-[36px]">
                  {allAccounts.length === 0 ? (
                    <p className="text-[11px] text-[#334155] italic">No hay redes vinculadas aún</p>
                  ) : (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {allAccounts.map(acc => {
                        const meta = PLATFORM_META[acc.platform]
                        const displayUsername = acc.username.startsWith('@') ? acc.username : `@${acc.username}`
                        return (
                          <div
                            key={acc.id}
                            title={`${meta?.label ?? acc.platform}: ${displayUsername}`}
                            className="group relative flex items-center justify-center w-7 h-7 rounded-lg border bg-[#181E26] border-[#334155] cursor-default transition-all hover:scale-110"
                            style={{ color: meta?.color ?? '#A8B8C8', borderColor: meta?.color ? meta.color + '40' : '#334155' }}
                          >
                            {meta?.icon ?? '❓'}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="flex items-stretch gap-0 border-t border-[#334155]/60 mt-auto">
                  <Link
                    href={`/dashboard/accounts?clientId=${client.id}`}
                    className="flex-1 flex items-center justify-center py-3 text-xs font-semibold text-[#6A7E94] hover:text-[#F0F4F8] hover:bg-[#2a3441] transition-colors border-r border-[#334155]/60"
                  >
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Gestionar redes
                  </Link>
                  <Link
                    href={`/dashboard/upload?clientId=${client.id}`}
                    className="flex-1 flex items-center justify-center py-3 text-xs font-bold text-[#1A6B8A] hover:text-white hover:bg-[#1A6B8A] transition-colors rounded-br-2xl"
                  >
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Publicar
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <NewClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setRefreshKey(k => k + 1)}
      />
    </div>
  )
}
