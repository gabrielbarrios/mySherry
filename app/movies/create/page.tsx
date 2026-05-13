'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@/app/utils/string-utils'
import ButtonAction from '@/app/components/ui/ButtonAction'
import PageHeader from '@/app/components/ui/SectionHeader'
import MovieFormFields from '@/app/components/form/FormMovieFields'
import { useTranslation } from '@/app/components/context/LanguageProvider';
import { useToast } from '@/app/components/ui/Toast';


export default function CreateMovie() {
 const t = useTranslation();
 const { toast } = useToast();

 const supabase = createClient()
 const router = useRouter()
 const [loading, setLoading] = useState(false)

 const [formData, setFormData] = useState({
 name: '',
 description: '',
 long_description: '',
 genre: '',
 director: '',
 release_year: '',
 duration_minutes: '',
 language: '',
 country: '',
 image_url: '',
 trailer_url: '',
 where_to_watch: '',
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

 const { error } = await supabase.from('movies').insert({
 ...formData,
 slug: generateSlug(formData.name),
 release_year: formData.release_year ? parseInt(formData.release_year) : null,
 duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
 user_id: user.id
 })

 if (error) {
 toast.error(t.global.errorSave + ': ' + error.message)
 } else {
 toast.success(t.movies.createdSuccess)
 router.push('/movies')
 }
 setLoading(false)
 }

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
 setFormData({ ...formData, [e.target.name]: e.target.value })
 }

 return (
 <main className="p-6 max-w-7xl mx-auto text-black dark:text-white">
 <PageHeader
 title={t.movies.register}
 description={t.movies.addNew}
 back
 />

 <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-900 border p-8 rounded-3xl shadow-sm">

 <MovieFormFields
 formData={formData}
 handleChange={handleChange}
 onImageChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
 />

 <ButtonAction
 type="submit"
 variant="create"
 disabled={loading}
 className="w-full"
 >
 {loading ? t.global.saving : t.movies.create}
 </ButtonAction>
 </form>
 </main>
 )
}
