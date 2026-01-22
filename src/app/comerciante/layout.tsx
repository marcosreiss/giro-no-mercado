// src/app/comerciante/layout.tsx
'use client'

import { ReactNode, useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { Package, ShoppingBag, User, LogOut, ClipboardList, Wallet } from 'lucide-react'
import { useAuth } from '@/src/context/AuthContext'
import { useNotification } from '@/src/context/NotificationContext'
import { supabase } from '@/src/lib/supabase'

export default function ComercianteLayout({ children }: { children: ReactNode }) {
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
            // Buscar comerciante
            const { data: comerciante, error: erroComerciante } = await supabase
                .from('comerciantes')
                .select('id')
                .eq('usuario_id', user.id)
                .single()

            if (erroComerciante || !comerciante) {
                console.error('Erro ao buscar comerciante:', erroComerciante)
                return
            }

            // Buscar vendas aprovadas
            const { data: itens, error: erroVendas } = await supabase
                .from('itens_pedido')
                .select('preco_total')
                .eq('comerciante_id', comerciante.id)
                .eq('status', 'aprovado')

            if (erroVendas) {
                console.error('Erro ao buscar vendas:', erroVendas)
                return
            }

            const total = itens?.reduce((sum, item) => sum + item.preco_total, 0) || 0
            setSaldoCarteira(total)
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
        { id: 'home', label: 'Início', icon: ShoppingBag, path: '/comerciante' },
        { id: 'pedidos', label: 'Pedidos', icon: ClipboardList, path: '/comerciante/pedidos' },
        { id: 'produtos', label: 'Produtos', icon: Package, path: '/comerciante/produtos' },
        { id: 'perfil', label: 'Perfil', icon: User, path: '/comerciante/perfil' }
    ]

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            {/* Header */}
            <header className="bg-giro-amarelo text-neutral-900 shadow-lg fixed top-0 left-0 right-0 z-50">
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
                                    className="opacity-80 truncate"
                                    style={{ fontSize: 'clamp(0.625rem, 1.5vw + 0.125rem, 0.75rem)' }}
                                >
                                    Olá, {user?.nome_completo?.split(' ')[0]}
                                </p>
                            </div>
                        </div>

                        {/* Saldo da carteira */}
                        <button
                            onClick={() => router.push('/comerciante/carteira')}
                            className="bg-neutral-900/90 text-neutral-0 active:bg-neutral-900 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all btn-touch shadow-md flex-shrink-0"
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
                                        className="text-neutral-0/70 leading-none mt-0.5 whitespace-nowrap hidden sm:block"
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
                            className="bg-neutral-900/10 active:bg-neutral-900/20 p-2 sm:p-3 rounded-xl transition-all btn-touch flex-shrink-0"
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
                                            ? 'text-giro-amarelo'
                                            : 'text-neutral-600 active:text-giro-amarelo'
                                        }`}
                                    style={{ minWidth: 'clamp(4rem, 20vw, 5.5rem)' }}
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
                                        <div className="w-8 sm:w-12 h-1 bg-giro-amarelo rounded-full mt-0.5" />
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
