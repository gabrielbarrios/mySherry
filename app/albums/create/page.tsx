'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@/app/utils/string-utils'
import ButtonAction from '@/app/components/ui/ButtonAction'
import PageHeader from '@/app/components/ui/SectionHeader'
import FormAlbumFields from '@/app/components/form/FormAlbumFields'
import { useTranslation } from '@/app/components/context/LanguageProvider'
import { useToast } from '@/app/components/ui/Toast'

export default function CreateAlbum() {
 const router = useRouter()
 const t = useTranslation()
 const { toast } = useToast()

 const [loading, setLoading] = useState(false)
 const [errorMsg, setErrorMsg] = useState<string | null>(null)
 const [photos, setPhotos] = useState<string[]>([])

 const [formData, setFormData] = useState({
 title: '',
 description: '',
 tags: '',
 permission: '0',
 })

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
 setFormData({ ...formData, [e.target.name]: e.target.value })
 }

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault()
 const supabase = createClient()
 setLoading(true)
 setErrorMsg(null)

 const { data: { user } } = await supabase.auth.getUser()
 if (!user) {
 toast.info(t.global.notLoggedIn)
 setLoading(false)
 return
 }

 const slug = generateSlug(formData.title)

 // 1. Insert album
 const { data: album, error } = await supabase
 .from('albums')
 .insert([{
 ...formData,
 permission: parseInt(formData.permission),
 slug,
 user_id: user.id,
 }])
 .select('id')
 .single()

 if (error) {
 if (error.code === '23505') {
 setErrorMsg(t.albums.errorExist)
 } else {
 toast.error(`${t.global.errorSave}: ${error.message}`)
 }
 setLoading(false)
 return
 }

 // 2. Insert photos if any
 if (photos.length > 0) {
 const photoRows = photos.map((url, idx) => ({
 album_id: album.id,
 user_id: user.id,
 image_url: url,
 display_order: idx,
 }))
 await supabase.from('album_photos').insert(photoRows)
 }

 toast.success(t.albums.saved)
 router.push('/albums')
 router.refresh()
 setLoading(false)
 }

 return (
 <main className="p-6 max-w-7xl mx-auto text-black dark:text-white">
 <PageHeader
 title={t.albums.create.title}
 description={t.albums.create.description}
 back
 />

 {errorMsg && (
 <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm animate-in fade-in slide-in-from-top-2">
 <p className="font-bold">{t.albums.create.titleNoAvailable}</p>
 <p className="text-sm">{errorMsg}</p>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-900 border p-8 rounded-3xl shadow-sm">
 <FormAlbumFields
 formData={formData}
 handleChange={handleChange}
 photos={photos}
 onPhotosChange={setPhotos}
 />

 <ButtonAction type="submit" variant="create" disabled={loading} className="w-full">
 {loading ? t.global.saving : t.albums.create.save}
 </ButtonAction>
 </form>
 </main>
 )
}
