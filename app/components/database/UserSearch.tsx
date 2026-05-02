'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Search, User as UserIcon, Loader2 } from 'lucide-react'
import { useTranslation } from '@/app/components/context/LanguageProvider';

interface Props {
 className?: string;
}

export default function UserSearch({ className }: Props) {
 const [query, setQuery] = useState('')
 const [results, setResults] = useState<any[]>([])
 const [loading, setLoading] = useState(false)
 const [showResults, setShowResults] = useState(false)
 const supabase = useMemo(() => createClient(), [])
 const router = useRouter()
 const t = useTranslation();

 useEffect(() => {
 const searchUsers = async () => {
 if (query.length < 2) {
 setResults([])
 return
 }

 setLoading(true)
 const { data, error } = await supabase
 .from('profiles')
 .select('id, username, avatar_url')
 .ilike('username', `%${query}%`)
 .limit(5)

 if (!error) setResults(data)
 setLoading(false)
 }

 // Debounce: Esperamos 300ms después de que el usuario deja de escribir
 const timeoutId = setTimeout(searchUsers, 300)
 return () => clearTimeout(timeoutId)
 }, [query])

 const handleSelect = (username: string) => {
 setQuery('')
 setShowResults(false)
 router.push(`/user/${username}`)
 }

 return (
 <div className={`relative w-full max-w-md ${className || ''}`}>
 <div className="relative group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
 <input
 type="text"
 placeholder={t.global.searchFriend}
 value={query}
 onChange={(e) => {
 setQuery(e.target.value)
 setShowResults(true)
 }}
 onFocus={() => setShowResults(true)}
 className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-medium text-sm"
 />
 {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-orange-500" size={18} />}
 </div>

 {/* Lista de Resultados */}
 {showResults && results.length > 0 && (
 <>
 <div className="fixed inset-0 z-10" onClick={() => setShowResults(false)} />
 <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
 {results.map((user) => (
 <button
 key={user.id}
 onClick={() => handleSelect(user.username)}
 className="w-full flex items-center gap-3 px-5 py-4 hover:bg-orange-50 transition-colors text-left border-b border-gray-100 dark:border-gray-800 last:border-0"
 >
 <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
 {user.avatar_url ? (
 <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
 ) : (
 <UserIcon size={20} className="text-gray-500 dark:text-gray-400" />
 )}
 </div>
 <div>
 <p className="font-black text-gray-900 dark:text-gray-100 text-sm">@{user.username}</p>
 <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Ver Perfil</p>
 </div>
 </button>
 ))}
 </div>
 </>
 )}
 </div>
 )
}