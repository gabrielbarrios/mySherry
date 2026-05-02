import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import PageHeader from '../components/ui/SectionHeader'
import Heading from '../components/ui/Heading'
import FilterBarRestaurant from '../components/filter/FilterBarRestaurt'
import StaticRating from '../components/ui/StaticRating'

import { getProfile } from '@/library/get-user-data';
import { getTranslation } from '@/library/language/translate';

export default async function RestaurantsPage({
 searchParams
}: {
 searchParams: Promise<{ [key: string]: string | undefined }>
}) {
 const supabase = await createClient()
 const params = await searchParams

 const profile = await getProfile();
 const t = getTranslation(profile?.languaje);

 // 1. Construcción de la Query con filtros dinámicos
 let query = supabase
 .from('restaurants')
 .select(`
 *,
 reviews:restaurant_reviews!restaurant_reviews_item_id_fkey (
 rating
 )
 `)

 if (params.name) query = query.ilike('name', `%${params.name}%`)
 if (params.city) query = query.ilike('city', `%${params.city}%`)
 if (params.state) query = query.ilike('state', `%${params.state}%`)
 if (params.country) query = query.ilike('country', `%${params.country}%`)
 if (params.address) query = query.ilike('address', `%${params.address}%`)
 if (params.price) query = query.eq('price_range', params.price)
 if (params.cuisine) {
 // 1. Limpiamos y separamos la búsqueda del usuario: "birria, tacos" -> ["birria", "tacos"]
 const tags = params.cuisine.split(/[ ,]+/).filter(Boolean);

 if (tags.length > 0) {
 // 2. Construimos un filtro que busque CUALQUIERA de esas palabras
 // Esto genera algo como: cuisine_type.ilike.%birria%,cuisine_type.ilike.%tacos%
 const orFilter = tags.map(tag => `cuisine_type.ilike.%${tag}%`).join(',');
 query = query.or(orFilter);
 }
 }


 // Si no hay filtros, limitamos a 10 (Por defecto)
 const { data: rawRestaurants, error } = await query.limit(10)

 const restaurants = rawRestaurants?.map(res => {
 const reviews = res.reviews || [];
 const totalVotes = reviews.length;
 const avg = totalVotes > 0
 ? reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / totalVotes
 : 0;

 return {
 ...res,
 averageRating: Math.round(avg),
 totalVotes: totalVotes
 };
 });

 return (
 <main className="p-6 max-w-7xl mx-auto text-black dark:text-white">
 {/* Encabezado */}
 <PageHeader
 title={t.restaurants.restaurants}
 description={t.restaurants.description}
 buttonText={t.restaurants.add}
 buttonHref='/restaurants/create'
 variant='create'
 back
 />

 {/* PANEL DE BUSQUEDA Y FILTROS */}
 <FilterBarRestaurant params={params} />

 {/* RESULTADOS */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {restaurants?.map((res) => (
 <Link
 key={res.id}
 href={`/restaurants/view/${res.slug}`}
 className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-2 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
 >
 <div className="relative aspect-[16/10] bg-gray-100 dark:bg-gray-800 rounded-[2rem] mb-4 overflow-hidden flex items-center justify-center text-4xl group-hover:scale-[1.02] transition-transform">
 {res.image_url ? (
 <img src={res.image_url} alt={res.name} className="w-full h-full object-cover" />
 ) : (
 res.cuisine_type?.toLowerCase().includes('piz') ? '🍕' :
 res.cuisine_type?.toLowerCase().includes('hamb') ? '🍔' :
 res.cuisine_type?.toLowerCase().includes('mex') ? '🌮' : '🍽️'
 )}
 <div className="absolute bottom-3 right-3">
 <StaticRating
 rating={res.averageRating}
 total={res.totalVotes}
 />
 </div>
 </div>

 <div className="px-4 pb-4">
 {/* Dentro de la tarjeta del restaurante */}
 <div className="flex flex-wrap gap-2 mb-3">
 {res.cuisine_type?.split(',').map((tag: string) => (
 <span
 key={tag}
 className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-1 rounded-lg"
 >
 {tag.trim()}
 </span>
 ))}
 </div>
 <Heading level="h2">{res.name}</Heading>
 <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1 mb-4 italic">
 {res.description}
 </p>
 <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 mb-2.5">
 <span>{res.address}</span>
 </div>
 <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
 <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">📍 {res.city}</span>
 <span>•</span>
 <span>{res.state}</span>
 </div>
 </div>
 </Link>
 ))}
 </div>

 {restaurants?.length === 0 && (
 <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-800">
 <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">{t.global.noFound}</p>
 <Link href="/restaurants" className="text-orange-600 font-bold underline mt-2 block">{t.restaurants.seeAll}</Link>
 </div>
 )}
 </main>
 )
}