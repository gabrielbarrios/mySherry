'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import PageHeader from '@/app/components/ui/SectionHeader'
import RestaurantFormFields from '@/app/components/form/FormRestaurantFields'
import { useFetchOwnerEntity } from '@/hooks/useFetchOwnerEntity'
import ButtonAction from '@/app/components/ui/ButtonAction'
import { useTranslation } from '@/app/components/context/LanguageProvider';
import { useToast } from '@/app/components/ui/Toast';


export default function EditRestaurant() {
    const supabase = createClient()
    const router = useRouter()
    const { id } = useParams()
    const t = useTranslation();
    const { toast } = useToast();

    // 1. Usamos el Hook personalizado (manejamos loading, authUser y data desde aquí)
    const { data, loading, authUser } = useFetchOwnerEntity<any>('restaurants', id as string, '/restaurants')

    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<any>(null)
    const [openingHours, setOpeningHours] = useState<any>(null)

    // 2. Sincronizar los datos cuando el Hook termina de cargar
    useEffect(() => {
        if (data) {
            setFormData({
                name: data.name || '',
                description: data.description || '',
                long_description: data.long_description || '',
                address: data.address || '',
                city: data.city || '',
                state: data.state || '',
                country: data.country || 'Mexico',
                latitude: data.latitude?.toString() || '',
                longitude: data.longitude?.toString() || '',
                phone: data.phone || '',
                website: data.website || '',
                cuisine_type: data.cuisine_type || '',
                price_range: data.price_range || '$$',
                slug: data.slug || '',
                image_url: data.image_url || ''
            })
            setOpeningHours(data.opening_hours)
        }
    }, [data])

    // 3. Handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleHourUpdate = (day: string, type: 'open' | 'close' | 'isClosed', value?: string) => {
        if (!openingHours) return;
        setOpeningHours((prev: any) => {
            const current = prev[day];
            const [currentOpen, currentClose] = current === 'closed' ? ['09:00', '22:00'] : current.split('-');
            if (type === 'isClosed') return { ...prev, [day]: current === 'closed' ? '09:00-22:00' : 'closed' };
            if (type === 'open') return { ...prev, [day]: `${value}-${currentClose}` };
            if (type === 'close') return { ...prev, [day]: `${currentOpen}-${value}` };
            return prev;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!authUser || !id) return
        setSaving(true)

        try {
            const { error } = await supabase
                .from('restaurants')
                .update({
                    ...formData,
                    opening_hours: openingHours,
                    latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                    longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                })
                .eq('id', id)
                .eq('user_id', authUser.id)

            if (error) throw error

            router.push(`/restaurants/view/${formData.slug}`)
            router.refresh()
        } catch (error: any) {
            toast.error(t.global.errorUpdate + ': ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    // Estado de carga inicial
    if (loading || !formData) {
        return (
            <div className="p-20 text-center">
                <div className="animate-pulse font-black text-2xl text-gray-300">{t.global.loading}</div>
            </div>
        )
    }

    return (
        <main className="p-6 max-w-7xl mx-auto">
            <PageHeader
                title={t.restaurants.edit}
                description={`${t.restaurants.editing} : ${formData.name}`}
                back
            />

            <form onSubmit={handleSubmit} className="mt-8 space-y-8 bg-white border p-10 rounded-[3rem] shadow-sm">
                <RestaurantFormFields
                    formData={formData}
                    openingHours={openingHours}
                    handleChange={handleChange}
                    handleHourUpdate={handleHourUpdate}
                    onImageChange={(url) => setFormData((prev: any) => ({ ...prev, image_url: url }))}
                />

                <ButtonAction
                    type="submit"
                    variant="edit"
                    disabled={saving}
                    className="w-full py-6 text-lg"
                >
                    {saving ? t.global.saving : t.restaurants.update}
                </ButtonAction>

            </form>
        </main>
    )
}