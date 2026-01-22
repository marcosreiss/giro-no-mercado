/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/src/lib/auth'
import { useAuth } from '@/src/context/AuthContext'

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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4 relative">
            {/* Substitua por sua logo */}
            <div className="w-full h-full bg-green-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              GnM
            </div>
          </div>
          <h1 className="text-3xl font-bold text-green-800">Giro no Mercado</h1>
          <p className="text-gray-600 mt-2">Entre na sua conta</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {erro}
            </div>
          )}

          <div className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                placeholder="Digite seu usuário"
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
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
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="lembrar" className="ml-3 text-gray-700">
                Lembrar-me por 30 dias
              </label>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        {/* Usuários de teste */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">👤 Usuários de teste:</p>
          <ul className="space-y-1">
            <li>• <strong>cliente1</strong> / demo123</li>
            <li>• <strong>banca1</strong> / demo123</li>
            <li>• <strong>entregador1</strong> / demo123</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
