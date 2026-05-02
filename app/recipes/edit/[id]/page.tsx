'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import PageHeader from '@/app/components/ui/SectionHeader'
import FormRecipeFields from '@/app/components/form/FormRecipeFields'
import ButtonAction from '@/app/components/ui/ButtonAction'
import { useFetchOwnerEntity } from '@/hooks/useFetchOwnerEntity'

import { useTranslation } from '@/app/components/context/LanguageProvider';
import { useToast } from '@/app/components/ui/Toast';

export default function EditRecipe() {
    const router = useRouter()
    const { id } = useParams()
    const supabase = createClient()

    const t = useTranslation();
    const { toast } = useToast();

    // 1. Usamos el Hook (especificamos la tabla 'recipes')
    const { data, loading, authUser } = useFetchOwnerEntity<any>('recipes', id as string, '/recipes')

    const [updating, setUpdating] = useState(false)
    const [formData, setFormData] = useState<any>(null)

    // 2. Sincronizamos los datos de la receta con el estado del formulario
    useEffect(() => {
        if (data) {
            setFormData({
                title: data.title || '',
                ingredients: data.ingredients || '',
                instructions: data.instructions || '',
                permission: data.permission?.toString() || '0',
                description: data.description || '',
                long_description: data.long_description || '',
                tags: data.tags || '',
                servings: data.servings || '',
                duration: data.duration || '',
                image_url: data.image_url || ''
            })
        }
    }, [data])

    // 3. Handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!authUser || !id) return
        setUpdating(true)

        try {
            // Creamos una copia de los datos para limpiar números
            const dataToUpdate = {
                ...formData,
                // Convertimos a número. Si está vacío, enviamos null o 0
                servings: formData.servings ? parseInt(formData.servings) : null,
                duration: formData.duration ? parseInt(formData.duration) : null,
                permission: parseInt(formData.permission) // Este suele ser int también
            }



            const { error } = await supabase
                .from('recipes')
                .update(dataToUpdate)
                .eq('id', id)
                .eq('user_id', authUser.id) // Doble seguridad

            if (error) throw error

            toast.success(t.recipes.updated.success)
            router.push('/recipes')
            router.refresh()
        } catch (error: any) {
            toast.error(`${t.global.errorUpdate}: ${error.message}`)
        } finally {
            setUpdating(false)
        }
    }

    // Estado de carga inicial
    if (loading || !formData) {
        return (
            <div className="p-20 text-center">
                <p className="animate-pulse font-black text-xl text-gray-300 uppercase tracking-widest">
                    {t.global.loading}
                </p>
            </div>
        )
    }

    return (
        <main className="p-6 max-w-7xl mx-auto text-black">
            <PageHeader
                title='Editar Receta'
                description={`${t.global.editing}: ${formData.title}`}
                back
            />

            <form onSubmit={handleUpdate} className="mt-8 space-y-8 bg-white border p-10 rounded-[3rem] shadow-sm">
                <FormRecipeFields
                    formData={formData}
                    handleChange={handleChange}
                    onImageChange={(url) => setFormData((prev: any) => ({ ...prev, image_url: url }))}
                />

                <ButtonAction
                    type="submit"
                    variant="edit"
                    disabled={updating}
                    className="w-full py-6 text-lg"
                >
                    {updating ? t.global.saving : t.global.update}
                </ButtonAction>
            </form>
        </main>
    )
}