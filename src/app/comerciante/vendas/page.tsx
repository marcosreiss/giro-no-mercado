/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/comerciante/vendas/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, Package, Calendar, DollarSign, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'
import { useAuth } from '@/src/context/AuthContext'
import { formatarMoeda, formatarData } from '@/src/lib/utils'

interface ItemPedido {
    produto_nome: string
    quantidade: number
    unidade: string
    preco_total: number
}

interface Venda {
    id: string
    criado_em: string
    valor_total: number
    status: string
    cliente_nome: string
    itens_pedido: ItemPedido[]
}

export default function VendasPage() {
    const { user } = useAuth()
    const [vendas, setVendas] = useState<Venda[]>([])
    const [loading, setLoading] = useState(true)
    const [filtro, setFiltro] = useState<'todos' | 'hoje' | 'semana' | 'mes'>('todos')
    const [expandido, setExpandido] = useState<string | null>(null)
    const [totais, setTotais] = useState({
        total: 0,
        quantidade: 0,
        ticket_medio: 0
    })

    const carregarVendas = useCallback(async () => {
        try {
            setLoading(true)

            // Buscar comerciante
            const { data: comerciante, error: erroComerciante } = await supabase
                .from('comerciantes')
                .select('id')
                .eq('usuario_id', user?.id)
                .single()

            if (erroComerciante || !comerciante) {
                console.error('Erro ao buscar comerciante:', erroComerciante)
                return
            }

            // Calcular datas para filtro
            const agora = new Date()
            let dataInicio = new Date(0) // Epoch

            if (filtro === 'hoje') {
                dataInicio = new Date(agora)
                dataInicio.setHours(0, 0, 0, 0)
            } else if (filtro === 'semana') {
                dataInicio = new Date(agora)
                dataInicio.setDate(agora.getDate() - 7)
            } else if (filtro === 'mes') {
                dataInicio = new Date(agora)
                dataInicio.setDate(agora.getDate() - 30)
            }

            // Buscar pedidos entregues (vendas concluídas)
            const { data: pedidos, error: erroPedidos } = await supabase
                .from('pedidos')
                .select('id, criado_em, valor_total, status, cliente_id')
                .eq('status', 'entregue')
                .gte('criado_em', dataInicio.toISOString())
                .order('criado_em', { ascending: false })

            if (erroPedidos) {
                console.error('Erro ao buscar pedidos:', erroPedidos)
                return
            }

            if (!pedidos || pedidos.length === 0) {
                setVendas([])
                setTotais({ total: 0, quantidade: 0, ticket_medio: 0 })
                return
            }

            // Buscar itens de cada pedido do comerciante
            const vendasComItens = await Promise.all(
                pedidos.map(async (pedido) => {
                    // Buscar cliente
                    const { data: cliente } = await supabase
                        .from('usuarios')
                        .select('nome_completo')
                        .eq('id', pedido.cliente_id)
                        .single()

                    // Buscar itens do comerciante
                    const { data: itens } = await supabase
                        .from('itens_pedido')
                        .select('produto_nome, quantidade, unidade, preco_total')
                        .eq('pedido_id', pedido.id)
                        .eq('comerciante_id', comerciante.id)

                    return {
                        id: pedido.id,
                        criado_em: pedido.criado_em,
                        valor_total: pedido.valor_total,
                        status: pedido.status,
                        cliente_nome: cliente?.nome_completo || 'Cliente',
                        itens_pedido: itens || []
                    }
                })
            )

            // Filtrar apenas vendas que têm itens do comerciante
            const vendasFiltradas = vendasComItens.filter(v => v.itens_pedido.length > 0)

            setVendas(vendasFiltradas)

            // Calcular totais
            const totalVendido = vendasFiltradas.reduce((sum, v) => {
                const valorComerciante = v.itens_pedido.reduce((s, i) => s + i.preco_total, 0)
                return sum + valorComerciante
            }, 0)

            setTotais({
                total: totalVendido,
                quantidade: vendasFiltradas.length,
                ticket_medio: vendasFiltradas.length > 0 ? totalVendido / vendasFiltradas.length : 0
            })

        } catch (error) {
            console.error('Erro ao carregar vendas:', error)
        } finally {
            setLoading(false)
        }
    }, [user?.id, filtro])

    useEffect(() => {
        if (user) {
            carregarVendas()
        }
    }, [user, carregarVendas])

    const getValorVenda = (venda: Venda) => {
        return venda.itens_pedido.reduce((sum, item) => sum + item.preco_total, 0)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-giro-amarelo border-t-transparent rounded-full animate-spin mb-4"></div>
                <p style={{ fontSize: 'clamp(1.125rem, 3vw + 0.5rem, 1.5rem)' }} className="font-bold text-neutral-700 text-center">
                    Carregando vendas...
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 px-3 sm:px-0">
            {/* Título */}
            <div className="bg-giro-amarelo rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <ShoppingBag className="flex-shrink-0 text-neutral-900" style={{ width: 'clamp(1.5rem, 4vw, 2rem)', height: 'clamp(1.5rem, 4vw, 2rem)' }} />
                    <h2 style={{ fontSize: 'clamp(1.5rem, 5vw + 0.5rem, 2rem)' }} className="font-bold text-neutral-900 leading-tight">
                        Histórico de Vendas
                    </h2>
                </div>
                <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-900/80">
                    Acompanhe suas vendas realizadas
                </p>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
                {[
                    { value: 'todos', label: '📊 Todas' },
                    { value: 'hoje', label: '📅 Hoje' },
                    { value: 'semana', label: '📆 7 dias' },
                    { value: 'mes', label: '🗓️ 30 dias' }
                ].map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFiltro(f.value as any)}
                        style={{
                            fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)',
                            minHeight: 'clamp(2.5rem, 8vw, 3rem)'
                        }}
                        className={`px-4 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold whitespace-nowrap transition-all btn-touch shadow-md ${filtro === f.value
                                ? 'bg-giro-amarelo text-neutral-900 border-2 border-giro-amarelo'
                                : 'bg-neutral-0 text-neutral-600 active:bg-neutral-50 border-2 border-neutral-200'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-success/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 sm:border-4 border-success/30 shadow-md">
                    <div className="flex flex-col items-center gap-1 text-success mb-1 sm:mb-2">
                        <DollarSign style={{ width: 'clamp(1rem, 3vw, 1.25rem)', height: 'clamp(1rem, 3vw, 1.25rem)' }} />
                        <p style={{ fontSize: 'clamp(0.6875rem, 1.5vw + 0.125rem, 0.75rem)' }} className="font-bold text-center">
                            💰 Total
                        </p>
                    </div>
                    <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1.125rem)' }} className="font-bold text-success text-center leading-tight">
                        {formatarMoeda(totais.total)}
                    </p>
                </div>

                <div className="bg-giro-amarelo/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 sm:border-4 border-giro-amarelo/30 shadow-md">
                    <div className="flex flex-col items-center gap-1 text-giro-amarelo mb-1 sm:mb-2">
                        <Package style={{ width: 'clamp(1rem, 3vw, 1.25rem)', height: 'clamp(1rem, 3vw, 1.25rem)' }} />
                        <p style={{ fontSize: 'clamp(0.6875rem, 1.5vw + 0.125rem, 0.75rem)' }} className="font-bold text-center">
                            📦 Vendas
                        </p>
                    </div>
                    <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1.125rem)' }} className="font-bold text-giro-amarelo text-center leading-tight">
                        {totais.quantidade}
                    </p>
                </div>

                <div className="bg-neutral-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 sm:border-4 border-neutral-300 shadow-md">
                    <div className="flex flex-col items-center gap-1 text-neutral-700 mb-1 sm:mb-2">
                        <TrendingUp style={{ width: 'clamp(1rem, 3vw, 1.25rem)', height: 'clamp(1rem, 3vw, 1.25rem)' }} />
                        <p style={{ fontSize: 'clamp(0.6875rem, 1.5vw + 0.125rem, 0.75rem)' }} className="font-bold text-center">
                            📈 Ticket
                        </p>
                    </div>
                    <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900 text-center leading-tight">
                        {formatarMoeda(totais.ticket_medio)}
                    </p>
                </div>
            </div>

            {/* Lista de Vendas */}
            <section>
                <h3 style={{ fontSize: 'clamp(1.125rem, 3.5vw + 0.5rem, 1.5rem)' }} className="font-bold text-neutral-900 mb-3 sm:mb-4">
                    📋 Vendas Realizadas
                </h3>

                {vendas.length === 0 ? (
                    <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center border-2 border-neutral-200 shadow-md">
                        <div style={{ fontSize: 'clamp(3rem, 10vw, 4.5rem)' }} className="mb-2 sm:mb-3">
                            📊
                        </div>
                        <p style={{ fontSize: 'clamp(1rem, 3vw + 0.5rem, 1.25rem)' }} className="text-neutral-900 font-bold mb-2">
                            Nenhuma venda encontrada
                        </p>
                        <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-500">
                            Vendas concluídas aparecerão aqui
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2 sm:space-y-3">
                        {vendas.map((venda) => (
                            <div
                                key={venda.id}
                                className="bg-neutral-0 rounded-xl sm:rounded-2xl border-2 border-neutral-200 overflow-hidden shadow-md"
                            >
                                <button
                                    onClick={() => setExpandido(expandido === venda.id ? null : venda.id)}
                                    style={{ minHeight: 'clamp(4.5rem, 12vw, 5.5rem)' }}
                                    className="w-full p-4 sm:p-5 text-left active:bg-neutral-50 transition-colors"
                                >
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 sm:mb-2 flex-wrap">
                                                <span style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>✅</span>
                                                <span style={{ fontSize: 'clamp(0.6875rem, 2vw + 0.125rem, 0.8125rem)' }} className="bg-success/20 text-success px-2 sm:px-3 py-1 rounded-lg font-bold">
                                                    Entregue
                                                </span>
                                            </div>
                                            <p style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900 mb-1 truncate">
                                                {venda.cliente_nome}
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar style={{ width: 'clamp(0.75rem, 2vw, 0.875rem)', height: 'clamp(0.75rem, 2vw, 0.875rem)' }} className="text-neutral-500 flex-shrink-0" />
                                                <span style={{ fontSize: 'clamp(0.75rem, 2vw + 0.125rem, 0.875rem)' }} className="text-neutral-500">
                                                    {formatarData(venda.criado_em)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                            <div className="text-right">
                                                <p style={{ fontSize: 'clamp(1.125rem, 3.5vw + 0.5rem, 1.5rem)' }} className="font-bold text-success leading-none mb-1">
                                                    {formatarMoeda(getValorVenda(venda))}
                                                </p>
                                                <p style={{ fontSize: 'clamp(0.6875rem, 2vw, 0.75rem)' }} className="text-neutral-500">
                                                    {venda.itens_pedido.length} {venda.itens_pedido.length === 1 ? 'item' : 'itens'}
                                                </p>
                                            </div>
                                            {expandido === venda.id ? (
                                                <ChevronUp style={{ width: 'clamp(1.25rem, 4vw, 1.5rem)', height: 'clamp(1.25rem, 4vw, 1.5rem)' }} className="text-neutral-400" />
                                            ) : (
                                                <ChevronDown style={{ width: 'clamp(1.25rem, 4vw, 1.5rem)', height: 'clamp(1.25rem, 4vw, 1.5rem)' }} className="text-neutral-400" />
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {expandido === venda.id && (
                                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t-2 border-neutral-100 pt-3 sm:pt-4 space-y-2 sm:space-y-3 bg-neutral-50/50">
                                        <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="font-bold text-neutral-700 mb-2">
                                            📦 Itens Vendidos:
                                        </p>
                                        {venda.itens_pedido.map((item, idx) => (
                                            <div key={idx} className="bg-neutral-0 rounded-xl p-3 sm:p-4 border border-neutral-200 shadow-sm">
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p style={{ fontSize: 'clamp(0.9375rem, 2.5vw + 0.25rem, 1.0625rem)' }} className="font-bold text-neutral-900 mb-0.5">
                                                            {item.produto_nome}
                                                        </p>
                                                        <p style={{ fontSize: 'clamp(0.8125rem, 2vw + 0.25rem, 0.9375rem)' }} className="text-neutral-600">
                                                            📏 {item.quantidade} {item.unidade}
                                                        </p>
                                                    </div>
                                                    <p style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.125rem)' }} className="font-bold text-success flex-shrink-0">
                                                        {formatarMoeda(item.preco_total)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="bg-success/10 rounded-xl p-3 sm:p-4 border-2 border-success/30 mt-3">
                                            <div className="flex justify-between items-center">
                                                <p style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900">
                                                    💰 Total da Venda:
                                                </p>
                                                <p style={{ fontSize: 'clamp(1.25rem, 4vw + 0.5rem, 1.75rem)' }} className="font-bold text-success">
                                                    {formatarMoeda(getValorVenda(venda))}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
