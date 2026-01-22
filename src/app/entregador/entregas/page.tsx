/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Package, MapPin, CheckCircle, Clock } from 'lucide-react'
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
    const [processando, setProcessando] = useState<string | null>(null)
    const [tab, setTab] = useState<'disponiveis' | 'minhas' | 'historico'>('disponiveis')

    const carregarDados = useCallback(async () => {
        setLoading(true)
        try {
            if (tab === 'disponiveis') {
                console.log('🔍 Buscando pedidos disponíveis...')

                const { data: pedidosData, error: pedidosError } = await supabase
                    .from('pedidos')
                    .select('*')
                    .eq('status', 'aprovado')
                    .is('entregador_id', null)
                    .not('pago_em', 'is', null)
                    .order('criado_em', { ascending: false })

                console.log('📦 Pedidos brutos:', pedidosData?.length || 0, pedidosError)

                if (pedidosError) {
                    console.error('❌ Erro ao buscar pedidos:', pedidosError)
                    throw pedidosError
                }

                const pedidosComClientes = await Promise.all(
                    (pedidosData || []).map(async (pedido) => {
                        const { data: cliente } = await supabase
                            .from('usuarios')
                            .select('nome_completo')
                            .eq('id', pedido.cliente_id)
                            .single()

                        return {
                            ...pedido,
                            usuarios: cliente || { nome_completo: 'Cliente' }
                        }
                    })
                )

                console.log('✅ Pedidos com clientes:', pedidosComClientes.length)
                setPedidosDisponiveis(pedidosComClientes)

            } else if (tab === 'minhas') {
                const { data: pedidosData, error: pedidosError } = await supabase
                    .from('pedidos')
                    .select('*')
                    .eq('entregador_id', user?.id)
                    .in('status', ['em_entrega', 'aguardando_confirmacao'])
                    .order('criado_em', { ascending: false })

                if (pedidosError) throw pedidosError

                const pedidosComClientes = await Promise.all(
                    (pedidosData || []).map(async (pedido) => {
                        const { data: cliente } = await supabase
                            .from('usuarios')
                            .select('nome_completo')
                            .eq('id', pedido.cliente_id)
                            .single()

                        return {
                            ...pedido,
                            usuarios: cliente || { nome_completo: 'Cliente' }
                        }
                    })
                )

                setMinhasEntregas(pedidosComClientes)

            } else {
                const { data: pedidosData, error: pedidosError } = await supabase
                    .from('pedidos')
                    .select('*')
                    .eq('entregador_id', user?.id)
                    .eq('status', 'entregue')
                    .order('criado_em', { ascending: false })
                    .limit(20)

                if (pedidosError) throw pedidosError

                const pedidosComClientes = await Promise.all(
                    (pedidosData || []).map(async (pedido) => {
                        const { data: cliente } = await supabase
                            .from('usuarios')
                            .select('nome_completo')
                            .eq('id', pedido.cliente_id)
                            .single()

                        return {
                            ...pedido,
                            usuarios: cliente || { nome_completo: 'Cliente' }
                        }
                    })
                )

                setEntregasConcluidas(pedidosComClientes)
            }
        } catch (error: any) {
            console.error('❌ Erro ao carregar dados:', {
                message: error?.message,
                details: error?.details,
                hint: error?.hint,
                code: error?.code,
                full: error
            })
        } finally {
            setLoading(false)
        }
    }, [user?.id, tab])

    useEffect(() => {
        if (user) {
            carregarDados()
        }
    }, [user, carregarDados])

    const aceitarEntrega = async (pedidoId: string) => {
        setProcessando(pedidoId)
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
        } finally {
            setProcessando(null)
        }
    }

    const finalizarEntrega = async (pedidoId: string) => {
        setProcessando(pedidoId)
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
        } finally {
            setProcessando(null)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-giro-azul-medio border-t-transparent rounded-full animate-spin mb-4"></div>
                <p style={{ fontSize: 'clamp(1.125rem, 3vw + 0.5rem, 1.5rem)' }} className="font-bold text-neutral-700 text-center">
                    Carregando entregas...
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 px-3 sm:px-0">
            {/* Título */}
            <div className="bg-giro-azul-medio rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <Package className="flex-shrink-0 text-neutral-0" style={{ width: 'clamp(1.5rem, 4vw, 2rem)', height: 'clamp(1.5rem, 4vw, 2rem)' }} />
                    <h2 style={{ fontSize: 'clamp(1.5rem, 5vw + 0.5rem, 2rem)' }} className="font-bold text-neutral-0 leading-tight">
                        Minhas Entregas
                    </h2>
                </div>
                <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-0/90">
                    Gerencie suas entregas
                </p>
            </div>

            {/* Tabs - Grandes e legíveis */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                    onClick={() => setTab('disponiveis')}
                    style={{
                        fontSize: 'clamp(0.8125rem, 2.5vw + 0.25rem, 1rem)',
                        minHeight: 'clamp(3rem, 8vw, 3.5rem)'
                    }}
                    className={`py-3 sm:py-4 px-2 rounded-xl sm:rounded-2xl font-bold transition-all btn-touch shadow-md ${tab === 'disponiveis'
                        ? 'bg-giro-azul-medio text-neutral-0 border-2 border-giro-azul-medio'
                        : 'bg-neutral-0 text-neutral-700 active:bg-neutral-50 border-2 border-neutral-200'
                        }`}
                >
                    <div className="leading-tight">
                        <div className="mb-0.5">📋 Disponíveis</div>
                        <div className={`text-xs ${tab === 'disponiveis' ? 'text-neutral-0/80' : 'text-neutral-500'}`}>
                            ({pedidosDisponiveis.length})
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => setTab('minhas')}
                    style={{
                        fontSize: 'clamp(0.8125rem, 2.5vw + 0.25rem, 1rem)',
                        minHeight: 'clamp(3rem, 8vw, 3.5rem)'
                    }}
                    className={`py-3 sm:py-4 px-2 rounded-xl sm:rounded-2xl font-bold transition-all btn-touch shadow-md ${tab === 'minhas'
                        ? 'bg-giro-azul-medio text-neutral-0 border-2 border-giro-azul-medio'
                        : 'bg-neutral-0 text-neutral-700 active:bg-neutral-50 border-2 border-neutral-200'
                        }`}
                >
                    <div className="leading-tight">
                        <div className="mb-0.5">🚴 Minhas</div>
                        <div className={`text-xs ${tab === 'minhas' ? 'text-neutral-0/80' : 'text-neutral-500'}`}>
                            ({minhasEntregas.length})
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => setTab('historico')}
                    style={{
                        fontSize: 'clamp(0.8125rem, 2.5vw + 0.25rem, 1rem)',
                        minHeight: 'clamp(3rem, 8vw, 3.5rem)'
                    }}
                    className={`py-3 sm:py-4 px-2 rounded-xl sm:rounded-2xl font-bold transition-all btn-touch shadow-md ${tab === 'historico'
                        ? 'bg-giro-azul-medio text-neutral-0 border-2 border-giro-azul-medio'
                        : 'bg-neutral-0 text-neutral-700 active:bg-neutral-50 border-2 border-neutral-200'
                        }`}
                >
                    <div className="leading-tight">
                        <div className="mb-0.5">✅ Histórico</div>
                        <div className={`text-xs ${tab === 'historico' ? 'text-neutral-0/80' : 'text-neutral-500'}`}>
                            ({entregasConcluidas.length})
                        </div>
                    </div>
                </button>
            </div>

            {/* Conteúdo - Disponíveis */}
            {tab === 'disponiveis' && (
                pedidosDisponiveis.length === 0 ? (
                    <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center border-2 border-neutral-200 shadow-md">
                        <div style={{ fontSize: 'clamp(3rem, 10vw, 4.5rem)' }} className="mb-2 sm:mb-3">
                            📍
                        </div>
                        <p style={{ fontSize: 'clamp(1rem, 3vw + 0.5rem, 1.25rem)' }} className="text-neutral-900 font-bold mb-2">
                            Nenhuma entrega disponível
                        </p>
                        <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-500">
                            Aguarde novos pedidos aparecerem
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {pedidosDisponiveis.map((pedido) => {
                            const estaProcessando = processando === pedido.id

                            return (
                                <div
                                    key={pedido.id}
                                    className="bg-neutral-0 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl border-2 sm:border-4 border-giro-azul-medio/40"
                                >
                                    {/* Cabeçalho */}
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 pb-4 border-b-2 border-neutral-200">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Package className="flex-shrink-0 text-giro-azul-medio" size={20} />
                                                <span style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)' }} className="font-bold text-neutral-900">
                                                    Nova Entrega
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span style={{ fontSize: 'clamp(0.75rem, 2vw + 0.25rem, 0.875rem)' }} className="bg-success/20 text-success px-2 sm:px-3 py-1 rounded-full font-bold whitespace-nowrap">
                                                    ✓ Pago
                                                </span>
                                                <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 font-semibold truncate">
                                                    {pedido.usuarios?.nome_completo}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Clock className="flex-shrink-0 text-neutral-500" size={14} />
                                                <p style={{ fontSize: 'clamp(0.75rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-500">
                                                    {tempoRelativo(pedido.criado_em)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right flex-shrink-0">
                                            <p style={{ fontSize: 'clamp(0.75rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-600 mb-0.5 font-semibold">
                                                💰 Seu Ganho
                                            </p>
                                            <p style={{ fontSize: 'clamp(1.5rem, 5vw + 0.5rem, 2rem)' }} className="font-bold text-success leading-none">
                                                R$ 5,00
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detalhes */}
                                    <div className="bg-giro-azul-medio/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 border-2 border-giro-azul-medio/30">
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <MapPin className="flex-shrink-0 text-giro-azul-medio mt-0.5" size={20} />
                                            <div className="flex-1 space-y-2">
                                                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                                                    <span style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 font-semibold">
                                                        Retirada:
                                                    </span>
                                                    <span style={{ fontSize: 'clamp(0.9375rem, 2.5vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900">
                                                        {pedido.entrada_retirada}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                                                    <span style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 font-semibold">
                                                        Horário:
                                                    </span>
                                                    <span style={{ fontSize: 'clamp(0.9375rem, 2.5vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900">
                                                        {formatarData(pedido.horario_retirada, 'hora')}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                                                    <span style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 font-semibold">
                                                        Valor total:
                                                    </span>
                                                    <span style={{ fontSize: 'clamp(0.9375rem, 2.5vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900">
                                                        {formatarMoeda(pedido.valor_total)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ação */}
                                    <button
                                        onClick={() => aceitarEntrega(pedido.id)}
                                        disabled={estaProcessando}
                                        style={{
                                            fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)',
                                            minHeight: 'clamp(3.5rem, 10vw, 4rem)'
                                        }}
                                        className="w-full bg-giro-azul-medio text-neutral-0 py-4 rounded-xl sm:rounded-2xl font-bold btn-touch active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border-2 border-giro-azul-medio flex items-center justify-center gap-2"
                                    >
                                        {estaProcessando ? '⏳ Aceitando...' : '✅ Aceitar Entrega'}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )
            )}

            {/* Conteúdo - Minhas Entregas */}
            {tab === 'minhas' && (
                minhasEntregas.length === 0 ? (
                    <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center border-2 border-neutral-200 shadow-md">
                        <div style={{ fontSize: 'clamp(3rem, 10vw, 4.5rem)' }} className="mb-2 sm:mb-3">
                            🚴
                        </div>
                        <p style={{ fontSize: 'clamp(1rem, 3vw + 0.5rem, 1.25rem)' }} className="text-neutral-900 font-bold mb-2">
                            Você não tem entregas em andamento
                        </p>
                        <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-500">
                            Aceite uma entrega para começar
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {minhasEntregas.map((pedido) => {
                            const estaProcessando = processando === pedido.id

                            return (
                                <div
                                    key={pedido.id}
                                    className="bg-neutral-0 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl border-2 sm:border-4 border-success/40"
                                >
                                    {/* Cabeçalho */}
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 pb-4 border-b-2 border-neutral-200">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Package className="flex-shrink-0 text-success" size={20} />
                                                <span style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)' }} className="font-bold text-success leading-tight">
                                                    {pedido.status === 'aguardando_confirmacao'
                                                        ? '⏳ Aguardando Cliente'
                                                        : '🚴 Em Andamento'}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 font-semibold truncate">
                                                Cliente: {pedido.usuarios?.nome_completo}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Clock className="flex-shrink-0 text-neutral-500" size={14} />
                                                <p style={{ fontSize: 'clamp(0.75rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-500">
                                                    Iniciado {tempoRelativo(pedido.criado_em)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right flex-shrink-0">
                                            <p style={{ fontSize: 'clamp(0.75rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-600 mb-0.5 font-semibold">
                                                Valor Total
                                            </p>
                                            <p style={{ fontSize: 'clamp(1.25rem, 4vw + 0.5rem, 1.75rem)' }} className="font-bold text-neutral-900 leading-none">
                                                {formatarMoeda(pedido.valor_total)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detalhes */}
                                    <div className="bg-success/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 border-2 border-success/30">
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <MapPin className="flex-shrink-0 text-success mt-0.5" size={20} />
                                            <div className="flex-1 space-y-2">
                                                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                                                    <span style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 font-semibold">
                                                        Local:
                                                    </span>
                                                    <span style={{ fontSize: 'clamp(0.9375rem, 2.5vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900">
                                                        {pedido.entrada_retirada}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                                                    <span style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 font-semibold">
                                                        Horário:
                                                    </span>
                                                    <span style={{ fontSize: 'clamp(0.9375rem, 2.5vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900">
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
                                            disabled={estaProcessando}
                                            style={{
                                                fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)',
                                                minHeight: 'clamp(3.5rem, 10vw, 4rem)'
                                            }}
                                            className="w-full bg-success text-neutral-0 py-4 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 btn-touch active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border-2 border-success"
                                        >
                                            <CheckCircle className="flex-shrink-0" style={{ width: 'clamp(1.25rem, 4vw, 1.5rem)', height: 'clamp(1.25rem, 4vw, 1.5rem)' }} />
                                            <span>{estaProcessando ? 'Finalizando...' : 'Entrega Realizada'}</span>
                                        </button>
                                    )}
                                    {pedido.status === 'aguardando_confirmacao' && (
                                        <div className="bg-giro-amarelo/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center border-2 border-giro-amarelo/40">
                                            <p style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900 mb-2">
                                                ⏳ Aguardando cliente confirmar
                                            </p>
                                            <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600">
                                                Você receberá <span className="font-bold text-success">R$ 5,00</span> após a confirmação
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )
            )}

            {/* Conteúdo - Histórico */}
            {tab === 'historico' && (
                entregasConcluidas.length === 0 ? (
                    <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center border-2 border-neutral-200 shadow-md">
                        <div style={{ fontSize: 'clamp(3rem, 10vw, 4.5rem)' }} className="mb-2 sm:mb-3">
                            📋
                        </div>
                        <p style={{ fontSize: 'clamp(1rem, 3vw + 0.5rem, 1.25rem)' }} className="text-neutral-900 font-bold mb-2">
                            Seu histórico está vazio
                        </p>
                        <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-500">
                            Suas entregas concluídas aparecerão aqui
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {entregasConcluidas.map((pedido) => (
                            <div
                                key={pedido.id}
                                className="bg-neutral-0 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border-2 border-neutral-200"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="flex-shrink-0 text-success" size={20} />
                                            <span style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.125rem)' }} className="font-bold text-success">
                                                ✅ Entregue
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 font-semibold truncate">
                                            {pedido.usuarios?.nome_completo}
                                        </p>
                                        <p style={{ fontSize: 'clamp(0.75rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-500 mt-1">
                                            {formatarData(pedido.criado_em, 'curto')}
                                        </p>
                                    </div>
                                    <div className="text-left sm:text-right flex-shrink-0">
                                        <p style={{ fontSize: 'clamp(0.75rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-600 mb-0.5 font-semibold">
                                            💰 Ganho
                                        </p>
                                        <p style={{ fontSize: 'clamp(1.125rem, 4vw + 0.5rem, 1.5rem)' }} className="font-bold text-success leading-none">
                                            + R$ 5,00
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-neutral-100 rounded-xl p-3">
                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                                        <span style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 font-semibold">
                                            Local:
                                        </span>
                                        <span style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="font-bold text-neutral-900">
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
