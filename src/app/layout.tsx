// src/app/layout.tsx - ATUALIZAR
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/src/context/AuthContext'
import { NotificationProvider } from '@/src/context/NotificationContext'
import ToastContainer from '@/src/components/ToastContainer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Giro no Mercado',
  description: 'Marketplace do Mercado Central',
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
