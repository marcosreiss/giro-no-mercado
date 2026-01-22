'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/AuthContext'

export default function NotFound() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redireciona para a home da role do usuário
        switch (user.tipo_usuario) {
          case 'cliente':
            router.push('/cliente')
            break
          case 'comerciante':
            router.push('/comerciante')
            break
          case 'entregador':
            router.push('/entregador')
            break
          default:
            router.push('/')
        }
      } else {
        // Se não estiver logado, redireciona para a página de login
        router.push('/')
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Página não encontrada</p>
        <p className="text-gray-500">Redirecionando...</p>
      </div>
    </div>
  )
}
