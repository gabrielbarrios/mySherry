'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/app/components/context/LanguageProvider'
import { useToast } from '@/app/components/ui/Toast'
import ConfirmModal from '@/app/components/ui/ConfirmModal'

export default function DeleteButton({ id }: { id: string }) {
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()
    const t = useTranslation()
    const { toast } = useToast()
    const [confirmOpen, setConfirmOpen] = useState(false)

    const handleDelete = async () => {
        setConfirmOpen(false)

        const { error } = await supabase
            .from('recipes')
            .delete()
            .eq('id', id)

        if (error) {
            toast.error(t.global.deleteError + ' ' + error.message)
        } else {
            router.refresh()
        }
    }

    return (
        <>
            <button
                onClick={() => setConfirmOpen(true)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={t.global.delete}
            >
                🗑️
            </button>

            <ConfirmModal
                isOpen={confirmOpen}
                title={t.global.deleteConfirm}
                message={t.global.deleteWarning}
                confirmText={t.global.deleteAction}
                cancelText={t.global.cancel}
                onConfirm={handleDelete}
                onCancel={() => setConfirmOpen(false)}
                variant="danger"
            />
        </>
    )
}
