/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Clock, Package } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'
import { useAuth } from '@/src/context/AuthContext'
import { useNotification } from '@/src/context/NotificationContext'

interface ItemPedido {
    id: string
    produto_nome: string
    quantidade: number
    unidade: string
    preco_unitario: number
    preco_total: number
    status: string
}

interface Pedido {
    id: string
    status: string
    entrada_retirada: string
    horario_retirada: string
    valor_produtos: number
    taxa_entrega: number
    valor_total: number
    criado_em: string
    itens_pedido: ItemPedido[]
}

export default function ComerciantePedidosPage() {
    const { user } = useAuth()
    const { success, error: showError } = useNotification()
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [loading, setLoading] = useState(true)
    const [comercianteId, setComercianteId] = useState<string | null>(null)
    const [processando, setProcessando] = useState<string | null>(null)

    // Função para buscar comerciante ID
    const buscarComercianteId = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('comerciantes')
                .select('id')
                .eq('usuario_id', user?.id)
                .single()

            if (error) throw error
            setComercianteId(data.id)
        } catch (error) {
            console.error('Erro ao buscar comerciante:', error)
        }
    }, [user?.id])

    // Função para carregar pedidos
    const carregarPedidos = useCallback(async () => {
        if (!comercianteId) return

        try {
            console.log('🔍 Carregando pedidos para comerciante:', comercianteId)

            // Buscar itens do pedido que pertencem a este comerciante
            const { data: itens, error: erroItens } = await supabase
                .from('itens_pedido')
                .select(`
                    *,
                    pedidos (
                        id,
                        status,
                        entrada_retirada,
                        horario_retirada,
                        valor_produtos,
                        taxa_entrega,
                        valor_total,
                        criado_em,
                        pago_em,
                        usuarios!pedidos_cliente_id_fkey (
                            nome_completo
                        )
                    )
                `)
                .eq('comerciante_id', comercianteId)
                .eq('status', 'pendente')

            console.log('📦 Itens de pedido encontrados:', itens?.length || 0)
            if (erroItens) {
                console.error('❌ Erro ao buscar itens:', erroItens)
                throw erroItens
            }

            // Agrupar itens por pedido
            const pedidosMap = new Map<string, Pedido>()

            itens?.forEach((item: any) => {
                const pedidoData = item.pedidos
                console.log('🔍 Item do pedido:', {
                    item_id: item.id,
                    pedido_id: pedidoData?.id,
                    pedido_status: pedidoData?.status,
                    pago_em: pedidoData?.pago_em,
                    produto: item.produto_nome
                })

                if (!pedidoData || pedidoData.status !== 'aguardando_aprovacao' || !pedidoData.pago_em) {
                    console.log('⚠️ Pedido filtrado:', {
                        motivo: !pedidoData ? 'sem dados' :
                            pedidoData.status !== 'aguardando_aprovacao' ? 'status diferente' :
                                'não pago'
                    })
                    return
                }

                if (!pedidosMap.has(pedidoData.id)) {
                    console.log('✅ Novo pedido adicionado:', pedidoData.id)
                    pedidosMap.set(pedidoData.id, {
                        ...pedidoData,
                        itens_pedido: []
                    })
                }

                pedidosMap.get(pedidoData.id)?.itens_pedido.push({
                    id: item.id,
                    produto_nome: item.produto_nome,
                    quantidade: item.quantidade,
                    unidade: item.unidade,
                    preco_unitario: item.preco_unitario,
                    preco_total: item.preco_total,
                    status: item.status
                })
            })

            setPedidos(Array.from(pedidosMap.values()))
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error)
        } finally {
            setLoading(false)
        }
    }, [comercianteId])

    // useEffect com dependências corrigidas
    useEffect(() => {
        if (user) {
            buscarComercianteId()
        }
    }, [user, buscarComercianteId])

    useEffect(() => {
        if (comercianteId) {
            carregarPedidos()
        }
    }, [comercianteId, carregarPedidos])

    const aceitarPedido = async (pedidoId: string, itensIds: string[]) => {
        setProcessando(pedidoId)
        try {
            console.log('✅ Aceitando pedido:', pedidoId)

            // Verificar se o pedido foi pago
            const { data: pedidoData, error: erroPedidoCheck } = await supabase
                .from('pedidos')
                .select('pago_em, status')
                .eq('id', pedidoId)
                .single()

            if (erroPedidoCheck) throw erroPedidoCheck

            if (!pedidoData?.pago_em) {
                showError('Este pedido ainda não foi pago pelo cliente')
                return
            }

            console.log('💰 Pedido pago em:', pedidoData.pago_em)

            // Atualizar status dos itens
            const { error: erroItens } = await supabase
                .from('itens_pedido')
                .update({ status: 'aprovado' })
                .in('id', itensIds)

            if (erroItens) throw erroItens

            // Verificar se todos os itens do pedido foram aprovados
            const { data: todosItens } = await supabase
                .from('itens_pedido')
                .select('status')
                .eq('pedido_id', pedidoId)

            const todosAprovados = todosItens?.every(item => item.status === 'aprovado')

            if (todosAprovados) {
                // Atualizar status do pedido
                const { error: erroPedido } = await supabase
                    .from('pedidos')
                    .update({ status: 'aprovado' })
                    .eq('id', pedidoId)

                if (erroPedido) throw erroPedido

                console.log('🎉 Pedido aprovado! Agora disponível para entregadores')
            }

            success('Pedido aceito com sucesso!')
            carregarPedidos()
        } catch (error) {
            console.error('Erro ao aceitar pedido:', error)
            showError('Erro ao aceitar pedido')
        } finally {
            setProcessando(null)
        }
    }

    const rejeitarPedido = async (pedidoId: string, itensIds: string[]) => {
        setProcessando(pedidoId)
        try {
            // Atualizar status dos itens
            const { error: erroItens } = await supabase
                .from('itens_pedido')
                .update({ status: 'rejeitado' })
                .in('id', itensIds)

            if (erroItens) throw erroItens

            success('Pedido rejeitado')
            carregarPedidos()
        } catch (error) {
            console.error('Erro ao rejeitar pedido:', error)
            showError('Erro ao rejeitar pedido')
        } finally {
            setProcessando(null)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-16 h-16 border-4 border-giro-amarelo border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xl font-bold text-neutral-700">Carregando pedidos...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Título - Grande e claro */}
            <div className="bg-giro-amarelo rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <Package size={32} className="text-neutral-0" />
                    <h2 className="text-3xl font-bold text-neutral-0">
                        Novos Pedidos
                    </h2>
                </div>
                <p className="text-neutral-0 text-xl font-semibold">
                    {pedidos.length} {pedidos.length === 1 ? 'pedido aguardando' : 'pedidos aguardando'}
                </p>
            </div>

            {/* Lista de pedidos */}
            {pedidos.length === 0 ? (
                <div className="bg-neutral-0 rounded-2xl p-10 text-center border-2 border-neutral-200 shadow-md">
                    <div className="text-7xl mb-4">📦</div>
                    <p className="text-neutral-900 text-2xl font-bold mb-3">
                        Nenhum pedido novo
                    </p>
                    <p className="text-neutral-600 text-lg">
                        Você será notificado quando receber pedidos
                    </p>
                </div>
            ) : (
                <div className="space-y-5">
                    {pedidos.map((pedido) => {
                        const itensIds = pedido.itens_pedido.map(i => i.id)
                        const estaProcessando = processando === pedido.id

                        return (
                            <div
                                key={pedido.id}
                                className="bg-neutral-0 rounded-2xl p-6 shadow-xl border-4 border-giro-amarelo"
                            >
                                {/* Cabeçalho com status */}
                                <div className="flex items-start justify-between mb-5 pb-5 border-b-2 border-neutral-200">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Clock size={28} className="text-giro-amarelo" />
                                            <span className="font-bold text-giro-amarelo text-xl">
                                                Aguardando sua resposta
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-base bg-success/20 text-success px-3 py-2 rounded-full font-bold">
                                                ✓ Já foi pago
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-base text-neutral-600 font-semibold mb-1">Valor Total</p>
                                        <p className="text-3xl font-bold text-neutral-900">
                                            R$ {pedido.itens_pedido.reduce((sum, item) => sum + item.preco_total, 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Itens do pedido - Card destacado */}
                                <div className="bg-giro-amarelo/10 rounded-2xl p-5 mb-5 border-2 border-giro-amarelo/30">
                                    <p className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                        <Package size={20} />
                                        Seus produtos neste pedido:
                                    </p>
                                    <div className="space-y-3">
                                        {pedido.itens_pedido.map((item) => (
                                            <div
                                                key={item.id}
                                                className="bg-neutral-0 rounded-xl p-4 flex justify-between items-center shadow-sm"
                                            >
                                                <span className="text-lg font-semibold text-neutral-900">
                                                    {item.quantidade} {item.unidade} de {item.produto_nome}
                                                </span>
                                                <span className="text-xl font-bold text-giro-verde-escuro">
                                                    R$ {item.preco_total.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Informações de retirada */}
                                <div className="bg-neutral-100 rounded-2xl p-5 mb-6">
                                    <p className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
                                        📍 Informações de Retirada
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-base text-neutral-700 font-semibold">Entrada:</span>
                                            <span className="text-lg font-bold text-neutral-900">
                                                {pedido.entrada_retirada}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-base text-neutral-700 font-semibold">Horário:</span>
                                            <span className="text-lg font-bold text-neutral-900">
                                                {pedido.horario_retirada}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botões de ação - GRANDES e CLAROS */}
                                <div className="grid grid-cols-1 gap-4">
                                    <button
                                        onClick={() => rejeitarPedido(pedido.id, itensIds)}
                                        disabled={estaProcessando}
                                        className="bg-neutral-200 text-neutral-900 py-6 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 btn-touch active:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border-2 border-neutral-300"
                                    >
                                        <XCircle size={28} />
                                        {estaProcessando ? 'Aguarde...' : 'NÃO TEM - Rejeitar'}
                                    </button>
                                    <button
                                        onClick={() => aceitarPedido(pedido.id, itensIds)}
                                        disabled={estaProcessando}
                                        className="bg-giro-verde-escuro text-neutral-0 py-6 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 btn-touch active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl border-2 border-giro-verde-escuro"
                                    >
                                        <CheckCircle size={28} />
                                        {estaProcessando ? 'Aceitando...' : 'TEM - Aceitar Pedido'}
                                    </button>
                                </div>

                                {/* Mensagem de ajuda */}
                                <div className="mt-4 p-4 bg-neutral-50 rounded-xl border-2 border-neutral-200">
                                    <p className="text-center text-base text-neutral-700 font-semibold">
                                        💡 Clique <span className="text-giro-verde-escuro font-bold">&quot;TEM&quot;</span> se você tem o produto.
                                        Clique <span className="font-bold">&quot;NÃO TEM&quot;</span> se acabou.
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
