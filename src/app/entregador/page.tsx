// src/app/entregador/page.tsx
'use client'

import { useAuth } from '@/src/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function EntregadorPage() {
    const { user, loading, logout } = useAuth()
    const router = useRouter()
    const [disponivel, setDisponivel] = useState(true)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        } else if (!loading && user && user.tipo_usuario !== 'entregador') {
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
            <header className="bg-giro-azul-medio text-neutral-0 p-4 shadow-lg sticky top-0 z-50">
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
                            <h1 className="text-xl font-bold">Entregas</h1>
                            <p className="text-sm opacity-90">Olá, {user.nome_completo}!</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="bg-neutral-0 text-giro-azul-medio px-5 py-2 rounded-lg font-semibold active:opacity-80 transition-all btn-touch"
                    >
                        Sair
                    </button>
                </div>
            </header>

            {/* Status toggle */}
            <div className="bg-neutral-0 border-b-2 border-neutral-200 p-4 sticky top-[72px] z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <p className="text-sm text-neutral-600">Seu Status</p>
                        <p className="font-bold text-lg text-neutral-900">
                            {disponivel ? '🟢 Disponível' : '🔴 Indisponível'}
                        </p>
                    </div>
                    <button
                        onClick={() => setDisponivel(!disponivel)}
                        className={`px-6 py-3 rounded-xl font-bold transition-all btn-touch ${disponivel
                                ? 'bg-error text-neutral-0'
                                : 'bg-success text-neutral-0'
                            }`}
                    >
                        {disponivel ? 'Ficar Indisponível' : 'Ficar Disponível'}
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-4">
                {/* Cards de resumo */}
                <div className="grid grid-cols-3 gap-3 mb-6 mt-4">
                    <div className="bg-neutral-0 rounded-2xl p-4 shadow-md border border-neutral-200">
                        <p className="text-neutral-600 text-xs mb-1">Hoje</p>
                        <p className="text-2xl font-bold text-giro-azul-escuro">0</p>
                    </div>
                    <div className="bg-neutral-0 rounded-2xl p-4 shadow-md border border-neutral-200">
                        <p className="text-neutral-600 text-xs mb-1">Ganhos</p>
                        <p className="text-2xl font-bold text-success">R$ 0</p>
                    </div>
                    <div className="bg-neutral-0 rounded-2xl p-4 shadow-md border border-neutral-200">
                        <p className="text-neutral-600 text-xs mb-1">Avaliação</p>
                        <p className="text-2xl font-bold text-giro-amarelo">5.0 ⭐</p>
                    </div>
                </div>

                {/* Entregas disponíveis */}
                <section className="mb-6">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                        {disponivel ? 'Entregas Disponíveis' : 'Você está indisponível'}
                    </h2>

                    {disponivel ? (
                        <div className="bg-neutral-0 rounded-2xl p-8 text-center border border-neutral-200">
                            <div className="text-6xl mb-3">📍</div>
                            <p className="text-neutral-600 text-lg">Nenhuma entrega disponível</p>
                            <p className="text-neutral-400 text-sm mt-2">
                                Aguarde novos pedidos aparecerem
                            </p>
                        </div>
                    ) : (
                        <div className="bg-neutral-100 rounded-2xl p-8 text-center border border-neutral-200">
                            <div className="text-6xl mb-3">😴</div>
                            <p className="text-neutral-600 text-lg">Você está em pausa</p>
                            <p className="text-neutral-400 text-sm mt-2">
                                Ative seu status para receber entregas
                            </p>
                        </div>
                    )}
                </section>

                {/* Ações */}
                <section>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">Menu</h2>
                    <div className="grid gap-4">
                        <button className="bg-neutral-0 rounded-2xl p-6 text-left border-2 border-neutral-200 active:bg-neutral-50 transition-all btn-touch">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">📦</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-neutral-900">Minhas Entregas</h3>
                                    <p className="text-sm text-neutral-600">Histórico de entregas realizadas</p>
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

                        <button className="bg-neutral-0 rounded-2xl p-6 text-left border-2 border-neutral-200 active:bg-neutral-50 transition-all btn-touch">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">⭐</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-neutral-900">Minhas Avaliações</h3>
                                    <p className="text-sm text-neutral-600">Ver feedback dos clientes</p>
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
