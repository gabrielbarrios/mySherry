'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@/app/utils/string-utils'
import ButtonAction from '@/app/components/ui/ButtonAction'
import PageHeader from '@/app/components/ui/SectionHeader'
import FormRecipeFields from '@/app/components/form/FormRecipeFields'

import { useTranslation } from '@/app/components/context/LanguageProvider';
import { useToast } from '@/app/components/ui/Toast';

export default function CreateRecipe() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null) // Estado para el error de slug

    const t = useTranslation();
    const { toast } = useToast();

    // Estados para los campos deben tener el mismo nombre que en la base de datos
    const [formData, setFormData] = useState({
        title: '',
        ingredients: '',
        instructions: '',
        permission: '0',
        description: '',
        long_description: '',
        tags: '',
        servings: '',
        duration: '',
        image_url: ''
    })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const supabase = createClient()
        setLoading(true)
        setErrorMsg(null) // Limpiamos errores previos

        // 1. Obtener el usuario actual
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            toast.info(t.recipes.mustLogin)
            setLoading(false)
            return
        }

        // 2. Generar el slug a partir del título
        const slug = generateSlug(formData.title)

        const dataToInsert = {
            ...formData,
            // Convertimos a número. Si está vacío, enviamos null o 0
            servings: formData.servings ? parseInt(formData.servings) : null,
            duration: formData.duration ? parseInt(formData.duration) : null,
            permission: parseInt(formData.permission) // Este suele ser int también
        }
        // 3. Insertar en la tabla 'recipes'
        const { error } = await supabase
            .from('recipes')
            .insert([
                {
                    ...dataToInsert,
                    slug, // <--- Agregamos el slug generado
                    user_id: user.id
                }
            ])

        if (error) {
            // Verificamos si el error es por duplicado (Código 23505)
            if (error.code === '23505') {
                setErrorMsg(t.recipes.errorExist)
            } else {
                toast.error(`${t.global.errorSave}: ${error.message}`)
            }
        } else {
            toast.success(t.recipes.save)
            router.push('/recipes')
            router.refresh()
        }
        setLoading(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <main className="p-6 max-w-7xl mx-auto text-black">
            <PageHeader
                title={t.recipes.create.title}
                description={t.recipes.create.description}
                back
            />

            {/* Mensaje de error visual si el slug ya existe */}
            {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm animate-in fade-in slide-in-from-top-2">
                    <p className="font-bold">{t.recipes.create.titleNoAvailable}</p>
                    <p className="text-sm">{errorMsg}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 bg-white border p-8 rounded-3xl shadow-sm">

                <FormRecipeFields
                formData={formData}
                handleChange={handleChange}
                onImageChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
            />

                {/* Botón de envío */}
                <ButtonAction
                    type="submit"
                    variant="create"
                    disabled={loading}
                    className="w-full" // Mantenemos el w-full para que ocupe todo el ancho del form
                >
                    {loading ? t.global.saving : t.recipes.create.save}
                </ButtonAction>
            </form>
        </main>
    )
}