'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@/app/utils/string-utils'
import ButtonAction from '@/app/components/ui/ButtonAction'
import PageHeader from '@/app/components/ui/SectionHeader'
import RestaurantFormFields from '@/app/components/form/FormRestaurantFields'
import { useTranslation } from '@/app/components/context/LanguageProvider';
import { useToast } from '@/app/components/ui/Toast';




export default function CreateRestaurant() {
 const t = useTranslation();
 const { toast } = useToast();

 const DAYS_OF_WEEK = [
 { id: 'monday', label: t.global.monday },
 { id: 'tuesday', label: t.global.tuesday },
 { id: 'wednesday', label: t.global.wednesday },
 { id: 'thursday', label: t.global.thursday },
 { id: 'friday', label: t.global.friday },
 { id: 'saturday', label: t.global.saturday },
 { id: 'sunday', label: t.global.sunday },
 ]

 const supabase = createClient()
 const router = useRouter()
 const [loading, setLoading] = useState(false)

 const [formData, setFormData] = useState({
 name: '',
 description: '',
 long_description: '',
 address: '',
 city: '',
 state: '',
 country: 'Mexico',
 latitude: '',
 longitude: '',
 phone: '',
 website: '',
 cuisine_type: '',
 price_range: '$$',
 image_url: '',
 })

 // Estado específico para el JSON de horarios
 const [openingHours, setOpeningHours] = useState({
 monday: '10:00-22:00',
 tuesday: '10:00-22:00',
 wednesday: '10:00-22:00',
 thursday: '10:00-22:00',
 friday: '10:00-22:00',
 saturday: '10:00-22:00',
 sunday: 'closed',
 })


 const handleHourUpdate = (day: string, type: 'open' | 'close' | 'isClosed', value?: string) => {
 setOpeningHours(prev => {
 const current = prev[day as keyof typeof prev];
 // Si el valor actual es 'closed', usamos un horario por defecto para editar
 const [currentOpen, currentClose] = current === 'closed' ? ['09:00', '22:00'] : current.split('-');

 if (type === 'isClosed') {
 return { ...prev, [day]: current === 'closed' ? '09:00-22:00' : 'closed' };
 }

 if (type === 'open') return { ...prev, [day]: `${value}-${currentClose}` };
 if (type === 'close') return { ...prev, [day]: `${currentOpen}-${value}` };

 return prev;
 });
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setLoading(true)

 const { data: { user } } = await supabase.auth.getUser()
 if (!user) {
 toast.info(t.global.notLoggedIn)
 setLoading(false)
 return
 }

 const { error } = await supabase.from('restaurants').insert({
 ...formData,
 opening_hours: openingHours,
 slug: generateSlug(formData.name),
 latitude: formData.latitude ? parseFloat(formData.latitude) : null,
 longitude: formData.longitude ? parseFloat(formData.longitude) : null,
 user_id: user.id
 })

 if (error) {
 toast.error(t.global.errorSave + ': ' + error.message)
 } else {
 toast.success(t.restaurants.createdSuccess)
 router.push('/restaurants')
 }
 setLoading(false)
 }

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
 setFormData({ ...formData, [e.target.name]: e.target.value })
 }

 return (
 <main className="p-6 max-w-7xl mx-auto text-black dark:text-white">
 <PageHeader
 title={t.restaurants.register}
 description={t.restaurants.addNew}
 back
 />

 <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-900 border p-8 rounded-3xl shadow-sm">

 <RestaurantFormFields
 formData={formData}
 openingHours={openingHours}
 handleChange={handleChange}
 handleHourUpdate={handleHourUpdate}
 onImageChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
 />

 <ButtonAction
 type="submit"
 variant="create"
 disabled={loading}
 className="w-full" // Mantenemos el w-full para que ocupe todo el ancho del form
 >
 {loading ? t.global.saving : t.restaurants.create}
 </ButtonAction>
 </form>
 </main>
 )
}