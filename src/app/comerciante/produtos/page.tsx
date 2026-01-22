/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/comerciante/produtos/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'
import { useNotification } from '@/src/context/NotificationContext'
import { useAuth } from '@/src/context/AuthContext'
import { supabase } from '@/src/lib/supabase'
import Image from 'next/image'

interface Produto {
    id: string
    nome: string
    categoria: string
    preco: number
    unidade: string
    cota_disponivel: number
    foto_url: string | null
    ativo: boolean
    criado_em: string
}

export default function ProdutosPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { success, error } = useNotification()

    const [produtos, setProdutos] = useState<Produto[]>([])
    const [loading, setLoading] = useState(true)
    const [busca, setBusca] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')

    const carregarProdutos = useCallback(async () => {
        setLoading(true)
        try {
            const { data: comerciante } = await supabase
                .from('comerciantes')
                .select('id')
                .eq('usuario_id', user?.id)
                .single()

            if (!comerciante) throw new Error('Comerciante não encontrado')

            const { data, error: erroQuery } = await supabase
                .from('produtos')
                .select('*')
                .eq('comerciante_id', comerciante.id)
                .order('criado_em', { ascending: false })    

            if (erroQuery) throw erroQuery

            setProdutos(data || [])
        } catch (err: any) {
            console.error('Erro ao carregar produtos:', err)
            error('Erro ao carregar produtos')
        } finally {
            setLoading(false)
        }
    }, [user?.id, error])

    useEffect(() => {
        carregarProdutos()
    }, [carregarProdutos])

    const handleToggleStatus = async (produto: Produto) => {
        try {
            const novoStatus = !produto.ativo
            const { error: erroUpdate } = await supabase
                .from('produtos')
                .update({ ativo: novoStatus })
                .eq('id', produto.id)

            if (erroUpdate) throw erroUpdate

            setProdutos(produtos.map(p =>
                p.id === produto.id ? { ...p, ativo: novoStatus } : p
            ))

            success(novoStatus ? 'Produto ativado!' : 'Produto desativado!')
        } catch {
            error('Erro ao alterar status')
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
            return
        }

        try {
            const { error: erroDelete } = await supabase
                .from('produtos')
                .delete()
                .eq('id', id)

            if (erroDelete) throw erroDelete

            setProdutos(produtos.filter(p => p.id !== id))
            success('Produto excluído!')
        } catch {
            error('Erro ao excluir produto')
        }
    }

    // Filtrar produtos
    const produtosFiltrados = produtos.filter(p => {
        const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase())
        const matchCategoria = filtroCategoria === 'todas' || p.categoria === filtroCategoria
        return matchBusca && matchCategoria
    })

    const categoriaEmoji: Record<string, string> = {
        frutas: '🍎',
        legumes: '🥕',
        hortalicas: '🥬'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Meus Produtos</h2>
                    <p className="text-neutral-600 mt-1">
                        {produtos.length} {produtos.length === 1 ? 'produto cadastrado' : 'produtos cadastrados'}
                    </p>
                </div>
                <button
                    onClick={() => router.push('/comerciante/produtos/novo')}
                    className="bg-giro-amarelo active:opacity-80 text-neutral-0 font-bold px-6 py-4 rounded-xl text-base transition-all shadow-lg btn-touch flex items-center gap-2"
                >
                    <Plus size={20} />
                    Adicionar
                </button>
            </div>

            {/* Busca e Filtros */}
            <div className="bg-neutral-0 rounded-2xl shadow-lg border-2 border-neutral-200 p-5 space-y-4">
                {/* Busca */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar produto..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-amarelo focus:border-giro-amarelo transition-all"
                    />
                </div>

                {/* Filtro de Categoria */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFiltroCategoria('todas')}
                        className={`px-5 py-2 rounded-full font-semibold whitespace-nowrap transition-all btn-touch ${filtroCategoria === 'todas'
                            ? 'bg-giro-amarelo text-neutral-0 shadow-md'
                            : 'bg-neutral-100 text-neutral-700 active:bg-neutral-200'
                            }`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFiltroCategoria('frutas')}
                        className={`px-5 py-2 rounded-full font-semibold whitespace-nowrap transition-all btn-touch ${filtroCategoria === 'frutas'
                            ? 'bg-giro-amarelo text-neutral-0 shadow-md'
                            : 'bg-neutral-100 text-neutral-700 active:bg-neutral-200'
                            }`}
                    >
                        🍎 Frutas
                    </button>
                    <button
                        onClick={() => setFiltroCategoria('legumes')}
                        className={`px-5 py-2 rounded-full font-semibold whitespace-nowrap transition-all btn-touch ${filtroCategoria === 'legumes'
                            ? 'bg-giro-amarelo text-neutral-0 shadow-md'
                            : 'bg-neutral-100 text-neutral-700 active:bg-neutral-200'
                            }`}
                    >
                        🥕 Legumes
                    </button>
                    <button
                        onClick={() => setFiltroCategoria('hortalicas')}
                        className={`px-5 py-2 rounded-full font-semibold whitespace-nowrap transition-all btn-touch ${filtroCategoria === 'hortalicas'
                            ? 'bg-giro-amarelo text-neutral-0 shadow-md'
                            : 'bg-neutral-100 text-neutral-700 active:bg-neutral-200'
                            }`}
                    >
                        🥬 Hortaliças
                    </button>
                </div>
            </div>

            {/* Lista de Produtos */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-giro-amarelo border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-neutral-600 mt-4">Carregando produtos...</p>
                </div>
            ) : produtosFiltrados.length === 0 ? (
                <div className="bg-neutral-0 rounded-2xl shadow-lg border-2 border-neutral-200 p-12 text-center">
                    <Package size={64} className="mx-auto text-neutral-300 mb-4" />
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                        {produtos.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}
                    </h3>
                    <p className="text-neutral-600 mb-6">
                        {produtos.length === 0
                            ? 'Comece adicionando seus primeiros produtos'
                            : 'Tente outra busca ou filtro'
                        }
                    </p>
                    {produtos.length === 0 && (
                        <button
                            onClick={() => router.push('/comerciante/produtos/novo')}
                            className="bg-giro-amarelo active:opacity-80 text-neutral-0 font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg btn-touch inline-flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Adicionar Primeiro Produto
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {produtosFiltrados.map(produto => (
                        <div
                            key={produto.id}
                            className={`bg-neutral-0 rounded-2xl shadow-lg border-2 overflow-hidden transition-all ${produto.ativo ? 'border-neutral-200' : 'border-neutral-300 opacity-60'
                                }`}
                        >
                            {/* Imagem */}
                            <div className="relative h-48 bg-gradient-to-br from-giro-amarelo/10 to-neutral-100">
                                {produto.foto_url ? (
                                    <Image
                                        src={produto.foto_url}
                                        alt={produto.nome}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-6xl">
                                            {categoriaEmoji[produto.categoria] || '📦'}
                                        </span>
                                    </div>
                                )}
                                {!produto.ativo && (
                                    <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center">
                                        <span className="bg-neutral-0 px-4 py-2 rounded-full font-bold text-neutral-900">
                                            Desativado
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Conteúdo */}
                            <div className="p-5 space-y-4">
                                {/* Nome e Categoria */}
                                <div>
                                    <h3 className="text-xl font-bold text-neutral-900 mb-1">
                                        {produto.nome}
                                    </h3>
                                    <span className="inline-block bg-neutral-100 px-3 py-1 rounded-full text-sm font-semibold text-neutral-700">
                                        {categoriaEmoji[produto.categoria]} {produto.categoria}
                                    </span>
                                </div>

                                {/* Preço e Estoque */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-3xl font-bold text-giro-verde-escuro">
                                            R$ {produto.preco.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-neutral-600">
                                            por {produto.unidade}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-2xl font-bold ${produto.cota_disponivel > 10
                                            ? 'text-success'
                                            : produto.cota_disponivel > 0
                                                ? 'text-warning'
                                                : 'text-error'
                                            }`}>
                                            {produto.cota_disponivel}
                                        </p>
                                        <p className="text-sm text-neutral-600">
                                            disponível
                                        </p>
                                    </div>
                                </div>

                                {/* Ações */}
                                <div className="flex gap-2 pt-2 border-t-2 border-neutral-100">
                                    <button
                                        onClick={() => handleToggleStatus(produto)}
                                        className={`flex-1 font-bold py-3 px-4 rounded-xl transition-all btn-touch ${produto.ativo
                                            ? 'bg-neutral-100 text-neutral-700 active:bg-neutral-200'
                                            : 'bg-success/10 text-success active:bg-success/20'
                                            }`}
                                    >
                                        {produto.ativo ? 'Desativar' : 'Ativar'}
                                    </button>
                                    <button
                                        onClick={() => router.push(`/comerciante/produtos/${produto.id}/editar`)}
                                        className="bg-giro-azul-medio/10 text-giro-azul-medio active:bg-giro-azul-medio/20 font-bold p-3 rounded-xl transition-all btn-touch"
                                    >
                                        <Edit size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(produto.id)}
                                        className="bg-error/10 text-error active:bg-error/20 font-bold p-3 rounded-xl transition-all btn-touch"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
