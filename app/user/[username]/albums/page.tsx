import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Images, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '@/app/components/ui/SectionHeader'
import FilterBarAlbum from '@/app/components/filter/FilterBarAlbum'

import { getProfile } from '@/library/get-user-data'
import { getTranslation } from '@/library/language/translate'

const PAGE_SIZE = 5

export default async function UserAlbumsPage({
 params,
 searchParams,
}: {
 params: Promise<{ username: string }>
 searchParams: Promise<{ [key: string]: string | undefined }>
}) {
 const supabase = await createClient()
 const { username } = await params
 const searchparams = await searchParams

 const profileuser = await getProfile()
 const t = getTranslation(profileuser?.languaje)

 const { data: { user: authUser } } = await supabase.auth.getUser()

 const { data: profile, error: profileError } = await supabase
 .from('profiles')
 .select('id, username, avatar_url')
 .eq('username', username)
 .single()

 if (profileError || !profile) notFound()

 const isOwner = authUser?.id === profile.id
 const page = Math.max(1, parseInt(searchparams.page || '1'))
 const offset = (page - 1) * PAGE_SIZE

 // Build query — RLS handles permission filtering automatically
 let query = supabase
 .from('albums')
 .select(`
 *,
 album_photos ( image_url, display_order )
 `, { count: 'exact' })
 .eq('user_id', profile.id)
 .order('created_at', { ascending: false })

 if (searchparams.name) query = query.ilike('title', `%${searchparams.name}%`)
 if (searchparams.tags) {
 const tags = searchparams.tags.split(/[ ,]+/).filter(Boolean)
 if (tags.length > 0) {
 query = query.or(tags.map(tag => `tags.ilike.%${tag}%`).join(','))
 }
 }

 // If not owner, only show public. RLS also enforces this, but being explicit is faster.
 if (!isOwner) query = query.eq('permission', 0)

 const { data: albums, count } = await query.range(offset, offset + PAGE_SIZE - 1)

 const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

 const basePath = `/user/${username}/albums`
 const buildPageUrl = (p: number) => {
 const sp = new URLSearchParams(searchparams as Record<string, string>)
 sp.set('page', String(p))
 return `${basePath}?${sp.toString()}`
 }

 return (
 <main className="p-6 max-w-7xl mx-auto text-black dark:text-white">
 <PageHeader
 title={`${t.albums.albums} · @${username}`}
 back
 />

 <FilterBarAlbum params={searchparams} basePath={basePath} />

 <div className="flex justify-between items-end mb-8">
 <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
 {isOwner ? t.albums.myAlbums : t.albums.albums}
 </h2>
 <span className="text-sm text-gray-500 dark:text-gray-400">{count || 0} {t.albums.found}</span>
 </div>

 {albums?.length === 0 ? (
 <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-800">
 <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">{t.albums.noAlbums}</p>
 </div>
 ) : (
 <div className="space-y-16">
 {albums?.map((album) => {
 const photos = [...(album.album_photos || [])].sort(
 (a: any, b: any) => a.display_order - b.display_order
 )

 return (
 <section key={album.id}>
 {/* Album header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5">
 <div>
 <Link
 href={`/albums/view/${album.slug}`}
 className="text-2xl font-black text-gray-900 dark:text-gray-100 hover:text-orange-600 transition-colors tracking-tight"
 >
 {album.title}
 </Link>
 {album.description && (
 <p className="text-gray-500 dark:text-gray-400 text-sm italic mt-1">{album.description}</p>
 )}
 <div className="flex flex-wrap gap-2 mt-2">
 {album.tags?.split(',').map((tag: string) => (
 <span key={tag} className="text-[10px] font-black uppercase tracking-tighter text-orange-700 bg-orange-100/50 px-2.5 py-1 rounded-md border border-orange-100">
 {tag.trim()}
 </span>
 ))}
 </div>
 </div>
 <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
 <span className="flex items-center gap-1">
 <Images size={14} />
 {photos.length} {t.albums.photos}
 </span>
 <span>{new Date(album.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
 </div>
 </div>

 {/* Photo grid */}
 {photos.length === 0 ? (
 <div className="h-40 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800">
 <p className="text-gray-300 text-sm font-bold">{t.albums.noPhotos}</p>
 </div>
 ) : (
 <Link href={`/albums/view/${album.slug}`} className="block">
 <div className={`grid gap-2 ${
 photos.length === 1 ? 'grid-cols-1' :
 photos.length === 2 ? 'grid-cols-2' :
 photos.length === 3 ? 'grid-cols-3' :
 'grid-cols-2 md:grid-cols-4'
 }`}>
 {photos.slice(0, 8).map((photo: any, idx: number) => (
 <div
 key={photo.image_url + idx}
 className={`relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 ${
 photos.length >= 4 && idx === 0 ? 'md:col-span-2 md:row-span-2' : ''
 }`}
 style={{ aspectRatio: photos.length === 1 ? '16/7' : '1/1' }}
 >
 <img
 src={photo.image_url}
 alt=""
 className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
 />
 {/* Overlay showing how many more photos are hidden */}
 {idx === 7 && photos.length > 8 && (
 <div className="absolute inset-0 bg-black/60 dark:bg-gray-950/60 flex items-center justify-center">
 <span className="text-white font-black text-2xl">+{photos.length - 8}</span>
 </div>
 )}
 </div>
 ))}
 </div>
 </Link>
 )}
 </section>
 )
 })}
 </div>
 )}

 {/* Pagination */}
 {totalPages > 1 && (
 <nav className="flex justify-center items-center gap-3 mt-16">
 {page > 1 ? (
 <Link
 href={buildPageUrl(page - 1)}
 className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 transition-all"
 >
 <ChevronLeft size={16} /> {t.global.back}
 </Link>
 ) : (
 <span className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold text-gray-200 cursor-not-allowed">
 <ChevronLeft size={16} /> {t.global.back}
 </span>
 )}

 <div className="flex items-center gap-2">
 {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
 <Link
 key={p}
 href={buildPageUrl(p)}
 className={`w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-black transition-all ${
 p === page
 ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
 : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-800'
 }`}
 >
 {p}
 </Link>
 ))}
 </div>

 {page < totalPages ? (
 <Link
 href={buildPageUrl(page + 1)}
 className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 transition-all"
 >
 Siguiente <ChevronRight size={16} />
 </Link>
 ) : (
 <span className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold text-gray-200 cursor-not-allowed">
 Siguiente <ChevronRight size={16} />
 </span>
 )}
 </nav>
 )}
 </main>
 )
}
