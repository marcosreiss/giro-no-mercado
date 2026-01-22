/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/cadastro/entregador/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import Image from 'next/image'
import { Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react'
import { useNotification } from '@/src/context/NotificationContext'

interface CadastroFormData {
    nome_completo: string
    username: string
    password: string
    confirmar_password: string
}

export default function CadastroEntregador() {
    const router = useRouter()
    const { success, error } = useNotification()
    const [loading, setLoading] = useState(false)
    const [passo, setPasso] = useState(1)
    const [mostrarSenha, setMostrarSenha] = useState(true)
    const [mostrarConfirmar, setMostrarConfirmar] = useState(true)

    const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm<CadastroFormData>()
    const password = watch('password')

    const proximoPasso = async () => {
        let camposValidar: any = []

        switch (passo) {
            case 1:
                camposValidar = ['nome_completo']
                break
            case 2:
                camposValidar = ['username']
                break
            case 3:
                camposValidar = ['password', 'confirmar_password']
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

    const onSubmit = async (data: CadastroFormData) => {
        setLoading(true)

        try {
            const { data: existente, error: erroConsulta } = await supabase
                .from('usuarios')
                .select('username')
                .eq('username', data.username)

            if (!erroConsulta && existente && existente.length > 0) {
                error('Este nome de usuário já está em uso')
                setLoading(false)
                setPasso(2)
                return
            }

            const password_hash = await bcrypt.hash(data.password, 10)

            const { data: usuario, error: erroUsuario } = await supabase
                .from('usuarios')
                .insert({
                    username: data.username,
                    password_hash,
                    nome_completo: data.nome_completo,
                    tipo_usuario: 'entregador'
                })
                .select()
                .single()

            if (erroUsuario) throw erroUsuario

            const { error: erroEntregador } = await supabase
                .from('entregadores')
                .insert({
                    usuario_id: usuario.id
                })

            if (erroEntregador) throw erroEntregador

            success('Conta criada com sucesso!')
            setTimeout(() => router.push('/login'), 1500)
        } catch (err: any) {
            console.error('Erro ao cadastrar:', err)
            error('Erro ao criar conta. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-giro-azul-medio/10 to-neutral-0 p-4 py-8">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-72 h-28 mx-auto mb-4 relative">
                        <Image
                            src="/LOGO-COM-TEXTO.png"
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                        Cadastro de Entregador
                    </h1>
                    <p className="text-neutral-600">
                        Passo {passo} de 3
                    </p>
                    {/* Barra de progresso */}
                    <div className="w-full bg-neutral-200 h-2 rounded-full mt-4">
                        <div
                            className="bg-giro-azul-medio h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(passo / 3) * 100}%` }}
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-neutral-0 rounded-3xl shadow-xl border border-neutral-200 p-8">
                    {/* Passo 1: Nome Completo */}
                    {passo === 1 && (
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="nome" className="block text-2xl font-bold text-neutral-900 mb-4">
                                    Qual é o seu nome?
                                </label>
                                <input
                                    id="nome"
                                    type="text"
                                    {...register('nome_completo', {
                                        required: 'Por favor, digite seu nome',
                                        minLength: { value: 3, message: 'Nome muito curto' }
                                    })}
                                    className="w-full px-5 py-5 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-azul-medio focus:border-giro-azul-medio text-xl transition-all"
                                    placeholder="Seu nome completo"
                                    autoFocus
                                />
                                {errors.nome_completo && (
                                    <p className="text-error text-base mt-2">{errors.nome_completo.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Passo 2: Nome de Usuário */}
                    {passo === 2 && (
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="username" className="block text-2xl font-bold text-neutral-900 mb-4">
                                    Escolha um nome de usuário
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    {...register('username', {
                                        required: 'Nome de usuário é obrigatório',
                                        minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                                        pattern: { value: /^[a-z0-9]+$/, message: 'Apenas letras minúsculas e números' },
                                        onChange: (e) => e.target.value = e.target.value.toLowerCase().trim()
                                    })}
                                    className="w-full px-5 py-5 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-azul-medio focus:border-giro-azul-medio text-xl transition-all"
                                    placeholder="usuario123"
                                    autoComplete="username"
                                    autoFocus
                                />
                                {errors.username && (
                                    <p className="text-error text-base mt-2">{errors.username.message}</p>
                                )}
                                {!errors.username && (
                                    <p className="text-neutral-500 text-base mt-2">
                                        💡 Use apenas letras e números
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Passo 3: Senhas */}
                    {passo === 3 && (
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="password" className="block text-2xl font-bold text-neutral-900 mb-4">
                                    Crie uma senha segura
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={mostrarSenha ? "text" : "password"}
                                        {...register('password', {
                                            required: 'Senha é obrigatória',
                                            minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                                        })}
                                        className="w-full px-5 py-5 pr-14 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-azul-medio focus:border-giro-azul-medio text-xl transition-all"
                                        placeholder="Mínimo 6 caracteres"
                                        autoComplete="new-password"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarSenha(!mostrarSenha)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 active:text-neutral-900"
                                    >
                                        {mostrarSenha ? <Eye size={28} /> : <EyeOff size={28} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-error text-base mt-2">{errors.password.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmar" className="block text-lg font-semibold text-neutral-700 mb-2">
                                    Digite a senha novamente
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmar"
                                        type={mostrarConfirmar ? "text" : "password"}
                                        {...register('confirmar_password', {
                                            required: 'Confirme sua senha',
                                            validate: (value) => value === password || 'As senhas não coincidem'
                                        })}
                                        className="w-full px-5 py-4 pr-14 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-azul-medio focus:border-giro-azul-medio text-lg transition-all"
                                        placeholder="Digite a senha novamente"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 active:text-neutral-900"
                                    >
                                        {mostrarConfirmar ? <Eye size={24} /> : <EyeOff size={24} />}
                                    </button>
                                </div>
                                {errors.confirmar_password && (
                                    <p className="text-error text-base mt-2">{errors.confirmar_password.message}</p>
                                )}
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

                        {passo < 3 ? (
                            <button
                                type="button"
                                onClick={proximoPasso}
                                className="flex-1 bg-giro-azul-medio active:opacity-80 text-neutral-0 font-bold py-5 px-6 rounded-xl text-lg transition-all shadow-lg btn-touch flex items-center justify-center gap-2"
                            >
                                Continuar
                                <ArrowRight size={20} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-giro-azul-medio active:opacity-80 text-neutral-0 font-bold py-5 px-6 rounded-xl text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg btn-touch"
                            >
                                {loading ? 'Criando conta...' : 'Criar Conta'}
                            </button>
                        )}
                    </div>
                </form>

                <button
                    onClick={() => router.push('/')}
                    className="w-full mt-4 text-neutral-600 active:text-neutral-900 font-medium btn-touch"
                >
                    ← Cancelar cadastro
                </button>
            </div>
        </div>
    )
}
