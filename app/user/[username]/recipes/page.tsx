import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/app/components/ui/SectionHeader'
import Heading from '@/app/components/ui/Heading'
import FilterBarRecipe from '@/app/components/filter/FilterBarRecipe'
import StaticRating from '@/app/components/ui/StaticRating'

//import { useTranslation } from '@/app/components/context/LanguageProvider';
import { getProfile } from '@/library/get-user-data';
import { getTranslation } from '@/library/language/translate';

export default async function UserRecipesPage({
 params,
 searchParams
}: {
 params: Promise<{ username: string }>,
 searchParams: Promise<{ [key: string]: string | undefined }>
}) {
 const supabase = await createClient()

 // 1. Unwrapping params (Requerido en Next.js 15)
 const { username } = await params
 const searchparams = await searchParams

 const profileuser = await getProfile();
 const t = getTranslation(profileuser?.languaje);

 // 2. Obtener el usuario logueado actualmente (si existe)
 const { data: { user: authUser } } = await supabase.auth.getUser()


 const { data: profile, error: profileError } = await supabase
 .from('profiles')
 .select('id, username, avatar_url, biography')
 .eq('username', username)
 .single()

 if (profileError || !profile) {
 notFound()
 }

 // 4. LÓGICA DE PRIVACIDAD:
 // ¿Es el dueño viendo su propio perfil?
 const isOwner = authUser?.id === profile.id

 // 3. Buscar el perfil del username de la URL
 /* new codem filter */
 let query = supabase
 .from('recipes')
 .select(`
 *,
 recipe_reviews (
 rating
 )
 `)
 .eq('user_id', profile.id)
 .order('created_at', { ascending: false })

 if (searchparams.name) query = query.ilike('title', `%${searchparams.name}%`)
 if (searchparams.tags) {
 // 1. Limpiamos y separamos la búsqueda del usuario: "birria, tacos" -> ["birria", "tacos"]
 const tags = searchparams.tags.split(/[ ,]+/).filter(Boolean);

 if (tags.length > 0) {
 // 2. Construimos un filtro que busque CUALQUIERA de esas palabras
 // Esto genera algo como: tags.ilike.%birria%,tags.ilike.%tacos%
 const orFilter = tags.map(tags => `tags.ilike.%${tags}%`).join(',');
 query = query.or(orFilter);
 }
 }

 // Si NO es el dueño, filtramos para mostrar SOLO las públicas (0)
 if (!isOwner) {
 query = query.eq('permission', 0)
 }

 const { data: rawRecipes } = await query.limit(50)

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

 return (
 <main className="p-6 max-w-7xl mx-auto text-black dark:text-white">
 {/* Encabezado del Perfil */}
 <PageHeader
 title={`${t.recipes.recipes} ${username}`}
 back
 />

 {/* USANDO EL COMPONENTE REUTILIZABLE */}
 <FilterBarRecipe
 params={searchparams}
 basePath={`/user/${username}/recipes`}
 />

 <div className="flex justify-between items-end mb-6">
 <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
 {isOwner ? t.recipes.allRecipes : t.recipes.recipes}
 </h2>
 <span className="text-sm text-gray-500 dark:text-gray-400">{recipes?.length || 0} {t.recipes.found}</span>
 </div>

 {/* Lista de Recetas */}
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
 <div className="relative aspect-[16/10] bg-gray-100 dark:bg-gray-800 rounded-[2rem] mb-4 flex items-center justify-center text-4xl group-hover:scale-[1.02] transition-transform">
 {recipe.cuisine_type?.toLowerCase().includes('piz') ? '🍕' :
 recipe.cuisine_type?.toLowerCase().includes('hamb') ? '🍔' :
 recipe.cuisine_type?.toLowerCase().includes('mex') ? '🌮' : '🍽️'}
 {/* Rating flotante sobre la "imagen" */}
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
 </div>
 ))}
 </div>
 )}
 </main>
 )
}