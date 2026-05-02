// app/friends/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import PageHeader from '@/app/components/ui/SectionHeader';
import Link from 'next/link';
import { User } from 'lucide-react';
import Heading from '../components/ui/Heading';
import UnfriendButton from '../components/database/UnfriendButton';

import { getProfile } from '@/library/get-user-data';
import { getTranslation } from '@/library/language/translate';

export default async function FriendsPage() {
 const supabase = await createClient();

 const profile = await getProfile();
 const t = getTranslation(profile?.languaje);

 const { data: { user: authUser } } = await supabase.auth.getUser();

 if (!authUser) redirect('/login');

 // Consultamos las amistades aceptadas
 // Buscamos en ambas direcciones: donde soy el que envió o el que recibió
 const { data: friendships, error } = await supabase
 .from('friends')
 .select(`
 id,
 user_id,
 friend_id,
 sender:profiles!friends_user_id_fkey(id, username, avatar_url, interests),
 receiver:profiles!friends_friend_id_fkey(id, username, avatar_url, interests)
 `)
 .eq('status', 'accepted')
 .or(`user_id.eq.${authUser.id},friend_id.eq.${authUser.id}`);

 // Mapeamos los datos para obtener solo el perfil de la OTRA persona
 const friends = friendships?.map(f => {
 return f.user_id === authUser.id ? f.receiver : f.sender;
 }) || [];

 return (
 <main className="max-w-7xl mx-auto px-6 py-12">
 <PageHeader
 title={t.friends.myFriends}
 description={`${friends.length} ${t.friends.conections}`}
 back
 />

 {friends.length === 0 ? (
 <div className="mt-20 text-center space-y-4">
 <div className="text-6xl">🤝</div>
 <h2 className="text-xl font-black">{t.friends.notFriends}</h2>
 <p className="text-gray-500 dark:text-gray-400">{t.friends.findFriends}</p>
 <Link href="/" className="inline-block bg-black dark:bg-gray-950 text-white px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform">
 {t.global.searchFriend}
 </Link>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {friends.map((friend: any, index: number) => {
 const friendshipId = friendships?.[index]?.id;
 return (
 <div
 key={friend.id}
 className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-2 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative"
 >
 <Link href={`/user/${friend.username}`} className="flex flex-col flex-grow">
 <div className="relative aspect-[16/10] bg-gray-100 dark:bg-gray-800 rounded-[2rem] mb-4 flex items-center justify-center text-4xl group-hover:scale-[1.02] transition-transform">
 {friend.avatar_url ? (
 <img src={friend.avatar_url} className="w-full h-full object-cover" />
 ) : (
 <User className="text-gray-500 dark:text-gray-400" size={28} />
 )}
 </div>
 <div className="px-4 pb-4">
 <Heading level='h2'>@{friend.username}</Heading>
 <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 italic">
 {friend.biography || t.friends.noBiography}
 </p>
 </div>
 </Link>

 <div className="flex gap-2 ml-4">
 {/* Botón para ver recetas o perfil */}

 <div className="flex flex-wrap gap-2 mb-3">
 {friend.interests?.map((tag: string) => (
 <Link
 href={`user/${friend.username}/${tag.trim().toLowerCase()}`}
 key={tag}
 className="hover:scale-105 transition-transform"
 >
 <span
 key={tag}
 className="text-[10px] font-black uppercase tracking-tighter text-orange-700 bg-orange-100/50 px-2.5 py-1 rounded-md border border-orange-100"
 >
 {tag.trim()}
 </span>
 </Link>
 ))}
 </div>


 </div>
 <div className='flex justify-center'>
 {/* Aquí podrías poner un botón para eliminar amigo o chatear */}
 <UnfriendButton
 friendshipId={friendshipId}
 friendName={friend.username}
 />
 </div>
 </div>
 )
 })}
 </div>
 )}
 </main>
 );
}