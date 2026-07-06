'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FaYoutube, FaInstagram, FaFacebook, FaTiktok, FaLinkedin } from 'react-icons/fa'
import { SiPinterest, SiX, SiThreads } from 'react-icons/si'
import NewClientModal from '@/components/NewClientModal'
import AccountsSkeleton from '@/components/ui/AccountsSkeleton'

interface SocialAccount {
  id: string
  client_id: string
  platform: string
  username: string
  page_name: string | null
}

interface SocialToken {
  id: string
  client_id: string
  platform: string
  username: string
  page_name: string | null
}

interface Client {
  id: string
  name: string
  logo_url: string | null
  client_social_accounts: SocialAccount[]
  social_tokens: SocialToken[]
}

interface Platform {
  id: string
  name: string
  icon: React.ReactNode
  color: string
}

const PLATFORMS: Platform[] = [
  { id: 'youtube', name: 'YouTube', icon: <FaYoutube className="w-5 h-5" style={{ color: '#FF0000' }} />, color: '#EF4444' },
  { id: 'instagram', name: 'Instagram', icon: <FaInstagram className="w-5 h-5" style={{ color: '#E1306C' }} />, color: '#EC4899' },
  { id: 'facebook', name: 'Facebook', icon: <FaFacebook className="w-5 h-5" style={{ color: '#1877F2' }} />, color: '#3B82F6' },
  // Uso #FFFFFF en vez de #000000 para que se vea en el modo oscuro de Posty
  { id: 'tiktok', name: 'TikTok', icon: <FaTiktok className="w-5 h-5" style={{ color: '#FFFFFF' }} />, color: '#A8B8C8' },
  { id: 'pinterest', name: 'Pinterest', icon: <SiPinterest className="w-5 h-5" style={{ color: '#E60023' }} />, color: '#E60023' },
  { id: 'x', name: 'X', icon: <SiX className="w-5 h-5" style={{ color: '#FFFFFF' }} />, color: '#F0F4F8' },
  { id: 'threads', name: 'Threads', icon: <SiThreads className="w-5 h-5" style={{ color: '#FFFFFF' }} />, color: '#A8B8C8' },
  { id: 'linkedin', name: 'LinkedIn', icon: <FaLinkedin className="w-5 h-5" style={{ color: '#0A66C2' }} />, color: '#0A66C2' },
  { id: 'voxurn', name: 'Voxurn', icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <defs>
          <linearGradient id="voxGradAcct" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8A2BE2" />
            <stop offset="100%" stopColor="#4A00E0" />
          </linearGradient>
          <linearGradient id="voxRingGradAcct" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4A00E0" />
            <stop offset="50%" stopColor="#6C63FF" />
            <stop offset="100%" stopColor="#00E1D9" />
          </linearGradient>
          <clipPath id="voxTopHalfAcct">
            <rect x="0" y="0" width="24" height="11.5" />
          </clipPath>
        </defs>
        <ellipse cx="12" cy="11.5" rx="10.5" ry="3.5" stroke="url(#voxRingGradAcct)" strokeWidth={2.5} transform="rotate(-15 12 11.5)" opacity="0.95" />
        <ellipse cx="12" cy="11.5" rx="8" ry="2.5" stroke="url(#voxRingGradAcct)" strokeWidth={1.5} transform="rotate(-15 12 11.5)" opacity="0.7" />
        <ellipse cx="12" cy="11.5" rx="5.5" ry="1.5" stroke="url(#voxRingGradAcct)" strokeWidth={1} transform="rotate(-15 12 11.5)" opacity="0.4" />
        <path d="M12 22 L1.5 2 h6.5 L12 12.5 L16 2 h6.5 L12 22 Z" fill="url(#voxGradAcct)" />
        <g clipPath="url(#voxTopHalfAcct)">
          <ellipse cx="12" cy="11.5" rx="10.5" ry="3.5" stroke="url(#voxRingGradAcct)" strokeWidth={2.5} transform="rotate(-15 12 11.5)" opacity="0.95" />
          <ellipse cx="12" cy="11.5" rx="8" ry="2.5" stroke="url(#voxRingGradAcct)" strokeWidth={1.5} transform="rotate(-15 12 11.5)" opacity="0.7" />
          <ellipse cx="12" cy="11.5" rx="5.5" ry="1.5" stroke="url(#voxRingGradAcct)" strokeWidth={1} transform="rotate(-15 12 11.5)" opacity="0.4" />
        </g>
      </svg>
    ), color: '#6C63FF' 
  },
]

export default function AccountsContent() {
  const searchParams = useSearchParams()
  const urlClientId = searchParams.get('clientId')
  const successMsg = searchParams.get('success')
  const errorMsg = searchParams.get('error')
  
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchClients()
    if (successMsg === 'youtube_connected') {
      alert('¡Cuenta de YouTube conectada con éxito!')
    } else if (errorMsg) {
      alert(`Error de conexión: ${errorMsg}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successMsg, errorMsg])

  async function fetchClients() {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(data)
        
        if (urlClientId && data.some((c: Client) => c.id === urlClientId)) {
          setExpandedIds(prev => ({ ...prev, [urlClientId]: true }))
        }
      }
    } catch (err) {
      console.error('Error fetching clients:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggle = (id: string) =>
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }))

  const handleDisconnect = async (clientId: string, accountId: string, platformName: string) => {
    if (!confirm(`¿Desconectar la cuenta de ${platformName}?`)) return
    try {
      const res = await fetch(`/api/clients/${clientId}/accounts/${accountId}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      fetchClients()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err))
    }
  }

  const handleDisconnectOAuth = async (clientId: string, platform: string) => {
    if (!confirm(`¿Desconectar la cuenta de ${platform}?`)) return
    try {
      const res = await fetch(`/api/auth/${platform}?clientId=${clientId}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      fetchClients()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err))
    }
  }

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`¿Eliminar permanentemente a ${clientName} y TODAS sus cuentas asociadas? Esta acción no se puede deshacer.`)) return
    try {
      const res = await fetch(`/api/clients/${clientId}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      setClients(prev => prev.filter(c => c.id !== clientId))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold mb-3 tracking-tighter text-[#F0F4F8]">
          Tus Clientes
        </h1>
        <p className="leading-relaxed font-medium text-[#A8B8C8]">
          Gestiona las conexiones de redes sociales para cada uno de tus clientes.
        </p>
      </div>

      {loading ? (
        <AccountsSkeleton />
      ) : clients.length === 0 ? (
        <div className="text-center py-16 px-8 rounded-3xl border border-dashed border-[#334155] bg-[#232B36]">
          <p className="text-sm text-[#A8B8C8] mb-4">No tienes clientes aún. Crea uno desde el dashboard.</p>
          <Link
            href="/dashboard/clients"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1A6B8A] transition-opacity hover:opacity-90 inline-block"
          >
            Ir a Clientes
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {clients.map(client => {
            const isOpen = !!expandedIds[client.id]
            const accounts = client.client_social_accounts || []
            const socialTokens = client.social_tokens || []
            const totalAccounts = accounts.length + socialTokens.length

            return (
              <div
                key={client.id}
                className="rounded-3xl border bg-[#232B36] overflow-hidden transition-all duration-300 shadow-md"
                style={{ borderColor: isOpen ? '#1A6B8A' : '#334155' }}
              >
                <div
                  className="flex flex-wrap items-center justify-between p-6 gap-4 cursor-pointer hover:bg-[#28323f] transition-colors"
                  onClick={() => toggle(client.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow uppercase flex-shrink-0 bg-[#1A6B8A]">
                      {client.name.slice(0, 2)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#F0F4F8] tracking-tight">{client.name}</h2>
                      <p className="text-xs text-[#A8B8C8] mt-1">
                        {totalAccounts} {totalAccounts === 1 ? 'red conectada' : 'redes conectadas'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/dashboard/clients/${client.id}/edit`}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-[#A8B8C8] border border-[#334155] hover:bg-[#334155] hover:text-[#F0F4F8] transition-colors"
                    >
                      Editar cliente
                    </Link>
                    <button
                      onClick={() => handleDeleteClient(client.id, client.name)}
                      className="p-2 rounded-lg text-[#6A7E94] hover:text-[#F87171] hover:bg-[#334155] transition-colors"
                      title="Eliminar cliente"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <svg
                      className={`w-5 h-5 text-[#6A7E94] transition-transform duration-300 ml-2 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-[#334155] p-6 bg-[#1d2530]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {PLATFORMS.map(platform => {
                        const isOAuthPlatform = ['youtube', 'facebook', 'instagram', 'threads'].includes(platform.id);
                        const connectedAccount = isOAuthPlatform
                          ? socialTokens.find(acc => acc.platform === platform.id)
                          : accounts.find(acc => acc.platform === platform.id);
                          
                        const isConnected = !!connectedAccount

                        return (
                          <div
                            key={platform.id}
                            className="p-4 rounded-2xl border bg-[#232B36] flex flex-col justify-between transition-all"
                            style={{ borderColor: isConnected ? '#1A6B8A' : '#334155' }}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#181E26] shadow-inner border border-[#334155]">
                                  {platform.icon}
                                </div>
                                <div
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border ${
                                    isConnected 
                                      ? 'bg-green-500/10 text-[#6BCB77] border-green-500/20' 
                                      : 'bg-gray-500/10 text-[#6A7E94] border-[#334155]'
                                  }`}
                                >
                                  <span 
                                    className={`w-2 h-2 rounded-full ${
                                      isConnected 
                                        ? 'bg-[#6BCB77] shadow-[0_0_8px_rgba(107,203,119,0.8)]' 
                                        : 'bg-[#6A7E94]'
                                    }`}
                                  />
                                  {isConnected ? 'Conectado' : 'No conectado'}
                                </div>
                              </div>
                              <h3 className="text-sm font-bold text-[#F0F4F8] mb-1">{platform.name}</h3>
                              
                              {isConnected && connectedAccount ? (
                                <div className="mb-4">
                                  <p className="text-xs text-[#A8B8C8] truncate">
                                    {connectedAccount.username.startsWith('@')
                                      ? connectedAccount.username
                                      : `@${connectedAccount.username}`}
                                  </p>
                                </div>
                              ) : (
                                <div className="mb-4">
                                  <p className="text-[11px] text-[#6A7E94]">Sin vincular</p>
                                </div>
                              )}
                            </div>

                            <div>
                              {isConnected && connectedAccount ? (
                                <button
                                  onClick={() => {
                                    if (isOAuthPlatform) {
                                      handleDisconnectOAuth(client.id, platform.id)
                                    } else {
                                      handleDisconnect(client.id, connectedAccount.id, platform.name)
                                    }
                                  }}
                                  className="w-full py-2 rounded-lg text-xs font-bold transition-all text-[#E87A7A] border border-[#E87A7A] hover:bg-red-500/10"
                                >
                                  Desconectar
                                </button>
                              ) : (
                                isOAuthPlatform ? (
                                  <a
                                    href={`/api/auth/${platform.id}?clientId=${client.id}`}
                                    className="w-full block text-center py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:bg-[#155b76] bg-[#1A6B8A]"
                                  >
                                    Conectar {platform.name}
                                  </a>
                                ) : (
                                  <button
                                    disabled
                                    className="w-full py-2 rounded-lg text-xs font-bold text-[#A8B8C8] bg-[#334155] cursor-not-allowed opacity-70"
                                  >
                                    Próximamente
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <div className="pt-6 text-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-[#F0F4F8] bg-[#232B36] border border-[#334155] hover:bg-[#334155] transition-colors"
            >
              + Nuevo Cliente
            </button>
          </div>
        </div>
      )}

      <NewClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchClients}
      />
    </>
  )
}
