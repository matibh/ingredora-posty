import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Posty — Publica en todas las redes con un clic',
  description: 'Sube tu video ya editado y publícalo automáticamente en YouTube, Instagram, Facebook y TikTok en menos de 3 minutos.',
  icons: { icon: '/postylogo2.png' },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} antialiased h-full`}>
      <body className="h-full flex flex-col md:flex-row font-sans overflow-hidden" style={{ backgroundColor: '#181E26', color: '#A8B8C8' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
          <Footer />
        </div>
      </body>
    </html>
  )
}
