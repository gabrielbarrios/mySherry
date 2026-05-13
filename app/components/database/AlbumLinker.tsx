'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, X, Check, Images } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { generateSlug } from '@/app/utils/string-utils'
import { useTranslation } from '@/app/components/context/LanguageProvider'
import { useToast } from '@/app/components/ui/Toast'

type AlbumLite = {
 id: string
 title: string
 slug: string
 cover_url: string | null
 photo_count: number
}

interface Props {
 value: string | null
 onChange: (albumId: string | null) => void
}

export default function AlbumLinker({ value, onChange }: Props) {
 const t = useTranslation()
 const { toast } = useToast()
 const supabase = useMemo(() => createClient(), [])

 const [albums, setAlbums] = useState<AlbumLite[]>([])
 const [loading, setLoading] = useState(true)
 const [creating, setCreating] = useState(false)
 const [showInlineForm, setShowInlineForm] = useState(false)
 const [newTitle, setNewTitle] = useState('')
 const [newDescription, setNewDescription] = useState('')

 // Carga los álbumes del usuario
 useEffect(() => {
 let cancelled = false
 ;(async () => {
 const { data: { user } } = await supabase.auth.getUser()
 if (!user) {
 if (!cancelled) setLoading(false)
 return
 }
 const { data, error } = await supabase
 .from('albums')
 .select(`id, title, slug, album_photos ( image_url, display_order )`)
 .eq('user_id', user.id)
 .order('created_at', { ascending: false })
 .limit(50)

 if (cancelled) return
 if (error || !data) {
 setLoading(false)
 return
 }
 const lite: AlbumLite[] = data.map(a => {
 const photos = (a.album_photos || []) as { image_url: string; display_order: number }[]
 const sorted = [...photos].sort((p, q) => p.display_order - q.display_order)
 return {
 id: a.id,
 title: a.title,
 slug: a.slug,
 cover_url: sorted[0]?.image_url || null,
 photo_count: photos.length,
 }
 })
 setAlbums(lite)
 setLoading(false)
 })()
 return () => {
 cancelled = true
 }
 }, [supabase])

 const linkedAlbum = albums.find(a => a.id === value) || null

 const handleSelect = (albumId: string) => {
 onChange(albumId === value ? null : albumId)
 }

 const handleCreateInline = async () => {
 if (!newTitle.trim()) return
 setCreating(true)
 try {
 const { data: { user } } = await supabase.auth.getUser()
 if (!user) {
 toast.info(t.global.notLoggedIn)
 setCreating(false)
 return
 }
 const slug = generateSlug(newTitle)
 const { data, error } = await supabase
 .from('albums')
 .insert([{
 title: newTitle,
 description: newDescription || null,
 tags: '',
 permission: 0,
 slug,
 user_id: user.id,
 }])
 .select('id, title, slug')
 .single()

 if (error) {
 toast.error(`${t.global.errorSave}: ${error.message}`)
 setCreating(false)
 return
 }

 const created: AlbumLite = {
 id: data.id,
 title: data.title,
 slug: data.slug,
 cover_url: null,
 photo_count: 0,
 }
 setAlbums(prev => [created, ...prev])
 onChange(created.id)
 setNewTitle('')
 setNewDescription('')
 setShowInlineForm(false)
 toast.success(t.albums.saved)
 } finally {
 setCreating(false)
 }
 }

 return (
 <div>
 <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-2">
 {t.travels.album.title}
 </p>
 <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-4">
 {t.travels.album.description}
 </p>

 {/* Estado: álbum vinculado */}
 {linkedAlbum && (
 <div className="mb-4 flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-2xl">
 <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
 {linkedAlbum.cover_url ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img src={linkedAlbum.cover_url} alt={linkedAlbum.title} className="w-full h-full object-cover" />
 ) : (
 <Images size={20} className="text-gray-400" />
 )}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-[10px] font-black text-orange-700 dark:text-orange-300 uppercase tracking-widest">
 <Check size={10} className="inline mr-1" />
 {t.travels.album.title}
 </p>
 <p className="font-bold truncate">{linkedAlbum.title}</p>
 <p className="text-xs text-gray-500 dark:text-gray-400">
 {linkedAlbum.photo_count} {t.travels.album.photos}
 </p>
 </div>
 <button
 type="button"
 onClick={() => onChange(null)}
 className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
 >
 <X size={14} className="inline mr-1" /> {t.travels.album.unlink}
 </button>
 </div>
 )}

 {/* Estado: cargando */}
 {loading && (
 <p className="text-sm text-gray-400 italic">{t.travels.album.loading}</p>
 )}

 {/* Scroll horizontal de álbumes */}
 {!loading && (
 <div className="flex gap-3 overflow-x-auto pb-3 -mx-2 px-2 snap-x">
 {/* Tile: Crear nuevo */}
 <button
 type="button"
 onClick={() => setShowInlineForm(s => !s)}
 className={`flex-shrink-0 w-36 snap-start aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
 showInlineForm
 ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-700'
 : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50/50'
 }`}
 >
 <div className="w-10 h-10 rounded-full bg-current/10 flex items-center justify-center">
 <Plus size={20} strokeWidth={2.5} />
 </div>
 <span className="text-xs font-black uppercase tracking-widest text-center px-2">
 {t.travels.album.newAlbum}
 </span>
 </button>

 {/* Álbumes existentes */}
 {albums.map(album => {
 const isSelected = album.id === value
 return (
 <button
 key={album.id}
 type="button"
 onClick={() => handleSelect(album.id)}
 className={`flex-shrink-0 w-36 snap-start aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all relative bg-gray-100 dark:bg-gray-800 ${
 isSelected
 ? 'border-orange-500 shadow-lg shadow-orange-500/20'
 : 'border-transparent hover:border-orange-300'
 }`}
 >
 {album.cover_url ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img src={album.cover_url} alt={album.title} className="absolute inset-0 w-full h-full object-cover" />
 ) : (
 <div className="absolute inset-0 flex items-center justify-center">
 <Images size={32} className="text-gray-400" />
 </div>
 )}
 <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-3 text-left">
 <p className="text-white text-xs font-black uppercase tracking-tight line-clamp-2">
 {album.title}
 </p>
 <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-0.5">
 {album.photo_count} {t.travels.album.photos}
 </p>
 </div>
 {isSelected && (
 <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1.5 shadow-lg">
 <Check size={12} strokeWidth={3} />
 </div>
 )}
 </button>
 )
 })}

 {albums.length === 0 && !showInlineForm && (
 <div className="flex-shrink-0 flex items-center px-4">
 <p className="text-sm text-gray-400 italic whitespace-nowrap">
 {t.travels.album.noAlbumsYet}
 </p>
 </div>
 )}
 </div>
 )}

 {/* Inline form para crear */}
 {showInlineForm && (
 <div className="mt-4 p-5 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
 <div className="flex items-center justify-between mb-4">
 <div>
 <h3 className="font-black text-sm uppercase tracking-tight">
 {t.travels.album.inlineFormTitle}
 </h3>
 <p className="text-xs text-gray-500 dark:text-gray-400 italic">
 {t.travels.album.inlineFormDescription}
 </p>
 </div>
 <button
 type="button"
 onClick={() => {
 setShowInlineForm(false)
 setNewTitle('')
 setNewDescription('')
 }}
 className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
 aria-label={t.travels.album.cancelCreate}
 >
 <X size={16} />
 </button>
 </div>

 <input
 type="text"
 value={newTitle}
 onChange={(e) => setNewTitle(e.target.value)}
 placeholder={t.travels.album.inlineNamePlaceholder}
 className="w-full p-3 mb-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
 autoFocus
 />
 <textarea
 value={newDescription}
 onChange={(e) => setNewDescription(e.target.value)}
 placeholder={t.travels.album.inlineDescPlaceholder}
 rows={2}
 className="w-full p-3 mb-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
 />
 <button
 type="button"
 onClick={handleCreateInline}
 disabled={creating || !newTitle.trim()}
 className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm uppercase tracking-widest"
 >
 {creating ? t.global.saving : t.travels.album.saveAlbum}
 </button>
 </div>
 )}
 </div>
 )
}
