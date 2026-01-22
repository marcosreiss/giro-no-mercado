'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User, Star, Package, TrendingUp, Calendar, LogOut, AlertCircle, Wallet } from 'lucide-react'
import { useAuth } from '@/src/context/AuthContext'
import { useNotification } from '@/src/context/NotificationContext'
import { supabase } from '@/src/lib/supabase'

interface EntregadorData {
    id: string
    avaliacoes_media: number
    total_avaliacoes: number
    total_entregas: number
    saldo_carteira: number
    disponivel: boolean
}

export default function EntregadorPerfilPage() {
    const router = useRouter()
    const { user, logout } = useAuth()
    const { success, error: showError } = useNotification()
    const [entregador, setEntregador] = useState<EntregadorData | null>(null)
    const [estatisticas, setEstatisticas] = useState({
        entregasHoje: 0,
        ganhosHoje: 0,
        entregasEmAndamento: 0
    })
    const [loading, setLoading] = useState(true)
    const [alterandoStatus, setAlterandoStatus] = useState(false)

    const carregarDados = useCallback(async () => {
        try {
            console.log('🔄 [ENTREGADOR PERFIL] Carregando dados...')

            // Buscar dados do entregador
            console.log('🔍 [ENTREGADOR PERFIL] Buscando dados do entregador, user_id:', user?.id)
            const { data: entregadorData, error: erroEntregador } = await supabase
                .from('entregadores')
                .select('*')
                .eq('usuario_id', user?.id)
                .maybeSingle()

            if (erroEntregador) {
                console.error('❌ [ENTREGADOR PERFIL] Erro ao buscar entregador:', erroEntregador.message || 'Erro desconhecido', {
                    code: erroEntregador.code,
                    details: erroEntregador.details,
                    hint: erroEntregador.hint
                })
                throw new Error(erroEntregador.message || 'Erro ao buscar dados do entregador')
            }

            if (!entregadorData) {
                console.warn('⚠️ [ENTREGADOR PERFIL] Nenhum entregador encontrado para user_id:', user?.id)
                showError('Perfil de entregador não encontrado')
                return
            }

            console.log('✅ [ENTREGADOR PERFIL] Entregador encontrado:', entregadorData)
            setEntregador(entregadorData)

            // Entregas de hoje
            console.log('🔍 [ENTREGADOR PERFIL] Buscando entregas de hoje...')
            const hoje = new Date()
            hoje.setHours(0, 0, 0, 0)

            const { data: entregasHojeData, error: erroEntregasHoje } = await supabase
                .from('pedidos')
                .select('taxa_entrega')
                .eq('entregador_id', user?.id)
                .eq('status', 'entregue')
                .gte('criado_em', hoje.toISOString())

            if (erroEntregasHoje) {
                console.error('❌ [ENTREGADOR PERFIL] Erro ao buscar entregas de hoje:', {
                    message: erroEntregasHoje?.message,
                    details: erroEntregasHoje?.details,
                    hint: erroEntregasHoje?.hint,
                    code: erroEntregasHoje?.code,
                    error: erroEntregasHoje
                })
            }

            const entregasHoje = entregasHojeData?.length || 0
            console.log('✅ [ENTREGADOR PERFIL] Entregas de hoje:', entregasHoje)

            // Ganhos de hoje (soma das taxas de entrega reais)
            const ganhosHoje = entregasHojeData?.reduce((sum, p) => sum + (p.taxa_entrega || 5.00), 0) || 0

            // Entregas em andamento
            console.log('🔍 [ENTREGADOR PERFIL] Buscando entregas em andamento...')
            const { count: entregasEmAndamento, error: erroAndamento } = await supabase
                .from('pedidos')
                .select('*', { count: 'exact', head: true })
                .eq('entregador_id', user?.id)
                .in('status', ['em_entrega', 'aguardando_confirmacao'])

            if (erroAndamento) {
                console.error('❌ [ENTREGADOR PERFIL] Erro ao buscar entregas em andamento:', {
                    message: erroAndamento?.message,
                    details: erroAndamento?.details,
                    hint: erroAndamento?.hint,
                    code: erroAndamento?.code,
                    error: erroAndamento
                })
            }

            console.log('✅ [ENTREGADOR PERFIL] Entregas em andamento:', entregasEmAndamento || 0)

            const estatisticasFinais = {
                entregasHoje,
                ganhosHoje,
                entregasEmAndamento: entregasEmAndamento || 0
            }

            console.log('📊 [ENTREGADOR PERFIL] Estatísticas finais:', estatisticasFinais)
            setEstatisticas(estatisticasFinais)

            console.log('✅ [ENTREGADOR PERFIL] Dados carregados com sucesso!')
        } catch (error) {
            const err = error as Error
            console.error('❌ [ENTREGADOR PERFIL] ERRO FATAL ao carregar dados:', {
                message: err?.message,
                error: error
            })
            showError(`Erro ao carregar dados: ${err?.message || 'Erro desconhecido'}`)
        } finally {
            setLoading(false)
        }
    }, [user, showError])

    useEffect(() => {
        if (user) {
            carregarDados()
        }
    }, [user, carregarDados])

    const toggleDisponibilidade = async () => {
        if (!entregador || alterandoStatus) return

        setAlterandoStatus(true)
        try {
            const novoStatus = !entregador.disponivel

            const { error } = await supabase
                .from('entregadores')
                .update({ disponivel: novoStatus })
                .eq('usuario_id', user?.id)

            if (error) throw error

            setEntregador({ ...entregador, disponivel: novoStatus })
            success(novoStatus ? 'Você está disponível!' : 'Você está indisponível')
        } catch (error) {
            console.error('Erro ao atualizar status:', error)
            showError('Erro ao atualizar status')
        } finally {
            setAlterandoStatus(false)
        }
    }

    const handleLogout = async () => {
        await logout()
        success('Você saiu da sua conta')
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-giro-azul-medio border-t-transparent rounded-full animate-spin mb-4"></div>
                <p style={{ fontSize: 'clamp(1.125rem, 3vw + 0.5rem, 1.5rem)' }} className="font-bold text-neutral-700 text-center">
                    Carregando seu perfil...
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 px-3 sm:px-0">
            {/* Perfil do entregador */}
            <div className="bg-giro-azul-medio text-neutral-0 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-xl">
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    <div className="bg-neutral-0/20 p-3 sm:p-4 rounded-full flex-shrink-0">
                        <User style={{ width: 'clamp(2rem, 6vw, 2.5rem)', height: 'clamp(2rem, 6vw, 2.5rem)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 style={{ fontSize: 'clamp(1.25rem, 4vw + 0.5rem, 1.75rem)' }} className="font-bold leading-tight truncate">
                            {user?.nome_completo}
                        </h2>
                        <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-0/80 truncate">
                            🚴 Entregador
                        </p>
                    </div>
                </div>
                <div className="bg-neutral-0/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                    <Star className="flex-shrink-0" size={20} fill="currentColor" />
                    <span style={{ fontSize: 'clamp(1.125rem, 3.5vw + 0.25rem, 1.5rem)' }} className="font-bold">
                        {entregador?.avaliacoes_media.toFixed(1)}
                    </span>
                    <span style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-0/80">
                        ({entregador?.total_avaliacoes} avaliações)
                    </span>
                </div>
            </div>

            {/* Status de disponibilidade - Grande e destacado */}
            <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl border-2 sm:border-4 ${entregador?.disponivel
                    ? 'bg-success/10 border-success/40'
                    : 'bg-error/10 border-error/40'
                }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
                    <div className="flex-1">
                        <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 mb-1 font-semibold">
                            Seu Status Agora
                        </p>
                        <p style={{ fontSize: 'clamp(1.25rem, 4vw + 0.5rem, 1.75rem)' }} className={`font-bold leading-tight ${entregador?.disponivel ? 'text-success' : 'text-error'
                            }`}>
                            {entregador?.disponivel ? '🟢 Disponível' : '🔴 Indisponível'}
                        </p>
                    </div>
                    <button
                        onClick={toggleDisponibilidade}
                        disabled={alterandoStatus}
                        style={{
                            fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)',
                            minHeight: 'clamp(3rem, 8vw, 3.5rem)'
                        }}
                        className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all btn-touch shadow-lg flex-shrink-0 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed ${entregador?.disponivel
                                ? 'bg-error text-neutral-0 active:opacity-80 border-2 border-error'
                                : 'bg-success text-neutral-0 active:opacity-80 border-2 border-success'
                            }`}
                    >
                        {alterandoStatus ? '⏳' : entregador?.disponivel ? '⏸️ Pausar' : '▶️ Ativar'}
                    </button>
                </div>
                <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 leading-relaxed">
                    {entregador?.disponivel
                        ? '✅ Você está recebendo notificações de novas entregas'
                        : '⏸️ Ative para começar a receber entregas'}
                </p>
            </div>

            {/* Estatísticas - Cards grandes */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border-2 sm:border-4 border-giro-azul-medio/30 text-center">
                    <p style={{ fontSize: 'clamp(0.75rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-600 mb-1 sm:mb-2 font-semibold">
                        Hoje
                    </p>
                    <p style={{ fontSize: 'clamp(1.5rem, 6vw + 0.5rem, 2.5rem)' }} className="font-bold text-giro-azul-medio leading-none">
                        {estatisticas.entregasHoje}
                    </p>
                    <p style={{ fontSize: 'clamp(0.6875rem, 1.5vw, 0.75rem)' }} className="text-neutral-500 mt-0.5 sm:mt-1">
                        entregas
                    </p>
                </div>
                <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border-2 sm:border-4 border-success/30 text-center">
                    <p style={{ fontSize: 'clamp(0.75rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-600 mb-1 sm:mb-2 font-semibold">
                        💰 Ganhos
                    </p>
                    <p style={{ fontSize: 'clamp(1.125rem, 4.5vw + 0.5rem, 1.75rem)' }} className="font-bold text-success leading-none">
                        R$ {estatisticas.ganhosHoje.toFixed(0)}
                    </p>
                    <p style={{ fontSize: 'clamp(0.6875rem, 1.5vw, 0.75rem)' }} className="text-neutral-500 mt-0.5 sm:mt-1">
                        hoje
                    </p>
                </div>
                <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border-2 sm:border-4 border-giro-amarelo/30 text-center">
                    <p style={{ fontSize: 'clamp(0.75rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-600 mb-1 sm:mb-2 font-semibold">
                        Ativas
                    </p>
                    <p style={{ fontSize: 'clamp(1.5rem, 6vw + 0.5rem, 2.5rem)' }} className="font-bold text-giro-amarelo leading-none">
                        {estatisticas.entregasEmAndamento}
                    </p>
                    <p style={{ fontSize: 'clamp(0.6875rem, 1.5vw, 0.75rem)' }} className="text-neutral-500 mt-0.5 sm:mt-1">
                        em curso
                    </p>
                </div>
            </div>

            {/* Resumo geral */}
            <section>
                <h3 style={{ fontSize: 'clamp(1.125rem, 3.5vw + 0.5rem, 1.5rem)' }} className="font-bold text-neutral-900 mb-3 sm:mb-4">
                    📊 Resumo Geral
                </h3>
                <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg border-2 sm:border-4 border-neutral-300 space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3">
                        <Package className="flex-shrink-0 text-neutral-600" size={22} />
                        <div className="flex-1 min-w-0">
                            <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 font-semibold">
                                Total de Entregas
                            </p>
                            <p style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900">
                                {entregador?.total_entregas} entregas
                            </p>
                        </div>
                    </div>
                    <div className="border-t-2 border-neutral-200"></div>
                    <div className="flex items-center gap-3">
                        <Star className="flex-shrink-0 text-neutral-600" size={22} />
                        <div className="flex-1 min-w-0">
                            <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 font-semibold">
                                Avaliação Média
                            </p>
                            <p style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900">
                                {entregador?.avaliacoes_media.toFixed(1)} ⭐ ({entregador?.total_avaliacoes})
                            </p>
                        </div>
                    </div>
                    <div className="border-t-2 border-neutral-200"></div>
                    <div className="flex items-center gap-3">
                        <Wallet className="flex-shrink-0 text-success" size={22} />
                        <div className="flex-1 min-w-0">
                            <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 font-semibold">
                                💰 Saldo na Carteira
                            </p>
                            <p style={{ fontSize: 'clamp(1.125rem, 3.5vw + 0.5rem, 1.5rem)' }} className="font-bold text-success">
                                R$ {entregador?.saldo_carteira.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <div className="border-t-2 border-neutral-200"></div>
                    <div className="flex items-center gap-3">
                        <Calendar className="flex-shrink-0 text-neutral-600" size={22} />
                        <div className="flex-1 min-w-0">
                            <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 font-semibold">
                                Usuário
                            </p>
                            <p style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900 truncate">
                                @{user?.username}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ações rápidas */}
            <section>
                <h3 style={{ fontSize: 'clamp(1.125rem, 3.5vw + 0.5rem, 1.5rem)' }} className="font-bold text-neutral-900 mb-3 sm:mb-4">
                    ⚡ Ações Rápidas
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
                                    📦 Minhas Entregas
                                </h4>
                                <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600">
                                    {estatisticas.entregasEmAndamento} em andamento
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
                                    R$ {entregador?.saldo_carteira.toFixed(2)} disponível
                                </p>
                            </div>
                            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }} className="text-success/60 flex-shrink-0">
                                →
                            </div>
                        </div>
                    </button>

                    {/* Dica motivacional */}
                    <div className="bg-giro-azul-medio/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-giro-azul-medio/40 shadow-md">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="flex-shrink-0 text-giro-azul-medio mt-0.5" size={22} />
                            <div className="flex-1">
                                <p style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900 mb-1 sm:mb-2">
                                    💡 Dica: Ganhe mais!
                                </p>
                                <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 leading-relaxed">
                                    Mantenha seu status ativo e aceite mais entregas. Cada entrega vale <span className="font-bold text-success">R$ 5,00</span>!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botão sair */}
                    <button
                        onClick={handleLogout}
                        style={{ minHeight: 'clamp(4.5rem, 12vw, 5.5rem)' }}
                        className="w-full bg-error/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-left border-2 sm:border-4 border-error/40 active:bg-error/20 transition-all btn-touch shadow-md"
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-error/20 p-3 rounded-xl flex-shrink-0">
                                <LogOut className="text-error" style={{ width: 'clamp(1.5rem, 5vw, 2rem)', height: 'clamp(1.5rem, 5vw, 2rem)' }} />
                            </div>
                            <div className="flex-1">
                                <h4 style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)' }} className="font-bold text-error mb-0.5 leading-tight">
                                    🚪 Sair da Conta
                                </h4>
                                <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-error/80">
                                    Fazer logout
                                </p>
                            </div>
                            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }} className="text-error/60 flex-shrink-0">
                                →
                            </div>
                        </div>
                    </button>
                </div>
            </section>
        </div>
    )
}
