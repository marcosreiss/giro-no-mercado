'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle, XCircle } from 'lucide-react'
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
    const router = useRouter()
    const { user } = useAuth()
    const { success, error: showError } = useNotification()
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [loading, setLoading] = useState(true)
    const [comercianteId, setComercianteId] = useState<string | null>(null)

    useEffect(() => {
        if (user) {
            buscarComercianteId()
        }
    }, [user])

    useEffect(() => {
        if (comercianteId) {
            carregarPedidos()
        }
    }, [comercianteId])

    const buscarComercianteId = async () => {
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
    }

    const carregarPedidos = async () => {
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
                        pago_em
                    )
                `)
                .eq('comerciante_id', comercianteId)
                .eq('status', 'pendente')
                .order('criado_em', { ascending: false })

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
    }

    const aceitarPedido = async (pedidoId: string, itensIds: string[]) => {
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
        }
    }

    const rejeitarPedido = async (pedidoId: string, itensIds: string[]) => {
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
        }
    }

    if (loading) {
        return <div className="text-center py-12">Carregando pedidos...</div>
    }

    return (
        <div className="space-y-6">
            {/* Título */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                    Novos Pedidos
                </h2>
                <p className="text-neutral-600 mt-1">
                    {pedidos.length} {pedidos.length === 1 ? 'pedido aguardando' : 'pedidos aguardando'}
                </p>
            </div>

            {/* Lista de pedidos */}
            {pedidos.length === 0 ? (
                <div className="bg-neutral-0 rounded-2xl p-8 text-center border-2 border-neutral-200">
                    <div className="text-6xl mb-3">📦</div>
                    <p className="text-neutral-600 text-lg font-semibold">
                        Nenhum pedido novo
                    </p>
                    <p className="text-neutral-500 text-sm mt-2">
                        Você será notificado quando receber pedidos
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pedidos.map((pedido) => {
                        const itensIds = pedido.itens_pedido.map(i => i.id)
                        return (
                            <div
                                key={pedido.id}
                                className="bg-neutral-0 rounded-2xl p-5 shadow-md border-2 border-giro-amarelo/30"
                            >
                                {/* Cabeçalho */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock size={18} className="text-giro-amarelo" />
                                            <span className="font-bold text-giro-amarelo">
                                                Aguardando Aprovação
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full font-semibold">
                                                ✓ Pago
                                            </span>
                                            <p className="text-xs text-neutral-500">
                                                Pedido #{pedido.id.slice(0, 8)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-neutral-600">Total</p>
                                        <p className="text-xl font-bold text-neutral-900">
                                            R$ {pedido.itens_pedido.reduce((sum, item) => sum + item.preco_total, 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Itens */}
                                <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                                    <p className="text-sm font-semibold text-neutral-700 mb-3">
                                        Seus produtos neste pedido:
                                    </p>
                                    <div className="space-y-2">
                                        {pedido.itens_pedido.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span className="text-neutral-700">
                                                    {item.quantidade} {item.unidade} de {item.produto_nome}
                                                </span>
                                                <span className="font-semibold text-neutral-900">
                                                    R$ {item.preco_total.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Informações de retirada */}
                                <div className="bg-giro-amarelo/10 rounded-xl p-4 mb-4">
                                    <p className="text-sm font-semibold text-neutral-700 mb-2">
                                        📍 Informações de Retirada
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
                                                {pedido.horario_retirada}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Ações */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => rejeitarPedido(pedido.id, itensIds)}
                                        className="bg-neutral-200 text-neutral-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 btn-touch active:bg-neutral-300"
                                    >
                                        <XCircle size={20} />
                                        Rejeitar
                                    </button>
                                    <button
                                        onClick={() => aceitarPedido(pedido.id, itensIds)}
                                        className="bg-giro-verde-escuro text-neutral-0 py-3 rounded-xl font-bold flex items-center justify-center gap-2 btn-touch active:opacity-90"
                                    >
                                        <CheckCircle size={20} />
                                        Aceitar
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
