import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import DeleteButton from '@/app/components/database/DeleteItem'
import PageHeader from '@/app/components/ui/SectionHeader'
import ButtonAction from '@/app/components/ui/ButtonAction'
import { Users, Clock, Utensils, ClipboardList, ChefHat, CheckCircle2 } from 'lucide-react';
import RatingDisplay from '@/app/components/database/RatingDisplay'


import { getProfile } from '@/library/get-user-data';
import { getTranslation } from '@/library/language/translate';

export default async function ViewRecipePage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const supabase = await createClient()
    const { slug } = await params

    const [{ data: { user: authUser } }, profileuser] = await Promise.all([
        supabase.auth.getUser(),
        getProfile(),
    ])

    const t = getTranslation(profileuser?.languaje);

    const currentUserId = authUser?.id || '00000000-0000-0000-0000-000000000000';
    const { data: recipe, error } = await supabase
        .from('recipes')
        .select(`
        *,
        profiles!user_id (
            username
        )
    `)
        .eq('slug', slug)
        .or(`user_id.eq.${currentUserId},permission.eq.0`)
        .single();

    // Si no existe o no tenemos permiso (RLS), 404
    if (error || !recipe) {
        return (
            <main className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center text-black">
                {/* Un icono grande y visual */}
                <div className="text-6xl mb-4">🔍</div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t.recipes.noFound}
                </h1>

                <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                    {t.recipes.noFoundmessage}
                </p>

                <div className="flex gap-4">
                    {/* Botón para volver a la lista general */}
                    <Link
                        href="/"
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-95"
                    >
                        {t.recipes.explore}
                    </Link>

                    {/* Botón secundario para ir a sus propias recetas */}
                    <Link
                        href="/recipes"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
                    >
                        {t.recipes.myRecipes}
                    </Link>

                </div>

                {/* Pequeño detalle técnico por si eres tú el que está desarrollando */}
                {/* 
                }
                {process.env.NODE_ENV === 'development' && error && (
                    <details className="mt-10 text-left w-full max-w-lg opacity-50">
                        <summary className="text-xs cursor-pointer text-gray-400">Ver detalle técnico (Solo Dev)</summary>
                        <pre className="text-[10px] bg-gray-50 p-2 rounded mt-2 overflow-auto">
                            {JSON.stringify(error, null, 2)}
                        </pre>
                    </details>
                )}
                {*/}
            </main>
        )
    }

    let existingReview = null;

    if (authUser) {
        const { data } = await supabase
            .from('recipe_reviews')
            .select('rating, personal_review')
            .eq('item_id', recipe.id)
            .eq('user_id', authUser.id)
            .single();

        existingReview = data;
    }

    const myRatingData = {
        itemId: recipe.id,
        tableName: "recipe_reviews",
        userId: authUser?.id,
        initialRating: existingReview?.rating,
        initialReview: existingReview?.personal_review
    };

    return (
        <main className="p-6 max-w-7xl mx-auto text-black">
            {/* Botón Volver */}
            <PageHeader
                title={recipe.title}
                description={recipe.description}
                back
                ratingConfig={myRatingData}
            />


            <article className="bg-white border rounded-3xl shadow-sm overflow-hidden">
                {recipe.image_url && (
                    <div className="aspect-[16/6] w-full overflow-hidden">
                        <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="p-8">
                {/* Cabecera */}
                <header className="mb-10 border-b border-gray-100 pb-8">
                    {/* Fila Superior: Badge de Privacidad y Acciones de Dueño */}
                    <div className="flex justify-between items-center mb-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] ${recipe.permission === 0
                            ? 'bg-green-50 text-green-600 border border-green-100'
                            : 'bg-gray-50 text-gray-500 border border-gray-100'
                            }`}>
                            {recipe.permission === 0 ? '🔓 Pública' : '🔒 Privada'}
                        </span>

                        {authUser?.id === recipe.user_id && (
                            <div className="flex gap-2">
                                <ButtonAction
                                    variant='edit'
                                    href={`/recipes/edit/${recipe.id}`}
                                    className="px-4 py-2 text-xs" // Más pequeño para no robar protagonismo
                                >
                                    {t.global.edit}
                                </ButtonAction>
                                <DeleteButton
                                    itemId={recipe.id}
                                    tableName='recipes'
                                    redirectPath="/recipes"
                                />
                            </div>
                        )}
                    </div>

                    {/* Fila Principal: Autor e Info vs Calificación */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">

                        {/* Info del Autor */}
                        <div className="flex items-center gap-4">
                            {/* Avatar Placeholder (Círculo con inicial) */}
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl uppercase">
                                {recipe.profiles?.username?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-0.5">{t.recipes.author}</p>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/user/${recipe.profiles?.username}/recipes`}
                                        className="text-gray-900 hover:text-orange-600 font-bold text-lg transition-colors"
                                    >
                                        @{recipe.profiles?.username}
                                    </Link>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-gray-500 text-sm">
                                        {new Date(recipe.created_at).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Cuadro de Calificación Estilizado */}
                        <div className="bg-white px-2 py-1 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center md:items-end gap-1">
                            <RatingDisplay
                                itemId={recipe.id}
                                tableName="recipe_reviews"
                                size={20}
                            />
                        </div>
                    </div>
                </header>

                <div className="grid gap-10">
                    {/* Sección Tags - NUmero de personas - Duracion */}
                    <section className='flex flex-wrap items-center justify-between gap-4 mb-4'>
                        {/* Etiquetas (Tags) */}
                        <div className="flex flex-wrap gap-2">
                            {recipe.tags?.split(',').map((tag: string) => (
                                <span
                                    key={tag}
                                    className="text-[10px] font-black uppercase tracking-tighter text-orange-700 bg-orange-100/50 px-2.5 py-1 rounded-md border border-orange-100"
                                >
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>

                        {/* Info de Cocina (Tiempo y Raciones) */}
                        <div className='flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-100'>
                            {/* Duración */}
                            <div className='flex items-center gap-1.5 text-gray-600 border-r border-gray-200 pr-3'>
                                <Clock size={14} className="text-orange-500" strokeWidth={2.5} />
                                <span className="text-xs font-bold">{recipe.duration}m</span>
                            </div>

                            {/* Raciones */}
                            <div className='flex items-center gap-1.5 text-gray-600'>
                                <Users size={14} className="text-orange-500" strokeWidth={2.5} />
                                <span className="text-xs font-bold">{recipe.servings}</span>
                            </div>
                        </div>
                    </section>


                    {/* Sección Descripción */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-orange-500 p-2 rounded-xl text-white shadow-sm shadow-orange-200">
                                <ClipboardList size={20} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{t.global.description}</h2>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <p className="text-gray-600 leading-relaxed italic">
                                "{recipe.long_description}"
                            </p>
                        </div>
                    </section>

                    {/* Sección Ingredientes */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-orange-500 p-2 rounded-xl text-white shadow-sm shadow-orange-200">
                                <Utensils size={20} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{t.global.ingredients}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:grid-cols-3">
                            {recipe.ingredients?.split('\n')
                                .filter((i: string) => i.trim() !== '') // Especificamos que 'i' es string
                                .map((ing: string, index: number) => (  // Especificamos 'ing' y 'index'
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group"
                                    >
                                        <CheckCircle2 size={18} className="text-orange-400 group-hover:text-orange-600 transition-colors" />
                                        <span className="text-gray-700 font-medium">{ing.trim()}</span>
                                    </div>
                                ))}
                        </div>
                    </section>

                    {/* Sección Instrucciones */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-orange-500 p-2 rounded-xl text-white shadow-sm shadow-orange-200">
                                <ChefHat size={20} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{t.global.instructions}</h2>
                        </div>
                        <div className="relative space-y-8 pl-4">
                            {/* Línea vertical decorativa */}
                            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-to-b from-orange-200 via-orange-100 to-transparent"></div>

                            {recipe.instructions?.split('\n').filter((p: string) => p.trim() !== '').map((step: string, index: number) => (
                                <div key={index} className="relative pl-8">
                                    {/* El número del paso */}
                                    <span className="absolute left-[-11px] top-0 flex items-center justify-center w-6 h-6 bg-orange-500 text-white text-[10px] font-black rounded-full ring-4 ring-white">
                                        {index + 1}
                                    </span>
                                    <p className="text-gray-700 leading-relaxed pt-0.5">
                                        {step.trim()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
                </div>
            </article>

            {/* Footer de la página */}
            <div className="mt-10 text-center text-gray-400 text-sm">
                {t.recipes.niceMessage}
            </div>
        </main>
    )
}