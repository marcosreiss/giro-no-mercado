/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/entregador/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Wallet, Star, Clock, MapPin } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'
import { useAuth } from '@/src/context/AuthContext'
import { useNotification } from '@/src/context/NotificationContext'
import { tempoRelativo } from '@/src/lib/utils'

interface Pedido {
    id: string
    entrada_retirada: string
    valor_total: number
    criado_em: string
    usuarios: {
        nome_completo: string
    }
}

export default function EntregadorPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { success, error } = useNotification()
    const [disponivel, setDisponivel] = useState(true)
    const [pedidosDisponiveis, setPedidosDisponiveis] = useState<Pedido[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        entregasHoje: 0,
        ganhosHoje: 0,
        avaliacaoMedia: 5.0,
        saldoCarteira: 0
    })

    const carregarDados = useCallback(async () => {
        try {
            console.log('🔄 [ENTREGADOR DASHBOARD] Carregando dados...')

            // Buscar dados do entregador
            console.log('🔍 [ENTREGADOR DASHBOARD] Buscando dados do entregador, user_id:', user?.id)
            const { data: entregador, error: entregadorError } = await supabase
                .from('entregadores')
                .select('*')
                .eq('usuario_id', user?.id)
                .maybeSingle()

            if (entregadorError) {
                console.error('❌ [ENTREGADOR DASHBOARD] Erro ao buscar entregador:', entregadorError.message || 'Erro desconhecido', {
                    code: entregadorError.code,
                    details: entregadorError.details,
                    hint: entregadorError.hint
                })
                throw new Error(entregadorError.message || 'Erro ao buscar dados do entregador')
            }

            if (!entregador) {
                console.warn('⚠️ [ENTREGADOR DASHBOARD] Nenhum entregador encontrado para user_id:', user?.id)
                error('Perfil de entregador não encontrado')
                return
            }

            console.log('✅ [ENTREGADOR DASHBOARD] Entregador encontrado:', entregador)
            setDisponivel(entregador.disponivel)

            // Buscar pedidos disponíveis (aprovados, pagos, sem entregador)
            console.log('🔍 [ENTREGADOR DASHBOARD] Buscando pedidos disponíveis...')
            const { data: pedidosData, error: pedidosError } = await supabase
                .from('pedidos')
                .select('*')
                .eq('status', 'aprovado')
                .is('entregador_id', null)
                .not('pago_em', 'is', null)
                .order('criado_em', { ascending: false })

            if (pedidosError) {
                console.error('❌ [ENTREGADOR DASHBOARD] Erro ao buscar pedidos:', {
                    message: pedidosError?.message,
                    details: pedidosError?.details,
                    hint: pedidosError?.hint,
                    code: pedidosError?.code,
                    error: pedidosError
                })
                throw pedidosError
            }

            console.log('✅ [ENTREGADOR DASHBOARD] Pedidos encontrados:', pedidosData?.length || 0)

            // Buscar nomes dos clientes
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

            setPedidosDisponiveis(pedidosComClientes)

            // Calcular estatísticas de hoje
            console.log('🔍 [ENTREGADOR DASHBOARD] Calculando estatísticas...')
            const hoje = new Date()
            hoje.setHours(0, 0, 0, 0)

            const { data: entregasHoje, error: entregasError } = await supabase
                .from('pedidos')
                .select('taxa_entrega')
                .eq('entregador_id', user?.id)
                .eq('status', 'entregue')
                .gte('criado_em', hoje.toISOString())

            if (entregasError) {
                console.error('❌ [ENTREGADOR DASHBOARD] Erro ao buscar entregas:', {
                    message: entregasError?.message,
                    details: entregasError?.details,
                    hint: entregasError?.hint,
                    code: entregasError?.code,
                    error: entregasError
                })
            }

            const ganhosHoje = entregasHoje?.reduce((sum, p) => sum + (p.taxa_entrega || 0), 0) || 0

            const statsFinais = {
                entregasHoje: entregasHoje?.length || 0,
                ganhosHoje,
                avaliacaoMedia: entregador.avaliacoes_media || 5.0,
                saldoCarteira: entregador.saldo_carteira || 0
            }

            console.log('📊 [ENTREGADOR DASHBOARD] Estatísticas finais:', statsFinais)
            setStats(statsFinais)

            console.log('✅ [ENTREGADOR DASHBOARD] Dados carregados com sucesso!')
        } catch (err: any) {
            console.error('❌ [ENTREGADOR DASHBOARD] ERRO FATAL ao carregar dados:', {
                message: err?.message,
                details: err?.details,
                hint: err?.hint,
                code: err?.code,
                error: err
            })
            error(`Erro ao carregar dados: ${err?.message || 'Erro desconhecido'}`)
        } finally {
            setLoading(false)
        }
    }, [user?.id, error])

    useEffect(() => {
        if (user) {
            carregarDados()
        }
    }, [user, carregarDados])

    const toggleDisponibilidade = async () => {
        try {
            const novoStatus = !disponivel

            const { error: erroUpdate } = await supabase
                .from('entregadores')
                .update({ disponivel: novoStatus })
                .eq('usuario_id', user?.id)

            if (erroUpdate) throw erroUpdate

            setDisponivel(novoStatus)
            success(novoStatus ? 'Você está disponível!' : 'Você está indisponível')
        } catch (err) {
            console.error('Erro ao atualizar status:', err)
            error('Erro ao atualizar status')
        }
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 px-3 sm:px-0">
            {/* Status Toggle - Grande e destacado */}
            <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl border-2 sm:border-4 border-neutral-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex-1">
                        <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 mb-1 font-semibold">
                            Seu Status Agora
                        </p>
                        <p style={{ fontSize: 'clamp(1.25rem, 4vw + 0.5rem, 1.75rem)' }} className="font-bold text-neutral-900 leading-tight">
                            {disponivel ? '🟢 Disponível' : '🔴 Indisponível'}
                        </p>
                    </div>
                    <button
                        onClick={toggleDisponibilidade}
                        style={{
                            fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)',
                            minHeight: 'clamp(3rem, 8vw, 3.5rem)'
                        }}
                        className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all btn-touch shadow-lg flex-shrink-0 w-full sm:w-auto ${disponivel
                            ? 'bg-error text-neutral-0 active:opacity-80 border-2 border-error'
                            : 'bg-success text-neutral-0 active:opacity-80 border-2 border-success'
                            }`}
                    >
                        {disponivel ? '⏸️ Pausar' : '▶️ Ativar'}
                    </button>
                </div>
                <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-500 leading-relaxed">
                    {disponivel
                        ? '✅ Você receberá notificações de novas entregas'
                        : '⏸️ Ative para começar a receber entregas'}
                </p>
            </div>

            {/* Cards de resumo - Grandes e legíveis */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border-2 sm:border-4 border-giro-azul-medio/30 text-center">
                    <p style={{ fontSize: 'clamp(0.75rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-600 mb-1 sm:mb-2 font-semibold">
                        Hoje
                    </p>
                    <p style={{ fontSize: 'clamp(1.5rem, 6vw + 0.5rem, 2.5rem)' }} className="font-bold text-giro-azul-medio leading-none">
                        {stats.entregasHoje}
                    </p>
                    <p style={{ fontSize: 'clamp(0.6875rem, 1.5vw, 0.75rem)' }} className="text-neutral-500 mt-0.5 sm:mt-1">
                        entregas
                    </p>
                </div>
                <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border-2 sm:border-4 border-success/30 text-center">
                    <p style={{ fontSize: 'clamp(0.75rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-600 mb-1 sm:mb-2 font-semibold">
                        Ganhos
                    </p>
                    <p style={{ fontSize: 'clamp(1.125rem, 4.5vw + 0.5rem, 1.75rem)' }} className="font-bold text-success leading-none">
                        R$ {stats.ganhosHoje.toFixed(2)}
                    </p>
                    <p style={{ fontSize: 'clamp(0.6875rem, 1.5vw, 0.75rem)' }} className="text-neutral-500 mt-0.5 sm:mt-1">
                        hoje
                    </p>
                </div>
                <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border-2 sm:border-4 border-giro-amarelo/30 text-center">
                    <p style={{ fontSize: 'clamp(0.75rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-600 mb-1 sm:mb-2 font-semibold">
                        Nota
                    </p>
                    <p style={{ fontSize: 'clamp(1.5rem, 5vw + 0.5rem, 2rem)' }} className="font-bold text-giro-amarelo leading-none">
                        {stats.avaliacaoMedia.toFixed(1)}
                    </p>
                    <p style={{ fontSize: 'clamp(0.6875rem, 1.5vw, 0.75rem)' }} className="text-neutral-500 mt-0.5 sm:mt-1">
                        ⭐ média
                    </p>
                </div>
            </div>

            {/* Entregas disponíveis */}
            <section>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 style={{ fontSize: 'clamp(1.125rem, 3.5vw + 0.5rem, 1.5rem)' }} className="font-bold text-neutral-900">
                        {disponivel ? '📦 Entregas Disponíveis' : '😴 Você está em pausa'}
                    </h2>
                    {pedidosDisponiveis.length > 0 && disponivel && (
                        <button
                            onClick={() => router.push('/entregador/entregas')}
                            style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }}
                            className="text-giro-azul-medio font-bold active:opacity-70 btn-touch"
                        >
                            Ver todas →
                        </button>
                    )}
                </div>

                {!disponivel ? (
                    <div className="bg-neutral-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center border-2 border-neutral-200">
                        <div style={{ fontSize: 'clamp(3rem, 10vw, 4.5rem)' }} className="mb-2 sm:mb-3">
                            😴
                        </div>
                        <p style={{ fontSize: 'clamp(1rem, 3vw + 0.5rem, 1.25rem)' }} className="text-neutral-900 font-bold mb-2">
                            Você está em pausa
                        </p>
                        <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-500">
                            Ative seu status para receber entregas
                        </p>
                    </div>
                ) : loading ? (
                    <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center border-2 border-neutral-200">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-giro-azul-medio border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p style={{ fontSize: 'clamp(1rem, 2.5vw + 0.25rem, 1.125rem)' }} className="text-neutral-600 font-semibold">
                            Buscando entregas...
                        </p>
                    </div>
                ) : pedidosDisponiveis.length === 0 ? (
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
                        {pedidosDisponiveis.slice(0, 3).map((pedido) => (
                            <button
                                key={pedido.id}
                                onClick={() => router.push('/entregador/entregas')}
                                style={{ minHeight: 'clamp(5rem, 12vw, 6rem)' }}
                                className="w-full bg-neutral-0 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-left border-2 sm:border-4 border-giro-azul-medio/40 active:bg-neutral-50 active:border-giro-azul-medio transition-all btn-touch shadow-md"
                            >
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)' }} className="font-bold text-neutral-900 mb-1 sm:mb-2 truncate">
                                            {pedido.usuarios.nome_completo}
                                        </p>
                                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                            <MapPin className="flex-shrink-0 text-neutral-600" size={16} />
                                            <span style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 font-semibold truncate">
                                                {pedido.entrada_retirada}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="flex-shrink-0 text-neutral-500" size={14} />
                                            <span style={{ fontSize: 'clamp(0.75rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-500">
                                                {tempoRelativo(pedido.criado_em)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p style={{ fontSize: 'clamp(0.75rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-500 mb-0.5 font-semibold">
                                            Seu ganho
                                        </p>
                                        <p style={{ fontSize: 'clamp(1.25rem, 4vw + 0.5rem, 1.75rem)' }} className="font-bold text-success leading-none">
                                            R$ 5,00
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                        {pedidosDisponiveis.length > 3 && (
                            <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-center text-neutral-600 font-semibold py-2">
                                + {pedidosDisponiveis.length - 3} entregas disponíveis
                            </p>
                        )}
                    </div>
                )}
            </section>

            {/* Menu de ações */}
            <section>
                <h3 style={{ fontSize: 'clamp(1.125rem, 3.5vw + 0.5rem, 1.5rem)' }} className="font-bold text-neutral-900 mb-3 sm:mb-4">
                    ⚡ Menu
                </h3>
                <div className="space-y-3 sm:space-y-4">
                    <button
                        onClick={() => router.push('/entregador/entregas')}
                        style={{ minHeight: 'clamp(4.5rem, 12vw, 5.5rem)' }}
                        className="w-full bg-neutral-0 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-left border-2 sm:border-4 border-neutral-300 active:bg-neutral-50 active:border-giro-azul-medio transition-all btn-touch shadow-md"
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-giro-azul-medio/20 p-3 rounded-xl flex-shrink-0">
                                <Package className="text-giro-azul-medio" style={{ width: 'clamp(1.5rem, 5vw, 2rem)', height: 'clamp(1.5rem, 5vw, 2rem)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)' }} className="font-bold text-neutral-900 mb-0.5 leading-tight">
                                    Minhas Entregas
                                </h4>
                                <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600">
                                    Histórico de entregas realizadas
                                </p>
                            </div>
                            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }} className="text-neutral-400 flex-shrink-0">
                                →
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/entregador/carteira')}
                        style={{ minHeight: 'clamp(4.5rem, 12vw, 5.5rem)' }}
                        className="w-full bg-success/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-left border-2 sm:border-4 border-success/40 active:bg-success/20 transition-all btn-touch shadow-md"
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-success/30 p-3 rounded-xl flex-shrink-0">
                                <Wallet className="text-success" style={{ width: 'clamp(1.5rem, 5vw, 2rem)', height: 'clamp(1.5rem, 5vw, 2rem)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)' }} className="font-bold text-success mb-0.5 leading-tight">
                                    💰 Minha Carteira
                                </h4>
                                <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-success/90 font-semibold">
                                    Saldo: R$ {stats.saldoCarteira.toFixed(2)}
                                </p>
                            </div>
                            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }} className="text-success/60 flex-shrink-0">
                                →
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/entregador/avaliacoes')}
                        style={{ minHeight: 'clamp(4.5rem, 12vw, 5.5rem)' }}
                        className="w-full bg-neutral-0 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-left border-2 sm:border-4 border-neutral-300 active:bg-neutral-50 active:border-giro-amarelo transition-all btn-touch shadow-md"
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-giro-amarelo/20 p-3 rounded-xl flex-shrink-0">
                                <Star className="text-giro-amarelo" style={{ width: 'clamp(1.5rem, 5vw, 2rem)', height: 'clamp(1.5rem, 5vw, 2rem)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)' }} className="font-bold text-neutral-900 mb-0.5 leading-tight">
                                    ⭐ Minhas Avaliações
                                </h4>
                                <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600">
                                    Nota média: {stats.avaliacaoMedia.toFixed(1)}
                                </p>
                            </div>
                            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }} className="text-neutral-400 flex-shrink-0">
                                →
                            </div>
                        </div>
                    </button>
                </div>
            </section>
        </div>
    )
}
