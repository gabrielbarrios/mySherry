'use client'

import FormInput from '@/app/components/form/FormInput'
import MultiImageUpload from '@/app/components/ui/MultiImageUpload'
import { useTranslation } from '@/app/components/context/LanguageProvider'

interface AlbumFormFieldsProps {
 formData: any
 handleChange: (e: any) => void
 photos: string[]
 onPhotosChange: (urls: string[]) => void
}

export default function FormAlbumFields({
 formData,
 handleChange,
 photos,
 onPhotosChange,
}: AlbumFormFieldsProps) {
 const t = useTranslation()

 return (
 <>
 <FormInput
 id="title"
 name="title"
 type="text"
 required
 label={t.form.name}
 placeholder={t.albums.placeholder.name}
 value={formData.title}
 onChange={handleChange}
 />

 <FormInput
 id="tags"
 name="tags"
 type="text"
 label={t.form.tags}
 placeholder={t.albums.placeholder.tags}
 value={formData.tags}
 onChange={handleChange}
 />

 <FormInput
 id="description"
 name="description"
 type="textarea"
 label={t.form.descriptionShort}
 placeholder={t.albums.placeholder.description}
 value={formData.description}
 onChange={handleChange}
 />

 <FormInput
 label="Privacidad"
 id="permission"
 name="permission"
 type="select"
 value={formData.permission}
 onChange={handleChange}
 options={[
 { value: '0', label: t.form.privacity.public },
 { value: '1', label: t.form.privacity.friends },
 { value: '2', label: t.form.privacity.private },
 ]}
 />

 <MultiImageUpload
 label={t.form.imageGallery}
 value={photos}
 onChange={onPhotosChange}
 folder="albums"
 maxPhotos={20}
 />
 </>
 )
}
