// src/app/layout.tsx - ATUALIZAR
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/src/context/AuthContext'
import { NotificationProvider } from '@/src/context/NotificationContext'
import ToastContainer from '@/src/components/ToastContainer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Giro no Mercado - Marketplace do Mercado Central',
    template: '%s | Giro no Mercado'
  },
  description: 'Plataforma de marketplace que conecta clientes, comerciantes e entregadores do Mercado Central. Compre produtos frescos e receba em casa com entrega rápida.',
  keywords: ['marketplace', 'mercado central', 'delivery', 'compras online', 'produtos frescos', 'entrega rápida', 'comercio local'],
  authors: [{ name: 'Giro no Mercado' }],
  creator: 'Giro no Mercado',
  publisher: 'Giro no Mercado',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://giro-no-mercado.vercel.app'),
  openGraph: {
    title: 'Giro no Mercado - Marketplace do Mercado Central',
    description: 'Conectando clientes, comerciantes e entregadores do Mercado Central. Compre produtos frescos e receba em casa.',
    url: 'https://giro-no-mercado.vercel.app',
    siteName: 'Giro no Mercado',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Giro no Mercado - Marketplace do Mercado Central',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Giro no Mercado - Marketplace do Mercado Central',
    description: 'Conectando clientes, comerciantes e entregadores do Mercado Central.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <NotificationProvider>
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  )
}
