// app/user/[username]/page.tsx
import FriendButton from '@/app/components/database/FriendButton';
import InterestsCard from '@/app/components/ui/InterestsCard';
import PageHeader from '@/app/components/ui/SectionHeader';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export default async function UserProfilePage({
    params
}: {
    params: Promise<{ username: string }>
}) {
    const supabase = await createClient();
    const { username } = await params;

    const { data: { user: authUser } } = await supabase.auth.getUser();

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

    if (error || !profile) return notFound();

    const displayInterests = Array.isArray(profile.interests) ? profile.interests : [];

    return (
        <main className="p-6 max-w-7xl mx-auto text-black">
            <PageHeader title={username} back />

            <header className="flex flex-col items-center text-center mb-12">
                <div className="w-32 h-32 bg-gray-100 rounded-full mb-4 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={username} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-4xl">👨‍🍳</span>
                    )}
                </div>

                {profile.biography && (
                    <p className="text-gray-500 max-w-sm italic">"{profile.biography}"</p>
                )}

                {/* BOTÓN DE AMISTAD (Componente de Cliente) */}
                <div className="mt-6">
                    {authUser?.id && authUser.id !== profile.id && (
                        <FriendButton authUserId={authUser.id} profileId={profile.id} />
                    )}
                </div>
            </header>

            <div className="mt-8">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Intereses</h3>
                <InterestsCard displayInterests={displayInterests} username={username} />
            </div>
        </main>
    );
}