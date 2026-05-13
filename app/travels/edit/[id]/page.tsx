'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import PageHeader from '@/app/components/ui/SectionHeader'
import TravelFormFields from '@/app/components/form/FormTravelFields'
import { VisitedLocation } from '@/app/components/database/LocationPicker'
import { useFetchOwnerEntity } from '@/hooks/useFetchOwnerEntity'
import ButtonAction from '@/app/components/ui/ButtonAction'
import { useTranslation } from '@/app/components/context/LanguageProvider';
import { useToast } from '@/app/components/ui/Toast';


export default function EditTravel() {
 const supabase = createClient()
 const router = useRouter()
 const { id } = useParams()
 const t = useTranslation();
 const { toast } = useToast();

 const { data, loading, authUser } = useFetchOwnerEntity<any>('travels', id as string, '/travels')

 const [saving, setSaving] = useState(false)
 const [formData, setFormData] = useState<any>(null)

 useEffect(() => {
 if (data) {
 setFormData({
 name: data.name || '',
 description: data.description || '',
 long_description: data.long_description || '',
 visited_locations: Array.isArray(data.visited_locations) ? data.visited_locations : [],
 start_date: data.start_date || '',
 end_date: data.end_date || '',
 trip_type: data.trip_type || '',
 budget_range: data.budget_range || '$$',
 companions: data.companions || '',
 transport: data.transport || '',
 accommodation: data.accommodation || '',
 image_url: data.image_url || '',
 album_id: data.album_id || null,
 slug: data.slug || ''
 })
 }
 }, [data])

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
 setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }))
 }

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 if (!authUser || !id) return
 setSaving(true)

 try {
 const { error } = await supabase
 .from('travels')
 .update({
 ...formData,
 start_date: formData.start_date || null,
 end_date: formData.end_date || null,
 })
 .eq('id', id)
 .eq('user_id', authUser.id)

 if (error) throw error

 router.push(`/travels/view/${formData.slug}`)
 router.refresh()
 } catch (error: any) {
 toast.error(t.global.errorUpdate + ': ' + error.message)
 } finally {
 setSaving(false)
 }
 }

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
 title={t.travels.edit}
 description={`${t.travels.editing} : ${formData.name}`}
 back
 />

 <form onSubmit={handleSubmit} className="mt-8 space-y-8 bg-white dark:bg-gray-900 border p-10 rounded-[3rem] shadow-sm">
 <TravelFormFields
 formData={formData}
 handleChange={handleChange}
 onImageChange={(url) => setFormData((prev: any) => ({ ...prev, image_url: url }))}
 onLocationsChange={(locs: VisitedLocation[]) => setFormData((prev: any) => ({ ...prev, visited_locations: locs }))}
 onAlbumChange={(albumId: string | null) => setFormData((prev: any) => ({ ...prev, album_id: albumId }))}
 />

 <ButtonAction
 type="submit"
 variant="edit"
 disabled={saving}
 className="w-full py-6 text-lg"
 >
 {saving ? t.global.saving : t.travels.update}
 </ButtonAction>

 </form>
 </main>
 )
}
