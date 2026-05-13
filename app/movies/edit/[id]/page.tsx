'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import PageHeader from '@/app/components/ui/SectionHeader'
import MovieFormFields from '@/app/components/form/FormMovieFields'
import { useFetchOwnerEntity } from '@/hooks/useFetchOwnerEntity'
import ButtonAction from '@/app/components/ui/ButtonAction'
import { useTranslation } from '@/app/components/context/LanguageProvider';
import { useToast } from '@/app/components/ui/Toast';


export default function EditMovie() {
 const supabase = createClient()
 const router = useRouter()
 const { id } = useParams()
 const t = useTranslation();
 const { toast } = useToast();

 const { data, loading, authUser } = useFetchOwnerEntity<any>('movies', id as string, '/movies')

 const [saving, setSaving] = useState(false)
 const [formData, setFormData] = useState<any>(null)

 useEffect(() => {
 if (data) {
 setFormData({
 name: data.name || '',
 description: data.description || '',
 long_description: data.long_description || '',
 genre: data.genre || '',
 director: data.director || '',
 release_year: data.release_year?.toString() || '',
 duration_minutes: data.duration_minutes?.toString() || '',
 language: data.language || '',
 country: data.country || '',
 image_url: data.image_url || '',
 trailer_url: data.trailer_url || '',
 where_to_watch: data.where_to_watch || '',
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
 .from('movies')
 .update({
 ...formData,
 release_year: formData.release_year ? parseInt(formData.release_year) : null,
 duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
 })
 .eq('id', id)
 .eq('user_id', authUser.id)

 if (error) throw error

 router.push(`/movies/view/${formData.slug}`)
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
 title={t.movies.edit}
 description={`${t.movies.editing} : ${formData.name}`}
 back
 />

 <form onSubmit={handleSubmit} className="mt-8 space-y-8 bg-white dark:bg-gray-900 border p-10 rounded-[3rem] shadow-sm">
 <MovieFormFields
 formData={formData}
 handleChange={handleChange}
 onImageChange={(url) => setFormData((prev: any) => ({ ...prev, image_url: url }))}
 />

 <ButtonAction
 type="submit"
 variant="edit"
 disabled={saving}
 className="w-full py-6 text-lg"
 >
 {saving ? t.global.saving : t.movies.update}
 </ButtonAction>

 </form>
 </main>
 )
}
