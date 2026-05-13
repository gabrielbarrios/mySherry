'use client'
import Heading from '@/app/components/ui/Heading'
import FormInput from '@/app/components/form/FormInput'
import ImageUpload from '@/app/components/ui/ImageUpload'
import LocationPicker, { VisitedLocation } from '@/app/components/database/LocationPicker'
import AlbumLinker from '@/app/components/database/AlbumLinker'
import { useTranslation } from '@/app/components/context/LanguageProvider';

interface TravelFormFieldsProps {
 formData: any;
 handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
 onImageChange: (url: string) => void;
 onLocationsChange: (locations: VisitedLocation[]) => void;
 onAlbumChange: (albumId: string | null) => void;
}

export default function TravelFormFields({
 formData,
 handleChange,
 onImageChange,
 onLocationsChange,
 onAlbumChange,
}: TravelFormFieldsProps) {

 const t = useTranslation();

 return (
 <div className="space-y-10">
 {/* Foto principal */}
 <ImageUpload
 label={t.form.imageTravel}
 value={formData.image_url || ''}
 onChange={onImageChange}
 folder="travels"
 aspectRatio="16/9"
 />

 {/* Álbum vinculado */}
 <AlbumLinker
 value={formData.album_id || null}
 onChange={onAlbumChange}
 />

 {/* SECCIÓN 1: Información Principal */}
 <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="md:col-span-2">
 <Heading level='h2' className='text-orange-500 mb-4'>{t.global.generalInformation}</Heading>
 <FormInput
 label={t.travels.nameTravel}
 id="name"
 name="name"
 value={formData.name}
 placeholder={t.travels.placeholder.name}
 onChange={handleChange}
 required
 />
 </div>

 <div>
 <FormInput
 label={t.travels.tripType}
 id="trip_type"
 name="trip_type"
 value={formData.trip_type}
 placeholder={t.travels.placeholder.tag}
 onChange={handleChange}
 required
 />
 </div>

 <div>
 <FormInput
 label={t.travels.budget}
 id="budget_range"
 name="budget_range"
 type="select"
 value={formData.budget_range}
 onChange={handleChange}
 options={[
 { value: "$", label: "$ Mochilero" },
 { value: "$$", label: "$$ Económico" },
 { value: "$$$", label: "$$$ Confort" },
 { value: "$$$$", label: "$$$$ Lujo" }
 ]}
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
 label={t.travels.story}
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

 {/* SECCIÓN 2: Destino — mapa interactivo */}
 <section>
 <Heading level='h2' className="text-blue-500 mb-4">{t.travels.destination}</Heading>
 <LocationPicker
 value={formData.visited_locations || []}
 onChange={onLocationsChange}
 />
 </section>

 <hr className="border-gray-100 dark:border-gray-800" />

 {/* SECCIÓN 3: Fechas */}
 <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <Heading level='h2' className="text-purple-600 mb-4 md:col-span-2">{t.travels.dates}</Heading>
 <FormInput
 label={t.travels.startDate}
 id="start_date"
 name="start_date"
 type="date"
 value={formData.start_date}
 onChange={handleChange}
 />
 <FormInput
 label={t.travels.endDate}
 id="end_date"
 name="end_date"
 type="date"
 value={formData.end_date}
 onChange={handleChange}
 />
 </section>

 <hr className="border-gray-100 dark:border-gray-800" />

 {/* SECCIÓN 4: Logística */}
 <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <Heading level='h2' className="text-green-500 mb-4 md:col-span-2">{t.travels.details}</Heading>
 <FormInput
 label={t.travels.companions}
 id="companions"
 name="companions"
 value={formData.companions}
 placeholder={t.travels.placeholder.companions}
 onChange={handleChange}
 />
 <FormInput
 label={t.travels.transport}
 id="transport"
 name="transport"
 value={formData.transport}
 placeholder={t.travels.placeholder.transport}
 onChange={handleChange}
 />
 <div className="md:col-span-2">
 <FormInput
 label={t.travels.accommodation}
 id="accommodation"
 name="accommodation"
 value={formData.accommodation}
 placeholder={t.travels.placeholder.accommodation}
 onChange={handleChange}
 />
 </div>
 </section>
 </div>
 )
}
