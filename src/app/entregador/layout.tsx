// src/app/entregador/layout.tsx
'use client'

import { ReactNode, useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { Package, List, User, LogOut, Wallet } from 'lucide-react'
import { useAuth } from '@/src/context/AuthContext'
import { useNotification } from '@/src/context/NotificationContext'
import { supabase } from '@/src/lib/supabase'

export default function EntregadorLayout({ children }: { children: ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const { success } = useNotification()
    const [saldoCarteira, setSaldoCarteira] = useState<number>(0)
    const [loadingSaldo, setLoadingSaldo] = useState(true)

    // Função para buscar saldo da carteira
    const buscarSaldo = useCallback(async () => {
        if (!user?.id) return

        try {
            // Buscar entregador
            const { data: entregador, error: erroEntregador } = await supabase
                .from('entregadores')
                .select('saldo_carteira')
                .eq('usuario_id', user.id)
                .single()

            if (erroEntregador || !entregador) {
                console.error('Erro ao buscar entregador:', erroEntregador)
                return
            }

            setSaldoCarteira(entregador.saldo_carteira || 0)
        } catch (error) {
            console.error('Erro ao calcular saldo:', error)
        } finally {
            setLoadingSaldo(false)
        }
    }, [user?.id])

    useEffect(() => {
        buscarSaldo()

        // Atualizar saldo a cada 30 segundos
        const interval = setInterval(buscarSaldo, 30000)
        return () => clearInterval(interval)
    }, [buscarSaldo])

    const handleLogout = async () => {
        await logout()
        success('Você saiu da sua conta')
        router.push('/login')
    }

    const navItems = [
        { id: 'home', label: 'Início', icon: Package, path: '/entregador' },
        { id: 'entregas', label: 'Entregas', icon: List, path: '/entregador/entregas' },
        { id: 'perfil', label: 'Perfil', icon: User, path: '/entregador/perfil' }
    ]

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            {/* Header */}
            <header className="bg-giro-azul-medio text-neutral-0 shadow-lg fixed top-0 left-0 right-0 z-50">
                <div className="max-w-screen-xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                        {/* Logo e nome */}
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0">
                                <Image
                                    src="/LOGO-GIRO-NO-MERCADO.png"
                                    alt="Logo"
                                    fill
                                    sizes="40px"
                                    className="object-contain"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1
                                    className="font-bold leading-tight truncate"
                                    style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1.125rem)' }}
                                >
                                    Giro no Mercado
                                </h1>
                                <p
                                    className="opacity-90 truncate"
                                    style={{ fontSize: 'clamp(0.625rem, 1.5vw + 0.125rem, 0.75rem)' }}
                                >
                                    Olá, {user?.nome_completo?.split(' ')[0]}
                                </p>
                            </div>
                        </div>

                        {/* Saldo da carteira */}
                        <button
                            onClick={() => router.push('/entregador/carteira')}
                            className="bg-neutral-0/90 text-giro-azul-medio active:bg-neutral-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all btn-touch shadow-md flex-shrink-0"
                            aria-label="Ver carteira"
                        >
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Wallet
                                    className="flex-shrink-0"
                                    style={{
                                        width: 'clamp(1rem, 3vw, 1.25rem)',
                                        height: 'clamp(1rem, 3vw, 1.25rem)'
                                    }}
                                />
                                <div className="text-left">
                                    <p
                                        className="font-bold leading-none whitespace-nowrap"
                                        style={{ fontSize: 'clamp(0.875rem, 2.5vw + 0.25rem, 1.125rem)' }}
                                    >
                                        {loadingSaldo ? '...' : `R$ ${saldoCarteira.toFixed(2)}`}
                                    </p>
                                    <p
                                        className="text-giro-azul-medio/70 leading-none mt-0.5 whitespace-nowrap hidden sm:block"
                                        style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.6875rem)' }}
                                    >
                                        Carteira
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Botão sair */}
                        <button
                            onClick={handleLogout}
                            className="bg-neutral-0/20 active:bg-neutral-0/30 p-2 sm:p-3 rounded-xl transition-all btn-touch flex-shrink-0"
                            aria-label="Sair"
                        >
                            <LogOut
                                className="flex-shrink-0"
                                style={{
                                    width: 'clamp(1.125rem, 3vw, 1.25rem)',
                                    height: 'clamp(1.125rem, 3vw, 1.25rem)'
                                }}
                            />
                        </button>
                    </div>
                </div>
            </header>

            {/* Conteúdo */}
            <main className="flex-1 pt-16 sm:pt-20 pb-24 overflow-y-auto">
                <div className="max-w-screen-xl mx-auto px-4 py-6">
                    {children}
                </div>
            </main>

            {/* Bottom Nav */}
            <nav className="bg-neutral-0 border-t-2 border-neutral-200 shadow-2xl fixed bottom-0 left-0 right-0 z-50">
                <div className="max-w-screen-xl mx-auto px-1 sm:px-2">
                    <div className="flex items-center justify-around">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.path

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => router.push(item.path)}
                                    className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 sm:px-2 btn-touch transition-all ${isActive
                                            ? 'text-giro-azul-medio'
                                            : 'text-neutral-600 active:text-giro-azul-medio'
                                        }`}
                                    style={{ minWidth: 'clamp(4.5rem, 25vw, 6rem)' }}
                                >
                                    <Icon
                                        size={24}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className="flex-shrink-0"
                                    />
                                    <span
                                        className={`text-xs leading-tight text-center ${isActive ? 'font-bold' : 'font-semibold'
                                            }`}
                                        style={{ fontSize: 'clamp(0.625rem, 2vw, 0.75rem)' }}
                                    >
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <div className="w-8 sm:w-12 h-1 bg-giro-azul-medio rounded-full mt-0.5" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </nav>
        </div>
    )
}
