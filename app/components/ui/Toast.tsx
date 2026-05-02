'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
    id: string
    message: string
    type: ToastType
}

interface ToastContextValue {
    toast: {
        success: (msg: string) => void
        error: (msg: string) => void
        info: (msg: string) => void
    }
}

const ToastContext = createContext<ToastContextValue>({
    toast: { success: () => {}, error: () => {}, info: () => {} }
})

const TOAST_CONFIG = {
    success: { Icon: CheckCircle2, bar: 'bg-green-500', iconColor: 'text-green-500' },
    error:   { Icon: XCircle,      bar: 'bg-red-500',   iconColor: 'text-red-500' },
    info:    { Icon: AlertCircle,  bar: 'bg-orange-500', iconColor: 'text-orange-500' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([])

    const remove = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const add = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).slice(2)
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => remove(id), 3500)
    }, [remove])

    const toast = {
        success: (msg: string) => add(msg, 'success'),
        error:   (msg: string) => add(msg, 'error'),
        info:    (msg: string) => add(msg, 'info'),
    }

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed top-6 right-6 z-[300] flex flex-col gap-3 pointer-events-none">
                {toasts.map(t => {
                    const { Icon, bar, iconColor } = TOAST_CONFIG[t.type]
                    return (
                        <div
                            key={t.id}
                            className="pointer-events-auto flex items-center gap-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-80 animate-in fade-in slide-in-from-top-4 duration-300"
                        >
                            <div className={`w-1 self-stretch shrink-0 ${bar}`} />
                            <Icon size={20} className={`${iconColor} shrink-0 my-4 ml-1`} />
                            <p className="text-sm font-bold text-gray-800 flex-1 py-4">{t.message}</p>
                            <button
                                onClick={() => remove(t.id)}
                                className="p-4 text-gray-300 hover:text-gray-500 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )
                })}
            </div>
        </ToastContext.Provider>
    )
}

export const useToast = () => useContext(ToastContext)
