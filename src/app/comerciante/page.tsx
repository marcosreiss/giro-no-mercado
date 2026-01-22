// src/app/comerciante/page.tsx
 
'use client'

import { useAuth } from '@/src/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'

export default function ComerciantePage() {
    const { user, loading, logout } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        } else if (!loading && user && user.tipo_usuario !== 'comerciante') {
            router.push('/login')
        }
    }, [user, loading, router])

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="text-xl text-neutral-600">Carregando...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="bg-giro-amarelo text-neutral-0 p-4 shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 relative">
                            <Image
                                src="/LOGO-GIRO-NO-MERCADO.png"
                                alt="Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Minha Banca</h1>
                            <p className="text-sm opacity-90">Olá, {user.nome_completo}!</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="bg-neutral-0 text-giro-amarelo px-5 py-2 rounded-lg font-semibold active:opacity-80 transition-all btn-touch"
                    >
                        Sair
                    </button>
                </div>
            </header>

            {/* Dashboard */}
            <main className="max-w-7xl mx-auto p-4">
                {/* Cards de resumo */}
                <div className="grid grid-cols-2 gap-4 mb-6 mt-4">
                    <div className="bg-neutral-0 rounded-2xl p-5 shadow-md border border-neutral-200">
                        <p className="text-neutral-600 text-sm mb-1">Pedidos Hoje</p>
                        <p className="text-3xl font-bold text-giro-verde-escuro">0</p>
                    </div>
                    <div className="bg-neutral-0 rounded-2xl p-5 shadow-md border border-neutral-200">
                        <p className="text-neutral-600 text-sm mb-1">Vendas Hoje</p>
                        <p className="text-3xl font-bold text-giro-verde-escuro">R$ 0,00</p>
                    </div>
                </div>

                {/* Novos Pedidos */}
                <section className="mb-6">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">Novos Pedidos</h2>
                    <div className="bg-neutral-0 rounded-2xl p-8 text-center border border-neutral-200">
                        <div className="text-6xl mb-3">📦</div>
                        <p className="text-neutral-600 text-lg">Nenhum pedido novo</p>
                        <p className="text-neutral-400 text-sm mt-2">
                            Você será notificado quando receber pedidos
                        </p>
                    </div>
                </section>

                {/* Ações rápidas */}
                <section>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">Ações Rápidas</h2>
                    <div className="grid gap-4">
                        <button className="bg-neutral-0 rounded-2xl p-6 text-left border-2 border-neutral-200 active:bg-neutral-50 transition-all btn-touch">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">📝</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-neutral-900">Gerenciar Produtos</h3>
                                    <p className="text-sm text-neutral-600">Adicionar, editar ou remover produtos</p>
                                </div>
                                <div className="text-2xl text-neutral-400">→</div>
                            </div>
                        </button>

                        <button className="bg-neutral-0 rounded-2xl p-6 text-left border-2 border-neutral-200 active:bg-neutral-50 transition-all btn-touch">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">📊</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-neutral-900">Histórico de Vendas</h3>
                                    <p className="text-sm text-neutral-600">Ver relatório de vendas anteriores</p>
                                </div>
                                <div className="text-2xl text-neutral-400">→</div>
                            </div>
                        </button>

                        <button className="bg-neutral-0 rounded-2xl p-6 text-left border-2 border-neutral-200 active:bg-neutral-50 transition-all btn-touch">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">💰</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-neutral-900">Minha Carteira</h3>
                                    <p className="text-sm text-neutral-600">Saldo: R$ 0,00</p>
                                </div>
                                <div className="text-2xl text-neutral-400">→</div>
                            </div>
                        </button>
                    </div>
                </section>
            </main>
        </div>
    )
}
