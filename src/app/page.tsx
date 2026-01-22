// src/app/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShoppingCart, Store, Package, ArrowRight, LogIn, UserPlus } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [passo, setPasso] = useState<'inicial' | 'cadastro'>('inicial')

  if (passo === 'inicial') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-giro-verde-claro/10 to-neutral-0 flex flex-col items-center justify-center p-4">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-80 h-32 mx-auto mb-6 relative">
            <Image
              src="/LOGO-COM-TEXTO.png"
              alt="Giro no Mercado"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Bem-vindo ao Giro no Mercado!
          </h1>
          <p className="text-neutral-600 text-lg">
            Conectando você ao Mercado Central
          </p>
        </div>

        {/* Opções principais */}
        <div className="w-full max-w-md space-y-4">
          <h2 className="text-xl font-bold text-center text-neutral-900 mb-6">
            É sua primeira vez aqui?
          </h2>

          {/* Já tenho conta */}
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-giro-verde-escuro active:opacity-80 text-neutral-0 rounded-2xl p-8 transition-all shadow-xl btn-touch"
          >
            <div className="flex flex-col items-center gap-3">
              <LogIn size={56} />
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Já tenho conta</h3>
                <p className="text-base opacity-90">
                  Fazer login agora
                </p>
              </div>
            </div>
          </button>

          {/* Primeira vez */}
          <button
            onClick={() => setPasso('cadastro')}
            className="w-full bg-neutral-0 border-2 border-giro-verde-escuro active:bg-neutral-50 text-neutral-900 rounded-2xl p-8 transition-all shadow-lg btn-touch"
          >
            <div className="flex flex-col items-center gap-3">
              <UserPlus size={56} className="text-giro-verde-escuro" />
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Primeira vez aqui</h3>
                <p className="text-base text-neutral-600">
                  Criar minha conta
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    )
  }

  // Passo 2: Escolher tipo de cadastro
  return (
    <div className="min-h-screen bg-gradient-to-b from-giro-verde-claro/10 to-neutral-0 flex flex-col items-center justify-center p-4">
      {/* Logo menor */}
      <div className="text-center mb-8">
        <div className="w-64 h-24 mx-auto mb-4 relative">
          <Image
            src="/LOGO-COM-TEXTO.png"
            alt="Giro no Mercado"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Seleção de perfil */}
      <div className="w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-neutral-900 mb-6">
          Como você quer se cadastrar?
        </h2>

        {/* Cliente */}
        <button
          onClick={() => router.push('/cadastro/cliente')}
          className="w-full bg-neutral-0 border-2 border-giro-verde-claro active:bg-giro-verde-claro/10 text-neutral-900 rounded-2xl p-6 transition-all shadow-lg btn-touch"
        >
          <div className="flex items-center gap-4">
            <ShoppingCart size={48} className="text-giro-verde-claro flex-shrink-0" />
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold">Sou Cliente</h3>
              <p className="text-sm text-neutral-600">
                Quero comprar produtos frescos
              </p>
            </div>
            <ArrowRight size={24} className="text-neutral-400 flex-shrink-0" />
          </div>
        </button>

        {/* Feirante */}
        <button
          onClick={() => router.push('/cadastro/comerciante')}
          className="w-full bg-neutral-0 border-2 border-giro-amarelo active:bg-giro-amarelo/10 text-neutral-900 rounded-2xl p-6 transition-all shadow-lg btn-touch"
        >
          <div className="flex items-center gap-4">
            <Store size={48} className="text-giro-amarelo flex-shrink-0" />
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold">Sou Feirante</h3>
              <p className="text-sm text-neutral-600">
                Tenho uma banca no mercado
              </p>
            </div>
            <ArrowRight size={24} className="text-neutral-400 flex-shrink-0" />
          </div>
        </button>

        {/* Entregador */}
        <button
          onClick={() => router.push('/cadastro/entregador')}
          className="w-full bg-neutral-0 border-2 border-giro-azul-medio active:bg-giro-azul-medio/10 text-neutral-900 rounded-2xl p-6 transition-all shadow-lg btn-touch"
        >
          <div className="flex items-center gap-4">
            <Package size={48} className="text-giro-azul-medio flex-shrink-0" />
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold">Sou Entregador Parceiro</h3>
              <p className="text-sm text-neutral-600">
                Quero fazer entregas
              </p>
            </div>
            <ArrowRight size={24} className="text-neutral-400 flex-shrink-0" />
          </div>
        </button>

        {/* Voltar */}
        <button
          onClick={() => setPasso('inicial')}
          className="w-full mt-6 text-neutral-600 active:text-neutral-900 font-bold text-lg btn-touch py-4"
        >
          ← Voltar
        </button>
      </div>
    </div>
  )
}
