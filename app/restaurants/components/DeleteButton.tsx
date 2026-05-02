"use client";

import { useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/components/context/LanguageProvider';
import { useToast } from '@/app/components/ui/Toast';
import ConfirmModal from '@/app/components/ui/ConfirmModal';

export default function DeleteButton({ restaurantId }: { restaurantId: string | number }) {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const t = useTranslation();
    const { toast } = useToast();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setConfirmOpen(false);
        setDeleting(true);

        const { error } = await supabase
            .from('restaurants')
            .delete()
            .eq('id', restaurantId);

        if (error) {
            toast.error(t.global.deleteError + ' ' + error.message);
            setDeleting(false);
        } else {
            router.push('/restaurants');
            router.refresh();
        }
    };

    return (
        <>
            <button
                onClick={() => setConfirmOpen(true)}
                disabled={deleting}
                className={`px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors ${deleting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {deleting ? t.global.loading : t.global.delete}
            </button>

            <ConfirmModal
                isOpen={confirmOpen}
                title={t.global.deleteConfirm}
                message={t.global.deleteWarning}
                confirmText={t.global.deleteAction}
                cancelText={t.global.cancel}
                onConfirm={handleDelete}
                onCancel={() => setConfirmOpen(false)}
                variant="danger"
            />
        </>
    );
}
