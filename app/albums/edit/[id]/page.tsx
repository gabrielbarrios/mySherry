'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import ButtonAction from '@/app/components/ui/ButtonAction'
import PageHeader from '@/app/components/ui/SectionHeader'
import FormAlbumFields from '@/app/components/form/FormAlbumFields'
import { useTranslation } from '@/app/components/context/LanguageProvider'
import { useToast } from '@/app/components/ui/Toast'

export default function EditAlbum() {
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()
    const { id } = useParams()
    const t = useTranslation()
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [photos, setPhotos] = useState<string[]>([])
    const [formData, setFormData] = useState<any>(null)

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }

            const { data: album } = await supabase
                .from('albums')
                .select('*, album_photos(image_url, display_order)')
                .eq('id', id)
                .eq('user_id', user.id)
                .single()

            if (!album) { router.push('/albums'); return }

            setFormData({
                title: album.title || '',
                description: album.description || '',
                tags: album.tags || '',
                permission: String(album.permission ?? '0'),
                slug: album.slug || '',
            })

            const sorted = [...(album.album_photos || [])].sort(
                (a: any, b: any) => a.display_order - b.display_order
            )
            setPhotos(sorted.map((p: any) => p.image_url))
            setLoading(false)
        }
        load()
    }, [supabase, id, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !id) return
        setSaving(true)

        try {
            // 1. Update album metadata
            const { error } = await supabase
                .from('albums')
                .update({
                    title: formData.title,
                    description: formData.description,
                    tags: formData.tags,
                    permission: parseInt(formData.permission),
                })
                .eq('id', id)
                .eq('user_id', user.id)

            if (error) throw error

            // 2. Replace all photos: delete existing, insert current list
            await supabase.from('album_photos').delete().eq('album_id', id)

            if (photos.length > 0) {
                const photoRows = photos.map((url, idx) => ({
                    album_id: id,
                    user_id: user.id,
                    image_url: url,
                    display_order: idx,
                }))
                const { error: photoError } = await supabase.from('album_photos').insert(photoRows)
                if (photoError) throw photoError
            }

            toast.success(t.albums.updated.success)
            router.push(`/albums/view/${formData.slug}`)
            router.refresh()
        } catch (err: any) {
            toast.error(`${t.global.errorUpdate}: ${err.message}`)
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
        <main className="p-6 max-w-7xl mx-auto text-black">
            <PageHeader
                title={t.albums.updated.title}
                description={`${t.global.editing}: ${formData.title}`}
                back
            />

            <form onSubmit={handleSubmit} className="mt-8 space-y-8 bg-white border p-8 rounded-3xl shadow-sm">
                <FormAlbumFields
                    formData={formData}
                    handleChange={handleChange}
                    photos={photos}
                    onPhotosChange={setPhotos}
                />

                <ButtonAction type="submit" variant="edit" disabled={saving} className="w-full py-6 text-lg">
                    {saving ? t.global.saving : t.global.update}
                </ButtonAction>
            </form>
        </main>
    )
}
