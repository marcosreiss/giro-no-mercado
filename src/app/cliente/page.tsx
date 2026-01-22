// src/app/cliente/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/src/lib/supabase'

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
    const router = useRouter()
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [loadingProdutos, setLoadingProdutos] = useState(true)
    const [carrinho, setCarrinho] = useState<Record<string, number>>({})
    const [categoriaAtiva, setCategoriaAtiva] = useState('Todos')

    useEffect(() => {
        carregarProdutos()
    }, [])

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
        const novosItens = { ...carrinho, [produtoId]: (carrinho[produtoId] || 0) + 1 }
        setCarrinho(novosItens)
        salvarCarrinhoCompleto(novosItens)
    }

    const removerDoCarrinho = (produtoId: string) => {
        const novo = { ...carrinho }
        if (novo[produtoId] > 1) {
            novo[produtoId]--
        } else {
            delete novo[produtoId]
        }
        setCarrinho(novo)
        salvarCarrinhoCompleto(novo)
    }

    const salvarCarrinhoCompleto = (carrinhoAtual: Record<string, number>) => {
        const itensCompletos = produtos
            .filter(p => carrinhoAtual[p.id])
            .map(p => ({
                produto_id: p.id,
                nome: p.nome,
                preco: p.preco,
                quantidade: carrinhoAtual[p.id],
                unidade: p.unidade,
                comerciante_id: p.comerciante_id,
                banca_nome: p.comerciantes?.banca_nome || 'Banca'
            }))
        localStorage.setItem('carrinho', JSON.stringify(itensCompletos))
    }

    const calcularTotal = () => {
        return produtos.reduce((total, produto) => {
            const qtd = carrinho[produto.id] || 0
            return total + (produto.preco * qtd)
        }, 0)
    }

    const totalItens = Object.values(carrinho).reduce((sum, qtd) => sum + qtd, 0)

    const produtosFiltrados = categoriaAtiva === 'Todos'
        ? produtos
        : produtos.filter(p => p.categoria.toLowerCase() === categoriaAtiva.toLowerCase())

    return (
        <div className="space-y-6">
            {/* Título */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                    Produtos Frescos
                </h2>
                <p className="text-neutral-600 mt-1">
                    Escolha e reserve para retirar no mercado
                </p>
            </div>

            {/* Filtros de categoria */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['Todos', 'Frutas', 'Legumes', 'Hortaliças'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategoriaAtiva(cat)}
                        className={`px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all btn-touch ${categoriaAtiva === cat
                                ? 'bg-giro-verde-escuro text-neutral-0'
                                : 'bg-neutral-0 border-2 border-neutral-300 text-neutral-700 active:bg-neutral-100'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid de produtos */}
            {loadingProdutos ? (
                <div className="text-center py-12 text-neutral-600">
                    Carregando produtos...
                </div>
            ) : produtosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-neutral-600 text-lg">
                        Nenhum produto disponível
                    </p>
                    <p className="text-neutral-500 text-sm mt-2">
                        {categoriaAtiva !== 'Todos' && 'Tente outra categoria'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {produtosFiltrados.map((produto) => {
                        const qtdCarrinho = carrinho[produto.id] || 0
                        return (
                            <div
                                key={produto.id}
                                className="bg-neutral-0 rounded-2xl shadow-md border border-neutral-200 overflow-hidden"
                            >
                                {/* Imagem */}
                                <div className="h-32 bg-gradient-to-br from-giro-verde-claro/20 to-giro-amarelo/20 relative">
                                    {produto.foto_url ? (
                                        <Image
                                            src={produto.foto_url}
                                            alt={produto.nome}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-5xl">
                                            🥬
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-3">
                                    <h3 className="font-bold text-base text-neutral-900 line-clamp-1">
                                        {produto.nome}
                                    </h3>
                                    <p className="text-xs text-neutral-600 mb-2 line-clamp-1">
                                        {produto.comerciantes?.banca_nome}
                                    </p>
                                    <div className="flex items-baseline gap-1 mb-3">
                                        <span className="text-xl font-bold text-giro-verde-escuro">
                                            R$ {produto.preco.toFixed(2)}
                                        </span>
                                        <span className="text-xs text-neutral-500">/{produto.unidade}</span>
                                    </div>

                                    {/* Controles */}
                                    {qtdCarrinho === 0 ? (
                                        <button
                                            onClick={() => adicionarAoCarrinho(produto.id)}
                                            className="w-full bg-giro-verde-claro active:bg-giro-verde-escuro text-neutral-0 font-bold py-3 rounded-xl transition-colors btn-touch"
                                        >
                                            Adicionar
                                        </button>
                                    ) : (
                                        <div className="flex items-center justify-between gap-2">
                                            <button
                                                onClick={() => removerDoCarrinho(produto.id)}
                                                className="w-10 h-10 bg-error/10 text-error font-bold rounded-xl active:bg-error active:text-neutral-0 transition-colors btn-touch text-xl"
                                            >
                                                −
                                            </button>
                                            <span className="text-lg font-bold text-neutral-900">
                                                {qtdCarrinho}
                                            </span>
                                            <button
                                                onClick={() => adicionarAoCarrinho(produto.id)}
                                                className="w-10 h-10 bg-success/10 text-success font-bold rounded-xl active:bg-success active:text-neutral-0 transition-colors btn-touch text-xl"
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

            {/* Carrinho fixo no rodapé */}
            {totalItens > 0 && (
                <div className="fixed bottom-20 left-0 right-0 bg-neutral-0 border-t-2 border-neutral-200 shadow-2xl p-4 z-40">
                    <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
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
                            className="bg-gradient-secundario active:opacity-80 text-neutral-0 font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-lg btn-touch"
                        >
                            Ver Carrinho →
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
