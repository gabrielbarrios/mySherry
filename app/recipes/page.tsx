import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DeleteButton from '../components/database/DeleteItem'
import PageHeader from '../components/ui/SectionHeader'
import Heading from '../components/ui/Heading'
import FilterBarRecipe from '../components/filter/FilterBarRecipe'
import StaticRating from '../components/ui/StaticRating'

import { getProfile } from '@/library/get-user-data';
import { getTranslation } from '@/library/language/translate';

export default async function Page({
 searchParams
}: {
 searchParams: Promise<{ [key: string]: string | undefined }>
}) {
 const supabase = await createClient()
 const params = await searchParams

 const profile = await getProfile();
 // 4. Definimos el idioma basado en el perfil
 const t = getTranslation(profile?.languaje);

 // 1. Verificamos si hay usuario. Si no, redirigimos.
 const { data: { user }, error: authError } = await supabase.auth.getUser()

 if (!user || authError) {
 redirect('/login') // O la ruta de tu login
 }


 // 1. Construcción de la Query incluyendo las reseñas
 let query = supabase
 .from('recipes')
 .select(`
 *,
 recipe_reviews (
 rating
 )
 `)
 .eq('user_id', user.id)
 .order('created_at', { ascending: false });

 if (params.name) query = query.ilike('title', `%${params.name}%`)
 if (params.tags) {
 // 1. Limpiamos y separamos la búsqueda del usuario: "birria, tacos" -> ["birria", "tacos"]
 const tags = params.tags.split(/[ ,]+/).filter(Boolean);

 if (tags.length > 0) {
 // 2. Construimos un filtro que busque CUALQUIERA de esas palabras
 // Esto genera algo como: tags.ilike.%birria%,tags.ilike.%tacos%
 const orFilter = tags.map(tags => `tags.ilike.%${tags}%`).join(',');
 query = query.or(orFilter);
 }
 }

 // 2. Ejecutar la query
 const { data: rawRecipes, error } = await query.limit(50);

 // 3. Procesar los datos para calcular promedios
 const recipes = rawRecipes?.map(recipe => {
 const reviews = recipe.recipe_reviews || [];
 const totalVotes = reviews.length;
 const avg = totalVotes > 0
 ? reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / totalVotes
 : 0;

 return {
 ...recipe,
 averageRating: Math.round(avg),
 totalVotes: totalVotes
 };
 });

 /*
 // 2. Traemos SOLO las recetas del usuario logueado
 const { data: recipes, error } = await supabase
 .from('recipes')
 .select('*')
 .eq('user_id', user.id) // <--- FILTRO CRÍTICO
 .order('created_at', { ascending: false })
 */


 if (error) {
 return <p className="p-10 text-red-500">Error loading data: {error.message}</p>
 }

 return (
 <main className="p-6 max-w-7xl mx-auto text-black dark:text-white">
 <PageHeader
 title={t.recipes.top}
 description={t.recipes.description}
 buttonText={t.recipes.add}
 buttonHref='/recipes/create'
 variant='create'
 back
 />

 {/* USANDO EL COMPONENTE REUTILIZABLE */}
 <FilterBarRecipe
 params={params}
 basePath="/recipes"
 />

 {recipes?.length === 0 ? (
 <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
 <p className="text-gray-500 dark:text-gray-400">{t.recipes.noRecipe}</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {recipes?.map((recipe) => (
 /* 1. Cambiamos el Link principal por un div */
 <div
 key={recipe.id}
 className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-2 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative"
 >
 {/* 2. Envolvemos solo la parte visual en un Link */}
 <Link href={`/recipes/view/${recipe.slug}`} className="flex flex-col flex-grow">
 <div className="relative aspect-[16/10] bg-gray-100 dark:bg-gray-800 rounded-[2rem] mb-4 overflow-hidden flex items-center justify-center text-4xl group-hover:scale-[1.02] transition-transform">
 {recipe.image_url ? (
 <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
 ) : (
 recipe.cuisine_type?.toLowerCase().includes('piz') ? '🍕' :
 recipe.cuisine_type?.toLowerCase().includes('hamb') ? '🍔' :
 recipe.cuisine_type?.toLowerCase().includes('mex') ? '🌮' : '🍽️'
 )}
 <div className="absolute bottom-3 right-3">
 <StaticRating
 rating={recipe.averageRating}
 total={recipe.totalVotes}
 />
 </div>
 </div>

 <div className="px-4 pb-4">
 <div className="flex flex-wrap gap-2 mb-3">
 {recipe.tags?.split(',').map((tag: string) => (
 <span
 key={tag}
 className="text-[10px] font-black uppercase tracking-tighter text-orange-700 bg-orange-100/50 px-2.5 py-1 rounded-md border border-orange-100"
 >
 {tag.trim()}
 </span>
 ))}
 </div>

 <Heading level="h2">{recipe.title}</Heading>

 <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1 mb-4 italic">
 {recipe.description}
 </p>

 <div className="flex gap-3 mt-1">
 <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${recipe.permission === 0 ? 'bg-green-100 text-green-700' :
 recipe.permission === 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
 }`}>
 {recipe.permission === 0 ? '🔓 Public' : recipe.permission === 1 ? '👥 Friends' : '🔒 Private'}
 </span>
 <span className="text-xs text-gray-500 dark:text-gray-400">
 {new Date(recipe.created_at).toLocaleDateString()}
 </span>
 </div>
 </div>
 </Link>

 {/* 3. La zona de botones queda FUERA del Link anterior pero dentro del div principal */}
 <div className="flex justify-center gap-2 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800 mt-auto">
 <Link
 href={`/recipes/edit/${recipe.id}`}
 className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100 flex items-center justify-center"
 title={t.recipes.edit}
 >
 <span className="text-lg">✏️</span>
 </Link>

 <DeleteButton
 itemId={recipe.id}
 tableName='recipes'
 redirectPath="/recipes"
 />
 </div>
 </div>
 ))}
 </div>
 )}
 </main>
 )
}