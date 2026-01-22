// src/app/entregador/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Wallet, Star } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'
import { useAuth } from '@/src/context/AuthContext'
import { useNotification } from '@/src/context/NotificationContext'

export default function EntregadorPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { success, error } = useNotification()
    const [disponivel, setDisponivel] = useState(true)
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
            // Buscar dados do entregador
            const { data: entregador } = await supabase
                .from('entregadores')
                .select('*')
                .eq('usuario_id', user?.id)
                .single()

            if (entregador) {
                setDisponivel(entregador.disponivel)
                setStats({
                    entregasHoje: 0, // TODO: calcular entregas de hoje
                    ganhosHoje: 0, // TODO: calcular ganhos de hoje
                    avaliacaoMedia: entregador.avaliacoes_media || 5.0,
                    saldoCarteira: entregador.saldo_carteira || 0
                })
            }
        } catch (err) {
            console.error('Erro ao carregar dados:', err)
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
                <h2 className="text-xl font-bold text-neutral-900 mb-4">
                    {disponivel ? 'Entregas Disponíveis' : 'Você está em pausa'}
                </h2>

                {disponivel ? (
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
                    <div className="bg-neutral-100 rounded-2xl p-8 text-center border-2 border-neutral-200">
                        <div className="text-6xl mb-3">😴</div>
                        <p className="text-neutral-600 text-lg font-semibold">
                            Você está em pausa
                        </p>
                        <p className="text-neutral-500 text-sm mt-2">
                            Ative seu status para receber entregas
                        </p>
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
