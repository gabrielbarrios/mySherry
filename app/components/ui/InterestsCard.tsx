'use client'
import Link from "next/link";
import Heading from "./Heading";

interface Props {
 displayInterests: string[];
 className?: string;
 username?: string; // <-- Agregamos esta prop opcional
}

const INTEREST_MAP: Record<string, { label: string, path: string, icon: string, description: string }> = {
 recipes: { label: 'Recetas', path: '/recipes', icon: '🍲', description: 'Explorar Recetas' },
 restaurants: { label: 'Restaurantes', path: '/restaurants', icon: '🍽️', description: 'Explorar Restaurantes' },
 medicals: { label: 'Médico', path: '/medical', icon: '🏥', description: 'Explorar recetas médicas' },
 events: { label: 'Eventos', path: '/events', icon: '🎉', description: 'Explorar Eventos' },
 albums: { label: 'Álbumes', path: '/albums', icon: '📸', description: 'Explorar Álbumes de fotos' },
 movies: { label: 'Películas', path: '/movies', icon: '🎬', description: 'Explorar Películas' },
 travels: { label: 'Viajes', path: '/travels', icon: '✈️', description: 'Explorar Viajes' },
};

export default function InterestsCard({
 displayInterests = [],
 className,
 username // Recibimos el username
}: Props) {

 return (
 <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${className || ''}`}>
 {displayInterests.map((id) => {
 const item = INTEREST_MAP[id];
 if (!item) return null;

 // LOGICA DE RUTA DINÁMICA:
 // Si hay username: /user/gabo/recipes
 // Si NO hay username: /recipes
 const finalPath = username
 ? `/user/${username}${item.path}`
 : item.path;

 return (
 <div
 key={id}
 className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-2 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative"
 >
 <Link href={finalPath} className="flex flex-col flex-grow">
 <div className="relative aspect-[16/10] bg-gray-100 dark:bg-gray-800 rounded-[2rem] mb-4 flex items-center justify-center text-4xl group-hover:scale-[1.02] transition-transform">
 {item.icon}
 </div>

 <div className="px-4 pb-4">
 <Heading level="h2">{item.label}</Heading>
 <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1 mb-4 italic">
 {username ? `Ver ${item.label} de @${username}` : item.description}
 </p>
 </div>
 </Link>
 </div>
 );
 })}
 </div>
 );
}