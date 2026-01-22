/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Store, MapPin, User, Package, ClipboardList, TrendingUp, LogOut } from 'lucide-react'
import { useAuth } from '@/src/context/AuthContext'
import { useNotification } from '@/src/context/NotificationContext'
import { supabase } from '@/src/lib/supabase'

interface ComercianteData {
    id: string
    banca_nome: string
    banca_codigo: string | null
    galpao: number | null
    foto_url: string | null
}

export default function ComerciantePerfilPage() {
    const router = useRouter()
    const { user, logout } = useAuth()
    const { success, error: showError } = useNotification()
    const [comerciante, setComerciante] = useState<ComercianteData | null>(null)
    const [estatisticas, setEstatisticas] = useState({
        totalProdutos: 0,
        produtosAtivos: 0,
        pedidosRecebidos: 0,
        totalVendas: 0
    })
    const [loading, setLoading] = useState(true)

    const carregarDados = useCallback(async () => {
        try {
            console.log('🔄 Carregando dados do perfil do comerciante...')
            
            // Buscar dados do comerciante
            const { data: comercianteData, error: erroComerciante } = await supabase
                .from('comerciantes')
                .select('*')
                .eq('usuario_id', user?.id)
                .single()

            if (erroComerciante) {
                console.error('❌ Erro ao buscar comerciante:', erroComerciante)
                throw erroComerciante
            }
            
            if (!comercianteData) {
                console.warn('⚠️ Nenhum comerciante encontrado para este usuário')
                showError('Perfil de comerciante não encontrado')
                return
            }
            
            console.log('✅ Comerciante encontrado:', comercianteData)
            setComerciante(comercianteData)

            // Total de produtos
            const { count: totalProdutos, error: erroProdutos } = await supabase
                .from('produtos')
                .select('*', { count: 'exact', head: true })
                .eq('comerciante_id', comercianteData.id)

            if (erroProdutos) console.error('Erro ao contar produtos:', erroProdutos)

            // Produtos ativos
            const { count: produtosAtivos, error: erroProdutosAtivos } = await supabase
                .from('produtos')
                .select('*', { count: 'exact', head: true })
                .eq('comerciante_id', comercianteData.id)
                .eq('ativo', true)

            if (erroProdutosAtivos) console.error('Erro ao contar produtos ativos:', erroProdutosAtivos)

            // Pedidos recebidos
            const { count: pedidosRecebidos, error: erroPedidos } = await supabase
                .from('itens_pedido')
                .select('*', { count: 'exact', head: true })
                .eq('comerciante_id', comercianteData.id)

            if (erroPedidos) console.error('Erro ao contar pedidos:', erroPedidos)

            // Total de vendas
            const { data: itens, error: erroVendas } = await supabase
                .from('itens_pedido')
                .select('preco_total, pedidos!inner(status)')
                .eq('comerciante_id', comercianteData.id)
                .eq('status', 'aprovado')

            if (erroVendas) console.error('Erro ao buscar vendas:', erroVendas)

            const totalVendas = itens?.reduce((sum, item) => sum + item.preco_total, 0) || 0

            console.log('📊 Estatísticas calculadas:', {
                totalProdutos,
                produtosAtivos,
                pedidosRecebidos,
                totalVendas
            })

            setEstatisticas({
                totalProdutos: totalProdutos || 0,
                produtosAtivos: produtosAtivos || 0,
                pedidosRecebidos: pedidosRecebidos || 0,
                totalVendas
            })
        } catch (error: any) {
            console.error('❌ Erro ao carregar dados:', {
                message: error?.message,
                details: error?.details,
                hint: error?.hint,
                code: error?.code,
                error
            })
            showError('Erro ao carregar dados: ' + (error?.message || 'Erro desconhecido'))
        } finally {
            setLoading(false)
        }
    }, [user?.id, showError])

    useEffect(() => {
        if (user) {
            carregarDados()
        }
    }, [user, carregarDados])

    const handleLogout = async () => {
        await logout()
        success('Você saiu da sua conta')
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-giro-amarelo border-t-transparent rounded-full animate-spin mb-4"></div>
                <p style={{ fontSize: 'clamp(1.125rem, 3vw + 0.5rem, 1.5rem)' }} className="font-bold text-neutral-700 text-center">
                    Carregando seu perfil...
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-5 sm:space-y-6 pb-6 sm:pb-8 px-3 sm:px-0">
            {/* Perfil da banca - Card destacado */}
            <div className="bg-giro-amarelo text-neutral-900 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-xl">
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    <div className="bg-neutral-900/10 p-3 sm:p-4 rounded-full flex-shrink-0">
                        <Store style={{ width: 'clamp(2rem, 6vw, 2.5rem)', height: 'clamp(2rem, 6vw, 2.5rem)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 style={{ fontSize: 'clamp(1.25rem, 4vw + 0.5rem, 1.75rem)' }} className="font-bold leading-tight truncate">
                            {comerciante?.banca_nome}
                        </h2>
                        <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-900/80 truncate">
                            {user?.nome_completo}
                        </p>
                    </div>
                </div>
                {comerciante?.galpao && (
                    <div className="bg-neutral-900/10 rounded-xl p-3 sm:p-4 flex items-center gap-2">
                        <MapPin className="flex-shrink-0" size={20} />
                        <span style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="font-semibold">
                            Galpão {comerciante.galpao}
                            {comerciante.banca_codigo && ` - Box ${comerciante.banca_codigo}`}
                        </span>
                    </div>
                )}
            </div>

            {/* Estatísticas - Cards grandes e legíveis */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg border-2 sm:border-4 border-giro-amarelo/30 text-center">
                    <p style={{ fontSize: 'clamp(0.75rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-600 mb-1 sm:mb-2 font-semibold">
                        Produtos Ativos
                    </p>
                    <p style={{ fontSize: 'clamp(1.75rem, 6vw + 0.5rem, 2.5rem)' }} className="font-bold text-giro-amarelo leading-none">
                        {estatisticas.produtosAtivos}
                    </p>
                    <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }} className="text-neutral-500 mt-1">
                        de {estatisticas.totalProdutos} total
                    </p>
                </div>
                <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg border-2 sm:border-4 border-giro-verde-escuro/30 text-center">
                    <p style={{ fontSize: 'clamp(0.75rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-600 mb-1 sm:mb-2 font-semibold">
                        Pedidos
                    </p>
                    <p style={{ fontSize: 'clamp(1.75rem, 6vw + 0.5rem, 2.5rem)' }} className="font-bold text-giro-verde-escuro leading-none">
                        {estatisticas.pedidosRecebidos}
                    </p>
                    <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }} className="text-neutral-500 mt-1">
                        recebidos
                    </p>
                </div>
                <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg border-2 sm:border-4 border-success/30 col-span-2 text-center">
                    <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600 mb-1 sm:mb-2 font-semibold">
                        💰 Total de Vendas
                    </p>
                    <p style={{ fontSize: 'clamp(2rem, 7vw + 0.5rem, 3rem)' }} className="font-bold text-success leading-none">
                        R$ {estatisticas.totalVendas.toFixed(2)}
                    </p>
                    <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }} className="text-neutral-500 mt-1 sm:mt-2">
                        em vendas aprovadas
                    </p>
                </div>
            </div>

            {/* Informações da conta - Simplificado */}
            <section>
                <h3 style={{ fontSize: 'clamp(1.125rem, 3.5vw + 0.5rem, 1.5rem)' }} className="font-bold text-neutral-900 mb-3 sm:mb-4">
                    📋 Dados da Banca
                </h3>
                <div className="bg-neutral-0 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border-2 border-neutral-200 space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3">
                        <Store className="flex-shrink-0 text-neutral-600" size={22} />
                        <div className="flex-1 min-w-0">
                            <p style={{ fontSize: 'clamp(0.8125rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-600 mb-0.5">
                                Nome da Banca
                            </p>
                            <p style={{ fontSize: 'clamp(1rem, 2.5vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900 truncate">
                                {comerciante?.banca_nome}
                            </p>
                        </div>
                    </div>
                    {comerciante?.galpao && (
                        <>
                            <div className="border-t-2 border-neutral-200"></div>
                            <div className="flex items-center gap-3">
                                <MapPin className="flex-shrink-0 text-neutral-600" size={22} />
                                <div className="flex-1 min-w-0">
                                    <p style={{ fontSize: 'clamp(0.8125rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-600 mb-0.5">
                                        Localização
                                    </p>
                                    <p style={{ fontSize: 'clamp(1rem, 2.5vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900">
                                        Galpão {comerciante.galpao}
                                        {comerciante.banca_codigo && ` - Box ${comerciante.banca_codigo}`}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="border-t-2 border-neutral-200"></div>
                    <div className="flex items-center gap-3">
                        <User className="flex-shrink-0 text-neutral-600" size={22} />
                        <div className="flex-1 min-w-0">
                            <p style={{ fontSize: 'clamp(0.8125rem, 2vw + 0.25rem, 0.875rem)' }} className="text-neutral-600 mb-0.5">
                                Seu Nome
                            </p>
                            <p style={{ fontSize: 'clamp(1rem, 2.5vw + 0.25rem, 1.125rem)' }} className="font-bold text-neutral-900 truncate">
                                {user?.nome_completo}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ações rápidas - Botões grandes e claros */}
            <section>
                <h3 style={{ fontSize: 'clamp(1.125rem, 3.5vw + 0.5rem, 1.5rem)' }} className="font-bold text-neutral-900 mb-3 sm:mb-4">
                    ⚡ Ações Rápidas
                </h3>
                <div className="space-y-3 sm:space-y-4">
                    <button
                        onClick={() => router.push('/comerciante/produtos')}
                        style={{ minHeight: 'clamp(4.5rem, 12vw, 5.5rem)' }}
                        className="w-full bg-neutral-0 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-left border-2 sm:border-4 border-neutral-300 active:bg-neutral-50 active:border-giro-amarelo transition-all btn-touch shadow-md"
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-giro-amarelo/20 p-3 rounded-xl flex-shrink-0">
                                <Package className="text-giro-amarelo" style={{ width: 'clamp(1.5rem, 5vw, 2rem)', height: 'clamp(1.5rem, 5vw, 2rem)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)' }} className="font-bold text-neutral-900 mb-0.5 leading-tight">
                                    Gerenciar Produtos
                                </h4>
                                <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600">
                                    {estatisticas.produtosAtivos} produtos ativos
                                </p>
                            </div>
                            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }} className="text-neutral-400 flex-shrink-0">
                                →
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/comerciante/pedidos')}
                        style={{ minHeight: 'clamp(4.5rem, 12vw, 5.5rem)' }}
                        className="w-full bg-neutral-0 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-left border-2 sm:border-4 border-neutral-300 active:bg-neutral-50 active:border-giro-verde-escuro transition-all btn-touch shadow-md"
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-giro-verde-escuro/20 p-3 rounded-xl flex-shrink-0">
                                <ClipboardList className="text-giro-verde-escuro" style={{ width: 'clamp(1.5rem, 5vw, 2rem)', height: 'clamp(1.5rem, 5vw, 2rem)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)' }} className="font-bold text-neutral-900 mb-0.5 leading-tight">
                                    Novos Pedidos
                                </h4>
                                <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-neutral-600">
                                    Ver pedidos aguardando
                                </p>
                            </div>
                            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }} className="text-neutral-400 flex-shrink-0">
                                →
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/comerciante/carteira')}
                        style={{ minHeight: 'clamp(4.5rem, 12vw, 5.5rem)' }}
                        className="w-full bg-success/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-left border-2 sm:border-4 border-success/40 active:bg-success/20 transition-all btn-touch shadow-md"
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-success/30 p-3 rounded-xl flex-shrink-0">
                                <TrendingUp className="text-success" style={{ width: 'clamp(1.5rem, 5vw, 2rem)', height: 'clamp(1.5rem, 5vw, 2rem)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)' }} className="font-bold text-success mb-0.5 leading-tight">
                                    💰 Minha Carteira
                                </h4>
                                <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-success/90 font-semibold">
                                    R$ {estatisticas.totalVendas.toFixed(2)}
                                </p>
                            </div>
                            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }} className="text-success/60 flex-shrink-0">
                                →
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={handleLogout}
                        style={{ minHeight: 'clamp(4.5rem, 12vw, 5.5rem)' }}
                        className="w-full bg-error/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-left border-2 sm:border-4 border-error/40 active:bg-error/20 transition-all btn-touch shadow-md"
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-error/30 p-3 rounded-xl flex-shrink-0">
                                <LogOut className="text-error" style={{ width: 'clamp(1.5rem, 5vw, 2rem)', height: 'clamp(1.5rem, 5vw, 2rem)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 style={{ fontSize: 'clamp(1rem, 3vw + 0.25rem, 1.25rem)' }} className="font-bold text-error mb-0.5 leading-tight">
                                    Sair da Conta
                                </h4>
                                <p style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1rem)' }} className="text-error/80">
                                    Fazer logout
                                </p>
                            </div>
                            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }} className="text-error/60 flex-shrink-0">
                                ×
                            </div>
                        </div>
                    </button>
                </div>
            </section>
        </div>
    )
}
