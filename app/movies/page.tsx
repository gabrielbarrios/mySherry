import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import PageHeader from '../components/ui/SectionHeader'
import Heading from '../components/ui/Heading'
import FilterBarMovie from '../components/filter/FilterBarMovie'
import StaticRating from '../components/ui/StaticRating'

import { getProfile } from '@/library/get-user-data';
import { getTranslation } from '@/library/language/translate';

export default async function MoviesPage({
 searchParams
}: {
 searchParams: Promise<{ [key: string]: string | undefined }>
}) {
 const supabase = await createClient()
 const params = await searchParams

 const profile = await getProfile();
 const t = getTranslation(profile?.languaje);

 let query = supabase
 .from('movies')
 .select(`
 *,
 reviews:movie_reviews!movie_reviews_item_id_fkey (
 rating
 )
 `)

 if (params.name) query = query.ilike('name', `%${params.name}%`)
 if (params.director) query = query.ilike('director', `%${params.director}%`)
 if (params.country) query = query.ilike('country', `%${params.country}%`)
 if (params.year) query = query.eq('release_year', parseInt(params.year))
 if (params.genre) {
 const tags = params.genre.split(/[ ,]+/).filter(Boolean);
 if (tags.length > 0) {
 const orFilter = tags.map(tag => `genre.ilike.%${tag}%`).join(',');
 query = query.or(orFilter);
 }
 }

 const { data: rawMovies } = await query.limit(10)

 const movies = rawMovies?.map(m => {
 const reviews = m.reviews || [];
 const totalVotes = reviews.length;
 const avg = totalVotes > 0
 ? reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / totalVotes
 : 0;

 return {
 ...m,
 averageRating: Math.round(avg),
 totalVotes: totalVotes
 };
 });

 return (
 <main className="p-6 max-w-7xl mx-auto text-black dark:text-white">
 <PageHeader
 title={t.movies.movies}
 description={t.movies.description}
 buttonText={t.movies.add}
 buttonHref='/movies/create'
 variant='create'
 back
 />

 <FilterBarMovie params={params} />

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {movies?.map((m) => (
 <Link
 key={m.id}
 href={`/movies/view/${m.slug}`}
 className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-2 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
 >
 <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-800 rounded-[2rem] mb-4 overflow-hidden flex items-center justify-center text-4xl group-hover:scale-[1.02] transition-transform">
 {m.image_url ? (
 <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
 ) : '🎬'}
 <div className="absolute bottom-3 right-3">
 <StaticRating
 rating={m.averageRating}
 total={m.totalVotes}
 />
 </div>
 </div>

 <div className="px-4 pb-4">
 <div className="flex flex-wrap gap-2 mb-3">
 {m.genre?.split(',').map((tag: string) => (
 <span
 key={tag}
 className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-1 rounded-lg"
 >
 {tag.trim()}
 </span>
 ))}
 </div>
 <Heading level="h2">{m.name}</Heading>
 <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1 mb-4 italic">
 {m.description}
 </p>
 <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
 {m.director && <span>🎥 {m.director}</span>}
 {m.release_year && (
 <>
 <span>•</span>
 <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">{m.release_year}</span>
 </>
 )}
 </div>
 </div>
 </Link>
 ))}
 </div>

 {movies?.length === 0 && (
 <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-800">
 <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">{t.global.noFound}</p>
 <Link href="/movies" className="text-orange-600 font-bold underline mt-2 block">{t.movies.seeAll}</Link>
 </div>
 )}
 </main>
 )
}
