// src/app/comerciante/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, TrendingUp, Wallet } from 'lucide-react'

export default function ComerciantePage() {
    const router = useRouter()
    const [stats] = useState({
        pedidosHoje: 0,
        vendasHoje: 0,
        saldoCarteira: 0
    })

    return (
        <div className="space-y-6">
            {/* Título */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                    Painel da Banca
                </h2>
                <p className="text-neutral-600 mt-1">
                    Gerencie seus produtos e pedidos
                </p>
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-0 rounded-2xl p-5 shadow-md border-2 border-giro-amarelo/20">
                    <p className="text-neutral-600 text-sm mb-1">Pedidos Hoje</p>
                    <p className="text-3xl font-bold text-giro-amarelo">
                        {stats.pedidosHoje}
                    </p>
                </div>
                <div className="bg-neutral-0 rounded-2xl p-5 shadow-md border-2 border-success/20">
                    <p className="text-neutral-600 text-sm mb-1">Vendas Hoje</p>
                    <p className="text-3xl font-bold text-success">
                        R$ {stats.vendasHoje.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Novos Pedidos */}
            <section>
                <h3 className="text-xl font-bold text-neutral-900 mb-4">
                    Novos Pedidos
                </h3>
                <div className="bg-neutral-0 rounded-2xl p-8 text-center border-2 border-neutral-200">
                    <div className="text-6xl mb-3">📦</div>
                    <p className="text-neutral-600 text-lg font-semibold">
                        Nenhum pedido novo
                    </p>
                    <p className="text-neutral-500 text-sm mt-2">
                        Você será notificado quando receber pedidos
                    </p>
                </div>
            </section>

            {/* Ações rápidas */}
            <section>
                <h3 className="text-xl font-bold text-neutral-900 mb-4">
                    Ações Rápidas
                </h3>
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/comerciante/produtos')}
                        className="w-full bg-neutral-0 rounded-2xl p-5 text-left border-2 border-neutral-200 active:bg-neutral-50 transition-all btn-touch"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-giro-amarelo/10 p-3 rounded-xl">
                                <Package size={28} className="text-giro-amarelo" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-neutral-900">
                                    Gerenciar Produtos
                                </h4>
                                <p className="text-sm text-neutral-600">
                                    Adicionar, editar ou remover produtos
                                </p>
                            </div>
                            <div className="text-2xl text-neutral-400">→</div>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/comerciante/vendas')}
                        className="w-full bg-neutral-0 rounded-2xl p-5 text-left border-2 border-neutral-200 active:bg-neutral-50 transition-all btn-touch"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-success/10 p-3 rounded-xl">
                                <TrendingUp size={28} className="text-success" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-neutral-900">
                                    Histórico de Vendas
                                </h4>
                                <p className="text-sm text-neutral-600">
                                    Ver relatório de vendas anteriores
                                </p>
                            </div>
                            <div className="text-2xl text-neutral-400">→</div>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/comerciante/carteira')}
                        className="w-full bg-neutral-0 rounded-2xl p-5 text-left border-2 border-neutral-200 active:bg-neutral-50 transition-all btn-touch"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-giro-verde-escuro/10 p-3 rounded-xl">
                                <Wallet size={28} className="text-giro-verde-escuro" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-neutral-900">
                                    Minha Carteira
                                </h4>
                                <p className="text-sm text-neutral-600">
                                    Saldo: R$ {stats.saldoCarteira.toFixed(2)}
                                </p>
                            </div>
                            <div className="text-2xl text-neutral-400">→</div>
                        </div>
                    </button>
                </div>
            </section>
        </div>
    )
}
