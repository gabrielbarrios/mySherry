import { createClient } from '@/utils/supabase/server' // Asegúrate de tener este helper de servidor
import { MapPin, Phone, Globe, Clock, Utensils, Tag, Banknote } from 'lucide-react' // Opcional: Instala lucide-react
import Link from 'next/link'
import DeleteButton from '@/app/components/database/DeleteItem'
import PageHeader from '@/app/components/ui/SectionHeader'
import RatingDisplay from '@/app/components/database/RatingDisplay'
import ButtonAction from '@/app/components/ui/ButtonAction'

import { getProfile } from '@/library/get-user-data';
import { getTranslation } from '@/library/language/translate';

export default async function RestaurantView({ params }: { params: { slug: string } }) {
    const supabase = await createClient()
    const { slug } = await params

    const [{ data: { user: authUser } }, profile, { data: restaurant, error }] = await Promise.all([
        supabase.auth.getUser(),
        getProfile(),
        supabase.from('restaurants').select('*').eq('slug', slug).single(),
    ])

    const t = getTranslation(profile?.languaje);

    if (error || !restaurant) {
        return (
            <main className="p-6 max-w-7xl mx-auto text-black">
                {/* Un icono grande y visual */}
                <div className="text-6xl mb-4">🔍</div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t.restaurants.notFound}
                </h1>

                <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                    {t.restaurants.notFoundmessage}
                </p>

                <div className="flex gap-4">
                    {/* Botón para volver a la lista general */}
                    <Link
                        href="/"
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-95"
                    >
                        {t.global.explore}
                    </Link>

                    {/* Botón secundario para ir a sus propias recetas */}
                    <Link
                        href="/restaurants"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
                    >
                        {t.restaurants.myRestaurants}
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

    const daysLabel: Record<string, string> = {
        monday: t.week.monday, tuesday: t.week.tuesday, wednesday: t.week.wednesday,
        thursday: t.week.thursday, friday: t.week.friday, saturday: t.week.saturday, sunday: t.week.sunday
    };

    let existingReview = null;

    if (authUser) {
        const { data } = await supabase
            .from('restaurant_reviews')
            .select('rating, personal_review')
            .eq('item_id', restaurant.id)
            .eq('user_id', authUser.id)
            .single();

        existingReview = data;
    }
    const myRatingData = {
        itemId: restaurant.id,
        tableName: "restaurant_reviews",
        userId: authUser?.id,
        initialRating: existingReview?.rating,
        initialReview: existingReview?.personal_review
    };

    return (
        <main className="p-6 max-w-7xl mx-auto text-black">
            {restaurant.image_url && (
                <div className="aspect-[16/5] w-full rounded-[2.5rem] overflow-hidden mb-8">
                    <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
                </div>
            )}

            {/* Header / Hero */}
            <PageHeader
                title={`${restaurant.name}`}
                back
                description={restaurant.description}
                ratingConfig={myRatingData}
            />

            <article className="max-w-7xl mx-auto space-y-8">
                {/* Fila Superior: Badge, Rating y Acciones */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 flex items-center gap-3">
                            <RatingDisplay itemId={restaurant.id} tableName="restaurant_reviews" size={18} />
                        </div>
                    </div>

                    {authUser?.id === restaurant.user_id && (
                        <div className="flex gap-2 pr-2">
                            <ButtonAction variant='edit' href={`/restaurants/edit/${restaurant.id}`} >
                                {t.global.edit}
                            </ButtonAction>
                            <DeleteButton itemId={restaurant.id} tableName='restaurants' redirectPath="/restaurants" />
                        </div>
                    )}
                </header>

                {/* Info de Etiquetas y Precio (Pills) */}
                <section className='flex flex-wrap items-center justify-between gap-4'>
                    <div className="flex flex-wrap gap-2">
                        {restaurant.cuisine_type?.split(',').map((tag: string) => (
                            <span key={tag} className="text-[10px] font-black uppercase tracking-tighter text-orange-700 bg-orange-100/50 px-3 py-1.5 rounded-xl border border-orange-100">
                                {tag.trim()}
                            </span>
                        ))}
                    </div>

                    <div className='flex items-center gap-2 bg-green-50 px-4 py-2 rounded-2xl border border-green-100'>
                        <Banknote size={16} className="text-green-600" strokeWidth={2.5} />
                        <span className="text-sm font-black text-green-700">{restaurant.price_range}</span>
                    </div>
                </section>

                {/* Layout de Dos Columnas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Columna Izquierda: Contenido Principal */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Sobre Nosotros */}
                        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-orange-500 p-2.5 rounded-2xl text-white">
                                    <Utensils size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{t.global.aboutUs}</h2>
                            </div>
                            <p className="text-gray-600 whitespace-pre-line leading-relaxed text-lg italic">
                                {restaurant.long_description || t.global.notDescripton}
                            </p>
                        </section>

                        {/* Ubicación */}
                        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-blue-500 p-2.5 rounded-2xl text-white">
                                    <MapPin size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{t.global.location}</h2>
                            </div>
                            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                                <div className="space-y-1">
                                    <p className="text-xl font-bold text-gray-900">{restaurant.address}</p>
                                    <p className="text-gray-500 font-medium">{restaurant.city}, {restaurant.state}</p>
                                </div>
                                <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 h-fit">
                                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{restaurant.country}</span>
                                </div>
                            </div>

                            {restaurant.latitude && (
                                <div className="relative overflow-hidden h-72 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center group hover:border-blue-300 transition-colors">
                                    <MapPin size={40} className="text-gray-300 group-hover:text-blue-400 transition-colors mb-2" />
                                    <span className="text-gray-400 font-bold text-sm tracking-widest uppercase">{t.global.mapInteractiveSoon}</span>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Columna Derecha: Sidebar */}
                    <aside className="space-y-8">
                        {/* Contacto */}
                        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6">{t.global.contact}</h3>
                            <div className="space-y-4">
                                {restaurant.phone && (
                                    <a href={`tel:${restaurant.phone}`} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-orange-50 hover:text-orange-600 transition-all border border-transparent hover:border-orange-100 group">
                                        <div className="bg-white p-2 rounded-lg shadow-sm group-hover:text-orange-600">
                                            <Phone size={20} />
                                        </div>
                                        <span className="font-bold">{restaurant.phone}</span>
                                    </a>
                                )}
                                {restaurant.website && (
                                    <a href={restaurant.website} target="_blank" className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100 group">
                                        <div className="bg-white p-2 rounded-lg shadow-sm group-hover:text-blue-600">
                                            <Globe size={20} />
                                        </div>
                                        <span className="font-bold">{t.global.websiteOfficial}</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Horarios */}
                        <div className="bg-black text-white p-8 rounded-[3rem] shadow-xl shadow-gray-200">
                            <div className="flex items-center gap-3 mb-8">
                                <Clock size={20} className="text-orange-500" />
                                <h3 className="text-sm font-black uppercase tracking-[0.2em]">{t.global.hours}</h3>
                            </div>
                            <div className="space-y-4">
                                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                                    const hours = restaurant.opening_hours?.[day];
                                    if (!hours) return null;
                                    const isClosed = hours === 'closed';

                                    return (
                                        <div key={day} className="flex justify-between items-center text-sm border-b border-white/10 pb-2 last:border-0">
                                            <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{daysLabel[day]}</span>
                                            <span className={`font-black ${isClosed ? 'text-red-400' : 'text-white'}`}>
                                                {isClosed ? t.global.closed : (hours as string).replace('-', ' - ')}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>
                </div>
            </article>
        </main>
    )
}