/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/comerciante/produtos/novo/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { ArrowLeft, ArrowRight, Camera } from 'lucide-react'
import { useNotification } from '@/src/context/NotificationContext'
import { useAuth } from '@/src/context/AuthContext'
import { uploadImage } from '@/src/lib/storage'
import { supabase } from '@/src/lib/supabase'

interface ProdutoFormData {
    nome: string
    categoria: string
    preco: string
    unidade: string
    cota_disponivel: string
    foto_url: string
}

export default function NovoProdutoPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { success, error } = useNotification()
    const [loading, setLoading] = useState(false)
    const [passo, setPasso] = useState(1)
    const [fotoPreview, setFotoPreview] = useState<string | null>(null)
    const [fotoPath, setFotoPath] = useState<string>('')
    const [uploadingFoto, setUploadingFoto] = useState(false)

    const { register, handleSubmit, formState: { errors }, watch, trigger, setValue } = useForm<ProdutoFormData>()

    const proximoPasso = async () => {
        let camposValidar: any = []

        switch (passo) {
            case 1:
                camposValidar = ['nome']
                break
            case 2:
                camposValidar = ['categoria']
                break
            case 3:
                camposValidar = ['preco', 'unidade']
                break
            case 4:
                camposValidar = ['cota_disponivel']
                break
        }

        const isValid = await trigger(camposValidar)
        if (isValid) {
            setPasso(passo + 1)
        }
    }

    const passoAnterior = () => {
        setPasso(passo - 1)
    }

    const handleFotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            error('Foto muito grande. Máximo 5MB')
            return
        }

        // Preview local
        const reader = new FileReader()
        reader.onloadend = () => {
            setFotoPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload
        setUploadingFoto(true)
        try {
            const result = await uploadImage(file, 'produtos', user?.id)
            setFotoPath(result.path)
            setValue('foto_url', result.url)
            success('Foto enviada!')
        } catch (err: any) {
            error(err.message || 'Erro ao enviar foto')
            setFotoPreview(null)
        } finally {
            setUploadingFoto(false)
        }
    }

    const onSubmit = async (data: ProdutoFormData) => {
        setLoading(true)

        try {
            // Buscar comerciante_id
            const { data: comerciante } = await supabase
                .from('comerciantes')
                .select('id')
                .eq('usuario_id', user?.id)
                .single()

            if (!comerciante) {
                throw new Error('Comerciante não encontrado')
            }

            // Inserir produto
            const { error: erroInsert } = await supabase
                .from('produtos')
                .insert({
                    comerciante_id: comerciante.id,
                    nome: data.nome,
                    categoria: data.categoria,
                    preco: parseFloat(data.preco),
                    unidade: data.unidade,
                    cota_disponivel: parseInt(data.cota_disponivel),
                    foto_url: data.foto_url || null,
                    ativo: true
                })

            if (erroInsert) throw erroInsert

            success('Produto cadastrado com sucesso!')
            setTimeout(() => router.push('/comerciante/produtos'), 1500)
        } catch (err: any) {
            console.error('Erro ao cadastrar produto:', err)
            error('Erro ao cadastrar produto. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                    Cadastrar Produto
                </h2>
                <p className="text-neutral-600 mt-1">
                    Passo {passo} de 5
                </p>
                {/* Barra de progresso */}
                <div className="w-full bg-neutral-200 h-2 rounded-full mt-4">
                    <div
                        className="bg-giro-amarelo h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(passo / 5) * 100}%` }}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-neutral-0 rounded-2xl shadow-lg border-2 border-neutral-200 p-6">
                {/* Passo 1: Nome do Produto */}
                {passo === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="nome" className="block text-2xl font-bold text-neutral-900 mb-2">
                                Qual o nome do produto?
                            </label>
                            <p className="text-sm text-neutral-600 mb-4">
                                💡 Seja claro e simples. Exemplo: &quot;Tomate&quot;, &quot;Alface Crespa&quot;
                            </p>
                            <input
                                id="nome"
                                type="text"
                                {...register('nome', {
                                    required: 'Por favor, digite o nome do produto',
                                    minLength: { value: 2, message: 'Nome muito curto' }
                                })}
                                className="w-full px-5 py-5 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-amarelo focus:border-giro-amarelo text-xl transition-all"
                                placeholder="Ex: Banana Prata"
                                autoFocus
                            />
                            {errors.nome && (
                                <p className="text-error text-base mt-2">{errors.nome.message}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Passo 2: Categoria */}
                {passo === 2 && (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="categoria" className="block text-2xl font-bold text-neutral-900 mb-2">
                                Qual é a categoria?
                            </label>
                            <p className="text-sm text-neutral-600 mb-4">
                                💡 Escolha o tipo que melhor descreve seu produto
                            </p>
                            <select
                                id="categoria"
                                {...register('categoria', { required: 'Escolha uma categoria' })}
                                className="w-full px-5 py-5 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-amarelo focus:border-giro-amarelo text-xl transition-all"
                                autoFocus
                            >
                                <option value="">Escolha a categoria</option>
                                <option value="frutas">🍎 Frutas</option>
                                <option value="legumes">🥕 Legumes</option>
                                <option value="hortalicas">🥬 Hortaliças</option>
                            </select>
                            {errors.categoria && (
                                <p className="text-error text-base mt-2">{errors.categoria.message}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Passo 3: Preço e Unidade */}
                {passo === 3 && (
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="preco" className="block text-2xl font-bold text-neutral-900 mb-2">
                                Qual é o preço?
                            </label>
                            <p className="text-sm text-neutral-600 mb-4">
                                💡 Digite apenas números. Exemplo: 5.50 ou 10
                            </p>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-neutral-600">
                                    R$
                                </span>
                                <input
                                    id="preco"
                                    type="number"
                                    step="0.01"
                                    {...register('preco', {
                                        required: 'Digite o preço',
                                        min: { value: 0.01, message: 'Preço deve ser maior que zero' }
                                    })}
                                    className="w-full pl-16 pr-5 py-5 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-amarelo focus:border-giro-amarelo text-xl transition-all"
                                    placeholder="0,00"
                                    autoFocus
                                />
                            </div>
                            {errors.preco && (
                                <p className="text-error text-base mt-2">{errors.preco.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="unidade" className="block text-lg font-semibold text-neutral-700 mb-2">
                                Como você vende?
                            </label>
                            <select
                                id="unidade"
                                {...register('unidade', { required: 'Escolha como vende' })}
                                className="w-full px-5 py-4 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-amarelo focus:border-giro-amarelo text-lg transition-all"
                            >
                                <option value="">Selecione</option>
                                <option value="kg">Por quilo (kg)</option>
                                <option value="unidade">Por unidade</option>
                                <option value="maço">Por maço</option>
                            </select>
                            {errors.unidade && (
                                <p className="text-error text-base mt-2">{errors.unidade.message}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Passo 4: Quantidade Disponível */}
                {passo === 4 && (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="cota" className="block text-2xl font-bold text-neutral-900 mb-2">
                                Quanto você tem disponível?
                            </label>
                            <p className="text-sm text-neutral-600 mb-4">
                                💡 Quantidade que você pode vender hoje
                            </p>
                            <input
                                id="cota"
                                type="number"
                                {...register('cota_disponivel', {
                                    required: 'Digite a quantidade',
                                    min: { value: 1, message: 'Deve ter pelo menos 1' }
                                })}
                                className="w-full px-5 py-5 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-amarelo focus:border-giro-amarelo text-xl transition-all"
                                placeholder="Ex: 50"
                                autoFocus
                            />
                            {errors.cota_disponivel && (
                                <p className="text-error text-base mt-2">{errors.cota_disponivel.message}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Passo 5: Foto */}
                {passo === 5 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-2xl font-bold text-neutral-900 mb-2">
                                Adicionar uma foto
                            </label>
                            <p className="text-sm text-neutral-600 mb-4">
                                💡 Você pode escolher da galeria ou tirar agora mesmo. A foto ajuda o cliente a ver o produto!
                            </p>

                            {/* Preview ou botão de upload */}
                            {fotoPreview ? (
                                <div className="relative w-full h-64 bg-neutral-100 rounded-xl overflow-hidden border-2 border-giro-amarelo">
                                    <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    {!uploadingFoto && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFotoPreview(null)
                                                setFotoPath('')
                                                setValue('foto_url', '')
                                            }}
                                            className="absolute top-3 right-3 bg-error text-neutral-0 rounded-full p-3 shadow-lg active:opacity-80 btn-touch"
                                        >
                                            ✕
                                        </button>
                                    )}
                                    {uploadingFoto && (
                                        <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center">
                                            <p className="text-neutral-0 text-lg font-bold">Enviando...</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <label className="block w-full h-64 bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center gap-3 active:bg-neutral-200 transition-all cursor-pointer btn-touch">
                                    <Camera size={56} className="text-neutral-400" />
                                    <p className="text-neutral-600 font-semibold text-lg">Escolher Foto</p>
                                    <p className="text-sm text-neutral-500">JPG, PNG ou WebP (máx. 5MB)</p>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={handleFotoSelect}
                                        className="hidden"
                                    />
                                </label>
                            )}

                            <p className="text-sm text-neutral-500 mt-3 text-center">
                                Foto é opcional, mas ajuda bastante nas vendas!
                            </p>
                        </div>
                    </div>
                )}

                {/* Botões de navegação */}
                <div className="flex gap-3 mt-8">
                    {passo > 1 && (
                        <button
                            type="button"
                            onClick={passoAnterior}
                            className="flex-1 bg-neutral-200 active:opacity-80 text-neutral-900 font-bold py-5 px-6 rounded-xl text-lg transition-all btn-touch flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={20} />
                            Voltar
                        </button>
                    )}

                    {passo < 5 ? (
                        <button
                            type="button"
                            onClick={proximoPasso}
                            className="flex-1 bg-giro-amarelo active:opacity-80 text-neutral-0 font-bold py-5 px-6 rounded-xl text-lg transition-all shadow-lg btn-touch flex items-center justify-center gap-2"
                        >
                            Continuar
                            <ArrowRight size={20} />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading || uploadingFoto}
                            className="flex-1 bg-giro-amarelo active:opacity-80 text-neutral-0 font-bold py-5 px-6 rounded-xl text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg btn-touch"
                        >
                            {loading ? 'Cadastrando...' : 'Cadastrar Produto'}
                        </button>
                    )}
                </div>
            </form>

            {/* Cancelar */}
            <button
                onClick={() => router.push('/comerciante/produtos')}
                className="w-full text-neutral-600 active:text-neutral-900 font-bold text-lg btn-touch py-4"
            >
                ← Cancelar
            </button>
        </div>
    )
}
