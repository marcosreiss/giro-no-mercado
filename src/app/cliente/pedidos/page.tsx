'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'
import { useAuth } from '@/src/context/AuthContext'
import { useNotification } from '@/src/context/NotificationContext'
import { formatarData, formatarMoeda, tempoRelativo, getStatusPedidoInfo } from '@/src/lib/utils'

interface ItemPedido {
    id: string
    produto_nome: string
    quantidade: number
    unidade: string
    preco_total: number
}

interface Pedido {
    id: string
    status: string
    entrada_retirada: string
    horario_retirada: string
    valor_total: number
    criado_em: string
    itens_pedido: ItemPedido[]
}

export default function ClientePedidosPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { success, error: showError } = useNotification()
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<'ativos' | 'historico'>('ativos')

    useEffect(() => {
        if (user) {
            carregarPedidos()
        }
    }, [user])

    const carregarPedidos = async () => {
        try {
            const { data, error } = await supabase
                .from('pedidos')
                .select(`
                    *,
                    itens_pedido (
                        id,
                        produto_nome,
                        quantidade,
                        unidade,
                        preco_total
                    )
                `)
                .eq('cliente_id', user?.id)
                .order('criado_em', { ascending: false })

            if (error) throw error
            setPedidos(data || [])
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error)
        } finally {
            setLoading(false)
        }
    }

    const confirmarRecebimento = async (pedidoId: string) => {
        try {
            console.log('🔄 [CONFIRMAR RECEBIMENTO] Iniciando confirmação do pedido:', pedidoId)
            
            const { data, error } = await supabase
                .from('pedidos')
                .update({ 
                    status: 'entregue'
                })
                .eq('id', pedidoId)
                .select()

            if (error) {
                console.error('❌ [CONFIRMAR RECEBIMENTO] Erro Supabase:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                })
                throw new Error(error.message || 'Erro ao confirmar recebimento')
            }

            console.log('✅ [CONFIRMAR RECEBIMENTO] Pedido atualizado:', data)
            success('Entrega confirmada! Obrigado!')
            carregarPedidos()
        } catch (err: any) {
            console.error('❌ [CONFIRMAR RECEBIMENTO] Erro:', err?.message || err)
            showError(err?.message || 'Erro ao confirmar entrega')
        }
    }

    const pedidosAtivos = pedidos.filter(p => 
        ['aguardando_aprovacao', 'aprovado', 'em_entrega', 'aguardando_confirmacao'].includes(p.status)
    )
    
    const pedidosHistorico = pedidos.filter(p => 
        ['entregue', 'cancelado', 'rejeitado'].includes(p.status)
    )

    const pedidosFiltrados = tab === 'ativos' ? pedidosAtivos : pedidosHistorico

    if (loading) {
        return <div className="text-center py-12">Carregando pedidos...</div>
    }

    return (
        <div className="space-y-6">
            {/* Título */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                    Meus Pedidos
                </h2>
                <p className="text-neutral-600 mt-1">
                    Acompanhe seus pedidos
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setTab('ativos')}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all btn-touch ${
                        tab === 'ativos'
                            ? 'bg-giro-verde-escuro text-neutral-0'
                            : 'bg-neutral-200 text-neutral-700 active:bg-neutral-300'
                    }`}
                >
                    Ativos ({pedidosAtivos.length})
                </button>
                <button
                    onClick={() => setTab('historico')}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all btn-touch ${
                        tab === 'historico'
                            ? 'bg-giro-verde-escuro text-neutral-0'
                            : 'bg-neutral-200 text-neutral-700 active:bg-neutral-300'
                    }`}
                >
                    Histórico ({pedidosHistorico.length})
                </button>
            </div>

            {/* Lista de pedidos */}
            {pedidosFiltrados.length === 0 ? (
                <div className="bg-neutral-0 rounded-2xl p-8 text-center border-2 border-neutral-200">
                    <div className="text-6xl mb-3">
                        {tab === 'ativos' ? '🛍️' : '📋'}
                    </div>
                    <p className="text-neutral-600 text-lg font-semibold">
                        {tab === 'ativos' 
                            ? 'Você não tem pedidos ativos' 
                            : 'Seu histórico está vazio'}
                    </p>
                    <p className="text-neutral-500 text-sm mt-2 mb-6">
                        {tab === 'ativos' 
                            ? 'Explore os produtos e faça seu primeiro pedido!' 
                            : 'Seus pedidos concluídos aparecerão aqui'}
                    </p>
                    {tab === 'ativos' && (
                        <button
                            onClick={() => router.push('/cliente')}
                            className="bg-giro-verde-escuro text-neutral-0 px-8 py-4 rounded-xl font-bold btn-touch"
                        >
                            Ver Produtos
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {pedidosFiltrados.map((pedido) => {
                        const statusInfo = getStatusPedidoInfo(pedido.status)
                        return (
                            <div
                                key={pedido.id}
                                className={`bg-neutral-0 rounded-2xl p-5 shadow-md border-2 ${statusInfo.border}`}
                            >
                                {/* Cabeçalho */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className={`flex items-center gap-2 mb-1 ${statusInfo.color}`}>
                                            <span className="text-2xl">{statusInfo.emoji}</span>
                                            <span className="font-bold">
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-neutral-500">
                                            {tempoRelativo(pedido.criado_em)} • {formatarData(pedido.criado_em, 'curto')}
                                        </p>
                                        <p className="text-sm text-neutral-600 mt-1">
                                            {statusInfo.desc}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-neutral-600">Total</p>
                                        <p className="text-xl font-bold text-neutral-900">
                                            {formatarMoeda(pedido.valor_total)}
                                        </p>
                                    </div>
                                </div>

                                {/* Itens */}
                                <div className={`${statusInfo.bg} rounded-xl p-4 mb-4`}>
                                    <p className="text-sm font-semibold text-neutral-700 mb-3">
                                        Itens do pedido:
                                    </p>
                                    <div className="space-y-2">
                                        {pedido.itens_pedido.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span className="text-neutral-700">
                                                    {item.quantidade} {item.unidade} de {item.produto_nome}
                                                </span>
                                                <span className="font-semibold text-neutral-900">
                                                    {formatarMoeda(item.preco_total)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Informações de retirada */}
                                <div className="bg-neutral-100 rounded-xl p-4 mb-4">
                                    <p className="text-sm font-semibold text-neutral-700 mb-2">
                                        📍 Local de Retirada
                                    </p>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-neutral-600">Entrada:</span>
                                            <span className="font-semibold text-neutral-900">
                                                {pedido.entrada_retirada}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-600">Horário:</span>
                                            <span className="font-semibold text-neutral-900">
                                                {formatarData(pedido.horario_retirada, 'hora')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botão de confirmação */}
                                {pedido.status === 'aguardando_confirmacao' && (
                                    <button
                                        onClick={() => confirmarRecebimento(pedido.id)}
                                        className="w-full bg-success text-neutral-0 py-4 rounded-xl font-bold flex items-center justify-center gap-2 btn-touch active:opacity-90"
                                    >
                                        <CheckCircle size={20} />
                                        Confirmar Recebimento
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}