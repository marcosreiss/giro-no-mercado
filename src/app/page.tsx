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
      <div className="h-screen bg-gradient-to-b from-giro-verde-claro/10 to-neutral-0 flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden">
        {/* Logo e Título */}
        <div className="text-center mt-8 sm:mt-12 flex-shrink-0">
          <div className="w-64 sm:w-80 h-24 sm:h-32 mx-auto mb-4 sm:mb-6 relative">
            <Image
              src="/LOGO-COM-TEXTO.png"
              alt="Giro no Mercado"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1
            className="font-bold text-neutral-900 mb-2"
            style={{ fontSize: 'clamp(1.25rem, 4vw + 0.5rem, 2rem)' }}
          >
            Bem-vindo ao Giro no Mercado!
          </h1>
          <p
            className="text-neutral-600"
            style={{ fontSize: 'clamp(1rem, 2.5vw + 0.25rem, 1.25rem)' }}
          >
            Conectando você ao Mercado Central
          </p>
        </div>

        {/* Opções principais */}
        <div className="w-full max-w-md space-y-3 sm:space-y-4 mb-8 sm:mb-12">
          <h2
            className="font-bold text-center text-neutral-900 mb-4 sm:mb-6"
            style={{ fontSize: 'clamp(1.125rem, 3vw + 0.5rem, 1.5rem)' }}
          >
            É sua primeira vez aqui?
          </h2>

          {/* Já tenho conta */}
          <button
            onClick={() => router.push('/login')}
            style={{ minHeight: 'clamp(7rem, 18vw, 9rem)' }}
            className="w-full bg-giro-verde-escuro active:opacity-80 text-neutral-0 rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all shadow-xl btn-touch"
          >
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <LogIn style={{ width: 'clamp(2.5rem, 8vw, 3.5rem)', height: 'clamp(2.5rem, 8vw, 3.5rem)' }} />
              <div className="text-center">
                <h3
                  className="font-bold mb-1"
                  style={{ fontSize: 'clamp(1.25rem, 4vw + 0.25rem, 1.75rem)' }}
                >
                  Já tenho conta
                </h3>
                <p
                  className="opacity-90"
                  style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1.125rem)' }}
                >
                  Fazer login agora
                </p>
              </div>
            </div>
          </button>

          {/* Primeira vez */}
          <button
            onClick={() => setPasso('cadastro')}
            style={{ minHeight: 'clamp(7rem, 18vw, 9rem)' }}
            className="w-full bg-neutral-0 border-2 sm:border-4 border-giro-verde-escuro active:bg-neutral-50 text-neutral-900 rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all shadow-lg btn-touch"
          >
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <UserPlus
                className="text-giro-verde-escuro"
                style={{ width: 'clamp(2.5rem, 8vw, 3.5rem)', height: 'clamp(2.5rem, 8vw, 3.5rem)' }}
              />
              <div className="text-center">
                <h3
                  className="font-bold mb-1"
                  style={{ fontSize: 'clamp(1.25rem, 4vw + 0.25rem, 1.75rem)' }}
                >
                  Primeira vez aqui
                </h3>
                <p
                  className="text-neutral-600"
                  style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1.125rem)' }}
                >
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
    <div className="h-screen bg-gradient-to-b from-giro-verde-claro/10 to-neutral-0 flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden">
      {/* Logo menor */}
      <div className="text-center mt-6 sm:mt-8 flex-shrink-0">
        <div className="w-48 sm:w-64 h-16 sm:h-24 mx-auto mb-3 sm:mb-4 relative">
          <Image
            src="/LOGO-COM-TEXTO.png"
            alt="Giro no Mercado"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Seleção de perfil */}
      <div className="w-full max-w-md space-y-3 mb-6 sm:mb-8 flex-1 flex flex-col justify-center">
        <h2
          className="font-bold text-center text-neutral-900 mb-3 sm:mb-4"
          style={{ fontSize: 'clamp(1.125rem, 3.5vw + 0.5rem, 1.75rem)' }}
        >
          Como você quer se cadastrar?
        </h2>

        {/* Cliente */}
        <button
          onClick={() => router.push('/cadastro/cliente')}
          style={{ minHeight: 'clamp(4.5rem, 12vw, 5.5rem)' }}
          className="w-full bg-neutral-0 border-2 sm:border-4 border-giro-verde-claro active:bg-giro-verde-claro/10 text-neutral-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all shadow-lg btn-touch"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-giro-verde-claro/20 p-2 sm:p-3 rounded-xl flex-shrink-0">
              <ShoppingCart
                className="text-giro-verde-claro"
                style={{ width: 'clamp(1.75rem, 6vw, 2.5rem)', height: 'clamp(1.75rem, 6vw, 2.5rem)' }}
              />
            </div>
            <div className="text-left flex-1 min-w-0">
              <h3
                className="font-bold leading-tight"
                style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)' }}
              >
                🛒 Sou Cliente
              </h3>
              <p
                className="text-neutral-600"
                style={{ fontSize: 'clamp(0.8125rem, 2.5vw + 0.125rem, 1rem)' }}
              >
                Quero comprar produtos frescos
              </p>
            </div>
            <ArrowRight
              className="text-neutral-400 flex-shrink-0"
              style={{ width: 'clamp(1.25rem, 4vw, 1.5rem)', height: 'clamp(1.25rem, 4vw, 1.5rem)' }}
            />
          </div>
        </button>

        {/* Feirante */}
        <button
          onClick={() => router.push('/cadastro/comerciante')}
          style={{ minHeight: 'clamp(4.5rem, 12vw, 5.5rem)' }}
          className="w-full bg-neutral-0 border-2 sm:border-4 border-giro-amarelo active:bg-giro-amarelo/10 text-neutral-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all shadow-lg btn-touch"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-giro-amarelo/20 p-2 sm:p-3 rounded-xl flex-shrink-0">
              <Store
                className="text-giro-amarelo"
                style={{ width: 'clamp(1.75rem, 6vw, 2.5rem)', height: 'clamp(1.75rem, 6vw, 2.5rem)' }}
              />
            </div>
            <div className="text-left flex-1 min-w-0">
              <h3
                className="font-bold leading-tight"
                style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)' }}
              >
                🏪 Sou Feirante
              </h3>
              <p
                className="text-neutral-600"
                style={{ fontSize: 'clamp(0.8125rem, 2.5vw + 0.125rem, 1rem)' }}
              >
                Tenho uma banca no mercado
              </p>
            </div>
            <ArrowRight
              className="text-neutral-400 flex-shrink-0"
              style={{ width: 'clamp(1.25rem, 4vw, 1.5rem)', height: 'clamp(1.25rem, 4vw, 1.5rem)' }}
            />
          </div>
        </button>

        {/* Entregador */}
        <button
          onClick={() => router.push('/cadastro/entregador')}
          style={{ minHeight: 'clamp(4.5rem, 12vw, 5.5rem)' }}
          className="w-full bg-neutral-0 border-2 sm:border-4 border-giro-azul-medio active:bg-giro-azul-medio/10 text-neutral-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all shadow-lg btn-touch"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-giro-azul-medio/20 p-2 sm:p-3 rounded-xl flex-shrink-0">
              <Package
                className="text-giro-azul-medio"
                style={{ width: 'clamp(1.75rem, 6vw, 2.5rem)', height: 'clamp(1.75rem, 6vw, 2.5rem)' }}
              />
            </div>
            <div className="text-left flex-1 min-w-0">
              <h3
                className="font-bold leading-tight"
                style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)' }}
              >
                🚴 Sou Entregador
              </h3>
              <p
                className="text-neutral-600"
                style={{ fontSize: 'clamp(0.8125rem, 2.5vw + 0.125rem, 1rem)' }}
              >
                Quero fazer entregas
              </p>
            </div>
            <ArrowRight
              className="text-neutral-400 flex-shrink-0"
              style={{ width: 'clamp(1.25rem, 4vw, 1.5rem)', height: 'clamp(1.25rem, 4vw, 1.5rem)' }}
            />
          </div>
        </button>

        {/* Voltar */}
        <button
          onClick={() => setPasso('inicial')}
          style={{
            fontSize: 'clamp(1rem, 2.5vw + 0.25rem, 1.125rem)',
            minHeight: 'clamp(3rem, 8vw, 3.5rem)'
          }}
          className="w-full mt-3 sm:mt-4 text-neutral-600 active:text-neutral-900 font-bold btn-touch py-3 sm:py-4 rounded-xl"
        >
          ← Voltar
        </button>
      </div>
    </div>
  )
}
