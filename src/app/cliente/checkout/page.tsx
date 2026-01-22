'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy } from 'lucide-react'
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

export default function CheckoutPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { success, error: showError } = useNotification()
    const [itens, setItens] = useState<ItemCarrinho[]>([])
    const [dadosEntrega, setDadosEntrega] = useState<any>(null)
    const [processando, setProcessando] = useState(false)
    const [pixGerado, setPixGerado] = useState(false)
    const [copiado, setCopiado] = useState(false)

    const pixMockado = "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5925GIRO NO MERCADO6009SAO PAULO62070503***63041D3D"

    useEffect(() => {
        carregarDados()
    }, [])

    const carregarDados = () => {
        const carrinhoSalvo = localStorage.getItem('carrinho')
        const entregaSalva = localStorage.getItem('dadosEntrega')

        if (!carrinhoSalvo || !entregaSalva) {
            showError('Dados incompletos')
            router.push('/cliente/carrinho')
            return
        }

        setItens(JSON.parse(carrinhoSalvo))
        setDadosEntrega(JSON.parse(entregaSalva))
    }

    const calcularSubtotal = () => {
        return itens.reduce((total, item) => total + (item.preco * item.quantidade), 0)
    }

    const taxaEntrega = 5.00
    const valorTotal = calcularSubtotal() + taxaEntrega

    const gerarPix = () => {
        setPixGerado(true)
    }

    const copiarCodigoPix = () => {
        navigator.clipboard.writeText(pixMockado)
        setCopiado(true)
        success('Código PIX copiado!')
        setTimeout(() => setCopiado(false), 2000)
    }

    const confirmarPagamento = async () => {
        if (!user) {
            showError('Usuário não autenticado')
            return
        }

        setProcessando(true)
        try {
            const pedidoData = {
                cliente_id: user.id,
                status: 'aguardando_aprovacao',
                entrada_retirada: dadosEntrega.entrada,
                horario_retirada: dadosEntrega.horario_timestamp || new Date().toISOString(),
                valor_produtos: calcularSubtotal(),
                taxa_entrega: taxaEntrega,
                valor_total: valorTotal,
                metodo_pagamento: 'pix_mockado',
                pago_em: new Date().toISOString()
            }

            console.log('Criando pedido com dados:', pedidoData)

            // Criar pedido
            const { data: pedido, error: erroPedido } = await supabase
                .from('pedidos')
                .insert(pedidoData)
                .select()
                .single()

            if (erroPedido) {
                console.error('Erro detalhado do pedido:', {
                    message: erroPedido.message,
                    details: erroPedido.details,
                    hint: erroPedido.hint,
                    code: erroPedido.code
                })
                throw new Error(erroPedido.message || 'Erro ao criar pedido')
            }

            console.log('Pedido criado com sucesso:', pedido)

            // Criar itens do pedido
            const itensPedido = itens.map(item => ({
                pedido_id: pedido.id,
                produto_id: item.produto_id,
                comerciante_id: item.comerciante_id,
                produto_nome: item.nome,
                quantidade: item.quantidade,
                unidade: item.unidade,
                preco_unitario: item.preco,
                preco_total: item.preco * item.quantidade,
                status: 'pendente'
            }))

            console.log('Criando itens do pedido:', itensPedido)

            const { error: erroItens } = await supabase
                .from('itens_pedido')
                .insert(itensPedido)

            if (erroItens) {
                console.error('Erro detalhado dos itens:', {
                    message: erroItens.message,
                    details: erroItens.details,
                    hint: erroItens.hint,
                    code: erroItens.code
                })
                throw new Error(erroItens.message || 'Erro ao criar itens do pedido')
            }

            console.log('Itens criados com sucesso')

            // Limpar carrinho
            localStorage.removeItem('carrinho')
            localStorage.removeItem('dadosEntrega')

            success('Pedido realizado com sucesso!')
            setTimeout(() => {
                router.push('/cliente/pedidos')
            }, 1500)

        } catch (error: any) {
            console.error('Erro ao criar pedido:', error)
            showError(error?.message || 'Erro ao processar pedido')
        } finally {
            setProcessando(false)
        }
    }

    if (!itens.length || !dadosEntrega) {
        return <div className="text-center py-12">Carregando...</div>
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Título */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                    Finalizar Pagamento
                </h2>
                <p className="text-neutral-600 mt-1">
                    Pague com PIX para confirmar seu pedido
                </p>
            </div>

            {/* Resumo do pedido */}
            <div className="bg-neutral-0 rounded-2xl p-5 shadow-md border-2 border-neutral-200">
                <h3 className="font-bold text-lg text-neutral-900 mb-4">
                    📦 Resumo do Pedido
                </h3>
                <div className="space-y-2">
                    {itens.map((item) => (
                        <div key={item.produto_id} className="flex justify-between text-sm">
                            <span className="text-neutral-700">
                                {item.quantidade}x {item.nome}
                            </span>
                            <span className="font-semibold text-neutral-900">
                                R$ {(item.preco * item.quantidade).toFixed(2)}
                            </span>
                        </div>
                    ))}
                    <div className="border-t-2 border-neutral-200 pt-2 mt-3 space-y-1">
                        <div className="flex justify-between text-sm text-neutral-700">
                            <span>Subtotal</span>
                            <span>R$ {calcularSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-neutral-700">
                            <span>Taxa de entrega</span>
                            <span>R$ {taxaEntrega.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-neutral-900 pt-2">
                            <span>Total</span>
                            <span>R$ {valorTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Informações de retirada */}
            <div className="bg-giro-amarelo/10 rounded-2xl p-5 border-2 border-giro-amarelo/30">
                <h3 className="font-bold text-lg text-neutral-900 mb-3">
                    📍 Informações de Retirada
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-neutral-700">Entrada:</span>
                        <span className="font-semibold text-neutral-900">{dadosEntrega.entrada}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-700">Horário:</span>
                        <span className="font-semibold text-neutral-900">{dadosEntrega.horario}</span>
                    </div>
                </div>
            </div>

            {/* Pagamento PIX */}
            {!pixGerado ? (
                <div className="bg-neutral-0 rounded-2xl p-8 text-center shadow-md border-2 border-neutral-200">
                    <div className="text-6xl mb-4">💳</div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                        Pagar com PIX
                    </h3>
                    <p className="text-neutral-600 mb-6">
                        Valor: <span className="font-bold text-2xl text-giro-verde-escuro">R$ {valorTotal.toFixed(2)}</span>
                    </p>
                    <button
                        onClick={gerarPix}
                        className="bg-giro-verde-escuro text-neutral-0 px-8 py-4 rounded-xl font-bold text-lg btn-touch active:opacity-90 w-full"
                    >
                        Gerar Código PIX
                    </button>
                </div>
            ) : (
                <div className="bg-neutral-0 rounded-2xl p-6 shadow-md border-2 border-giro-verde-escuro">
                    <div className="text-center mb-4">
                        <div className="text-5xl mb-3">✅</div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">
                            Código PIX Gerado!
                        </h3>
                        <p className="text-sm text-neutral-600">
                            Copie o código e cole no app do seu banco
                        </p>
                    </div>

                    {/* QR Code mockado */}
                    <div className="bg-neutral-100 rounded-xl p-6 mb-4">
                        <div className="text-center text-8xl">
                            📱
                        </div>
                        <p className="text-xs text-neutral-500 text-center mt-2">
                            QR Code PIX (mockado para demonstração)
                        </p>
                    </div>

                    {/* Código PIX */}
                    <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                        <p className="text-xs text-neutral-600 mb-2 font-semibold">Código PIX:</p>
                        <div className="bg-neutral-0 border-2 border-neutral-300 rounded-lg p-3 break-all text-xs font-mono text-neutral-700">
                            {pixMockado}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={copiarCodigoPix}
                            className="w-full bg-neutral-900 text-neutral-0 py-4 rounded-xl font-bold flex items-center justify-center gap-2 btn-touch active:opacity-80"
                        >
                            {copiado ? (
                                <>
                                    <Check size={20} />
                                    Copiado!
                                </>
                            ) : (
                                <>
                                    <Copy size={20} />
                                    Copiar Código PIX
                                </>
                            )}
                        </button>

                        <button
                            onClick={confirmarPagamento}
                            disabled={processando}
                            className="w-full bg-giro-verde-escuro text-neutral-0 py-4 rounded-xl font-bold btn-touch active:opacity-90 disabled:opacity-50"
                        >
                            {processando ? 'Processando...' : 'Já Paguei - Confirmar'}
                        </button>

                        <p className="text-xs text-center text-neutral-500">
                            ⚠️ Para demonstração, clique em "Já Paguei" após copiar o código
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
