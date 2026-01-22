// src/app/entregador/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Wallet, Star, Clock, MapPin } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'
import { useAuth } from '@/src/context/AuthContext'
import { useNotification } from '@/src/context/NotificationContext'
import { formatarMoeda, tempoRelativo } from '@/src/lib/utils'

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

    useEffect(() => {
        if (user) {
            carregarDados()
        }
    }, [user])

    const carregarDados = async () => {
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
    }

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
        <div className="space-y-6">
            {/* Status Toggle */}
            <div className="bg-neutral-0 rounded-2xl p-5 shadow-lg border-2 border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm text-neutral-600 mb-1">Seu Status</p>
                        <p className="font-bold text-xl text-neutral-900">
                            {disponivel ? '🟢 Disponível' : '🔴 Indisponível'}
                        </p>
                    </div>
                    <button
                        onClick={toggleDisponibilidade}
                        className={`px-6 py-3 rounded-xl font-bold transition-all btn-touch ${disponivel
                            ? 'bg-error text-neutral-0 active:opacity-80'
                            : 'bg-success text-neutral-0 active:opacity-80'
                            }`}
                    >
                        {disponivel ? 'Pausar' : 'Ativar'}
                    </button>
                </div>
                <p className="text-sm text-neutral-500">
                    {disponivel
                        ? 'Você receberá notificações de novas entregas'
                        : 'Ative para começar a receber entregas'}
                </p>
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-neutral-0 rounded-2xl p-4 shadow-md border-2 border-giro-azul-medio/20">
                    <p className="text-neutral-600 text-xs mb-1">Hoje</p>
                    <p className="text-2xl font-bold text-giro-azul-medio">
                        {stats.entregasHoje}
                    </p>
                </div>
                <div className="bg-neutral-0 rounded-2xl p-4 shadow-md border-2 border-success/20">
                    <p className="text-neutral-600 text-xs mb-1">Ganhos</p>
                    <p className="text-2xl font-bold text-success">
                        R$ {stats.ganhosHoje}
                    </p>
                </div>
                <div className="bg-neutral-0 rounded-2xl p-4 shadow-md border-2 border-giro-amarelo/20">
                    <p className="text-neutral-600 text-xs mb-1">Nota</p>
                    <p className="text-2xl font-bold text-giro-amarelo">
                        {stats.avaliacaoMedia.toFixed(1)} ⭐
                    </p>
                </div>
            </div>

            {/* Entregas disponíveis */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-neutral-900">
                        {disponivel ? 'Entregas Disponíveis' : 'Você está em pausa'}
                    </h2>
                    {pedidosDisponiveis.length > 0 && disponivel && (
                        <button
                            onClick={() => router.push('/entregador/entregas')}
                            className="text-giro-azul-medio font-semibold text-sm active:opacity-70"
                        >
                            Ver todas →
                        </button>
                    )}
                </div>

                {!disponivel ? (
                    <div className="bg-neutral-100 rounded-2xl p-8 text-center border-2 border-neutral-200">
                        <div className="text-6xl mb-3">😴</div>
                        <p className="text-neutral-600 text-lg font-semibold">
                            Você está em pausa
                        </p>
                        <p className="text-neutral-500 text-sm mt-2">
                            Ative seu status para receber entregas
                        </p>
                    </div>
                ) : loading ? (
                    <div className="bg-neutral-0 rounded-2xl p-8 text-center border-2 border-neutral-200">
                        <p className="text-neutral-600">Carregando...</p>
                    </div>
                ) : pedidosDisponiveis.length === 0 ? (
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
                    <div className="space-y-3">
                        {pedidosDisponiveis.slice(0, 3).map((pedido) => (
                            <button
                                key={pedido.id}
                                onClick={() => router.push('/entregador/entregas')}
                                className="w-full bg-neutral-0 rounded-2xl p-5 text-left border-2 border-giro-azul-medio/30 active:bg-neutral-50 transition-all btn-touch"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-bold text-neutral-900 mb-1">
                                            {pedido.usuarios.nome_completo}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                                            <MapPin size={14} />
                                            <span>{pedido.entrada_retirada}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                                            <Clock size={12} />
                                            <span>{tempoRelativo(pedido.criado_em)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-neutral-500">Ganho</p>
                                        <p className="text-lg font-bold text-success">
                                            R$ 5,00
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                        {pedidosDisponiveis.length > 3 && (
                            <p className="text-center text-sm text-neutral-500">
                                + {pedidosDisponiveis.length - 3} entregas disponíveis
                            </p>
                        )}
                    </div>
                )}
            </section>

            {/* Menu de ações */}
            <section>
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Menu</h3>
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/entregador/entregas')}
                        className="w-full bg-neutral-0 rounded-2xl p-5 text-left border-2 border-neutral-200 active:bg-neutral-50 transition-all btn-touch"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-giro-azul-medio/10 p-3 rounded-xl">
                                <Package size={28} className="text-giro-azul-medio" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-neutral-900">
                                    Minhas Entregas
                                </h4>
                                <p className="text-sm text-neutral-600">
                                    Histórico de entregas realizadas
                                </p>
                            </div>
                            <div className="text-2xl text-neutral-400">→</div>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/entregador/carteira')}
                        className="w-full bg-neutral-0 rounded-2xl p-5 text-left border-2 border-neutral-200 active:bg-neutral-50 transition-all btn-touch"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-success/10 p-3 rounded-xl">
                                <Wallet size={28} className="text-success" />
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

                    <button
                        onClick={() => router.push('/entregador/avaliacoes')}
                        className="w-full bg-neutral-0 rounded-2xl p-5 text-left border-2 border-neutral-200 active:bg-neutral-50 transition-all btn-touch"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-giro-amarelo/10 p-3 rounded-xl">
                                <Star size={28} className="text-giro-amarelo" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-neutral-900">
                                    Minhas Avaliações
                                </h4>
                                <p className="text-sm text-neutral-600">
                                    Ver feedback dos clientes
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
