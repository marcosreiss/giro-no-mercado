'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, MapPin, User, Calendar, LogOut, TrendingUp } from 'lucide-react'
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

    useEffect(() => {
        if (user) {
            carregarDados()
        }
    }, [user])

    const carregarDados = async () => {
        try {
            // Buscar dados do comerciante
            const { data: comercianteData, error: erroComerciante } = await supabase
                .from('comerciantes')
                .select('*')
                .eq('usuario_id', user?.id)
                .single()

            if (erroComerciante) throw erroComerciante
            setComerciante(comercianteData)

            // Total de produtos
            const { count: totalProdutos } = await supabase
                .from('produtos')
                .select('*', { count: 'exact', head: true })
                .eq('comerciante_id', comercianteData.id)

            // Produtos ativos
            const { count: produtosAtivos } = await supabase
                .from('produtos')
                .select('*', { count: 'exact', head: true })
                .eq('comerciante_id', comercianteData.id)
                .eq('ativo', true)

            // Pedidos recebidos
            const { count: pedidosRecebidos } = await supabase
                .from('itens_pedido')
                .select('*', { count: 'exact', head: true })
                .eq('comerciante_id', comercianteData.id)

            // Total de vendas
            const { data: itens } = await supabase
                .from('itens_pedido')
                .select('preco_total, pedidos!inner(status)')
                .eq('comerciante_id', comercianteData.id)
                .eq('status', 'aprovado')

            const totalVendas = itens?.reduce((sum, item) => sum + item.preco_total, 0) || 0

            setEstatisticas({
                totalProdutos: totalProdutos || 0,
                produtosAtivos: produtosAtivos || 0,
                pedidosRecebidos: pedidosRecebidos || 0,
                totalVendas
            })
        } catch (error) {
            console.error('Erro ao carregar dados:', error)
            showError('Erro ao carregar dados')
        } finally {
            setLoading(false)
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
            {/* Perfil da banca */}
            <div className="bg-giro-amarelo text-neutral-900 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-neutral-900/10 p-4 rounded-full">
                        <Store size={40} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold">
                            {comerciante?.banca_nome}
                        </h2>
                        <p className="text-neutral-900/80 text-sm">
                            {user?.nome_completo}
                        </p>
                    </div>
                </div>
                {comerciante?.galpao && (
                    <div className="bg-neutral-900/10 rounded-xl p-3 flex items-center gap-2 text-sm">
                        <MapPin size={18} />
                        <span>
                            Galpão {comerciante.galpao}
                            {comerciante.banca_codigo && ` - Box ${comerciante.banca_codigo}`}
                        </span>
                    </div>
                )}
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-0 rounded-2xl p-4 shadow-md border-2 border-giro-amarelo/20 text-center">
                    <p className="text-xs text-neutral-600 mb-1">Produtos</p>
                    <p className="text-2xl font-bold text-giro-amarelo">
                        {estatisticas.produtosAtivos}
                    </p>
                    <p className="text-xs text-neutral-500">de {estatisticas.totalProdutos} total</p>
                </div>
                <div className="bg-neutral-0 rounded-2xl p-4 shadow-md border-2 border-giro-verde-escuro/20 text-center">
                    <p className="text-xs text-neutral-600 mb-1">Pedidos</p>
                    <p className="text-2xl font-bold text-giro-verde-escuro">
                        {estatisticas.pedidosRecebidos}
                    </p>
                    <p className="text-xs text-neutral-500">recebidos</p>
                </div>
                <div className="bg-neutral-0 rounded-2xl p-4 shadow-md border-2 border-success/20 col-span-2 text-center">
                    <p className="text-xs text-neutral-600 mb-1">Total de Vendas</p>
                    <p className="text-3xl font-bold text-success">
                        R$ {estatisticas.totalVendas.toFixed(2)}
                    </p>
                    <p className="text-xs text-neutral-500">em vendas aprovadas</p>
                </div>
            </div>

            {/* Informações da conta */}
            <section>
                <h3 className="text-xl font-bold text-neutral-900 mb-4">
                    Informações da Banca
                </h3>
                <div className="bg-neutral-0 rounded-2xl p-5 shadow-md border-2 border-neutral-200 space-y-4">
                    <div className="flex items-center gap-3">
                        <Store size={20} className="text-neutral-600" />
                        <div className="flex-1">
                            <p className="text-sm text-neutral-600">Nome da Banca</p>
                            <p className="font-semibold text-neutral-900">{comerciante?.banca_nome}</p>
                        </div>
                    </div>
                    {comerciante?.galpao && (
                        <>
                            <div className="border-t border-neutral-200"></div>
                            <div className="flex items-center gap-3">
                                <MapPin size={20} className="text-neutral-600" />
                                <div className="flex-1">
                                    <p className="text-sm text-neutral-600">Localização</p>
                                    <p className="font-semibold text-neutral-900">
                                        Galpão {comerciante.galpao}
                                        {comerciante.banca_codigo && ` - Box ${comerciante.banca_codigo}`}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="border-t border-neutral-200"></div>
                    <div className="flex items-center gap-3">
                        <User size={20} className="text-neutral-600" />
                        <div className="flex-1">
                            <p className="text-sm text-neutral-600">Proprietário</p>
                            <p className="font-semibold text-neutral-900">{user?.nome_completo}</p>
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
                        onClick={() => router.push('/comerciante/produtos')}
                        className="w-full bg-neutral-0 rounded-2xl p-5 text-left border-2 border-neutral-200 active:bg-neutral-50 transition-all btn-touch"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-neutral-900">
                                    Gerenciar Produtos
                                </h4>
                                <p className="text-sm text-neutral-600">
                                    {estatisticas.produtosAtivos} produtos ativos
                                </p>
                            </div>
                            <div className="text-2xl text-neutral-400">→</div>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/comerciante/pedidos')}
                        className="w-full bg-neutral-0 rounded-2xl p-5 text-left border-2 border-neutral-200 active:bg-neutral-50 transition-all btn-touch"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-neutral-900">
                                    Novos Pedidos
                                </h4>
                                <p className="text-sm text-neutral-600">
                                    Ver pedidos aguardando
                                </p>
                            </div>
                            <div className="text-2xl text-neutral-400">→</div>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/comerciante/carteira')}
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
                                        R$ {estatisticas.totalVendas.toFixed(2)} em vendas
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
