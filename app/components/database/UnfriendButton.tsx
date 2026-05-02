'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserMinus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/app/components/context/LanguageProvider'
import { useToast } from '@/app/components/ui/Toast'
import ConfirmModal from '@/app/components/ui/ConfirmModal'

interface Props {
 friendshipId: string
 friendName: string
}

export default function UnfriendButton({ friendshipId, friendName }: Props) {
 const [loading, setLoading] = useState(false)
 const [confirmOpen, setConfirmOpen] = useState(false)
 const supabase = useMemo(() => createClient(), [])
 const router = useRouter()
 const t = useTranslation()
 const { toast } = useToast()

 const handleUnfriend = async () => {
 setConfirmOpen(false)
 setLoading(true)

 const { error } = await supabase
 .from('friends')
 .delete()
 .eq('id', friendshipId)

 if (error) {
 toast.error(t.friends.unfriendError)
 setLoading(false)
 } else {
 router.refresh()
 }
 }

 return (
 <>
 <button
 onClick={() => setConfirmOpen(true)}
 disabled={loading}
 className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 disabled:opacity-50"
 title={t.friends.unfriend}
 >
 {loading ? (
 <Loader2 size={18} className="animate-spin" />
 ) : (
 <UserMinus size={18} />
 )}
 </button>

 <ConfirmModal
 isOpen={confirmOpen}
 title={t.friends.unfriend}
 message={t.friends.unfriendConfirm.replace('{{name}}', friendName)}
 confirmText={t.global.confirm}
 cancelText={t.global.cancel}
 onConfirm={handleUnfriend}
 onCancel={() => setConfirmOpen(false)}
 variant="danger"
 />
 </>
 )
}
