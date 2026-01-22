// src/app/entregador/layout.tsx
'use client'

import { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { Package, List, Wallet, LogOut } from 'lucide-react'
import { useAuth } from '@/src/context/AuthContext'
import { useNotification } from '@/src/context/NotificationContext'

export default function EntregadorLayout({ children }: { children: ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const { success } = useNotification()

    const handleLogout = async () => {
        await logout()
        success('Você saiu da sua conta')
        router.push('/login')
    }

    const navItems = [
        { id: 'home', label: 'Início', icon: Package, path: '/entregador' },
        { id: 'entregas', label: 'Entregas', icon: List, path: '/entregador/entregas' },
        { id: 'carteira', label: 'Carteira', icon: Wallet, path: '/entregador/carteira' }
    ]

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            {/* Header */}
            <header className="bg-giro-azul-medio text-neutral-0 shadow-lg fixed top-0 left-0 right-0 z-50">
                <div className="max-w-screen-xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 relative">
                                <Image src="/LOGO-GIRO-NO-MERCADO.png" alt="Logo" fill className="object-contain" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg leading-tight">Giro no Mercado</h1>
                                <p className="text-xs opacity-90">Olá, {user?.nome_completo?.split(' ')[0]}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-neutral-0/20 active:bg-neutral-0/30 p-3 rounded-xl transition-all btn-touch"
                            aria-label="Sair"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Conteúdo */}
            <main className="flex-1 pt-20 pb-24 overflow-y-auto">
                <div className="max-w-screen-xl mx-auto px-4 py-6">
                    {children}
                </div>
            </main>

            {/* Bottom Nav */}
            <nav className="bg-neutral-0 border-t-2 border-neutral-200 shadow-2xl fixed bottom-0 left-0 right-0 z-50">
                <div className="max-w-screen-xl mx-auto px-2">
                    <div className="flex items-center justify-around">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.path

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => router.push(item.path)}
                                    className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 btn-touch ${isActive ? 'text-giro-azul-medio' : 'text-neutral-600 active:text-giro-azul-medio'
                                        }`}
                                >
                                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className={`text-xs ${isActive ? 'font-bold' : 'font-semibold'}`}>
                                        {item.label}
                                    </span>
                                    {isActive && <div className="w-12 h-1 bg-giro-azul-medio rounded-full mt-1" />}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </nav>
        </div>
    )
}
