'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { useTranslation } from '@/app/components/context/LanguageProvider'
import { useToast } from '@/app/components/ui/Toast'
import ConfirmModal from '@/app/components/ui/ConfirmModal'

interface Props {
 itemId: string
 tableName: string
 redirectPath?: string
}

export default function DeleteButton({ itemId, tableName, redirectPath = '/' }: Props) {
 const supabase = useMemo(() => createClient(), [])
 const router = useRouter()
 const t = useTranslation()
 const { toast } = useToast()
 const [confirmOpen, setConfirmOpen] = useState(false)
 const [deleting, setDeleting] = useState(false)

 const handleDelete = async () => {
 setConfirmOpen(false)
 setDeleting(true)

 const { data: { user } } = await supabase.auth.getUser()

 const { error } = await supabase
 .from(tableName)
 .delete()
 .eq('id', itemId)
 .eq('user_id', user?.id)

 if (error) {
 toast.error(t.global.deleteError + ' ' + error.message)
 setDeleting(false)
 } else {
 router.push(redirectPath)
 router.refresh()
 }
 }

 return (
 <>
 <button
 onClick={() => setConfirmOpen(true)}
 disabled={deleting}
 className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
 title={t.global.delete}
 >
 <Trash2 size={18} />
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
