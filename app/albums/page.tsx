import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '../components/ui/SectionHeader'
import Heading from '../components/ui/Heading'
import FilterBarAlbum from '../components/filter/FilterBarAlbum'
import DeleteButton from '../components/database/DeleteItem'
import ButtonAction from '../components/ui/ButtonAction'
import { Images } from 'lucide-react'

import { getProfile } from '@/library/get-user-data'
import { getTranslation } from '@/library/language/translate'

export default async function AlbumsPage({
 searchParams,
}: {
 searchParams: Promise<{ [key: string]: string | undefined }>
}) {
 const supabase = await createClient()
 const params = await searchParams

 const profile = await getProfile()
 const t = getTranslation(profile?.languaje)

 const { data: { user }, error: authError } = await supabase.auth.getUser()
 if (!user || authError) redirect('/login')

 let query = supabase
 .from('albums')
 .select(`
 *,
 album_photos ( image_url, display_order )
 `)
 .eq('user_id', user.id)
 .order('created_at', { ascending: false })

 if (params.name) query = query.ilike('title', `%${params.name}%`)
 if (params.tags) {
 const tags = params.tags.split(/[ ,]+/).filter(Boolean)
 if (tags.length > 0) {
 query = query.or(tags.map(tag => `tags.ilike.%${tag}%`).join(','))
 }
 }

 const { data: albums, error } = await query.limit(50)

 if (error) {
 return <p className="p-10 text-red-500">Error: {error.message}</p>
 }

 return (
 <main className="p-6 max-w-7xl mx-auto text-black dark:text-white">
 <PageHeader
 title={t.albums.myAlbums}
 description={t.albums.description}
 buttonText={t.albums.add}
 buttonHref="/albums/create"
 variant="create"
 back
 />

 <FilterBarAlbum params={params} basePath="/albums" />

 {albums?.length === 0 ? (
 <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-800">
 <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">{t.albums.noAlbums}</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {albums?.map((album) => {
 const photos: any[] = album.album_photos || []
 const sorted = [...photos].sort((a, b) => a.display_order - b.display_order)
 const cover = sorted[0]?.image_url

 return (
 <div
 key={album.id}
 className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-2 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative"
 >
 <Link href={`/albums/view/${album.slug}`} className="flex flex-col flex-grow">
 <div className="relative aspect-[16/10] bg-gray-100 dark:bg-gray-800 rounded-[2rem] mb-4 overflow-hidden flex items-center justify-center text-4xl group-hover:scale-[1.02] transition-transform">
 {cover ? (
 <img src={cover} alt={album.title} className="w-full h-full object-cover" />
 ) : (
 <Images size={40} className="text-gray-300" />
 )}
 <div className="absolute bottom-3 right-3 bg-black/50 dark:bg-gray-950/50 text-white text-[10px] font-black px-2.5 py-1 rounded-xl">
 {photos.length} {t.albums.photos}
 </div>
 </div>

 <div className="px-4 pb-4">
 <div className="flex flex-wrap gap-2 mb-3">
 {album.tags?.split(',').map((tag: string) => (
 <span
 key={tag}
 className="text-[10px] font-black uppercase tracking-tighter text-orange-700 bg-orange-100/50 px-2.5 py-1 rounded-md border border-orange-100"
 >
 {tag.trim()}
 </span>
 ))}
 </div>

 <Heading level="h2">{album.title}</Heading>

 {album.description && (
 <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1 mb-4 italic">
 {album.description}
 </p>
 )}

 <div className="flex gap-3 mt-1">
 <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
 album.permission === 0 ? 'bg-green-100 text-green-700' :
 album.permission === 1 ? 'bg-blue-100 text-blue-700' :
 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
 }`}>
 {album.permission === 0 ? '🔓 Público' : album.permission === 1 ? '👥 Amigos' : '🔒 Privado'}
 </span>
 <span className="text-xs text-gray-500 dark:text-gray-400">
 {new Date(album.created_at).toLocaleDateString()}
 </span>
 </div>
 </div>
 </Link>

 <div className="flex justify-center gap-2 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800 mt-auto">
 <ButtonAction variant="edit" href={`/albums/edit/${album.id}`} className="px-4 py-2 text-xs">
 {t.global.edit}
 </ButtonAction>
 <DeleteButton itemId={album.id} tableName="albums" redirectPath="/albums" />
 </div>
 </div>
 )
 })}
 </div>
 )}
 </main>
 )
}
