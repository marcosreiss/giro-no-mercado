// src/app/cadastro/cliente/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { useNotification } from '@/src/context/NotificationContext'

interface CadastroFormData {
    nome_completo: string
    username: string
    password: string
    confirmar_password: string
}

export default function CadastroClientePage() {
    const router = useRouter()
    const { success, error } = useNotification()
    const [loading, setLoading] = useState(false)
    const [mostrarSenha, setMostrarSenha] = useState(true)
    const [mostrarConfirmar, setMostrarConfirmar] = useState(true)

    const { register, handleSubmit, formState: { errors }, watch } = useForm<CadastroFormData>()
    const password = watch('password')

    const onSubmit = async (data: CadastroFormData) => {
        setLoading(true)

        try {
            // Verificar se username já existe
            const { data: existente, error: erroConsulta } = await supabase
                .from('usuarios')
                .select('username')
                .eq('username', data.username)

            if (!erroConsulta && existente && existente.length > 0) {
                error('Este nome de usuário já está em uso')
                setLoading(false)
                return
            }

            const password_hash = await bcrypt.hash(data.password, 10)

            const { error: erroInsert } = await supabase
                .from('usuarios')
                .insert({
                    username: data.username,
                    password_hash,
                    nome_completo: data.nome_completo,
                    tipo_usuario: 'cliente'
                })

            if (erroInsert) throw erroInsert

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
        <div className="min-h-screen bg-gradient-to-b from-giro-verde-claro/10 to-neutral-0 p-4 py-8">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <div className="w-72 h-28 mx-auto mb-4 relative">
                        <Image
                            src="/LOGO-COM-TEXTO.png"
                            alt="Giro no Mercado"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                        Cadastro de Cliente
                    </h1>
                    <p className="text-neutral-600">
                        Preencha seus dados para começar
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-neutral-0 rounded-3xl shadow-xl border border-neutral-200 p-8">
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="nome" className="block text-base font-semibold text-neutral-700 mb-2">
                                Nome Completo
                            </label>
                            <input
                                id="nome"
                                type="text"
                                {...register('nome_completo', {
                                    required: 'Nome completo é obrigatório',
                                    minLength: { value: 3, message: 'Nome deve ter no mínimo 3 caracteres' }
                                })}
                                className="w-full px-5 py-4 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-verde-claro focus:border-giro-verde-claro text-lg transition-all"
                                placeholder="Seu nome completo"
                            />
                            {errors.nome_completo && (
                                <p className="text-error text-sm mt-1">{errors.nome_completo.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-base font-semibold text-neutral-700 mb-2">
                                Nome de Usuário
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
                                className="w-full px-5 py-4 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-verde-claro focus:border-giro-verde-claro text-lg transition-all"
                                placeholder="escolha um nome de usuário"
                                autoComplete="username"
                            />
                            {errors.username && (
                                <p className="text-error text-sm mt-1">{errors.username.message}</p>
                            )}
                            {!errors.username && (
                                <p className="text-sm text-neutral-500 mt-1">
                                    Apenas letras e números, sem espaços
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-base font-semibold text-neutral-700 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={mostrarSenha ? "text" : "password"}
                                    {...register('password', {
                                        required: 'Senha é obrigatória',
                                        minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                                    })}
                                    className="w-full px-5 py-4 pr-14 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-verde-claro focus:border-giro-verde-claro text-lg transition-all"
                                    placeholder="Mínimo 6 caracteres"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarSenha(!mostrarSenha)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 active:text-neutral-900"
                                >
                                    {mostrarSenha ? <Eye size={24} /> : <EyeOff size={24} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-error text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmar" className="block text-base font-semibold text-neutral-700 mb-2">
                                Confirmar Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmar"
                                    type={mostrarConfirmar ? "text" : "password"}
                                    {...register('confirmar_password', {
                                        required: 'Confirme sua senha',
                                        validate: (value) => value === password || 'As senhas não coincidem'
                                    })}
                                    className="w-full px-5 py-4 pr-14 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-verde-claro focus:border-giro-verde-claro text-lg transition-all"
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
                                <p className="text-error text-sm mt-1">{errors.confirmar_password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-secundario active:opacity-80 text-neutral-0 font-bold py-5 px-6 rounded-xl text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg btn-touch mt-6"
                        >
                            {loading ? 'Criando conta...' : 'Criar Conta'}
                        </button>
                    </div>
                </form>

                <button
                    onClick={() => router.push('/')}
                    className="w-full mt-4 text-neutral-600 active:text-neutral-900 font-medium btn-touch"
                >
                    ← Voltar
                </button>
            </div>
        </div>
    )
}
