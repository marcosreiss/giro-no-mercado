/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/src/lib/auth'
import { useAuth } from '@/src/context/AuthContext'
import Image from 'next/image'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [lembrarMe, setLembrarMe] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { setUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const user = await login(username, password, lembrarMe)
      setUser(user)

      // Redirecionar baseado no tipo de usuário
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
      }
    } catch (error: any) {
      setErro(error.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-giro-verde-claro/10 to-neutral-0 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-40 h-40 mx-auto mb-6 relative">
            <Image
              src="/LOGO-COM-TEXTO.png"
              alt="Giro no Mercado"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-neutral-600 mt-4 text-lg">Entre na sua conta</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-neutral-0 rounded-3xl shadow-xl border border-neutral-200 p-8">
          {erro && (
            <div className="bg-error/10 border-2 border-error/30 text-error px-4 py-3 rounded-xl mb-6 font-medium">
              ⚠️ {erro}
            </div>
          )}

          <div className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-base font-semibold text-neutral-700 mb-2">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-5 py-4 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-verde-claro focus:border-giro-verde-claro text-lg transition-all"
                placeholder="Digite seu usuário"
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-base font-semibold text-neutral-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-verde-claro focus:border-giro-verde-claro text-lg transition-all"
                placeholder="Digite sua senha"
                autoComplete="current-password"
              />
            </div>

            {/* Lembrar-me */}
            <div className="flex items-center">
              <input
                id="lembrar"
                type="checkbox"
                checked={lembrarMe}
                onChange={(e) => setLembrarMe(e.target.checked)}
                className="w-5 h-5 text-giro-verde-escuro border-2 border-neutral-400 rounded focus:ring-giro-verde-claro focus:ring-2"
              />
              <label htmlFor="lembrar" className="ml-3 text-neutral-700 font-medium">
                Lembrar-me por 30 dias
              </label>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-secundario hover:opacity-90 text-neutral-0 font-bold py-5 px-6 rounded-xl text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg btn-touch"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        {/* Usuários de teste */}
        <div className="mt-6 p-5 bg-giro-azul-escuro/5 border-2 border-giro-azul-medio/20 rounded-xl text-sm text-neutral-700">
          <p className="font-bold text-giro-azul-escuro mb-3 text-base">👤 Usuários de teste:</p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-giro-verde-claro rounded-full mr-2"></span>
              <strong>cliente1</strong> <span className="mx-2 text-neutral-400">/</span> demo123
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-giro-amarelo rounded-full mr-2"></span>
              <strong>banca1</strong> <span className="mx-2 text-neutral-400">/</span> demo123
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-giro-azul-medio rounded-full mr-2"></span>
              <strong>entregador1</strong> <span className="mx-2 text-neutral-400">/</span> demo123
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
