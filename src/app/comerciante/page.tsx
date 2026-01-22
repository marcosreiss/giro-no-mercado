// src/app/comerciante/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, TrendingUp, Wallet, Clock, X, CheckCircle } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'
import { useAuth } from '@/src/context/AuthContext'
import { formatarMoeda, formatarData, tempoRelativo } from '@/src/lib/utils'
import { useNotification } from '@/src/context/NotificationContext'

interface Pedido {
    id: string
    valor_total: number
    criado_em: string
    entrada_retirada: string
    horario_retirada: string
    usuarios: {
        nome_completo: string
    }
}

interface ItemPedido {
    produto_nome: string
    quantidade: number
    unidade: string
    preco_unitario: number
    preco_total: number
}

export default function ComerciantePage() {
    const router = useRouter()
    const { user } = useAuth()
    const { success, error: showError } = useNotification()
    const [stats, setStats] = useState({
        pedidosHoje: 0,
        vendasHoje: 0,
        saldoCarteira: 0
    })
    const [pedidosPendentes, setPedidosPendentes] = useState<Pedido[]>([])
    const [loading, setLoading] = useState(true)
    const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)
    const [itensPedido, setItensPedido] = useState<ItemPedido[]>([])
    const [loadingItens, setLoadingItens] = useState(false)
    const [aceitando, setAceitando] = useState(false)

    useEffect(() => {
        if (user) {
            carregarDados()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const carregarDados = async () => {
        try {
            console.log('🏪 Carregando dados do comerciante...')
            
            // Buscar comerciante
            const { data: comerciante, error: comercianteError } = await supabase
                .from('comerciantes')
                .select('*')
                .eq('usuario_id', user?.id)
                .single()

            if (comercianteError) {
                console.error('❌ Erro ao buscar comerciante:', comercianteError)
                return
            }

            console.log('👤 Comerciante:', comerciante)
            if (!comerciante) {
                console.warn('⚠️ Comerciante não encontrado')
                return
            }

            // Buscar itens pendentes do comerciante
            const { data: itens } = await supabase
                .from('itens_pedido')
                .select(`
                    pedido_id,
                    pedidos (
                        id,
                        valor_total,
                        criado_em,
                        status,
                        pago_em,
                        usuarios!pedidos_cliente_id_fkey (
                            nome_completo
                        )
                    )
                `)
                .eq('comerciante_id', comerciante.id)
                .eq('status', 'pendente')

            console.log('📦 Itens encontrados:', itens?.length || 0, itens)

            // Agrupar por pedido e filtrar apenas pagos
            const pedidosMap = new Map<string, Pedido>()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            itens?.forEach((item: any) => {
                const pedido = item.pedidos
                console.log('🔍 Verificando pedido:', {
                    id: pedido?.id,
                    status: pedido?.status,
                    pago_em: pedido?.pago_em,
                    cliente: pedido?.usuarios?.nome_completo
                })
                
                if (pedido?.status === 'aguardando_aprovacao' && pedido.pago_em && !pedidosMap.has(pedido.id)) {
                    console.log('✅ Pedido válido adicionado!')
                    pedidosMap.set(pedido.id, {
                        id: pedido.id,
                        valor_total: pedido.valor_total,
                        criado_em: pedido.criado_em,
                        entrada_retirada: pedido.entrada_retirada,
                        horario_retirada: pedido.horario_retirada,
                        usuarios: pedido.usuarios
                    })
                }
            })

            const pedidos = Array.from(pedidosMap.values())
            console.log('📋 Total de pedidos para mostrar:', pedidos.length)
            setPedidosPendentes(pedidos)

            // Calcular estatísticas de hoje
            const hoje = new Date()
            hoje.setHours(0, 0, 0, 0)
            
            const pedidosHoje = pedidos.filter(p => 
                new Date(p.criado_em) >= hoje
            ).length

            const vendasHoje = pedidos
                .filter(p => new Date(p.criado_em) >= hoje)
                .reduce((sum, p) => sum + p.valor_total, 0)

            setStats({
                pedidosHoje,
                vendasHoje,
                saldoCarteira: comerciante.receita_total || 0
            })
        } catch (error) {
            console.error('Erro ao carregar dados:', error)
        } finally {
            setLoading(false)
        }
    }

    const verDetalhesPedido = async (pedido: Pedido) => {
        setPedidoSelecionado(pedido)
        setLoadingItens(true)
        
        try {
            const { data: comerciante } = await supabase
                .from('comerciantes')
                .select('id')
                .eq('usuario_id', user?.id)
                .single()

            if (!comerciante) return

            const { data: itens } = await supabase
                .from('itens_pedido')
                .select('produto_nome, quantidade, unidade, preco_unitario, preco_total')
                .eq('pedido_id', pedido.id)
                .eq('comerciante_id', comerciante.id)

            setItensPedido(itens || [])
        } catch (error) {
            console.error('Erro ao carregar itens:', error)
            showError('Erro ao carregar detalhes do pedido')
        } finally {
            setLoadingItens(false)
        }
    }

    const aceitarPedido = async () => {
        if (!pedidoSelecionado) {
            console.warn('⚠️ Nenhum pedido selecionado')
            return
        }
        
        console.log('🚀 Iniciando aceitação do pedido:', pedidoSelecionado.id)
        setAceitando(true)
        
        try {
            console.log('📤 Atualizando status do pedido para "aprovado"...')
            
            const { data, error } = await supabase
                .from('pedidos')
                .update({ status: 'aprovado' })
                .eq('id', pedidoSelecionado.id)
                .select()

            if (error) {
                console.error('❌ Erro do Supabase:', error)
                throw error
            }

            console.log('✅ Pedido atualizado com sucesso:', data)
            success('Pedido aceito! Aguardando entregador')
            setPedidoSelecionado(null)
            
            console.log('🔄 Recarregando lista de pedidos...')
            await carregarDados()
        } catch (err: unknown) {
            const error = err as { message?: string; details?: string; hint?: string; code?: string }
            console.error('❌ Erro ao aceitar pedido:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            })
            showError('Erro ao aceitar pedido: ' + (error.message || 'Erro desconhecido'))
        } finally {
            setAceitando(false)
        }
    }

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
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-neutral-900">
                        Novos Pedidos
                    </h3>
                    {pedidosPendentes.length > 0 && (
                        <button
                            onClick={() => router.push('/comerciante/pedidos')}
                            className="text-giro-amarelo font-semibold text-sm active:opacity-70"
                        >
                            Ver todos →
                        </button>
                    )}
                </div>
                
                {loading ? (
                    <div className="bg-neutral-0 rounded-2xl p-8 text-center border-2 border-neutral-200">
                        <p className="text-neutral-600">Carregando...</p>
                    </div>
                ) : pedidosPendentes.length === 0 ? (
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
                    <div className="space-y-3">
                        {pedidosPendentes.slice(0, 3).map((pedido) => (
                            <button
                                key={pedido.id}
                                onClick={() => verDetalhesPedido(pedido)}
                                className="w-full bg-neutral-0 rounded-2xl p-5 text-left border-2 border-giro-amarelo/30 active:bg-neutral-50 transition-all btn-touch"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-2xl">✓</span>
                                            <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-lg font-semibold">
                                                Pago
                                            </span>
                                        </div>
                                        <p className="font-bold text-neutral-900">
                                            {pedido.usuarios.nome_completo}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                                            <Clock size={12} />
                                            <span>{tempoRelativo(pedido.criado_em)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-giro-amarelo">
                                            {formatarMoeda(pedido.valor_total)}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            aguardando
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                        {pedidosPendentes.length > 3 && (
                            <p className="text-center text-sm text-neutral-500">
                                + {pedidosPendentes.length - 3} pedidos
                            </p>
                        )}
                    </div>
                )}
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

            {/* Modal de Detalhes do Pedido */}
            {pedidoSelecionado && (
                <div className="fixed inset-0 bg-neutral-900/50 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-neutral-0 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
                        {/* Header */}
                        <div className="bg-giro-amarelo p-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-neutral-900">
                                    Detalhes do Pedido
                                </h3>
                                <p className="text-sm text-neutral-700 mt-1">
                                    {pedidoSelecionado.usuarios.nome_completo}
                                </p>
                            </div>
                            <button
                                onClick={() => setPedidoSelecionado(null)}
                                className="p-2 hover:bg-neutral-900/10 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {/* Info do pedido */}
                            <div className="bg-neutral-100 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-neutral-600 text-sm">Pedido feito há</span>
                                    <span className="font-semibold text-neutral-900">
                                        {tempoRelativo(pedidoSelecionado.criado_em)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600 text-sm">Retirada</span>
                                    <span className="font-semibold text-neutral-900">
                                        {pedidoSelecionado.entrada_retirada}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600 text-sm">Horário</span>
                                    <span className="font-semibold text-neutral-900">
                                        {formatarData(pedidoSelecionado.horario_retirada)}
                                    </span>
                                </div>
                            </div>

                            {/* Itens do pedido */}
                            <div>
                                <h4 className="font-bold text-neutral-900 mb-3">Itens do Pedido</h4>
                                {loadingItens ? (
                                    <p className="text-neutral-600 text-center py-4">Carregando...</p>
                                ) : (
                                    <div className="space-y-2">
                                        {itensPedido.map((item, index) => (
                                            <div key={index} className="bg-neutral-50 rounded-lg p-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-neutral-900">
                                                            {item.produto_nome}
                                                        </p>
                                                        <p className="text-sm text-neutral-600">
                                                            {item.quantidade} {item.unidade} × {formatarMoeda(item.preco_unitario)}
                                                        </p>
                                                    </div>
                                                    <p className="font-bold text-giro-amarelo">
                                                        {formatarMoeda(item.preco_total)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Total */}
                            <div className="bg-giro-amarelo/10 rounded-xl p-4 border-2 border-giro-amarelo/30">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-neutral-900">Total</span>
                                    <span className="text-2xl font-bold text-giro-amarelo">
                                        {formatarMoeda(pedidoSelecionado.valor_total)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer com ações */}
                        <div className="p-5 bg-neutral-50 border-t-2 border-neutral-200 space-y-3">
                            <button
                                onClick={() => {
                                    console.log('🔘 Botão "Aceitar Pedido" clicado')
                                    aceitarPedido()
                                }}
                                disabled={aceitando}
                                className="w-full bg-success text-neutral-0 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
                            >
                                {aceitando ? (
                                    'Aceitando...'
                                ) : (
                                    <>
                                        <CheckCircle size={24} />
                                        Aceitar Pedido
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setPedidoSelecionado(null)}
                                className="w-full bg-neutral-200 text-neutral-900 py-3 rounded-xl font-semibold active:scale-95 transition-transform"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
