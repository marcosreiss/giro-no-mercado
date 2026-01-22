// src/app/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-giro-verde-claro/10 to-neutral-0 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="text-center mb-12">
        <div className="w-48 h-48 mx-auto mb-6 relative">
          <Image
            src="/LOGO-COM-TEXTO.png"
            alt="Giro no Mercado"
            fill
            className="object-contain"
            priority
          />
        </div>
        <p className="text-neutral-600 text-lg">
          Conectando você ao Mercado Central
        </p>
      </div>

      {/* Seleção de perfil */}
      <div className="w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-neutral-900 mb-6">
          Como você quer entrar?
        </h2>

        {/* Cliente */}
        <button
          onClick={() => router.push('/cadastro/cliente')}
          className="w-full bg-neutral-0 border-2 border-giro-verde-claro hover:bg-giro-verde-claro hover:text-neutral-0 text-neutral-900 rounded-2xl p-6 transition-all shadow-lg group btn-touch"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">🛒</div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold">Sou Cliente</h3>
              <p className="text-sm text-neutral-600 group-hover:text-neutral-100">
                Quero comprar produtos frescos
              </p>
            </div>
            <div className="text-2xl">→</div>
          </div>
        </button>

        {/* Feirante */}
        <button
          onClick={() => router.push('/cadastro/comerciante')}
          className="w-full bg-neutral-0 border-2 border-giro-amarelo hover:bg-giro-amarelo hover:text-neutral-0 text-neutral-900 rounded-2xl p-6 transition-all shadow-lg group btn-touch"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">🏪</div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold">Sou Feirante</h3>
              <p className="text-sm text-neutral-600 group-hover:text-neutral-100">
                Tenho uma banca no mercado
              </p>
            </div>
            <div className="text-2xl">→</div>
          </div>
        </button>

        {/* Entregador */}
        <button
          onClick={() => router.push('/cadastro/entregador')}
          className="w-full bg-neutral-0 border-2 border-giro-azul-medio hover:bg-giro-azul-medio hover:text-neutral-0 text-neutral-900 rounded-2xl p-6 transition-all shadow-lg group btn-touch"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">🏍️</div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold">Sou Entregador Parceiro</h3>
              <p className="text-sm text-neutral-600 group-hover:text-neutral-100">
                Quero fazer entregas
              </p>
            </div>
            <div className="text-2xl">→</div>
          </div>
        </button>

        {/* Link para login */}
        <div className="text-center mt-8 pt-6 border-t border-neutral-200">
          <p className="text-neutral-600 mb-3">Já tem uma conta?</p>
          <button
            onClick={() => router.push('/login')}
            className="text-giro-verde-escuro font-bold text-lg hover:underline"
          >
            Fazer Login
          </button>
        </div>
      </div>
    </div>
  )
}
