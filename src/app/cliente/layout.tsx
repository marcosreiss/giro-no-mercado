// src/app/cliente/layout.tsx
'use client'

import { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { ShoppingCart, User, List, LogOut } from 'lucide-react'
import { useAuth } from '@/src/context/AuthContext'
import { useNotification } from '@/src/context/NotificationContext'

export default function ClienteLayout({ children }: { children: ReactNode }) {
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
        { id: 'home', label: 'Início', icon: ShoppingCart, path: '/cliente' },
        { id: 'pedidos', label: 'Pedidos', icon: List, path: '/cliente/pedidos' },
        { id: 'perfil', label: 'Perfil', icon: User, path: '/cliente/perfil' }
    ]

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            {/* Header */}
            <header className="bg-gradient-secundario text-neutral-0 shadow-lg fixed top-0 left-0 right-0 z-50">
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
                        <button onClick={handleLogout} className="bg-neutral-0/20 active:bg-neutral-0/30 p-3 rounded-xl btn-touch">
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
                                    className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 btn-touch ${isActive ? 'text-giro-verde-escuro' : 'text-neutral-600 active:text-giro-verde-escuro'
                                        }`}
                                >
                                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className={`text-xs ${isActive ? 'font-bold' : 'font-semibold'}`}>{item.label}</span>
                                    {isActive && <div className="w-12 h-1 bg-giro-verde-escuro rounded-full mt-1" />}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </nav>
        </div>
    )
}
