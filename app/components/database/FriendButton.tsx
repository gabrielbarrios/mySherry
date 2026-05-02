'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import ButtonAction from '@/app/components/ui/ButtonAction'
import { UserPlus, Clock, Check } from 'lucide-react'
import { useTranslation } from '@/app/components/context/LanguageProvider'

interface Props {
 authUserId: string;
 profileId: string;
}

export default function FriendButton({ authUserId, profileId }: Props) {
 const supabase = useMemo(() => createClient(), [])
 const t = useTranslation()
 const [status, setStatus] = useState<string | null>(null)
 const [loading, setLoading] = useState(true)

 useEffect(() => {
 async function checkFriendship() {
 const { data } = await supabase
 .from('friends')
 .select('status')
 .or(`and(user_id.eq.${authUserId},friend_id.eq.${profileId}),and(user_id.eq.${profileId},friend_id.eq.${authUserId})`)
 .maybeSingle()

 if (data) setStatus(data.status)
 setLoading(false)
 }
 checkFriendship()
 }, [authUserId, profileId, supabase])

 const handleAction = async () => {
 if (status) return // Por ahora no hacemos nada si ya hay estado

 const { error } = await supabase.from('friends').insert({
 user_id: authUserId,
 friend_id: profileId,
 status: 'pending'
 })

 if (!error) setStatus('pending')
 }

 if (loading) return <div className="h-10 w-32 bg-gray-100 animate-pulse rounded-full" />

 if (status === 'pending') {
 return (
 <ButtonAction variant="outline" disabled className="gap-2">
 <Clock size={16} /> {t.friends.pendingRequest}
 </ButtonAction>
 )
 }

 if (status === 'accepted') {
 return (
 <ButtonAction variant="outline" className="gap-2 border-green-200 text-green-600 bg-green-50">
 <Check size={16} /> {t.friends.friends}
 </ButtonAction>
 )
 }

 return (
 <ButtonAction onClick={handleAction} className="gap-2">
 <UserPlus size={16} /> {t.friends.addFriend}
 </ButtonAction>
 )
}