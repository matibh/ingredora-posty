import { Suspense } from 'react'
import Link from 'next/link'
import AccountsContent from '@/components/AccountsContent'
import GlobalYouTubeDisconnect from '@/components/GlobalYouTubeDisconnect'
import { createClient } from '@/lib/supabase/server'

export default async function AccountsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let isYoutubeConnected = false;
  
  if (user) {
    const { data: tokens } = await supabase
      .from('social_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'youtube')
      .is('client_id', null)
      .maybeSingle()
      
    if (tokens) {
      isYoutubeConnected = true;
    }
  }

  return (
    <div className="flex-1" style={{ backgroundColor: '#181E26' }}>
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="font-medium transition-colors hover:text-[#F0F4F8]" style={{ color: '#6A7E94' }}>
              Dashboard
            </Link>
            <span className="opacity-50 text-[#6A7E94]">/</span>
            <span className="font-semibold text-[#F0F4F8]">Mis Clientes</span>
          </div>
          
          <div>
            {isYoutubeConnected && (
              <GlobalYouTubeDisconnect />
            )}
          </div>
        </nav>

        <Suspense fallback={<div className="py-12 text-center text-sm text-[#A8B8C8]">Cargando vista…</div>}>
          <AccountsContent />
        </Suspense>
      </main>
    </div>
  )
}
