/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/cadastro/comerciante/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import Image from 'next/image'

export default function CadastroComerciante() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')

    const [formData, setFormData] = useState({
        nome_completo: '',
        username: '',
        password: '',
        confirmar_password: '',
        banca_nome: '',
        galpao: '',
        banca_codigo: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro('')

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
            const { data: existente } = await supabase
                .from('usuarios')
                .select('username')
                .eq('username', formData.username)
                .single()

            if (existente) {
                setErro('Este nome de usuário já está em uso')
                setLoading(false)
                return
            }

            const password_hash = await bcrypt.hash(formData.password, 10)

            // Inserir usuário
            const { data: usuario, error: erroUsuario } = await supabase
                .from('usuarios')
                .insert({
                    username: formData.username,
                    password_hash,
                    nome_completo: formData.nome_completo,
                    tipo_usuario: 'comerciante'
                })
                .select()
                .single()

            if (erroUsuario) throw erroUsuario

            // Inserir dados do comerciante
            const { error: erroComerciante } = await supabase
                .from('comerciantes')
                .insert({
                    usuario_id: usuario.id,
                    banca_nome: formData.banca_nome,
                    galpao: parseInt(formData.galpao),
                    banca_codigo: formData.banca_codigo || null
                })

            if (erroComerciante) throw erroComerciante

            router.push('/login?cadastro=sucesso')
        } catch (error: any) {
            console.error('Erro ao cadastrar:', error)
            setErro('Erro ao criar conta. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-giro-amarelo/10 to-neutral-0 p-4 py-8">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <div className="w-24 h-24 mx-auto mb-4 relative">
                        <Image
                            src="/LOGO-GIRO-NO-MERCADO.png"
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                        Cadastro de Feirante
                    </h1>
                    <p className="text-neutral-600">
                        Cadastre sua banca no mercado
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-neutral-0 rounded-3xl shadow-xl border border-neutral-200 p-8">
                    {erro && (
                        <div className="bg-error/10 border-2 border-error/30 text-error px-4 py-3 rounded-xl mb-6 font-medium">
                            ⚠️ {erro}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label htmlFor="nome" className="block text-base font-semibold text-neutral-700 mb-2">
                                Seu Nome Completo
                            </label>
                            <input
                                id="nome"
                                type="text"
                                required
                                value={formData.nome_completo}
                                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                                className="w-full px-5 py-4 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-amarelo focus:border-giro-amarelo text-lg transition-all"
                                placeholder="Nome do responsável"
                            />
                        </div>

                        <div>
                            <label htmlFor="banca" className="block text-base font-semibold text-neutral-700 mb-2">
                                Nome da Banca
                            </label>
                            <input
                                id="banca"
                                type="text"
                                required
                                value={formData.banca_nome}
                                onChange={(e) => setFormData({ ...formData, banca_nome: e.target.value })}
                                className="w-full px-5 py-4 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-amarelo focus:border-giro-amarelo text-lg transition-all"
                                placeholder="Ex: Banca da Dona Maria"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="galpao" className="block text-base font-semibold text-neutral-700 mb-2">
                                    Galpão
                                </label>
                                <select
                                    id="galpao"
                                    required
                                    value={formData.galpao}
                                    onChange={(e) => setFormData({ ...formData, galpao: e.target.value })}
                                    className="w-full px-5 py-4 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-amarelo focus:border-giro-amarelo text-lg transition-all"
                                >
                                    <option value="">Escolha</option>
                                    <option value="1">Galpão 1</option>
                                    <option value="2">Galpão 2</option>
                                    <option value="3">Galpão 3</option>
                                    <option value="4">Galpão 4</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="codigo" className="block text-base font-semibold text-neutral-700 mb-2">
                                    Código <span className="text-neutral-400">(opcional)</span>
                                </label>
                                <input
                                    id="codigo"
                                    type="text"
                                    value={formData.banca_codigo}
                                    onChange={(e) => setFormData({ ...formData, banca_codigo: e.target.value })}
                                    className="w-full px-5 py-4 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-amarelo focus:border-giro-amarelo text-lg transition-all"
                                    placeholder="Ex: B-15"
                                />
                            </div>
                        </div>

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
                                className="w-full px-5 py-4 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-amarelo focus:border-giro-amarelo text-lg transition-all"
                                placeholder="escolha um nome de usuário"
                                autoComplete="username"
                            />
                        </div>

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
                                className="w-full px-5 py-4 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-amarelo focus:border-giro-amarelo text-lg transition-all"
                                placeholder="Mínimo 6 caracteres"
                                autoComplete="new-password"
                            />
                        </div>

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
                                className="w-full px-5 py-4 border-2 border-neutral-300 rounded-xl focus:ring-2 focus:ring-giro-amarelo focus:border-giro-amarelo text-lg transition-all"
                                placeholder="Digite a senha novamente"
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-giro-amarelo hover:opacity-90 text-neutral-0 font-bold py-5 px-6 rounded-xl text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg btn-touch mt-6"
                        >
                            {loading ? 'Criando conta...' : 'Criar Conta'}
                        </button>
                    </div>
                </form>

                <button
                    onClick={() => router.push('/')}
                    className="w-full mt-4 text-neutral-600 hover:text-neutral-900 font-medium"
                >
                    ← Voltar
                </button>
            </div>
        </div>
    )
}
