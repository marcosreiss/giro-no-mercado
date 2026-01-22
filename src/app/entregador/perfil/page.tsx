'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Star, Package, TrendingUp, Calendar, LogOut, AlertCircle } from 'lucide-react'
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

    useEffect(() => {
        if (user) {
            carregarDados()
        }
    }, [user])

    const carregarDados = async () => {
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
        } catch (error: any) {
            console.error('❌ [ENTREGADOR PERFIL] ERRO FATAL ao carregar dados:', {
                message: error?.message,
                details: error?.details,
                hint: error?.hint,
                code: error?.code,
                error: error
            })
            showError(`Erro ao carregar dados: ${error?.message || 'Erro desconhecido'}`)
        } finally {
            setLoading(false)
        }
    }

    const toggleDisponibilidade = async () => {
        if (!entregador) return
        
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
        }
    }

    const handleLogout = async () => {
        await logout()
        success('Você saiu da sua conta')
        router.push('/login')
    }

    if (loading) {
        return <div className="text-center py-12">Carregando...</div>
    }

    return (
        <div className="space-y-6">
            {/* Perfil do entregador */}
            <div className="bg-giro-azul-medio text-neutral-0 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-neutral-0/20 p-4 rounded-full">
                        <User size={40} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold">
                            {user?.nome_completo}
                        </h2>
                        <p className="text-neutral-0/80 text-sm">
                            Entregador
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="bg-neutral-0/10 rounded-xl p-3 flex items-center gap-2 text-sm">
                        <Star size={18} fill="currentColor" />
                        <span className="font-bold">
                            {entregador?.avaliacoes_media.toFixed(1)}
                        </span>
                        <span className="text-neutral-0/80">
                            ({entregador?.total_avaliacoes} avaliações)
                        </span>
                    </div>
                </div>
            </div>

            {/* Status de disponibilidade */}
            <div className={`rounded-2xl p-5 shadow-md border-2 ${
                entregador?.disponivel 
                    ? 'bg-success/10 border-success/30' 
                    : 'bg-error/10 border-error/30'
            }`}>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-sm text-neutral-600 mb-1">Seu Status</p>
                        <p className={`font-bold text-xl ${
                            entregador?.disponivel ? 'text-success' : 'text-error'
                        }`}>
                            {entregador?.disponivel ? '🟢 Disponível' : '🔴 Indisponível'}
                        </p>
                    </div>
                    <button
                        onClick={toggleDisponibilidade}
                        className={`px-6 py-3 rounded-xl font-bold transition-all btn-touch ${
                            entregador?.disponivel
                                ? 'bg-error text-neutral-0 active:opacity-80'
                                : 'bg-success text-neutral-0 active:opacity-80'
                        }`}
                    >
                        {entregador?.disponivel ? 'Pausar' : 'Ativar'}
                    </button>
                </div>
                <p className="text-sm text-neutral-600">
                    {entregador?.disponivel
                        ? 'Você está recebendo notificações de novas entregas'
                        : 'Ative para começar a receber entregas'}
                </p>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-neutral-0 rounded-2xl p-4 shadow-md border-2 border-giro-azul-medio/20 text-center">
                    <p className="text-xs text-neutral-600 mb-1">Hoje</p>
                    <p className="text-2xl font-bold text-giro-azul-medio">
                        {estatisticas.entregasHoje}
                    </p>
                    <p className="text-xs text-neutral-500">entregas</p>
                </div>
                <div className="bg-neutral-0 rounded-2xl p-4 shadow-md border-2 border-success/20 text-center">
                    <p className="text-xs text-neutral-600 mb-1">Ganhos</p>
                    <p className="text-xl font-bold text-success">
                        R$ {estatisticas.ganhosHoje.toFixed(0)}
                    </p>
                    <p className="text-xs text-neutral-500">hoje</p>
                </div>
                <div className="bg-neutral-0 rounded-2xl p-4 shadow-md border-2 border-giro-amarelo/20 text-center">
                    <p className="text-xs text-neutral-600 mb-1">Ativas</p>
                    <p className="text-2xl font-bold text-giro-amarelo">
                        {estatisticas.entregasEmAndamento}
                    </p>
                    <p className="text-xs text-neutral-500">em curso</p>
                </div>
            </div>

            {/* Resumo geral */}
            <section>
                <h3 className="text-xl font-bold text-neutral-900 mb-4">
                    Resumo Geral
                </h3>
                <div className="bg-neutral-0 rounded-2xl p-5 shadow-md border-2 border-neutral-200 space-y-4">
                    <div className="flex items-center gap-3">
                        <Package size={20} className="text-neutral-600" />
                        <div className="flex-1">
                            <p className="text-sm text-neutral-600">Total de Entregas</p>
                            <p className="font-semibold text-neutral-900">
                                {entregador?.total_entregas} entregas realizadas
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-neutral-200"></div>
                    <div className="flex items-center gap-3">
                        <Star size={20} className="text-neutral-600" />
                        <div className="flex-1">
                            <p className="text-sm text-neutral-600">Avaliação Média</p>
                            <p className="font-semibold text-neutral-900">
                                {entregador?.avaliacoes_media.toFixed(1)} ⭐ de {entregador?.total_avaliacoes} avaliações
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-neutral-200"></div>
                    <div className="flex items-center gap-3">
                        <TrendingUp size={20} className="text-neutral-600" />
                        <div className="flex-1">
                            <p className="text-sm text-neutral-600">Saldo na Carteira</p>
                            <p className="font-semibold text-success text-lg">
                                R$ {entregador?.saldo_carteira.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-neutral-200"></div>
                    <div className="flex items-center gap-3">
                        <Calendar size={20} className="text-neutral-600" />
                        <div className="flex-1">
                            <p className="text-sm text-neutral-600">Usuário</p>
                            <p className="font-semibold text-neutral-900">@{user?.username}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ações rápidas */}
            <section>
                <h3 className="text-xl font-bold text-neutral-900 mb-4">
                    Ações Rápidas
                </h3>
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/entregador/entregas')}
                        className="w-full bg-neutral-0 rounded-2xl p-5 text-left border-2 border-neutral-200 active:bg-neutral-50 transition-all btn-touch"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-neutral-900">
                                    Minhas Entregas
                                </h4>
                                <p className="text-sm text-neutral-600">
                                    {estatisticas.entregasEmAndamento} em andamento
                                </p>
                            </div>
                            <div className="text-2xl text-neutral-400">→</div>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/entregador/carteira')}
                        className="w-full bg-neutral-0 rounded-2xl p-5 text-left border-2 border-neutral-200 active:bg-neutral-50 transition-all btn-touch"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <TrendingUp size={24} className="text-success" />
                                <div>
                                    <h4 className="font-bold text-neutral-900">
                                        Minha Carteira
                                    </h4>
                                    <p className="text-sm text-neutral-600">
                                        R$ {entregador?.saldo_carteira.toFixed(2)} disponível
                                    </p>
                                </div>
                            </div>
                        </div>
                    </button>

                    <div className="bg-giro-azul-medio/10 rounded-2xl p-4 border-2 border-giro-azul-medio/30">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={20} className="text-giro-azul-medio mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-neutral-900 mb-1">
                                    Dica: Ganhe mais!
                                </p>
                                <p className="text-xs text-neutral-600">
                                    Mantenha seu status ativo e aceite mais entregas. Cada entrega vale R$ 5,00!
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full bg-error/10 rounded-2xl p-5 text-left border-2 border-error/30 active:bg-error/20 transition-all btn-touch"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <LogOut size={24} className="text-error" />
                                <div>
                                    <h4 className="font-bold text-error">
                                        Sair da Conta
                                    </h4>
                                    <p className="text-sm text-error/80">
                                        Fazer logout
                                    </p>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            </section>
        </div>
    )
}
