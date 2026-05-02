'use client'

import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ConfirmModalProps {
 isOpen: boolean
 title: string
 message: string
 confirmText?: string
 cancelText?: string
 onConfirm: () => void
 onCancel: () => void
 variant?: 'danger' | 'default'
}

export default function ConfirmModal({
 isOpen,
 title,
 message,
 confirmText = 'Confirmar',
 cancelText = 'Cancelar',
 onConfirm,
 onCancel,
 variant = 'danger',
}: ConfirmModalProps) {
 if (!isOpen) return null

 return createPortal(
 <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-black/60 dark:bg-gray-950/60 backdrop-blur-sm" onClick={onCancel} />
 <div className="relative bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
 <button
 onClick={onCancel}
 className="absolute top-4 right-4 p-2 text-gray-300 hover:text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors"
 >
 <X size={18} />
 </button>

 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
 variant === 'danger' ? 'bg-red-50' : 'bg-orange-50'
 }`}>
 <span className="text-3xl">{variant === 'danger' ? '🗑️' : '⚠️'}</span>
 </div>

 <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
 <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">{message}</p>

 <div className="flex gap-3">
 <button
 onClick={onCancel}
 className="flex-1 py-3.5 font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:bg-gray-800 rounded-2xl transition-colors"
 >
 {cancelText}
 </button>
 <button
 onClick={onConfirm}
 className={`flex-1 py-3.5 font-bold text-white rounded-2xl shadow-lg transition-all active:scale-95 ${
 variant === 'danger'
 ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
 : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
 }`}
 >
 {confirmText}
 </button>
 </div>
 </div>
 </div>,
 document.body
 )
}
