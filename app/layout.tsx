import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Posty - Publica en todas las redes con un clic',
  description: 'Sube tu video, elige un template y publícalo automáticamente en YouTube, Instagram, Facebook y TikTok.',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
        <Header />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
