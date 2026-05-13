import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import PageHeader from '@/app/components/ui/SectionHeader';
import { Film } from 'lucide-react';
import Link from 'next/link';
import Heading from '@/app/components/ui/Heading';
import StaticRating from '@/app/components/ui/StaticRating';
import FilterBarMovie from '@/app/components/filter/FilterBarMovie';

export default async function UserMoviesPage({
 params,
 searchParams
}: {
 params: Promise<{ username: string }>,
 searchParams: Promise<{ [key: string]: string | undefined }>
}) {
 const supabase = await createClient();
 const { username } = await params;
 const sercparams = await searchParams

 const { data: profile } = await supabase
 .from('profiles')
 .select('id, username')
 .eq('username', username)
 .single();

 if (!profile) return notFound();

 let query = supabase
 .from('movie_reviews')
 .select(`
 id,
 rating,
 personal_review,
 created_at,
 movie:movies!movie_reviews_item_id_fkey (
 id,
 name,
 slug,
 genre,
 director,
 release_year,
 country,
 image_url
 )
 `)
 .eq('user_id', profile.id)
 .order('created_at', { ascending: false });

 if (sercparams.name) query = query.ilike('movie.name', `%${sercparams.name}%`)
 if (sercparams.director) query = query.ilike('movie.director', `%${sercparams.director}%`)
 if (sercparams.country) query = query.ilike('movie.country', `%${sercparams.country}%`)
 if (sercparams.year) query = query.eq('movie.release_year', parseInt(sercparams.year))
 if (sercparams.genre) {
 const tags = sercparams.genre.split(/[ ,]+/).filter(Boolean);
 if (tags.length > 0) {
 const orFilter = tags.map(tag => `movie.genre.ilike.%${tag}%`).join(',');
 query = query.or(orFilter);
 }
 }

 const { data: movies } = await query.limit(10)

 return (
 <main className="p-6 max-w-7xl mx-auto text-black dark:text-white">
 <PageHeader
 title={`Películas Calificadas por @${username}`}
 description="Películas vistas y recomendaciones"
 back
 />
 <FilterBarMovie params={sercparams} />
 {!movies || movies.length === 0 ? (
 <div className="mt-20 text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
 <Film className="mx-auto text-gray-300 mb-4" size={48} />
 <p className="text-gray-500 dark:text-gray-400 font-medium">@{username} aún no ha calificado ninguna película.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {movies.map((rev: any) => {
 const m = rev.movie;
 if (!m) return null;

 return (
 <Link
 key={rev.id}
 href={`/movies/view/${m.slug}`}
 className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-2 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
 >
 <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-800 rounded-[2rem] mb-4 overflow-hidden flex items-center justify-center text-4xl group-hover:scale-[1.02] transition-transform">
 {m.image_url ? (
 <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
 ) : '🎬'}
 <div className="absolute bottom-3 right-3">
 <StaticRating
 rating={rev.rating}
 total={rev.rating}
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
 {rev.personal_review}
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
 );
 })}
 </div>
 )}
 </main>
 );
}
