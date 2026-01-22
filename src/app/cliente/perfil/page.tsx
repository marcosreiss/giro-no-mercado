'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Calendar, Shield, LogOut, Trash2 } from 'lucide-react'
import { useAuth } from '@/src/context/AuthContext'
import { useNotification } from '@/src/context/NotificationContext'
import { supabase } from '@/src/lib/supabase'

export default function ClientePerfilPage() {
    const router = useRouter()
    const { user, logout } = useAuth()
    const { success, error: showError } = useNotification()
    const [estatisticas, setEstatisticas] = useState({
        totalPedidos: 0,
        pedidosEmAndamento: 0,
        totalGasto: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            carregarEstatisticas()
        }
    }, [user])

    const carregarEstatisticas = async () => {
        try {
            // Total de pedidos
            const { count: totalPedidos } = await supabase
                .from('pedidos')
                .select('*', { count: 'exact', head: true })
                .eq('cliente_id', user?.id)

            // Pedidos em andamento
            const { count: pedidosEmAndamento } = await supabase
                .from('pedidos')
                .select('*', { count: 'exact', head: true })
                .eq('cliente_id', user?.id)
                .in('status', ['aguardando_aprovacao', 'aprovado', 'em_entrega', 'aguardando_confirmacao'])

            // Total gasto
            const { data: pedidos } = await supabase
                .from('pedidos')
                .select('valor_total')
                .eq('cliente_id', user?.id)
                .eq('status', 'entregue')

            const totalGasto = pedidos?.reduce((sum, p) => sum + p.valor_total, 0) || 0

            setEstatisticas({
                totalPedidos: totalPedidos || 0,
                pedidosEmAndamento: pedidosEmAndamento || 0,
                totalGasto
            })
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await logout()
        success('Você saiu da sua conta')
        router.push('/login')
    }

    const limparDados = () => {
        localStorage.removeItem('carrinho')
        localStorage.removeItem('dadosEntrega')
        success('Dados locais limpos!')
    }

    if (loading) {
        return <div className="text-center py-12">Carregando...</div>
    }

    return (
        <div className="space-y-6">
            {/* Perfil do usuário */}
            <div className="bg-gradient-secundario text-neutral-0 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-neutral-0/20 p-4 rounded-full">
                        <User size={40} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold">
                            {user?.nome_completo}
                        </h2>
                        <p className="text-neutral-0/80 text-sm">
                            @{user?.username}
                        </p>
                    </div>
                </div>
                <div className="bg-neutral-0/10 rounded-xl p-3 flex items-center gap-2 text-sm">
                    <Shield size={18} />
                    <span>Cliente verificado</span>
                </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-neutral-0 rounded-2xl p-4 shadow-md border-2 border-giro-verde-escuro/20 text-center">
                    <p className="text-xs text-neutral-600 mb-1">Total</p>
                    <p className="text-2xl font-bold text-giro-verde-escuro">
                        {estatisticas.totalPedidos}
                    </p>
                    <p className="text-xs text-neutral-500">pedidos</p>
                </div>
                <div className="bg-neutral-0 rounded-2xl p-4 shadow-md border-2 border-giro-amarelo/20 text-center">
                    <p className="text-xs text-neutral-600 mb-1">Ativos</p>
                    <p className="text-2xl font-bold text-giro-amarelo">
                        {estatisticas.pedidosEmAndamento}
                    </p>
                    <p className="text-xs text-neutral-500">em curso</p>
                </div>
                <div className="bg-neutral-0 rounded-2xl p-4 shadow-md border-2 border-neutral-300 text-center">
                    <p className="text-xs text-neutral-600 mb-1">Gasto</p>
                    <p className="text-lg font-bold text-neutral-900">
                        R$ {estatisticas.totalGasto.toFixed(0)}
                    </p>
                    <p className="text-xs text-neutral-500">total</p>
                </div>
            </div>

            {/* Informações da conta */}
            <section>
                <h3 className="text-xl font-bold text-neutral-900 mb-4">
                    Informações da Conta
                </h3>
                <div className="bg-neutral-0 rounded-2xl p-5 shadow-md border-2 border-neutral-200 space-y-4">
                    <div className="flex items-center gap-3">
                        <User size={20} className="text-neutral-600" />
                        <div className="flex-1">
                            <p className="text-sm text-neutral-600">Nome Completo</p>
                            <p className="font-semibold text-neutral-900">{user?.nome_completo}</p>
                        </div>
                    </div>
                    <div className="border-t border-neutral-200"></div>
                    <div className="flex items-center gap-3">
                        <Shield size={20} className="text-neutral-600" />
                        <div className="flex-1">
                            <p className="text-sm text-neutral-600">Nome de Usuário</p>
                            <p className="font-semibold text-neutral-900">@{user?.username}</p>
                        </div>
                    </div>
                    <div className="border-t border-neutral-200"></div>
                    <div className="flex items-center gap-3">
                        <Calendar size={20} className="text-neutral-600" />
                        <div className="flex-1">
                            <p className="text-sm text-neutral-600">Tipo de Conta</p>
                            <p className="font-semibold text-neutral-900 capitalize">{user?.tipo_usuario}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ações */}
            <section>
                <h3 className="text-xl font-bold text-neutral-900 mb-4">
                    Configurações
                </h3>
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/cliente/pedidos')}
                        className="w-full bg-neutral-0 rounded-2xl p-5 text-left border-2 border-neutral-200 active:bg-neutral-50 transition-all btn-touch"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-neutral-900">
                                    Meus Pedidos
                                </h4>
                                <p className="text-sm text-neutral-600">
                                    Ver histórico de pedidos
                                </p>
                            </div>
                            <div className="text-2xl text-neutral-400">→</div>
                        </div>
                    </button>

                    <button
                        onClick={limparDados}
                        className="w-full bg-neutral-0 rounded-2xl p-5 text-left border-2 border-neutral-200 active:bg-neutral-50 transition-all btn-touch"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Trash2 size={24} className="text-neutral-600" />
                                <div>
                                    <h4 className="font-bold text-neutral-900">
                                        Limpar Carrinho
                                    </h4>
                                    <p className="text-sm text-neutral-600">
                                        Remover itens salvos
                                    </p>
                                </div>
                            </div>
                        </div>
                    </button>

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
