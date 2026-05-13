import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import PageHeader from '@/app/components/ui/SectionHeader';
import { Plane, Map as MapIcon } from 'lucide-react';
import Link from 'next/link';
import Heading from '@/app/components/ui/Heading';
import StaticRating from '@/app/components/ui/StaticRating';
import FilterBarTravel from '@/app/components/filter/FilterBarTravel';

export default async function UserTravelsPage({
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

 // Trae los viajes CREADOS por el usuario, con sus reviews para sacar el rating promedio
 let query = supabase
 .from('travels')
 .select(`
 *,
 reviews:travel_reviews!travel_reviews_item_id_fkey (
 rating
 )
 `)
 .eq('user_id', profile.id)
 .order('start_date', { ascending: false });

 if (sercparams.name) query = query.ilike('name', `%${sercparams.name}%`)
 if (sercparams.country) query = query.ilike('visited_locations::text', `%${sercparams.country}%`)
 if (sercparams.budget) query = query.eq('budget_range', sercparams.budget)
 if (sercparams.type) {
 const tags = sercparams.type.split(/[ ,]+/).filter(Boolean);
 if (tags.length > 0) {
 const orFilter = tags.map(tag => `trip_type.ilike.%${tag}%`).join(',');
 query = query.or(orFilter);
 }
 }

 const { data: rawTravels } = await query.limit(20)

 const travels = rawTravels?.map(tr => {
 const reviews = tr.reviews || [];
 const totalVotes = reviews.length;
 const avg = totalVotes > 0
 ? reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / totalVotes
 : 0;
 return {
 ...tr,
 averageRating: Math.round(avg),
 totalVotes,
 };
 });

 const formatDateRange = (start?: string, end?: string) => {
 if (!start && !end) return null;
 const fmt = (d: string) => new Date(d).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
 if (start && end) return `${fmt(start)} → ${fmt(end)}`;
 return fmt((start || end)!);
 };

 return (
 <main className="p-6 max-w-7xl mx-auto text-black dark:text-white">
 <PageHeader
 title={`Viajes de @${username}`}
 description="Las aventuras que ha registrado"
 back
 />

 <div className="flex justify-end mb-6">
 <Link
 href={`/user/${username}/travels/map`}
 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-2xl shadow-sm"
 >
 <MapIcon size={14} />
 Ver en mapa
 </Link>
 </div>

 <FilterBarTravel params={sercparams} />
 {!travels || travels.length === 0 ? (
 <div className="mt-20 text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
 <Plane className="mx-auto text-gray-300 mb-4" size={48} />
 <p className="text-gray-500 dark:text-gray-400 font-medium">@{username} aún no ha registrado ningún viaje.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {travels.map((tr: any) => (
 <Link
 key={tr.id}
 href={`/travels/view/${tr.slug}`}
 className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-2 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
 >
 <div className="relative aspect-[16/10] bg-gray-100 dark:bg-gray-800 rounded-[2rem] mb-4 overflow-hidden flex items-center justify-center text-4xl group-hover:scale-[1.02] transition-transform">
 {tr.image_url ? (
 <img src={tr.image_url} alt={tr.name} className="w-full h-full object-cover" />
 ) : '✈️'}
 <div className="absolute bottom-3 right-3">
 <StaticRating
 rating={tr.averageRating}
 total={tr.totalVotes}
 />
 </div>
 </div>

 <div className="px-4 pb-4">
 <div className="flex flex-wrap gap-2 mb-3">
 {tr.trip_type?.split(',').map((tag: string) => (
 <span
 key={tag}
 className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-1 rounded-lg"
 >
 {tag.trim()}
 </span>
 ))}
 </div>
 <Heading level="h2">{tr.name}</Heading>
 <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1 mb-4 italic">
 {tr.description}
 </p>
 <div className="flex flex-wrap items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400 mb-2.5">
 <span>📍</span>
 {Array.isArray(tr.visited_locations) && tr.visited_locations.length > 0 ? (
 tr.visited_locations.slice(0, 3).map((loc: any, i: number) => (
 <span key={i} className="bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-lg">
 {loc.region_name ? `${loc.region_name}, ` : ''}{loc.country_name}
 </span>
 ))
 ) : (
 <span className="italic text-gray-400">Sin ubicaciones</span>
 )}
 {Array.isArray(tr.visited_locations) && tr.visited_locations.length > 3 && (
 <span className="italic">+{tr.visited_locations.length - 3} más</span>
 )}
 </div>
 {formatDateRange(tr.start_date, tr.end_date) && (
 <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
 <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">{formatDateRange(tr.start_date, tr.end_date)}</span>
 </div>
 )}
 </div>
 </Link>
 ))}
 </div>
 )}
 </main>
 );
}
