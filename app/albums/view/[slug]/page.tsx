import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Images, Tag } from 'lucide-react'
import PageHeader from '@/app/components/ui/SectionHeader'
import DeleteButton from '@/app/components/database/DeleteItem'
import ButtonAction from '@/app/components/ui/ButtonAction'
import RatingDisplay from '@/app/components/database/RatingDisplay'

import { getProfile } from '@/library/get-user-data'
import { getTranslation } from '@/library/language/translate'

export default async function AlbumView({ params }: { params: { slug: string } }) {
    const supabase = await createClient()
    const { slug } = await params

    const [{ data: { user: authUser } }, profile] = await Promise.all([
        supabase.auth.getUser(),
        getProfile(),
    ])

    const t = getTranslation(profile?.languaje)

    const { data: album, error } = await supabase
        .from('albums')
        .select(`
            *,
            profiles!user_id ( username, avatar_url ),
            album_photos ( id, image_url, display_order )
        `)
        .eq('slug', slug)
        .single()

    if (error || !album) {
        return (
            <main className="p-6 max-w-7xl mx-auto text-black">
                <div className="text-6xl mb-4">📷</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.albums.notFound}</h1>
                <p className="text-gray-500 max-w-md mb-8 leading-relaxed">{t.albums.notFoundMessage}</p>
                <div className="flex gap-4">
                    <Link href="/" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-95">
                        {t.global.explore}
                    </Link>
                    <Link href="/albums" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all active:scale-95">
                        {t.albums.myAlbums}
                    </Link>
                </div>
            </main>
        )
    }

    const isOwner = authUser?.id === album.user_id

    let existingReview = null
    if (authUser) {
        const { data } = await supabase
            .from('album_reviews')
            .select('rating, personal_review')
            .eq('item_id', album.id)
            .eq('user_id', authUser.id)
            .single()
        existingReview = data
    }

    const myRatingData = {
        itemId: album.id,
        tableName: 'album_reviews',
        userId: authUser?.id,
        initialRating: existingReview?.rating,
        initialReview: existingReview?.personal_review,
    }

    const photos = [...(album.album_photos || [])].sort(
        (a: any, b: any) => a.display_order - b.display_order
    )

    return (
        <main className="p-6 max-w-7xl mx-auto text-black">
            <PageHeader
                title={album.title}
                description={album.description}
                back
                ratingConfig={myRatingData}
            />

            <article className="max-w-7xl mx-auto space-y-8">
                {/* Header row */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Author + rating */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg uppercase overflow-hidden">
                            {album.profiles?.avatar_url ? (
                                <img src={album.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                album.profiles?.username?.charAt(0)
                            )}
                        </div>
                        <div>
                            <Link href={`/user/${album.profiles?.username}/albums`} className="font-bold text-gray-900 hover:text-orange-600 transition-colors">
                                @{album.profiles?.username}
                            </Link>
                            <p className="text-xs text-gray-400">
                                {new Date(album.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 flex items-center gap-3 ml-2">
                            <RatingDisplay itemId={album.id} tableName="album_reviews" size={16} />
                        </div>
                    </div>

                    {isOwner && (
                        <div className="flex gap-2">
                            <ButtonAction variant="edit" href={`/albums/edit/${album.id}`}>
                                {t.global.edit}
                            </ButtonAction>
                            <DeleteButton itemId={album.id} tableName="albums" redirectPath="/albums" />
                        </div>
                    )}
                </header>

                {/* Tags + permission */}
                <section className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {album.tags?.split(',').map((tag: string) => (
                            <span key={tag} className="text-[10px] font-black uppercase tracking-tighter text-orange-700 bg-orange-100/50 px-3 py-1.5 rounded-xl border border-orange-100">
                                {tag.trim()}
                            </span>
                        ))}
                    </div>
                    <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border ${
                        album.permission === 0 ? 'bg-green-50 text-green-700 border-green-100' :
                        album.permission === 1 ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-gray-50 text-gray-500 border-gray-100'
                    }`}>
                        {album.permission === 0 ? '🔓 Público' : album.permission === 1 ? '👥 Amigos' : '🔒 Privado'}
                    </span>
                </section>

                {/* Photo gallery */}
                <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-orange-500 p-2.5 rounded-2xl text-white">
                            <Images size={22} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                            {photos.length} {t.albums.photos}
                        </h2>
                    </div>

                    {photos.length === 0 ? (
                        <p className="text-gray-400 italic text-center py-12">{t.albums.noPhotos}</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {photos.map((photo: any, idx: number) => (
                                <a
                                    key={photo.id}
                                    href={photo.image_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100"
                                >
                                    <img
                                        src={photo.image_url}
                                        alt={`${album.title} ${idx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                </a>
                            ))}
                        </div>
                    )}
                </section>
            </article>
        </main>
    )
}
