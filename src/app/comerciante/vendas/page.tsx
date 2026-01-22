// src/app/comerciante/vendas/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Package, Calendar, DollarSign, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'
import { useAuth } from '@/src/context/AuthContext'
import { formatarMoeda, formatarData } from '@/src/lib/utils'

interface Venda {
    id: string
    criado_em: string
    valor_total: number
    status: string
    usuarios: {
        nome_completo: string
    }
    itens_pedido: {
        produto_nome: string
        quantidade: number
        unidade: string
        preco_total: number
    }[]
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

    useEffect(() => {
        if (user) {
            carregarVendas()
        }
    }, [user, filtro])

    const carregarVendas = async () => {
        try {
            setLoading(true)

            // Buscar comerciante
            const { data: comerciante } = await supabase
                .from('comerciantes')
                .select('id')
                .eq('usuario_id', user?.id)
                .single()

            if (!comerciante) return

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
            const { data: pedidos } = await supabase
                .from('pedidos')
                .select(`
                    id,
                    criado_em,
                    valor_total,
                    status,
                    usuarios!pedidos_cliente_id_fkey (
                        nome_completo
                    )
                `)
                .eq('status', 'entregue')
                .gte('criado_em', dataInicio.toISOString())
                .order('criado_em', { ascending: false })

            if (!pedidos) return

            // Buscar itens de cada pedido do comerciante
            const vendasComItens = await Promise.all(
                pedidos.map(async (pedido) => {
                    const { data: itens } = await supabase
                        .from('itens_pedido')
                        .select('produto_nome, quantidade, unidade, preco_total')
                        .eq('pedido_id', pedido.id)
                        .eq('comerciante_id', comerciante.id)

                    return {
                        ...pedido,
                        itens_pedido: itens || []
                    }
                })
            )

            // Filtrar apenas vendas que têm itens do comerciante
            const vendasFiltradas = vendasComItens.filter(v => v.itens_pedido.length > 0)

            setVendas(vendasFiltradas)

            // Calcular totais
            const totalVendido = vendasFiltradas.reduce((sum, v) => {
                const valorComerciant = v.itens_pedido.reduce((s, i) => s + i.preco_total, 0)
                return sum + valorComerciant
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
    }

    const getValorVenda = (venda: Venda) => {
        return venda.itens_pedido.reduce((sum, item) => sum + item.preco_total, 0)
    }

    return (
        <div className="space-y-6">
            {/* Título */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                    Histórico de Vendas
                </h2>
                <p className="text-neutral-600 mt-1">
                    Acompanhe suas vendas realizadas
                </p>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { value: 'todos', label: 'Todas' },
                    { value: 'hoje', label: 'Hoje' },
                    { value: 'semana', label: '7 dias' },
                    { value: 'mes', label: '30 dias' }
                ].map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFiltro(f.value as any)}
                        className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                            filtro === f.value
                                ? 'bg-giro-amarelo text-neutral-900'
                                : 'bg-neutral-200 text-neutral-600 active:bg-neutral-300'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-success/10 rounded-xl p-4 border-2 border-success/30">
                    <div className="flex items-center gap-2 text-success mb-1">
                        <DollarSign size={16} />
                        <p className="text-xs font-semibold">Total</p>
                    </div>
                    <p className="text-xl font-bold text-success">
                        {formatarMoeda(totais.total)}
                    </p>
                </div>

                <div className="bg-giro-amarelo/10 rounded-xl p-4 border-2 border-giro-amarelo/30">
                    <div className="flex items-center gap-2 text-giro-amarelo mb-1">
                        <Package size={16} />
                        <p className="text-xs font-semibold">Vendas</p>
                    </div>
                    <p className="text-xl font-bold text-giro-amarelo">
                        {totais.quantidade}
                    </p>
                </div>

                <div className="bg-neutral-100 rounded-xl p-4 border-2 border-neutral-300">
                    <div className="flex items-center gap-2 text-neutral-700 mb-1">
                        <TrendingUp size={16} />
                        <p className="text-xs font-semibold">Ticket</p>
                    </div>
                    <p className="text-xl font-bold text-neutral-900">
                        {formatarMoeda(totais.ticket_medio)}
                    </p>
                </div>
            </div>

            {/* Lista de Vendas */}
            <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-3">
                    Vendas Realizadas
                </h3>

                {loading ? (
                    <div className="bg-neutral-0 rounded-2xl p-8 text-center border-2 border-neutral-200">
                        <p className="text-neutral-600">Carregando...</p>
                    </div>
                ) : vendas.length === 0 ? (
                    <div className="bg-neutral-0 rounded-2xl p-8 text-center border-2 border-neutral-200">
                        <div className="text-6xl mb-3">📊</div>
                        <p className="text-neutral-600 text-lg font-semibold">
                            Nenhuma venda encontrada
                        </p>
                        <p className="text-neutral-500 text-sm mt-2">
                            Vendas concluídas aparecerão aqui
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {vendas.map((venda) => (
                            <div
                                key={venda.id}
                                className="bg-neutral-0 rounded-2xl border-2 border-neutral-200 overflow-hidden"
                            >
                                <button
                                    onClick={() => setExpandido(expandido === venda.id ? null : venda.id)}
                                    className="w-full p-4 text-left active:bg-neutral-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">✅</span>
                                                <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-lg font-semibold">
                                                    Entregue
                                                </span>
                                            </div>
                                            <p className="font-bold text-neutral-900">
                                                {venda.usuarios.nome_completo}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                                                <Calendar size={12} />
                                                <span>{formatarData(venda.criado_em)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-success">
                                                    {formatarMoeda(getValorVenda(venda))}
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    {venda.itens_pedido.length} {venda.itens_pedido.length === 1 ? 'item' : 'itens'}
                                                </p>
                                            </div>
                                            {expandido === venda.id ? (
                                                <ChevronUp size={20} className="text-neutral-400" />
                                            ) : (
                                                <ChevronDown size={20} className="text-neutral-400" />
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {expandido === venda.id && (
                                    <div className="px-4 pb-4 border-t-2 border-neutral-100 pt-3 space-y-2">
                                        {venda.itens_pedido.map((item, idx) => (
                                            <div key={idx} className="bg-neutral-50 rounded-lg p-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-neutral-900">
                                                            {item.produto_nome}
                                                        </p>
                                                        <p className="text-sm text-neutral-600">
                                                            {item.quantidade} {item.unidade}
                                                        </p>
                                                    </div>
                                                    <p className="font-bold text-success">
                                                        {formatarMoeda(item.preco_total)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
