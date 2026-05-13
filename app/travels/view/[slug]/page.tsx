import { createClient } from '@/utils/supabase/server'
import { MapPin, Calendar, Plane, Home, Users, Banknote, Compass } from 'lucide-react'
import Link from 'next/link'
import DeleteButton from '@/app/components/database/DeleteItem'
import PageHeader from '@/app/components/ui/SectionHeader'
import RatingDisplay from '@/app/components/database/RatingDisplay'
import ButtonAction from '@/app/components/ui/ButtonAction'
import TravelMapViewer from '@/app/components/database/TravelMapViewer'
import { Images } from 'lucide-react'

import { getProfile } from '@/library/get-user-data';
import { getTranslation } from '@/library/language/translate';

function diffDays(start?: string, end?: string): number | null {
 if (!start || !end) return null;
 const s = new Date(start).getTime();
 const e = new Date(end).getTime();
 if (isNaN(s) || isNaN(e) || e < s) return null;
 return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

function fmtDate(d?: string) {
 if (!d) return null;
 return new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function TravelView({ params }: { params: { slug: string } }) {
 const supabase = await createClient()
 const { slug } = await params

 const [{ data: { user: authUser } }, profile, { data: travel, error }] = await Promise.all([
 supabase.auth.getUser(),
 getProfile(),
 supabase
 .from('travels')
 .select(`*, album:albums!travels_album_id_fkey ( id, title, slug, album_photos ( image_url, display_order ) )`)
 .eq('slug', slug)
 .single(),
 ])

 const t = getTranslation(profile?.languaje);

 if (error || !travel) {
 return (
 <main className="p-6 max-w-7xl mx-auto text-black dark:text-white">
 <div className="text-6xl mb-4">✈️</div>

 <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
 {t.travels.notFound}
 </h1>

 <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
 {t.travels.notFoundmessage}
 </p>

 <div className="flex gap-4">
 <Link
 href="/"
 className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-95"
 >
 {t.global.explore}
 </Link>
 <Link
 href="/travels"
 className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
 >
 {t.travels.myTravels}
 </Link>
 </div>
 </main>
 )
 }

 let existingReview = null;
 if (authUser) {
 const { data } = await supabase
 .from('travel_reviews')
 .select('rating, personal_review')
 .eq('item_id', travel.id)
 .eq('user_id', authUser.id)
 .single();
 existingReview = data;
 }

 const myRatingData = {
 itemId: travel.id,
 tableName: "travel_reviews",
 userId: authUser?.id,
 initialRating: existingReview?.rating,
 initialReview: existingReview?.personal_review
 };

 const days = diffDays(travel.start_date, travel.end_date);

 return (
 <main className="p-6 max-w-7xl mx-auto text-black dark:text-white">
 {travel.image_url && (
 <div className="aspect-[16/5] w-full rounded-[2.5rem] overflow-hidden mb-8">
 <img src={travel.image_url} alt={travel.name} className="w-full h-full object-cover" />
 </div>
 )}

 <PageHeader
 title={`${travel.name}`}
 back
 description={travel.description}
 ratingConfig={myRatingData}
 />

 <article className="max-w-7xl mx-auto space-y-8">
 {/* Fila superior: rating + acciones */}
 <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div className="flex items-center gap-3">
 <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
 <RatingDisplay itemId={travel.id} tableName="travel_reviews" size={18} />
 </div>
 </div>

 {authUser?.id === travel.user_id && (
 <div className="flex gap-2 pr-2">
 <ButtonAction variant='edit' href={`/travels/edit/${travel.id}`} >
 {t.global.edit}
 </ButtonAction>
 <DeleteButton itemId={travel.id} tableName='travels' redirectPath="/travels" />
 </div>
 )}
 </header>

 {/* Pills: tipo + presupuesto */}
 <section className='flex flex-wrap items-center justify-between gap-4'>
 <div className="flex flex-wrap gap-2">
 {travel.trip_type?.split(',').map((tag: string) => (
 <span key={tag} className="text-[10px] font-black uppercase tracking-tighter text-orange-700 bg-orange-100/50 px-3 py-1.5 rounded-xl border border-orange-100">
 {tag.trim()}
 </span>
 ))}
 </div>

 {travel.budget_range && (
 <div className='flex items-center gap-2 bg-green-50 px-4 py-2 rounded-2xl border border-green-100'>
 <Banknote size={16} className="text-green-600" strokeWidth={2.5} />
 <span className="text-sm font-black text-green-700">{travel.budget_range}</span>
 </div>
 )}
 </section>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

 {/* Columna izquierda: contenido */}
 <div className="lg:col-span-2 space-y-8">

 {/* Historia */}
 <section className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
 <div className="flex items-center gap-3 mb-6">
 <div className="bg-orange-500 p-2.5 rounded-2xl text-white">
 <Compass size={24} />
 </div>
 <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{t.travels.story}</h2>
 </div>
 <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed text-lg italic">
 {travel.long_description || t.global.notDescripton}
 </p>
 </section>

 {/* Ubicación — mapa interactivo */}
 <section className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
 <div className="flex items-center gap-3 mb-6">
 <div className="bg-blue-500 p-2.5 rounded-2xl text-white">
 <MapPin size={24} />
 </div>
 <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{t.travels.destination}</h2>
 </div>
 <TravelMapViewer locations={Array.isArray(travel.visited_locations) ? travel.visited_locations : []} />
 </section>

 {/* Álbum vinculado */}
 {travel.album && (() => {
 const albumPhotos = (travel.album.album_photos || []) as { image_url: string; display_order: number }[]
 const sorted = [...albumPhotos].sort((p, q) => p.display_order - q.display_order)
 const cover = sorted[0]?.image_url
 const preview = sorted.slice(0, 4)
 return (
 <Link
 href={`/albums/view/${travel.album.slug}`}
 className="block group bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all"
 >
 <div className="flex items-center gap-3 mb-6">
 <div className="bg-purple-500 p-2.5 rounded-2xl text-white">
 <Images size={24} />
 </div>
 <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{t.travels.album.title}</h2>
 </div>
 <div className="flex flex-col md:flex-row gap-6 items-start">
 <div className="flex-shrink-0 w-full md:w-48 aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
 {cover ? (
 <img src={cover} alt={travel.album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
 ) : (
 <div className="w-full h-full flex items-center justify-center">
 <Images size={48} className="text-gray-300" />
 </div>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-2">
 {albumPhotos.length} {t.travels.album.photos}
 </p>
 <h3 className="text-3xl font-black mb-3">{travel.album.title}</h3>
 {preview.length > 1 && (
 <div className="grid grid-cols-4 gap-2 mt-4">
 {preview.slice(1).map((p, i) => (
 <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
 <img src={p.image_url} alt="" className="w-full h-full object-cover" />
 </div>
 ))}
 </div>
 )}
 <p className="text-xs font-bold uppercase tracking-widest text-orange-600 group-hover:text-orange-700 mt-4 inline-flex items-center gap-1">
 {t.travels.album.viewAlbum} →
 </p>
 </div>
 </div>
 </Link>
 )
 })()}
 </div>

 {/* Columna derecha: sidebar */}
 <aside className="space-y-8">

 {/* Fechas */}
 {(travel.start_date || travel.end_date) && (
 <div className="bg-black dark:bg-gray-950 text-white p-8 rounded-[3rem] shadow-xl shadow-gray-200">
 <div className="flex items-center gap-3 mb-6">
 <Calendar size={20} className="text-orange-500" />
 <h3 className="text-sm font-black uppercase tracking-[0.2em]">{t.travels.dates}</h3>
 </div>
 <div className="space-y-3">
 {travel.start_date && (
 <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
 <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{t.travels.startDate}</span>
 <span className="font-black">{fmtDate(travel.start_date)}</span>
 </div>
 )}
 {travel.end_date && (
 <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
 <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{t.travels.endDate}</span>
 <span className="font-black">{fmtDate(travel.end_date)}</span>
 </div>
 )}
 {days !== null && (
 <div className="flex justify-between items-center text-sm">
 <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Total</span>
 <span className="font-black text-orange-400">{days} {t.travels.days}</span>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Detalles */}
 {(travel.companions || travel.transport || travel.accommodation) && (
 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
 <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-6">{t.travels.details}</h3>
 <div className="space-y-4">
 {travel.companions && (
 <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800">
 <div className="bg-white dark:bg-gray-900 p-2 rounded-lg shadow-sm">
 <Users size={20} />
 </div>
 <div>
 <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t.travels.companions}</p>
 <p className="font-bold">{travel.companions}</p>
 </div>
 </div>
 )}
 {travel.transport && (
 <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800">
 <div className="bg-white dark:bg-gray-900 p-2 rounded-lg shadow-sm">
 <Plane size={20} />
 </div>
 <div>
 <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t.travels.transport}</p>
 <p className="font-bold">{travel.transport}</p>
 </div>
 </div>
 )}
 {travel.accommodation && (
 <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800">
 <div className="bg-white dark:bg-gray-900 p-2 rounded-lg shadow-sm">
 <Home size={20} />
 </div>
 <div>
 <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t.travels.accommodation}</p>
 <p className="font-bold">{travel.accommodation}</p>
 </div>
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
