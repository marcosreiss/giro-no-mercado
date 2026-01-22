// src/app/comerciante/carteira/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, Package, DollarSign, Calendar } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'
import { useAuth } from '@/src/context/AuthContext'
import { formatarMoeda, formatarData, tempoRelativo } from '@/src/lib/utils'

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
    const [comerciante, setComerciant] = useState<any>(null)
    const [transacoes, setTransacoes] = useState<Transacao[]>([])
    const [stats, setStats] = useState({
        saldo: 0,
        totalVendas: 0,
        vendasMes: 0,
        pedidosEntregues: 0
    })

    useEffect(() => {
        if (user) {
            carregarDados()
        }
    }, [user])

    const carregarDados = async () => {
        try {
            setLoading(true)

            // Buscar dados do comerciante
            const { data: comercianteData } = await supabase
                .from('comerciantes')
                .select('*')
                .eq('usuario_id', user?.id)
                .single()

            if (!comercianteData) return

            setComerciant(comercianteData)

            // Buscar pedidos entregues do comerciante
            const { data: pedidos } = await supabase
                .from('pedidos')
                .select(`
                    id,
                    criado_em,
                    valor_total,
                    usuarios!pedidos_cliente_id_fkey (
                        nome_completo
                    )
                `)
                .eq('status', 'entregue')
                .order('criado_em', { ascending: false })

            if (!pedidos) return

            // Buscar itens de cada pedido para este comerciante
            const transacoesData: Transacao[] = []
            let totalMes = 0
            const umMesAtras = new Date()
            umMesAtras.setDate(umMesAtras.getDate() - 30)

            for (const pedido of pedidos) {
                const { data: itens } = await supabase
                    .from('itens_pedido')
                    .select('preco_total')
                    .eq('pedido_id', pedido.id)
                    .eq('comerciante_id', comercianteData.id)

                if (itens && itens.length > 0) {
                    const valorTotal = itens.reduce((sum, item) => sum + item.preco_total, 0)
                    
                    transacoesData.push({
                        id: pedido.id,
                        criado_em: pedido.criado_em,
                        valor: valorTotal,
                        tipo: 'entrada',
                        descricao: 'Venda concluída',
                        cliente: pedido.usuarios.nome_completo
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
    }

    return (
        <div className="space-y-6">
            {/* Título */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                    Minha Carteira
                </h2>
                <p className="text-neutral-600 mt-1">
                    Acompanhe seus ganhos e receitas
                </p>
            </div>

            {/* Saldo Principal */}
            <div className="bg-gradient-to-br from-giro-amarelo to-giro-amarelo/80 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-neutral-0/20 p-3 rounded-2xl">
                        <Wallet size={32} className="text-neutral-900" />
                    </div>
                    <div>
                        <p className="text-neutral-900/80 text-sm font-semibold">
                            Saldo Disponível
                        </p>
                        <p className="text-xs text-neutral-900/60">
                            {comerciante?.banca_nome || 'Minha Banca'}
                        </p>
                    </div>
                </div>
                <p className="text-4xl font-bold text-neutral-900 mb-2">
                    {formatarMoeda(stats.saldo)}
                </p>
                <p className="text-sm text-neutral-900/70">
                    Receita total acumulada
                </p>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-neutral-0 rounded-xl p-4 border-2 border-neutral-200">
                    <div className="flex items-center gap-2 text-neutral-700 mb-2">
                        <TrendingUp size={16} />
                    </div>
                    <p className="text-lg font-bold text-neutral-900">
                        {formatarMoeda(stats.vendasMes)}
                    </p>
                    <p className="text-xs text-neutral-600">
                        Últimos 30 dias
                    </p>
                </div>

                <div className="bg-neutral-0 rounded-xl p-4 border-2 border-neutral-200">
                    <div className="flex items-center gap-2 text-neutral-700 mb-2">
                        <Package size={16} />
                    </div>
                    <p className="text-lg font-bold text-neutral-900">
                        {stats.pedidosEntregues}
                    </p>
                    <p className="text-xs text-neutral-600">
                        Pedidos entregues
                    </p>
                </div>

                <div className="bg-neutral-0 rounded-xl p-4 border-2 border-neutral-200">
                    <div className="flex items-center gap-2 text-neutral-700 mb-2">
                        <DollarSign size={16} />
                    </div>
                    <p className="text-lg font-bold text-neutral-900">
                        {stats.pedidosEntregues > 0 
                            ? formatarMoeda(stats.totalVendas / stats.pedidosEntregues)
                            : 'R$ 0,00'
                        }
                    </p>
                    <p className="text-xs text-neutral-600">
                        Ticket médio
                    </p>
                </div>
            </div>

            {/* Extrato de Transações */}
            <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-3">
                    Extrato de Vendas
                </h3>

                {loading ? (
                    <div className="bg-neutral-0 rounded-2xl p-8 text-center border-2 border-neutral-200">
                        <p className="text-neutral-600">Carregando...</p>
                    </div>
                ) : transacoes.length === 0 ? (
                    <div className="bg-neutral-0 rounded-2xl p-8 text-center border-2 border-neutral-200">
                        <div className="text-6xl mb-3">💰</div>
                        <p className="text-neutral-600 text-lg font-semibold">
                            Nenhuma transação ainda
                        </p>
                        <p className="text-neutral-500 text-sm mt-2">
                            Suas vendas concluídas aparecerão aqui
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {transacoes.map((transacao) => (
                            <div
                                key={transacao.id}
                                className="bg-neutral-0 rounded-xl p-4 border-2 border-neutral-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-success/10 p-2 rounded-lg">
                                            <TrendingUp size={20} className="text-success" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-neutral-900">
                                                {transacao.descricao}
                                            </p>
                                            <p className="text-sm text-neutral-600">
                                                {transacao.cliente}
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                                                <Calendar size={12} />
                                                <span>{tempoRelativo(transacao.criado_em)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-success">
                                            + {formatarMoeda(transacao.valor)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Informação sobre saque */}
            <div className="bg-giro-verde-escuro/10 rounded-2xl p-5 border-2 border-giro-verde-escuro/30">
                <div className="flex items-start gap-3">
                    <div className="text-2xl">ℹ️</div>
                    <div>
                        <p className="font-bold text-neutral-900 mb-1">
                            Sobre os pagamentos
                        </p>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                            Os valores das vendas concluídas são acumulados em sua carteira. 
                            Para solicitar saque, entre em contato com a administração do mercado.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
