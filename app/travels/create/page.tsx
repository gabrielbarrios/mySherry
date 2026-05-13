'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@/app/utils/string-utils'
import ButtonAction from '@/app/components/ui/ButtonAction'
import PageHeader from '@/app/components/ui/SectionHeader'
import TravelFormFields from '@/app/components/form/FormTravelFields'
import { VisitedLocation } from '@/app/components/database/LocationPicker'
import { useTranslation } from '@/app/components/context/LanguageProvider';
import { useToast } from '@/app/components/ui/Toast';


export default function CreateTravel() {
 const t = useTranslation();
 const { toast } = useToast();

 const supabase = createClient()
 const router = useRouter()
 const [loading, setLoading] = useState(false)

 const [formData, setFormData] = useState<{
 name: string
 description: string
 long_description: string
 visited_locations: VisitedLocation[]
 start_date: string
 end_date: string
 trip_type: string
 budget_range: string
 companions: string
 transport: string
 accommodation: string
 image_url: string
 album_id: string | null
 }>({
 name: '',
 description: '',
 long_description: '',
 visited_locations: [],
 start_date: '',
 end_date: '',
 trip_type: '',
 budget_range: '$$',
 companions: '',
 transport: '',
 accommodation: '',
 image_url: '',
 album_id: null,
 })

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setLoading(true)

 const { data: { user } } = await supabase.auth.getUser()
 if (!user) {
 toast.info(t.global.notLoggedIn)
 setLoading(false)
 return
 }

 const { error } = await supabase.from('travels').insert({
 ...formData,
 slug: generateSlug(formData.name),
 start_date: formData.start_date || null,
 end_date: formData.end_date || null,
 user_id: user.id
 })

 if (error) {
 toast.error(t.global.errorSave + ': ' + error.message)
 } else {
 toast.success(t.travels.createdSuccess)
 router.push('/travels')
 }
 setLoading(false)
 }

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
 setFormData({ ...formData, [e.target.name]: e.target.value })
 }

 return (
 <main className="p-6 max-w-7xl mx-auto text-black dark:text-white">
 <PageHeader
 title={t.travels.register}
 description={t.travels.addNew}
 back
 />

 <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-900 border p-8 rounded-3xl shadow-sm">

 <TravelFormFields
 formData={formData}
 handleChange={handleChange}
 onImageChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
 onLocationsChange={(locs) => setFormData(prev => ({ ...prev, visited_locations: locs }))}
 onAlbumChange={(albumId) => setFormData(prev => ({ ...prev, album_id: albumId }))}
 />

 <ButtonAction
 type="submit"
 variant="create"
 disabled={loading}
 className="w-full"
 >
 {loading ? t.global.saving : t.travels.create}
 </ButtonAction>
 </form>
 </main>
 )
}
