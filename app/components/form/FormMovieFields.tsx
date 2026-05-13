'use client'
import Heading from '@/app/components/ui/Heading'
import FormInput from '@/app/components/form/FormInput'
import ImageUpload from '@/app/components/ui/ImageUpload'
import { useTranslation } from '@/app/components/context/LanguageProvider';

interface MovieFormFieldsProps {
 formData: any;
 handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
 onImageChange: (url: string) => void;
}

export default function MovieFormFields({
 formData,
 handleChange,
 onImageChange,
}: MovieFormFieldsProps) {

 const t = useTranslation();

 return (
 <div className="space-y-10">
 {/* Póster */}
 <ImageUpload
 label={t.form.imageMovie}
 value={formData.image_url || ''}
 onChange={onImageChange}
 folder="movies"
 aspectRatio="2/3"
 />

 {/* SECCIÓN 1: Información Principal */}
 <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="md:col-span-2">
 <Heading level='h2' className='text-orange-500 mb-4'>{t.global.generalInformation}</Heading>
 <FormInput
 label={t.movies.nameMovie}
 id="name"
 name="name"
 value={formData.name}
 placeholder={t.movies.placeholder.name}
 onChange={handleChange}
 required
 />
 </div>

 <div>
 <FormInput
 label={t.movies.genre}
 id="genre"
 name="genre"
 value={formData.genre}
 placeholder={t.movies.placeholder.tag}
 onChange={handleChange}
 required
 />
 </div>

 <div>
 <FormInput
 label={t.movies.director}
 id="director"
 name="director"
 value={formData.director}
 placeholder={t.movies.placeholder.director}
 onChange={handleChange}
 />
 </div>

 <div className="md:col-span-2">
 <FormInput
 label={t.form.descriptionShort}
 id="description"
 name="description"
 value={formData.description}
 placeholder={t.placeholder.descriptionShort}
 onChange={handleChange}
 />
 </div>

 <div className="md:col-span-2">
 <FormInput
 label={t.movies.synopsis}
 id="long_description"
 name="long_description"
 type="textarea"
 value={formData.long_description}
 placeholder={t.placeholder.descriptionLong}
 onChange={handleChange}
 />
 </div>
 </section>

 <hr className="border-gray-100 dark:border-gray-800" />

 {/* SECCIÓN 2: Ficha técnica */}
 <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <Heading level='h2' className="text-blue-500 mb-4 md:col-span-2">{t.movies.details}</Heading>

 <div>
 <FormInput
 label={t.movies.releaseYear}
 id="release_year"
 name="release_year"
 type="number"
 value={formData.release_year}
 placeholder={t.movies.placeholder.releaseYear}
 onChange={handleChange}
 />
 </div>

 <div>
 <FormInput
 label={t.movies.duration}
 id="duration_minutes"
 name="duration_minutes"
 type="number"
 value={formData.duration_minutes}
 placeholder={t.movies.placeholder.duration}
 onChange={handleChange}
 />
 </div>

 <div>
 <FormInput
 label={t.movies.language}
 id="language"
 name="language"
 value={formData.language}
 placeholder={t.movies.placeholder.language}
 onChange={handleChange}
 />
 </div>

 <div>
 <FormInput
 label={t.movies.country}
 id="country"
 name="country"
 value={formData.country}
 placeholder={t.movies.placeholder.country}
 onChange={handleChange}
 />
 </div>
 </section>

 <hr className="border-gray-100 dark:border-gray-800" />

 {/* SECCIÓN 3: Enlaces */}
 <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <Heading level='h2' className="text-green-500 mb-4 md:col-span-2">{t.global.contactWeb}</Heading>
 <FormInput
 label={t.movies.trailerUrl}
 id="trailer_url"
 name="trailer_url"
 type="url"
 value={formData.trailer_url}
 placeholder={t.movies.placeholder.trailerUrl}
 onChange={handleChange}
 />
 <FormInput
 label={t.movies.whereToWatch}
 id="where_to_watch"
 name="where_to_watch"
 value={formData.where_to_watch}
 placeholder={t.movies.placeholder.whereToWatch}
 onChange={handleChange}
 />
 </section>
 </div>
 )
}
