'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'
import { useAuth } from '@/src/context/AuthContext'
import { useNotification } from '@/src/context/NotificationContext'

interface ItemCarrinho {
    produto_id: string
    nome: string
    preco: number
    quantidade: number
    unidade: string
    comerciante_id: string
    banca_nome: string
}

export default function CarrinhoPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { success, error: showError } = useNotification()
    const [itens, setItens] = useState<ItemCarrinho[]>([])
    const [loading, setLoading] = useState(true)
    const [entrada, setEntrada] = useState('')
    const [horario, setHorario] = useState('')

    useEffect(() => {
        carregarCarrinho()
    }, [])

    const carregarCarrinho = () => {
        const carrinhoSalvo = localStorage.getItem('carrinho')
        if (carrinhoSalvo) {
            setItens(JSON.parse(carrinhoSalvo))
        }
        setLoading(false)
    }

    const salvarCarrinho = (novosItens: ItemCarrinho[]) => {
        localStorage.setItem('carrinho', JSON.stringify(novosItens))
        setItens(novosItens)
    }

    const alterarQuantidade = (produtoId: string, delta: number) => {
        const novosItens = itens.map(item => {
            if (item.produto_id === produtoId) {
                const novaQtd = Math.max(1, item.quantidade + delta)
                return { ...item, quantidade: novaQtd }
            }
            return item
        })
        salvarCarrinho(novosItens)
    }

    const removerItem = (produtoId: string) => {
        const novosItens = itens.filter(item => item.produto_id !== produtoId)
        salvarCarrinho(novosItens)
        success('Item removido do carrinho')
    }

    const calcularSubtotal = () => {
        return itens.reduce((total, item) => total + (item.preco * item.quantidade), 0)
    }

    const taxaEntrega = 5.00

    const finalizarPedido = () => {
        if (!entrada || !horario) {
            showError('Selecione a entrada e horário de retirada')
            return
        }

        // Converter horário para timestamp completo (hoje + horário selecionado)
        const hoje = new Date()
        const [horas, minutos] = horario.split(':')
        hoje.setHours(parseInt(horas), parseInt(minutos), 0, 0)
        
        // Salvar dados de entrega no localStorage
        localStorage.setItem('dadosEntrega', JSON.stringify({ 
            entrada, 
            horario,
            horario_timestamp: hoje.toISOString() 
        }))
        router.push('/cliente/checkout')
    }

    if (loading) {
        return <div className="text-center py-12">Carregando...</div>
    }

    if (itens.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <div className="text-8xl mb-6">🛒</div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                    Seu carrinho está vazio
                </h2>
                <p className="text-neutral-600 mb-8">
                    Adicione produtos para continuar
                </p>
                <button
                    onClick={() => router.push('/cliente')}
                    className="bg-giro-verde-escuro text-neutral-0 px-8 py-4 rounded-xl font-bold btn-touch"
                >
                    Ver Produtos
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-32">
            {/* Título */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                    Meu Carrinho
                </h2>
                <p className="text-neutral-600 mt-1">
                    {itens.length} {itens.length === 1 ? 'item' : 'itens'}
                </p>
            </div>

            {/* Lista de itens */}
            <div className="space-y-3">
                {itens.map((item) => (
                    <div
                        key={item.produto_id}
                        className="bg-neutral-0 rounded-2xl p-4 shadow-md border-2 border-neutral-200"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                <h3 className="font-bold text-neutral-900">
                                    {item.nome}
                                </h3>
                                <p className="text-sm text-neutral-600">
                                    {item.banca_nome}
                                </p>
                                <p className="font-bold text-giro-verde-escuro mt-2">
                                    R$ {item.preco.toFixed(2)} / {item.unidade}
                                </p>
                            </div>
                            <button
                                onClick={() => removerItem(item.produto_id)}
                                className="text-error p-2 btn-touch"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        {/* Controle de quantidade */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => alterarQuantidade(item.produto_id, -1)}
                                    className="bg-neutral-200 text-neutral-900 w-10 h-10 rounded-xl flex items-center justify-center btn-touch active:bg-neutral-300"
                                >
                                    <Minus size={20} />
                                </button>
                                <span className="font-bold text-lg min-w-[40px] text-center">
                                    {item.quantidade}
                                </span>
                                <button
                                    onClick={() => alterarQuantidade(item.produto_id, 1)}
                                    className="bg-giro-verde-escuro text-neutral-0 w-10 h-10 rounded-xl flex items-center justify-center btn-touch active:opacity-80"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-neutral-600">Subtotal</p>
                                <p className="font-bold text-xl text-neutral-900">
                                    R$ {(item.preco * item.quantidade).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Informações de retirada */}
            <div className="bg-giro-amarelo/10 rounded-2xl p-5 border-2 border-giro-amarelo/30">
                <h3 className="font-bold text-neutral-900 mb-4">
                    📍 Informações de Retirada
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Entrada do Mercado
                        </label>
                        <select
                            value={entrada}
                            onChange={(e) => setEntrada(e.target.value)}
                            className="w-full bg-neutral-0 border-2 border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 focus:border-giro-verde-escuro focus:outline-none"
                        >
                            <option value="">Selecione...</option>
                            <option value="Entrada Principal">Entrada Principal</option>
                            <option value="Entrada Lateral">Entrada Lateral</option>
                            <option value="Entrada Fundos">Entrada Fundos</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Horário de Retirada
                        </label>
                        <input
                            type="time"
                            value={horario}
                            onChange={(e) => setHorario(e.target.value)}
                            className="w-full bg-neutral-0 border-2 border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 focus:border-giro-verde-escuro focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Resumo fixo no rodapé */}
            <div className="fixed bottom-20 left-0 right-0 bg-neutral-0 border-t-2 border-neutral-200 p-4 shadow-lg">
                <div className="max-w-2xl mx-auto space-y-3">
                    <div className="flex justify-between text-neutral-700">
                        <span>Subtotal</span>
                        <span className="font-semibold">R$ {calcularSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                        <span>Taxa de entrega</span>
                        <span className="font-semibold">R$ {taxaEntrega.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-neutral-900 pt-3 border-t-2 border-neutral-200">
                        <span>Total</span>
                        <span>R$ {(calcularSubtotal() + taxaEntrega).toFixed(2)}</span>
                    </div>
                    <button
                        onClick={finalizarPedido}
                        className="w-full bg-giro-verde-escuro text-neutral-0 py-4 rounded-xl font-bold text-lg btn-touch active:opacity-90"
                    >
                        Ir para Pagamento
                    </button>
                </div>
            </div>
        </div>
    )
}
