// src/app/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShoppingCart, Store, Package, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

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
          className="w-full bg-neutral-0 border-2 border-giro-verde-claro active:bg-giro-verde-claro active:text-neutral-0 text-neutral-900 rounded-2xl p-6 transition-all shadow-lg btn-touch"
        >
          <div className="flex items-center gap-4">
            <ShoppingCart size={48} className="text-giro-verde-claro" />
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold">Sou Cliente</h3>
              <p className="text-sm text-neutral-600">
                Quero comprar produtos frescos
              </p>
            </div>
            <ArrowRight size={24} className="text-neutral-400" />
          </div>
        </button>

        {/* Feirante */}
        <button
          onClick={() => router.push('/cadastro/comerciante')}
          className="w-full bg-neutral-0 border-2 border-giro-amarelo active:bg-giro-amarelo active:text-neutral-0 text-neutral-900 rounded-2xl p-6 transition-all shadow-lg btn-touch"
        >
          <div className="flex items-center gap-4">
            <Store size={48} className="text-giro-amarelo" />
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold">Sou Feirante</h3>
              <p className="text-sm text-neutral-600">
                Tenho uma banca no mercado
              </p>
            </div>
            <ArrowRight size={24} className="text-neutral-400" />
          </div>
        </button>

        {/* Entregador */}
        <button
          onClick={() => router.push('/cadastro/entregador')}
          className="w-full bg-neutral-0 border-2 border-giro-azul-medio active:bg-giro-azul-medio active:text-neutral-0 text-neutral-900 rounded-2xl p-6 transition-all shadow-lg btn-touch"
        >
          <div className="flex items-center gap-4">
            <Package size={48} className="text-giro-azul-medio" />
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold">Sou Entregador Parceiro</h3>
              <p className="text-sm text-neutral-600">
                Quero fazer entregas
              </p>
            </div>
            <ArrowRight size={24} className="text-neutral-400" />
          </div>
        </button>

        {/* Link para login */}
        <div className="text-center mt-8 pt-6 border-t border-neutral-200">
          <p className="text-neutral-600 mb-3">Já tem uma conta?</p>
          <button
            onClick={() => router.push('/login')}
            className="text-giro-verde-escuro font-bold text-lg active:underline btn-touch"
          >
            Fazer Login
          </button>
        </div>
      </div>
    </div>
  )
}
