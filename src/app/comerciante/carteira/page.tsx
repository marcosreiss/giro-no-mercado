/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/comerciante/carteira/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Wallet, TrendingUp, Package, DollarSign, Calendar, Info } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'
import { useAuth } from '@/src/context/AuthContext'
import { formatarMoeda, tempoRelativo } from '@/src/lib/utils'

interface Transacao {
    id: string
    criado_em: string
    valor: number
    tipo: 'entrada'
    descricao: string
    cliente: string
}



export default function CarteiraPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [comerciante, setComerciante] = useState<any>(null)
    const [transacoes, setTransacoes] = useState<Transacao[]>([])
    const [stats, setStats] = useState({
        saldo: 0,
        totalVendas: 0,
        vendasMes: 0,
        pedidosEntregues: 0
    })

    const carregarDados = useCallback(async () => {
        try {
            setLoading(true)

            // Buscar dados do comerciante
            const { data: comercianteData, error: erroComerciante } = await supabase
                .from('comerciantes')
                .select('*')
                .eq('usuario_id', user?.id)
                .single()

            if (erroComerciante || !comercianteData) {
                console.error('Erro ao buscar comerciante:', erroComerciante)
                return
            }

            setComerciante(comercianteData)

            // Buscar pedidos entregues com clientes
            const { data: pedidos, error: erroPedidos } = await supabase
                .from('pedidos')
                .select(`
                    id,
                    criado_em,
                    valor_total,
                    cliente_id
                `)
                .eq('status', 'entregue')
                .order('criado_em', { ascending: false })

            if (erroPedidos) {
                console.error('Erro ao buscar pedidos:', erroPedidos)
                return
            }

            if (!pedidos || pedidos.length === 0) {
                setLoading(false)
                return
            }

            // Buscar itens de cada pedido para este comerciante
            const transacoesData: Transacao[] = []
            let totalMes = 0
            const umMesAtras = new Date()
            umMesAtras.setDate(umMesAtras.getDate() - 30)

            for (const pedido of pedidos) {
                // Buscar itens do pedido
                const { data: itens } = await supabase
                    .from('itens_pedido')
                    .select('preco_total')
                    .eq('pedido_id', pedido.id)
                    .eq('comerciante_id', comercianteData.id)

                if (itens && itens.length > 0) {
                    // Buscar nome do cliente
                    const { data: cliente } = await supabase
                        .from('usuarios')
                        .select('nome_completo')
                        .eq('id', pedido.cliente_id)
                        .single()

                    const valorTotal = itens.reduce((sum, item) => sum + item.preco_total, 0)

                    transacoesData.push({
                        id: pedido.id,
                        criado_em: pedido.criado_em,
                        valor: valorTotal,
                        tipo: 'entrada',
                        descricao: 'Venda concluída',
                        cliente: cliente?.nome_completo || 'Cliente'
                    })

                    // Calcular vendas do mês
                    if (new Date(pedido.criado_em) >= umMesAtras) {
                        totalMes += valorTotal
                    }
                }
            }

            setTransacoes(transacoesData)

            setStats({
                saldo: comercianteData.receita_total || 0,
                totalVendas: comercianteData.receita_total || 0,
                vendasMes: totalMes,
                pedidosEntregues: comercianteData.total_vendas || 0
            })

        } catch (error) {
            console.error('Erro ao carregar dados da carteira:', error)
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    useEffect(() => {
        if (user) {
            carregarDados()
        }
    }, [user, carregarDados])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-giro-amarelo border-t-transparent rounded-full animate-spin mb-4"></div>
                <p style={{ fontSize: 'clamp(1.125rem, 3vw + 0.5rem, 1.5rem)' }} className="font-bold text-neutral-700 text-center">
                    Carregando sua carteira...
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 px-3 sm:px-0">
            {/* Título */}
            <div className="bg-giro-amarelo rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <Wallet className="flex-shrink-0 text-neutral-900" style={{ width: 'clamp(1.5rem, 4vw, 2rem)', height: 'clamp(1.5rem, 4vw, 2rem)' }} />
                    <h2 style={{ fontSize: 'clamp(1.5rem, 5vw + 0.5rem, 2rem)' }} className="font-bold text-neutral-900 leading-tight">
                        Minha Carteira
                    </h2>
                </div>
                <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-900/80">
                    Acompanhe seus ganhos e receitas
                </p>
            </div>

            {/* Saldo Principal */}
            <div className="bg-gradient-to-br from-giro-amarelo to-giro-amarelo/80 rounded-xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border-2 sm:border-4 border-giro-amarelo">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="bg-neutral-900/10 p-2 sm:p-3 rounded-xl sm:rounded-2xl flex-shrink-0">
                        <Wallet style={{ width: 'clamp(1.5rem, 5vw, 2rem)', height: 'clamp(1.5rem, 5vw, 2rem)' }} className="text-neutral-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-900/80 font-bold">
                            💰 Saldo Disponível
                        </p>
                        <p style={{ fontSize: 'clamp(0.75rem, 2vw + 0.125rem, 0.875rem)' }} className="text-neutral-900/60 truncate">
                            {comerciante?.banca_nome || 'Minha Banca'}
                        </p>
                    </div>
                </div>
                <p style={{ fontSize: 'clamp(2rem, 8vw + 0.5rem, 3rem)' }} className="font-bold text-neutral-900 mb-1 sm:mb-2 leading-none">
                    {formatarMoeda(stats.saldo)}
                </p>
                <p style={{ fontSize: 'clamp(0.8125rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-900/70 font-semibold">
                    📊 Receita total acumulada
                </p>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 sm:border-4 border-neutral-300 shadow-md">
                    <div className="flex items-center justify-center gap-1 text-neutral-700 mb-1 sm:mb-2">
                        <TrendingUp style={{ width: 'clamp(0.875rem, 3vw, 1.125rem)', height: 'clamp(0.875rem, 3vw, 1.125rem)' }} />
                    </div>
                    <p style={{ fontSize: 'clamp(0.9375rem, 3vw + 0.25rem, 1.25rem)' }} className="font-bold text-neutral-900 text-center leading-tight">
                        {formatarMoeda(stats.vendasMes)}
                    </p>
                    <p style={{ fontSize: 'clamp(0.6875rem, 1.5vw + 0.125rem, 0.75rem)' }} className="text-neutral-600 text-center mt-0.5 sm:mt-1">
                        30 dias
                    </p>
                </div>

                <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 sm:border-4 border-neutral-300 shadow-md">
                    <div className="flex items-center justify-center gap-1 text-neutral-700 mb-1 sm:mb-2">
                        <Package style={{ width: 'clamp(0.875rem, 3vw, 1.125rem)', height: 'clamp(0.875rem, 3vw, 1.125rem)' }} />
                    </div>
                    <p style={{ fontSize: 'clamp(0.9375rem, 3vw + 0.25rem, 1.25rem)' }} className="font-bold text-neutral-900 text-center leading-tight">
                        {stats.pedidosEntregues}
                    </p>
                    <p style={{ fontSize: 'clamp(0.6875rem, 1.5vw + 0.125rem, 0.75rem)' }} className="text-neutral-600 text-center mt-0.5 sm:mt-1">
                        Pedidos
                    </p>
                </div>

                <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 sm:border-4 border-neutral-300 shadow-md">
                    <div className="flex items-center justify-center gap-1 text-neutral-700 mb-1 sm:mb-2">
                        <DollarSign style={{ width: 'clamp(0.875rem, 3vw, 1.125rem)', height: 'clamp(0.875rem, 3vw, 1.125rem)' }} />
                    </div>
                    <p style={{ fontSize: 'clamp(0.9375rem, 3vw + 0.25rem, 1.25rem)' }} className="font-bold text-neutral-900 text-center leading-tight">
                        {stats.pedidosEntregues > 0
                            ? formatarMoeda(stats.totalVendas / stats.pedidosEntregues)
                            : 'R$ 0'
                        }
                    </p>
                    <p style={{ fontSize: 'clamp(0.6875rem, 1.5vw + 0.125rem, 0.75rem)' }} className="text-neutral-600 text-center mt-0.5 sm:mt-1">
                        Ticket
                    </p>
                </div>
            </div>

            {/* Extrato de Transações */}
            <section>
                <h3 style={{ fontSize: 'clamp(1.125rem, 3.5vw + 0.5rem, 1.5rem)' }} className="font-bold text-neutral-900 mb-3 sm:mb-4">
                    📋 Extrato de Vendas
                </h3>

                {transacoes.length === 0 ? (
                    <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center border-2 border-neutral-200 shadow-md">
                        <div style={{ fontSize: 'clamp(3rem, 10vw, 4.5rem)' }} className="mb-2 sm:mb-3">
                            💰
                        </div>
                        <p style={{ fontSize: 'clamp(1rem, 3vw + 0.5rem, 1.25rem)' }} className="text-neutral-900 font-bold mb-2">
                            Nenhuma transação ainda
                        </p>
                        <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-500">
                            Suas vendas concluídas aparecerão aqui
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2 sm:space-y-3">
                        {transacoes.map((transacao) => (
                            <div
                                key={transacao.id}
                                className="bg-neutral-0 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-neutral-200 shadow-md"
                            >
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="bg-success/20 p-2 sm:p-3 rounded-xl flex-shrink-0">
                                        <TrendingUp className="text-success" style={{ width: 'clamp(1.125rem, 4vw, 1.5rem)', height: 'clamp(1.125rem, 4vw, 1.5rem)' }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900 mb-0.5">
                                            ✅ {transacao.descricao}
                                        </p>
                                        <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 truncate">
                                            {transacao.cliente}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Calendar style={{ width: 'clamp(0.75rem, 2vw, 0.875rem)', height: 'clamp(0.75rem, 2vw, 0.875rem)' }} className="text-neutral-500 flex-shrink-0" />
                                            <span style={{ fontSize: 'clamp(0.75rem, 2vw + 0.125rem, 0.875rem)' }} className="text-neutral-500">
                                                {tempoRelativo(transacao.criado_em)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p style={{ fontSize: 'clamp(1.125rem, 3.5vw + 0.5rem, 1.5rem)' }} className="font-bold text-success leading-none">
                                            + {formatarMoeda(transacao.valor)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Informação sobre saque */}
            <div className="bg-giro-verde-escuro/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-giro-verde-escuro/40 shadow-md">
                <div className="flex items-start gap-3">
                    <Info className="flex-shrink-0 text-giro-verde-escuro mt-0.5" size={22} />
                    <div className="flex-1">
                        <p style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900 mb-1 sm:mb-2">
                            ℹ️ Sobre os pagamentos
                        </p>
                        <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 leading-relaxed">
                            Os valores das vendas concluídas são acumulados em sua carteira.
                            Para solicitar saque, entre em contato com a administração do mercado.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
