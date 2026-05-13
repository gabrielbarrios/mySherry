import { createClient } from '@/utils/supabase/server'
import { Film, Calendar, Clock, Globe, Languages, PlayCircle, Tv } from 'lucide-react'
import Link from 'next/link'
import DeleteButton from '@/app/components/database/DeleteItem'
import PageHeader from '@/app/components/ui/SectionHeader'
import RatingDisplay from '@/app/components/database/RatingDisplay'
import ButtonAction from '@/app/components/ui/ButtonAction'

import { getProfile } from '@/library/get-user-data';
import { getTranslation } from '@/library/language/translate';

export default async function MovieView({ params }: { params: { slug: string } }) {
 const supabase = await createClient()
 const { slug } = await params

 const [{ data: { user: authUser } }, profile, { data: movie, error }] = await Promise.all([
 supabase.auth.getUser(),
 getProfile(),
 supabase.from('movies').select('*').eq('slug', slug).single(),
 ])

 const t = getTranslation(profile?.languaje);

 if (error || !movie) {
 return (
 <main className="p-6 max-w-7xl mx-auto text-black dark:text-white">
 <div className="text-6xl mb-4">🎬</div>

 <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
 {t.movies.notFound}
 </h1>

 <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
 {t.movies.notFoundmessage}
 </p>

 <div className="flex gap-4">
 <Link
 href="/"
 className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-95"
 >
 {t.global.explore}
 </Link>
 <Link
 href="/movies"
 className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
 >
 {t.movies.myMovies}
 </Link>
 </div>
 </main>
 )
 }

 let existingReview = null;

 if (authUser) {
 const { data } = await supabase
 .from('movie_reviews')
 .select('rating, personal_review')
 .eq('item_id', movie.id)
 .eq('user_id', authUser.id)
 .single();

 existingReview = data;
 }
 const myRatingData = {
 itemId: movie.id,
 tableName: "movie_reviews",
 userId: authUser?.id,
 initialRating: existingReview?.rating,
 initialReview: existingReview?.personal_review
 };

 return (
 <main className="p-6 max-w-7xl mx-auto text-black dark:text-white">
 <PageHeader
 title={`${movie.name}`}
 back
 description={movie.description}
 ratingConfig={myRatingData}
 />

 <article className="max-w-7xl mx-auto space-y-8">
 {/* Fila Superior: Rating + Acciones */}
 <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div className="flex items-center gap-3">
 <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
 <RatingDisplay itemId={movie.id} tableName="movie_reviews" size={18} />
 </div>
 </div>

 {authUser?.id === movie.user_id && (
 <div className="flex gap-2 pr-2">
 <ButtonAction variant='edit' href={`/movies/edit/${movie.id}`} >
 {t.global.edit}
 </ButtonAction>
 <DeleteButton itemId={movie.id} tableName='movies' redirectPath="/movies" />
 </div>
 )}
 </header>

 {/* Pills: género + año */}
 <section className='flex flex-wrap items-center justify-between gap-4'>
 <div className="flex flex-wrap gap-2">
 {movie.genre?.split(',').map((tag: string) => (
 <span key={tag} className="text-[10px] font-black uppercase tracking-tighter text-orange-700 bg-orange-100/50 px-3 py-1.5 rounded-xl border border-orange-100">
 {tag.trim()}
 </span>
 ))}
 </div>

 {movie.release_year && (
 <div className='flex items-center gap-2 bg-green-50 px-4 py-2 rounded-2xl border border-green-100'>
 <Calendar size={16} className="text-green-600" strokeWidth={2.5} />
 <span className="text-sm font-black text-green-700">{movie.release_year}</span>
 </div>
 )}
 </section>

 {/* Layout dos columnas */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

 {/* Columna izquierda: contenido */}
 <div className="lg:col-span-2 space-y-8">

 {/* Póster */}
 {movie.image_url && (
 <div className="aspect-[2/3] max-w-md mx-auto w-full rounded-[2.5rem] overflow-hidden">
 <img src={movie.image_url} alt={movie.name} className="w-full h-full object-cover" />
 </div>
 )}

 {/* Sinopsis */}
 <section className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
 <div className="flex items-center gap-3 mb-6">
 <div className="bg-orange-500 p-2.5 rounded-2xl text-white">
 <Film size={24} />
 </div>
 <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{t.movies.synopsis}</h2>
 </div>
 <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed text-lg italic">
 {movie.long_description || t.global.notDescripton}
 </p>
 </section>
 </div>

 {/* Columna derecha: sidebar */}
 <aside className="space-y-8">

 {/* Ficha técnica */}
 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
 <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-6">{t.movies.details}</h3>
 <div className="space-y-3 text-sm">
 {movie.director && (
 <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
 <span className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest">{t.movies.director}</span>
 <span className="font-black">{movie.director}</span>
 </div>
 )}
 {movie.duration_minutes && (
 <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
 <span className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1"><Clock size={12} />{t.movies.duration}</span>
 <span className="font-black">{movie.duration_minutes} min</span>
 </div>
 )}
 {movie.language && (
 <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
 <span className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1"><Languages size={12} />{t.movies.language}</span>
 <span className="font-black">{movie.language}</span>
 </div>
 )}
 {movie.country && (
 <div className="flex justify-between items-center">
 <span className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1"><Globe size={12} />{t.movies.country}</span>
 <span className="font-black">{movie.country}</span>
 </div>
 )}
 </div>
 </div>

 {/* Enlaces */}
 {(movie.trailer_url || movie.where_to_watch) && (
 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
 <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-6">{t.global.contact}</h3>
 <div className="space-y-4">
 {movie.trailer_url && (
 <a href={movie.trailer_url} target="_blank" className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100 group">
 <div className="bg-white dark:bg-gray-900 p-2 rounded-lg shadow-sm group-hover:text-red-600">
 <PlayCircle size={20} />
 </div>
 <span className="font-bold">{t.movies.trailerUrl}</span>
 </a>
 )}
 {movie.where_to_watch && (
 <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-transparent">
 <div className="bg-white dark:bg-gray-900 p-2 rounded-lg shadow-sm">
 <Tv size={20} />
 </div>
 <span className="font-bold">{movie.where_to_watch}</span>
 </div>
 )}
 </div>
 </div>
 )}
 </aside>
 </div>
 </article>
 </main>
 )
}
