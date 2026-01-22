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

            const { error: erroItens } = await supabase
                .from('itens_pedido')
                .update({ status: 'aprovado' })
                .in('id', itensIds)

            if (erroItens) throw erroItens

            const { data: todosItens } = await supabase
                .from('itens_pedido')
                .select('status')
                .eq('pedido_id', pedidoId)

            const todosAprovados = todosItens?.every(item => item.status === 'aprovado')

            if (todosAprovados) {
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
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-giro-amarelo border-t-transparent rounded-full animate-spin mb-4"></div>
                <p style={{ fontSize: 'clamp(1.125rem, 3vw + 0.5rem, 1.5rem)' }} className="font-bold text-neutral-700 text-center">
                    Carregando pedidos...
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 px-3 sm:px-0">
            {/* Título - Responsivo e grande */}
            <div className="bg-giro-amarelo rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <Package className="flex-shrink-0" style={{ width: 'clamp(1.5rem, 4vw, 2rem)', height: 'clamp(1.5rem, 4vw, 2rem)' }} />
                    <h2 style={{ fontSize: 'clamp(1.5rem, 5vw + 0.5rem, 2rem)' }} className="font-bold text-neutral-0 leading-tight">
                        Novos Pedidos
                    </h2>
                </div>
                <p style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)' }} className="text-neutral-0 font-semibold">
                    {pedidos.length} {pedidos.length === 1 ? 'pedido aguardando' : 'pedidos aguardando'}
                </p>
            </div>

            {/* Lista de pedidos */}
            {pedidos.length === 0 ? (
                <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-6 sm:p-10 text-center border-2 border-neutral-200 shadow-md">
                    <div style={{ fontSize: 'clamp(3rem, 10vw, 4.5rem)' }} className="mb-3 sm:mb-4">
                        📦
                    </div>
                    <p style={{ fontSize: 'clamp(1.25rem, 4vw + 0.5rem, 1.75rem)' }} className="text-neutral-900 font-bold mb-2 sm:mb-3">
                        Nenhum pedido novo
                    </p>
                    <p style={{ fontSize: 'clamp(1rem, 2.5vw + 0.25rem, 1.125rem)' }} className="text-neutral-600">
                        Você será notificado quando receber pedidos
                    </p>
                </div>
            ) : (
                <div className="space-y-4 sm:space-y-5">
                    {pedidos.map((pedido) => {
                        const itensIds = pedido.itens_pedido.map(i => i.id)
                        const estaProcessando = processando === pedido.id

                        return (
                            <div
                                key={pedido.id}
                                className="bg-neutral-0 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border-2 sm:border-4 border-giro-amarelo"
                            >
                                {/* Cabeçalho com status - Layout flexível */}
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b-2 border-neutral-200">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                            <Clock className="flex-shrink-0" style={{ width: 'clamp(1.25rem, 4vw, 1.75rem)', height: 'clamp(1.25rem, 4vw, 1.75rem)' }} />
                                            <span style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)' }} className="font-bold text-giro-amarelo leading-tight">
                                                Aguardando sua resposta
                                            </span>
                                        </div>
                                        <div className="inline-flex items-center gap-2">
                                            <span style={{ fontSize: 'clamp(0.875rem, 2vw + 0.25rem, 1rem)' }} className="bg-success/20 text-success px-2 sm:px-3 py-1.5 sm:py-2 rounded-full font-bold whitespace-nowrap">
                                                ✓ Já foi pago
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p style={{ fontSize: 'clamp(0.875rem, 2vw + 0.25rem, 1rem)' }} className="text-neutral-600 font-semibold mb-1">
                                            Valor Total
                                        </p>
                                        <p style={{ fontSize: 'clamp(1.5rem, 5vw + 0.5rem, 2rem)' }} className="font-bold text-neutral-900">
                                            R$ {pedido.itens_pedido.reduce((sum, item) => sum + item.preco_total, 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Itens do pedido */}
                                <div className="bg-giro-amarelo/10 rounded-xl sm:rounded-2xl p-3 sm:p-5 mb-4 sm:mb-5 border-2 border-giro-amarelo/30">
                                    <p style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900 mb-3 sm:mb-4 flex items-center gap-2">
                                        <Package className="flex-shrink-0" size={18} />
                                        Seus produtos neste pedido:
                                    </p>
                                    <div className="space-y-2 sm:space-y-3">
                                        {pedido.itens_pedido.map((item) => (
                                            <div
                                                key={item.id}
                                                className="bg-neutral-0 rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 shadow-sm"
                                            >
                                                <span style={{ fontSize: 'clamp(0.9375rem, 2.5vw + 0.25rem, 1.125rem)' }} className="font-semibold text-neutral-900 leading-snug">
                                                    {item.quantidade} {item.unidade} de {item.produto_nome}
                                                </span>
                                                <span style={{ fontSize: 'clamp(1.125rem, 3vw + 0.5rem, 1.25rem)' }} className="font-bold text-giro-verde-escuro">
                                                    R$ {item.preco_total.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Informações de retirada */}
                                <div className="bg-neutral-100 rounded-xl sm:rounded-2xl p-3 sm:p-5 mb-4 sm:mb-6">
                                    <p style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900 mb-2 sm:mb-3 flex items-center gap-2">
                                        <span className="text-lg sm:text-xl">📍</span> Informações de Retirada
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center gap-2">
                                            <span style={{ fontSize: 'clamp(0.9375rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-700 font-semibold">
                                                Entrada:
                                            </span>
                                            <span style={{ fontSize: 'clamp(1rem, 2.5vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900 text-right">
                                                {pedido.entrada_retirada}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center gap-2">
                                            <span style={{ fontSize: 'clamp(0.9375rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-700 font-semibold">
                                                Horário:
                                            </span>
                                            <span style={{ fontSize: 'clamp(1rem, 2.5vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900 text-right">
                                                {pedido.horario_retirada}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botões de ação - Empilhados em mobile */}
                                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                    <button
                                        onClick={() => rejeitarPedido(pedido.id, itensIds)}
                                        disabled={estaProcessando}
                                        style={{
                                            fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)',
                                            minHeight: 'clamp(3.5rem, 10vw, 4.5rem)'
                                        }}
                                        className="bg-neutral-200 text-neutral-900 py-4 sm:py-5 px-4 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 sm:gap-3 btn-touch active:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border-2 border-neutral-300"
                                    >
                                        <XCircle className="flex-shrink-0" style={{ width: 'clamp(1.25rem, 4vw, 1.75rem)', height: 'clamp(1.25rem, 4vw, 1.75rem)' }} />
                                        <span className="leading-tight text-center">
                                            {estaProcessando ? 'Aguarde...' : 'NÃO TEM - Rejeitar'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => aceitarPedido(pedido.id, itensIds)}
                                        disabled={estaProcessando}
                                        style={{
                                            fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)',
                                            minHeight: 'clamp(3.5rem, 10vw, 4.5rem)'
                                        }}
                                        className="bg-giro-verde-escuro text-neutral-0 py-4 sm:py-5 px-4 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 sm:gap-3 btn-touch active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl border-2 border-giro-verde-escuro"
                                    >
                                        <CheckCircle className="flex-shrink-0" style={{ width: 'clamp(1.25rem, 4vw, 1.75rem)', height: 'clamp(1.25rem, 4vw, 1.75rem)' }} />
                                        <span className="leading-tight text-center">
                                            {estaProcessando ? 'Aceitando...' : 'TEM - Aceitar Pedido'}
                                        </span>
                                    </button>
                                </div>

                                {/* Mensagem de ajuda */}
                                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-neutral-50 rounded-lg sm:rounded-xl border-2 border-neutral-200">
                                    <p style={{ fontSize: 'clamp(0.9375rem, 2.5vw + 0.25rem, 1rem)' }} className="text-center text-neutral-700 font-semibold leading-relaxed">
                                        <span className="text-base sm:text-lg">💡</span> Clique <span className="text-giro-verde-escuro font-bold">&quot;TEM&quot;</span> se você tem o produto.
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
