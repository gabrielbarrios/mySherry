'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Check, X, User } from 'lucide-react'
import { useTranslation } from '@/app/components/context/LanguageProvider'
import { useToast } from '@/app/components/ui/Toast'

const CACHE_TTL_MS = 30_000

export default function FriendRequestsModal({ isOpen, onClose, authUserId }: { isOpen: boolean, onClose: () => void, authUserId: string }) {
 const supabase = useMemo(() => createClient(), [])
 const t = useTranslation()
 const { toast } = useToast()
 const [requests, setRequests] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const lastFetchedAt = useRef<number>(0)

 useEffect(() => {
 if (!isOpen) return
 if (Date.now() - lastFetchedAt.current < CACHE_TTL_MS) return
 fetchRequests()
 }, [isOpen])

 async function fetchRequests() {
 setLoading(true)
 // Traemos las solicitudes donde YO soy el friend_id y el status es pending
 const { data } = await supabase
 .from('friends')
 .select(`
 id,
 user_id,
 profiles!friends_user_id_fkey (username, avatar_url)
 `)
 .eq('friend_id', authUserId)
 .eq('status', 'pending')

 setRequests(data || [])
 lastFetchedAt.current = Date.now()
 setLoading(false)
 }

 async function handleResponse(requestId: string, status: 'accepted' | 'rejected') {
 const { error } = await supabase
 .from('friends')
 .update({ status })
 .eq('id', requestId)

 if (!error) {
 setRequests(prev => prev.filter(r => r.id !== requestId))
 if (status === 'accepted') toast.success(t.friends.friendshipConfirmed)
 }
 }

 if (!isOpen) return null

 return (
 <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-black/40 dark:bg-gray-950/40 backdrop-blur-sm" onClick={onClose}></div>
 <div className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
 <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
 <h2 className="text-xl font-black uppercase tracking-tight">{t.friends.requests}</h2>
 <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-full"><X size={20} /></button>
 </div>

 <div className="p-4 max-h-[60vh] overflow-y-auto">
 {loading ? (
 <p className="text-center py-10 animate-pulse font-bold text-gray-500 dark:text-gray-400">{t.global.loading}</p>
 ) : requests.length === 0 ? (
 <p className="text-center py-10 text-gray-500 dark:text-gray-400">{t.friends.noPendingRequests}</p>
 ) : (
 requests.map((req) => (
 <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-3xl mb-3">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-full border flex items-center justify-center overflow-hidden">
 {req.profiles.avatar_url ? <img src={req.profiles.avatar_url} /> : <User size={20} />}
 </div>
 <span className="font-bold text-sm">@{req.profiles.username}</span>
 </div>
 <div className="flex gap-2">
 <button onClick={() => handleResponse(req.id, 'accepted')} className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
 <Check size={18} />
 </button>
 <button onClick={() => handleResponse(req.id, 'rejected')} className="p-2 bg-gray-200 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-300 transition-colors">
 <X size={18} />
 </button>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 )
}