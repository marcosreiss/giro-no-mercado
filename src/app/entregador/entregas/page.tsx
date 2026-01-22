'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, MapPin, CheckCircle } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'
import { useAuth } from '@/src/context/AuthContext'
import { useNotification } from '@/src/context/NotificationContext'
import { formatarData, formatarMoeda, tempoRelativo } from '@/src/lib/utils'

interface Pedido {
    id: string
    cliente_id: string
    status: string
    entrada_retirada: string
    horario_retirada: string
    valor_total: number
    criado_em: string
    usuarios: {
        nome_completo: string
    }
}

export default function EntregadorEntregasPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { success, error: showError } = useNotification()
    const [pedidosDisponiveis, setPedidosDisponiveis] = useState<Pedido[]>([])
    const [minhasEntregas, setMinhasEntregas] = useState<Pedido[]>([])
    const [entregasConcluidas, setEntregasConcluidas] = useState<Pedido[]>([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<'disponiveis' | 'minhas' | 'historico'>('disponiveis')

    useEffect(() => {
        if (user) {
            carregarDados()
        }
    }, [user, tab])

    const carregarDados = async () => {
        setLoading(true)
        try {
            if (tab === 'disponiveis') {
                // Pedidos aprovados, pagos e sem entregador
                const { data, error } = await supabase
                    .from('pedidos')
                    .select(`
                        *,
                        usuarios!pedidos_cliente_id_fkey (
                            nome_completo
                        )
                    `)
                    .eq('status', 'aprovado')
                    .is('entregador_id', null)
                    .not('pago_em', 'is', null)
                    .order('criado_em', { ascending: false })

                if (error) throw error
                setPedidosDisponiveis(data || [])
            } else if (tab === 'minhas') {
                // Minhas entregas (em andamento)
                const { data, error } = await supabase
                    .from('pedidos')
                    .select(`
                        *,
                        usuarios!pedidos_cliente_id_fkey (
                            nome_completo
                        )
                    `)
                    .eq('entregador_id', user?.id)
                    .in('status', ['em_entrega', 'aguardando_confirmacao'])
                    .order('criado_em', { ascending: false })

                if (error) throw error
                setMinhasEntregas(data || [])
            } else {
                // Entregas concluídas
                const { data, error } = await supabase
                    .from('pedidos')
                    .select(`
                        *,
                        usuarios!pedidos_cliente_id_fkey (
                            nome_completo
                        )
                    `)
                    .eq('entregador_id', user?.id)
                    .eq('status', 'entregue')
                    .order('criado_em', { ascending: false })
                    .limit(20)

                if (error) throw error
                setEntregasConcluidas(data || [])
            }
        } catch (error) {
            console.error('Erro ao carregar entregas:', error)
        } finally {
            setLoading(false)
        }
    }

    const aceitarEntrega = async (pedidoId: string) => {
        try {
            const { error } = await supabase
                .from('pedidos')
                .update({
                    entregador_id: user?.id,
                    status: 'em_entrega'
                })
                .eq('id', pedidoId)

            if (error) throw error

            success('Entrega aceita! Boa sorte!')
            carregarDados()
        } catch (error) {
            console.error('Erro ao aceitar entrega:', error)
            showError('Erro ao aceitar entrega')
        }
    }

    const finalizarEntrega = async (pedidoId: string) => {
        try {
            const { error } = await supabase
                .from('pedidos')
                .update({
                    status: 'aguardando_confirmacao'
                })
                .eq('id', pedidoId)

            if (error) throw error

            success('Entrega finalizada! Aguardando confirmação do cliente')
            carregarDados()
        } catch (error) {
            console.error('Erro ao finalizar entrega:', error)
            showError('Erro ao finalizar entrega')
        }
    }

    if (loading) {
        return <div className="text-center py-12">Carregando...</div>
    }

    return (
        <div className="space-y-6">
            {/* Título */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                    Entregas
                </h2>
                <p className="text-neutral-600 mt-1">
                    Gerencie suas entregas
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setTab('disponiveis')}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all btn-touch ${
                        tab === 'disponiveis'
                            ? 'bg-giro-azul-medio text-neutral-0'
                            : 'bg-neutral-200 text-neutral-700 active:bg-neutral-300'
                    }`}
                >
                    Disponíveis ({pedidosDisponiveis.length})
                </button>
                <button
                    onClick={() => setTab('minhas')}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all btn-touch ${
                        tab === 'minhas'
                            ? 'bg-giro-azul-medio text-neutral-0'
                            : 'bg-neutral-200 text-neutral-700 active:bg-neutral-300'
                    }`}
                >
                    Minhas ({minhasEntregas.length})
                </button>
                <button
                    onClick={() => setTab('historico')}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all btn-touch ${
                        tab === 'historico'
                            ? 'bg-giro-azul-medio text-neutral-0'
                            : 'bg-neutral-200 text-neutral-700 active:bg-neutral-300'
                    }`}
                >
                    Histórico
                </button>
            </div>

            {/* Conteúdo - Disponíveis */}
            {tab === 'disponiveis' && (
                pedidosDisponiveis.length === 0 ? (
                    <div className="bg-neutral-0 rounded-2xl p-8 text-center border-2 border-neutral-200">
                        <div className="text-6xl mb-3">📍</div>
                        <p className="text-neutral-600 text-lg font-semibold">
                            Nenhuma entrega disponível
                        </p>
                        <p className="text-neutral-500 text-sm mt-2">
                            Aguarde novos pedidos aparecerem
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pedidosDisponiveis.map((pedido) => (
                            <div
                                key={pedido.id}
                                className="bg-neutral-0 rounded-2xl p-5 shadow-md border-2 border-giro-azul-medio/30"
                            >
                                {/* Cabeçalho */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Package size={18} className="text-giro-azul-medio" />
                                            <span className="font-bold text-neutral-900">
                                                Nova Entrega
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full font-semibold">
                                                ✓ Pago
                                            </span>
                                            <p className="text-sm text-neutral-600">
                                                {pedido.usuarios?.nome_completo}
                                            </p>
                                        </div>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            {tempoRelativo(pedido.criado_em)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-neutral-600">Ganho</p>
                                        <p className="text-xl font-bold text-success">
                                            R$ 5,00
                                        </p>
                                    </div>
                                </div>

                                {/* Detalhes */}
                                <div className="bg-giro-azul-medio/10 rounded-xl p-4 mb-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin size={20} className="text-giro-azul-medio mt-1" />
                                        <div className="flex-1 space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-neutral-600">Retirada:</span>
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
                                            <div className="flex justify-between">
                                                <span className="text-neutral-600">Valor total:</span>
                                                <span className="font-semibold text-neutral-900">
                                                    {formatarMoeda(pedido.valor_total)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ação */}
                                <button
                                    onClick={() => aceitarEntrega(pedido.id)}
                                    className="w-full bg-giro-azul-medio text-neutral-0 py-4 rounded-xl font-bold btn-touch active:opacity-90"
                                >
                                    Aceitar Entrega
                                </button>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Conteúdo - Minhas Entregas */}
            {tab === 'minhas' && (
                minhasEntregas.length === 0 ? (
                    <div className="bg-neutral-0 rounded-2xl p-8 text-center border-2 border-neutral-200">
                        <div className="text-6xl mb-3">🚴</div>
                        <p className="text-neutral-600 text-lg font-semibold">
                            Você não tem entregas em andamento
                        </p>
                        <p className="text-neutral-500 text-sm mt-2">
                            Aceite uma entrega para começar
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {minhasEntregas.map((pedido) => (
                            <div
                                key={pedido.id}
                                className="bg-neutral-0 rounded-2xl p-5 shadow-md border-2 border-success/30"
                            >
                                {/* Cabeçalho */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Package size={18} className="text-success" />
                                            <span className="font-bold text-success">
                                                {pedido.status === 'aguardando_confirmacao' 
                                                    ? 'Aguardando Confirmação' 
                                                    : 'Em Andamento'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-600">
                                            Cliente: {pedido.usuarios?.nome_completo}
                                        </p>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            Iniciado {tempoRelativo(pedido.criado_em)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-neutral-600">Valor</p>
                                        <p className="text-xl font-bold text-neutral-900">
                                            {formatarMoeda(pedido.valor_total)}
                                        </p>
                                    </div>
                                </div>

                                {/* Detalhes */}
                                <div className="bg-success/10 rounded-xl p-4 mb-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin size={20} className="text-success mt-1" />
                                        <div className="flex-1 space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-neutral-600">Local:</span>
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
                                </div>

                                {/* Ação */}
                                {pedido.status === 'em_entrega' && (
                                    <button
                                        onClick={() => finalizarEntrega(pedido.id)}
                                        className="w-full bg-success text-neutral-0 py-4 rounded-xl font-bold flex items-center justify-center gap-2 btn-touch active:opacity-90"
                                    >
                                        <CheckCircle size={20} />
                                        Entrega Realizada
                                    </button>
                                )}
                                {pedido.status === 'aguardando_confirmacao' && (
                                    <div className="bg-giro-amarelo/10 rounded-xl p-4 text-center border-2 border-giro-amarelo/30">
                                        <p className="text-sm font-semibold text-neutral-900">
                                            ⏳ Aguardando cliente confirmar
                                        </p>
                                        <p className="text-xs text-neutral-600 mt-1">
                                            Você receberá R$ 5,00 após a confirmação
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Conteúdo - Histórico */}
            {tab === 'historico' && (
                entregasConcluidas.length === 0 ? (
                    <div className="bg-neutral-0 rounded-2xl p-8 text-center border-2 border-neutral-200">
                        <div className="text-6xl mb-3">📋</div>
                        <p className="text-neutral-600 text-lg font-semibold">
                            Seu histórico está vazio
                        </p>
                        <p className="text-neutral-500 text-sm mt-2">
                            Suas entregas concluídas aparecerão aqui
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {entregasConcluidas.map((pedido) => (
                            <div
                                key={pedido.id}
                                className="bg-neutral-0 rounded-2xl p-5 shadow-md border-2 border-neutral-200"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <CheckCircle size={18} className="text-success" />
                                            <span className="font-bold text-success">
                                                Entregue
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-600">
                                            {pedido.usuarios?.nome_completo}
                                        </p>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            {formatarData(pedido.criado_em, 'curto')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-neutral-600">Ganho</p>
                                        <p className="text-lg font-bold text-success">
                                            + R$ 5,00
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-neutral-100 rounded-xl p-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">Local:</span>
                                        <span className="font-semibold text-neutral-900">
                                            {pedido.entrada_retirada}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    )
}
        try {
            const { error } = await supabase
                .from('pedidos')
                .update({
                    status: 'aguardando_confirmacao'
                })
                .eq('id', pedidoId)

            if (error) throw error

            // Atualizar total de entregas do entregador
            const { error: erroEntregador } = await supabase.rpc('increment_entregas', {
                entregador_user_id: user?.id
            })

            success('Entrega finalizada! Aguardando confirmação do cliente')
            carregarDados()
        } catch (error) {
            console.error('Erro ao finalizar entrega:', error)
            showError('Erro ao finalizar entrega')
        }
    }

    if (loading) {
        return <div className="text-center py-12">Carregando...</div>
    }

    return (
        <div className="space-y-6">
            {/* Título */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                    Entregas
                </h2>
                <p className="text-neutral-600 mt-1">
                    Gerencie suas entregas
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setTab('disponiveis')}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all btn-touch ${
                        tab === 'disponiveis'
                            ? 'bg-giro-azul-medio text-neutral-0'
                            : 'bg-neutral-200 text-neutral-700 active:bg-neutral-300'
                    }`}
                >
                    Disponíveis ({pedidosDisponiveis.length})
                </button>
                <button
                    onClick={() => setTab('minhas')}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all btn-touch ${
                        tab === 'minhas'
                            ? 'bg-giro-azul-medio text-neutral-0'
                            : 'bg-neutral-200 text-neutral-700 active:bg-neutral-300'
                    }`}
                >
                    Minhas ({minhasEntregas.length})
                </button>
            </div>

            {/* Conteúdo */}
            {tab === 'disponiveis' ? (
                pedidosDisponiveis.length === 0 ? (
                    <div className="bg-neutral-0 rounded-2xl p-8 text-center border-2 border-neutral-200">
                        <div className="text-6xl mb-3">📍</div>
                        <p className="text-neutral-600 text-lg font-semibold">
                            Nenhuma entrega disponível
                        </p>
                        <p className="text-neutral-500 text-sm mt-2">
                            Aguarde novos pedidos aparecerem
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pedidosDisponiveis.map((pedido) => (
                            <div
                                key={pedido.id}
                                className="bg-neutral-0 rounded-2xl p-5 shadow-md border-2 border-giro-azul-medio/30"
                            >
                                {/* Cabeçalho */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Package size={18} className="text-giro-azul-medio" />
                                            <span className="font-bold text-neutral-900">
                                                Nova Entrega
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-600">
                                            Cliente: {pedido.usuarios?.nome_completo}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-neutral-600">Ganho</p>
                                        <p className="text-xl font-bold text-success">
                                            R$ 5,00
                                        </p>
                                    </div>
                                </div>

                                {/* Detalhes */}
                                <div className="bg-giro-azul-medio/10 rounded-xl p-4 mb-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin size={20} className="text-giro-azul-medio mt-1" />
                                        <div className="flex-1 space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-neutral-600">Retirada:</span>
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
                                </div>

                                {/* Ação */}
                                <button
                                    onClick={() => aceitarEntrega(pedido.id)}
                                    className="w-full bg-giro-azul-medio text-neutral-0 py-4 rounded-xl font-bold btn-touch active:opacity-90"
                                >
                                    Aceitar Entrega
                                </button>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                minhasEntregas.length === 0 ? (
                    <div className="bg-neutral-0 rounded-2xl p-8 text-center border-2 border-neutral-200">
                        <div className="text-6xl mb-3">🚴</div>
                        <p className="text-neutral-600 text-lg font-semibold">
                            Você não tem entregas em andamento
                        </p>
                        <p className="text-neutral-500 text-sm mt-2">
                            Aceite uma entrega para começar
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {minhasEntregas.map((pedido) => (
                            <div
                                key={pedido.id}
                                className="bg-neutral-0 rounded-2xl p-5 shadow-md border-2 border-success/30"
                            >
                                {/* Cabeçalho */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Package size={18} className="text-success" />
                                            <span className="font-bold text-success">
                                                Em Andamento
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-600">
                                            Cliente: {pedido.usuarios?.nome_completo}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-neutral-600">Valor</p>
                                        <p className="text-xl font-bold text-neutral-900">
                                            R$ {pedido.valor_total.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Detalhes */}
                                <div className="bg-success/10 rounded-xl p-4 mb-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin size={20} className="text-success mt-1" />
                                        <div className="flex-1 space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-neutral-600">Local:</span>
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
                                </div>

                                {/* Ação */}
                                <button
                                    onClick={() => finalizarEntrega(pedido.id)}
                                    className="w-full bg-success text-neutral-0 py-4 rounded-xl font-bold flex items-center justify-center gap-2 btn-touch active:opacity-90"
                                >
                                    <CheckCircle size={20} />
                                    Entrega Realizada
                                </button>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    )
}
