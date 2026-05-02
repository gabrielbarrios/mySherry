// @/components/layout/HeaderClient.tsx
"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Menu, X, User, Users, LogOut, LogIn, UserPlus, Utensils } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import mysherryLogo from '@/app/assets/images/logos/mysherry.svg';
import EditProfileModal from '../database/EditProfileModal';
import FriendRequestsModal from '../database/FriendRequestsModal';

// Importamos el hook de traducción
import { useTranslation } from '@/app/components/context/LanguageProvider';

interface HeaderClientProps {
    authUser: any;
    username: string | null;
}

export default function HeaderClient({ authUser, username }: HeaderClientProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isRequestsOpen, setIsRequestsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Consumimos el diccionario del contexto
    const t = useTranslation();

    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        if (!authUser) return;
        const countRequests = async () => {
            const { count } = await supabase
                .from('friends')
                .select('*', { count: 'exact', head: true })
                .eq('friend_id', authUser.id)
                .eq('status', 'pending');
            setUnreadCount(count || 0);
        };
        countRequests();
    }, [authUser, supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsOpen(false);
        window.location.href = '/';
    };

    // Ajuste por si el diccionario aún no carga o para invitados
    const nameToShow = username || authUser?.email?.split('@')[0] || (t?.nav?.guest || 'Usuario');

    return (
        <>
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image src={mysherryLogo} alt="MySherry" priority className="h-9 w-auto object-contain" />
                    </Link>

                    <div className="relative">
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        {isOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    {authUser ? (
                                        <>
                                            <div className="px-5 py-3 border-b border-gray-50 mb-2 bg-gray-50/50">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    {t.nav.hamburguer.top}
                                                </p>
                                                <p className="text-base font-black text-gray-900 truncate">@{nameToShow}</p>
                                            </div>

                                            <button
                                                onClick={() => { setIsOpen(false); setIsProfileModalOpen(true); }}
                                                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors text-left"
                                            >
                                                <User size={16} /> {t.nav.hamburguer.editProfile}
                                            </button>

                                            <button
                                                onClick={() => setIsRequestsOpen(true)}
                                                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors text-left"
                                            >
                                                <Users size={16} /> {t.nav.hamburguer.friends || 'Amigos'}
                                                {unreadCount > 0 && (
                                                    <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </button>

                                            <div className="border-t border-gray-50 my-2"></div>

                                            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-bold">
                                                <LogOut size={16} /> {t.nav.hamburguer.closeSection}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors font-bold">
                                                <LogIn size={16} /> {t.nav.auth?.login || 'Iniciar Sesión'}
                                            </Link>
                                            <Link href="/signup" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-white bg-black hover:bg-gray-800 m-2 rounded-xl justify-center transition-colors">
                                                <UserPlus size={16} /> {t.nav.auth?.signup || 'Crear Cuenta'}
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <FriendRequestsModal
                isOpen={isRequestsOpen}
                onClose={() => setIsRequestsOpen(false)}
                authUserId={authUser?.id}
            />

            <EditProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </>
    );
}