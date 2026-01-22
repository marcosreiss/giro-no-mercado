// src/components/ToastContainer.tsx
'use client'

import { useNotification } from '@/src/context/NotificationContext'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

export default function ToastContainer() {
    const { notifications, removeNotification } = useNotification()

    if (notifications.length === 0) return null

    return (
        <div className="fixed top-4 right-4 z-9999 space-y-3 max-w-md w-full px-4">
            {notifications.map((notification) => {
                const config = {
                    success: {
                        icon: CheckCircle,
                        bgColor: 'bg-success',
                        borderColor: 'border-success'
                    },
                    error: {
                        icon: XCircle,
                        bgColor: 'bg-error',
                        borderColor: 'border-error'
                    },
                    warning: {
                        icon: AlertTriangle,
                        bgColor: 'bg-warning',
                        borderColor: 'border-warning'
                    },
                    info: {
                        icon: Info,
                        bgColor: 'bg-info',
                        borderColor: 'border-info'
                    }
                }

                const { icon: Icon, bgColor, borderColor } = config[notification.type]

                return (
                    <div
                        key={notification.id}
                        className={`bg-neutral-0 border-2 ${borderColor} rounded-xl shadow-2xl p-4 flex items-start gap-3 animate-slide-in`}
                        role="alert"
                    >
                        <div className={`${bgColor} rounded-full p-1 shrink-0`}>
                            <Icon size={24} className="text-neutral-0" />
                        </div>

                        <p className="flex-1 text-neutral-900 font-medium text-base leading-tight pt-1">
                            {notification.message}
                        </p>

                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-neutral-400 active:text-neutral-900 shrink-0 p-1"
                            aria-label="Fechar notificação"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
