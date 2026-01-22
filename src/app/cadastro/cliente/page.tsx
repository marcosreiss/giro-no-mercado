// src/app/cadastro/cliente/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import Image from 'next/image'

export default function CadastroClientePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')

    const [formData, setFormData] = useState({
        nome_completo: '',
        username: '',
        password: '',
        confirmar_password: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro('')

        // Validações
        if (formData.password !== formData.confirmar_password) {
            setErro('As senhas não coincidem')
            return
        }

        if (formData.password.length < 6) {
            setErro('A senha deve ter no mínimo 6 caracteres')
            return
        }

        setLoading(true)

        try {
            // Verificar se username já existe - CORRIGIDO
            const { data: existente, error: erroConsulta } = await supabase
                .from('usuarios')
                .select('username')
                .eq('username', formData.username)

            // Se retornou dados, username já existe
            if (!erroConsulta && existente && existente.length > 0) {
                setErro('Este nome de usuário já está em uso')
                setLoading(false)
                return
            }

            // Gerar hash da senha
            const password_hash = await bcrypt.hash(formData.password, 10)

            // Inserir usuário
            const { error } = await supabase
                .from('usuarios')
                .insert({
                    username: formData.username,
                    password_hash,
                    nome_completo: formData.nome_completo,
                    tipo_usuario: 'cliente'
                })

            if (error) throw error

            // Redirecionar para login
            router.push('/login?cadastro=sucesso')
        } catch (error: any) {
            console.error('Erro ao cadastrar:', error)
            setErro('Erro ao criar conta. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-giro-verde-claro/10 to-neutral-0 p-4 py-8">
            <div className="max-w-md mx-auto">
                {/* Header */}
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

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="bg-neutral-0 rounded-3xl shadow-xl border border-neutral-200 p-8">
                    {erro && (
                        <div className="bg-error/10 border-2 border-error/30 text-error px-4 py-3 rounded-xl mb-6 font-medium">
                            ⚠️ {erro}
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Nome completo */}
                        <div>
                            <label htmlFor="nome" className="block text-base font-semibold text-neutral-700 mb-2">
                                Nome Completo
                            </label>
                            <input
                                id="nome"
                                type="text"
                                required
                                value={formData.nome_completo}
                                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                                className="w-full px-5 py-4 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-verde-claro focus:border-giro-verde-claro text-lg transition-all"
                                placeholder="Seu nome completo"
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-base font-semibold text-neutral-700 mb-2">
                                Nome de Usuário
                            </label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })}
                                className="w-full px-5 py-4 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-verde-claro focus:border-giro-verde-claro text-lg transition-all"
                                placeholder="escolha um nome de usuário"
                                autoComplete="username"
                            />
                            <p className="text-sm text-neutral-500 mt-1">
                                Apenas letras e números, sem espaços
                            </p>
                        </div>

                        {/* Senha */}
                        <div>
                            <label htmlFor="password" className="block text-base font-semibold text-neutral-700 mb-2">
                                Senha
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-5 py-4 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-verde-claro focus:border-giro-verde-claro text-lg transition-all"
                                placeholder="Mínimo 6 caracteres"
                                autoComplete="new-password"
                            />
                        </div>

                        {/* Confirmar senha */}
                        <div>
                            <label htmlFor="confirmar" className="block text-base font-semibold text-neutral-700 mb-2">
                                Confirmar Senha
                            </label>
                            <input
                                id="confirmar"
                                type="password"
                                required
                                value={formData.confirmar_password}
                                onChange={(e) => setFormData({ ...formData, confirmar_password: e.target.value })}
                                className="w-full px-5 py-4 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-verde-claro focus:border-giro-verde-claro text-lg transition-all"
                                placeholder="Digite a senha novamente"
                                autoComplete="new-password"
                            />
                        </div>

                        {/* Botão */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-secundario active:opacity-80 text-neutral-0 font-bold py-5 px-6 rounded-xl text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg btn-touch mt-6"
                        >
                            {loading ? 'Criando conta...' : 'Criar Conta'}
                        </button>
                    </div>
                </form>

                {/* Voltar */}
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
