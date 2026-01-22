// src/app/cliente/page.tsx
'use client'

import { useAuth } from '@/src/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

interface Produto {
    id: string
    nome: string
    categoria: string
    unidade: string
    preco: number
    foto_url: string | null
    cota_disponivel: number
    comerciante_id: string
    comerciantes: {
        banca_nome: string
    }
}

export default function ClientePage() {
    const { user, loading, logout } = useAuth()
    const router = useRouter()
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [loadingProdutos, setLoadingProdutos] = useState(true)
    const [carrinho, setCarrinho] = useState<Record<string, number>>({})

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        } else if (!loading && user && user.tipo_usuario !== 'cliente') {
            router.push('/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (user) {
            carregarProdutos()
        }
    }, [user])

    const carregarProdutos = async () => {
        try {
            const { data, error } = await supabase
                .from('produtos')
                .select(`
          *,
          comerciantes (
            banca_nome
          )
        `)
                .eq('ativo', true)
                .order('nome')

            if (error) throw error
            setProdutos(data || [])
        } catch (error) {
            console.error('Erro ao carregar produtos:', error)
        } finally {
            setLoadingProdutos(false)
        }
    }

    const adicionarAoCarrinho = (produtoId: string) => {
        setCarrinho(prev => ({
            ...prev,
            [produtoId]: (prev[produtoId] || 0) + 1
        }))
    }

    const removerDoCarrinho = (produtoId: string) => {
        setCarrinho(prev => {
            const novo = { ...prev }
            if (novo[produtoId] > 1) {
                novo[produtoId]--
            } else {
                delete novo[produtoId]
            }
            return novo
        })
    }

    const calcularTotal = () => {
        return produtos.reduce((total, produto) => {
            const qtd = carrinho[produto.id] || 0
            return total + (produto.preco * qtd)
        }, 0)
    }

    const totalItens = Object.values(carrinho).reduce((sum, qtd) => sum + qtd, 0)

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="text-xl text-neutral-600">Carregando...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header fixo */}
            <header className="bg-gradient-secundario text-neutral-0 p-4 shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 relative">
                            <Image
                                src="/LOGO-GIRO-NO-MERCADO.png"
                                alt="Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Giro no Mercado</h1>
                            <p className="text-sm opacity-90">Olá, {user.nome_completo}!</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="bg-neutral-0 text-giro-verde-escuro px-5 py-2 rounded-lg font-semibold hover:bg-neutral-100 transition-colors btn-touch"
                    >
                        Sair
                    </button>
                </div>
            </header>

            {/* Categorias */}
            <div className="bg-neutral-0 border-b border-neutral-200 sticky top-[72px] z-40">
                <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto">
                    <div className="flex gap-3">
                        {['Todos', 'Frutas', 'Legumes', 'Hortaliças'].map((cat) => (
                            <button
                                key={cat}
                                className="px-5 py-2 rounded-full bg-giro-verde-claro/10 text-giro-verde-escuro font-semibold hover:bg-giro-verde-claro hover:text-neutral-0 transition-all whitespace-nowrap"
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Conteúdo principal */}
            <main className="max-w-7xl mx-auto p-4 pb-32">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6 mt-4">Produtos Disponíveis</h2>

                {loadingProdutos ? (
                    <div className="text-center py-12 text-neutral-500">
                        Carregando produtos...
                    </div>
                ) : produtos.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                        Nenhum produto disponível no momento
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {produtos.map((produto) => {
                            const qtdCarrinho = carrinho[produto.id] || 0
                            return (
                                <div
                                    key={produto.id}
                                    className="bg-neutral-0 rounded-2xl shadow-md border border-neutral-200 overflow-hidden hover:shadow-xl transition-shadow"
                                >
                                    {/* Imagem do produto */}
                                    <div className="h-48 bg-gradient-to-br from-giro-verde-claro/20 to-giro-amarelo/20 relative">
                                        {produto.foto_url ? (
                                            <Image
                                                src={produto.foto_url}
                                                alt={produto.nome}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-6xl">
                                                🥬
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg text-neutral-900">{produto.nome}</h3>
                                        <p className="text-sm text-neutral-600 mb-2">
                                            {produto.comerciantes?.banca_nome || 'Banca'}
                                        </p>
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className="text-2xl font-bold text-giro-verde-escuro">
                                                R$ {produto.preco.toFixed(2)}
                                            </span>
                                            <span className="text-neutral-500">/ {produto.unidade}</span>
                                        </div>

                                        {/* Controles */}
                                        {qtdCarrinho === 0 ? (
                                            <button
                                                onClick={() => adicionarAoCarrinho(produto.id)}
                                                className="w-full bg-giro-verde-claro hover:bg-giro-verde-escuro text-neutral-0 font-bold py-3 rounded-xl transition-colors btn-touch"
                                            >
                                                Adicionar
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-between gap-3">
                                                <button
                                                    onClick={() => removerDoCarrinho(produto.id)}
                                                    className="w-12 h-12 bg-error/10 text-error font-bold rounded-xl hover:bg-error hover:text-neutral-0 transition-colors"
                                                >
                                                    −
                                                </button>
                                                <span className="text-xl font-bold text-neutral-900">{qtdCarrinho}</span>
                                                <button
                                                    onClick={() => adicionarAoCarrinho(produto.id)}
                                                    className="w-12 h-12 bg-success/10 text-success font-bold rounded-xl hover:bg-success hover:text-neutral-0 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* Carrinho fixo no rodapé */}
            {totalItens > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-neutral-0 border-t-2 border-neutral-200 shadow-2xl p-4 z-50">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-neutral-600">
                                {totalItens} {totalItens === 1 ? 'item' : 'itens'}
                            </p>
                            <p className="text-2xl font-bold text-giro-verde-escuro">
                                R$ {calcularTotal().toFixed(2)}
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/cliente/carrinho')}
                            className="bg-gradient-secundario hover:opacity-90 text-neutral-0 font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-lg btn-touch"
                        >
                            Ver Carrinho →
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
