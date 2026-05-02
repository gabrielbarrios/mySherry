import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import PageHeader from '@/app/components/ui/SectionHeader';
import { Utensils } from 'lucide-react';
import Link from 'next/link';
import Heading from '@/app/components/ui/Heading';
import StaticRating from '@/app/components/ui/StaticRating';
import FilterBarRestaurant from '@/app/components/filter/FilterBarRestaurt';

export default async function UserRestaurantsPage({
    params,
    searchParams
}: {
    params: Promise<{ username: string }>,
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const supabase = await createClient();
    const { username } = await params;
    const sercparams = await searchParams

    // 1. Buscamos el perfil para obtener el ID real del usuario
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', username)
        .single();

    if (!profile) return notFound();

    // 2. Traemos los restaurantes calificados por este usuario
    // Usamos item_id para conectar con la tabla restaurants
    let query = supabase
        .from('restaurant_reviews')
        .select(`
            id,
            rating,
            personal_review,
            created_at,
            restaurant:restaurants!restaurant_reviews_item_id_fkey (
                id,
                name,
                city,
                cuisine_type,
                slug,
                state,
                country,
                address,
                price_range
            )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

    if (sercparams.name) query = query.ilike('restaurant.name', `%${sercparams.name}%`)
    if (sercparams.city) query = query.ilike('restaurant.city', `%${sercparams.city}%`)
    if (sercparams.state) query = query.ilike('restaurant.state', `%${sercparams.state}%`)
    if (sercparams.country) query = query.ilike('restaurant.country', `%${sercparams.country}%`)
    if (sercparams.address) query = query.ilike('restaurant.address', `%${sercparams.address}%`)
    if (sercparams.price) query = query.eq('restaurant.price_range', sercparams.price)
    if (sercparams.cuisine) {
        // 1. Limpiamos y separamos la búsqueda del usuario: "birria, tacos" -> ["birria", "tacos"]
        const tags = sercparams.cuisine.split(/[ ,]+/).filter(Boolean);

        if (tags.length > 0) {
            // 2. Construimos un filtro que busque CUALQUIERA de esas palabras
            // Esto genera algo como: cuisine_type.ilike.%birria%,cuisine_type.ilike.%tacos%
            const orFilter = tags.map(tag => `restaurant.cuisine_type.ilike.%${tag}%`).join(',');
            query = query.or(orFilter);
        }
    }

    const { data: restaurants, error } = await query.limit(10)

    return (
        <main className="p-6 max-w-7xl mx-auto text-black">
            <PageHeader
                title={`Restaurantes Calificados por @${username}`}
                description="Sitios recomendados y calificaciones"
                back
            />
            {/* PANEL DE BUSQUEDA Y FILTROS */}
            <FilterBarRestaurant params={sercparams} />
            {/* Grid de Restaurantes */}
            {!restaurants || restaurants.length === 0 ? (
                <div className="mt-20 text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <Utensils className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500 font-medium">@{username} aún no ha calificado ningún restaurante.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {restaurants.map((rev: any) => {
                        const res = rev.restaurant;
                        if (!res) return null;

                        return (
                            <Link
                                key={rev.id}
                                href={`/restaurants/view/${res.slug}`}
                                className="group flex flex-col bg-white border border-gray-100 rounded-[2.5rem] p-2 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Placeholder para imagen (luego puedes agregar fotos reales) */}
                                <div className="relative aspect-[16/10] bg-gray-100 rounded-[2rem] mb-4 flex items-center justify-center text-4xl group-hover:scale-[1.02] transition-transform">
                                    {res.cuisine_type?.toLowerCase().includes('piz') ? '🍕' :
                                        res.cuisine_type?.toLowerCase().includes('hamb') ? '🍔' :
                                            res.cuisine_type?.toLowerCase().includes('mex') ? '🌮' : '🍽️'}
                                    {/* Rating flotante sobre la "imagen" */}
                                    <div className="absolute bottom-3 right-3">
                                        <StaticRating
                                            rating={rev.rating}
                                            total={rev.rating}
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
                                    <p className="text-gray-500 text-sm line-clamp-1 mb-4 italic">
                                        {rev.personal_review}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2.5">
                                        <span>{res.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                        <span className="bg-gray-100 px-2 py-1 rounded-lg">📍 {res.city}</span>
                                        <span>•</span>
                                        <span>{res.state}</span>
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