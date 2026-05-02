'use client'
import Heading from '@/app/components/ui/Heading'
import FormInput from '@/app/components/form/FormInput'
import ImageUpload from '@/app/components/ui/ImageUpload'
import { useTranslation } from '@/app/components/context/LanguageProvider';

interface RestaurantFormFieldsProps {
    formData: any;
    openingHours: any;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleHourUpdate: (day: string, type: 'open' | 'close' | 'isClosed', value?: string) => void;
    onImageChange: (url: string) => void;
}

export default function RestaurantFormFields({
    formData,
    openingHours,
    handleChange,
    handleHourUpdate,
    onImageChange,
}: RestaurantFormFieldsProps) {

    const t = useTranslation();

    const DAYS_OF_WEEK = [
        { id: 'monday', label: t.week.monday },
        { id: 'tuesday', label: t.week.tuesday },
        { id: 'wednesday', label: t.week.wednesday },
        { id: 'thursday', label: t.week.thursday },
        { id: 'friday', label: t.week.friday },
        { id: 'saturday', label: t.week.saturday },
        { id: 'sunday', label: t.week.sunday },
    ]

    return (
        <div className="space-y-10">
            {/* Imagen principal */}
            <ImageUpload
                label={t.form.imageRestaurant}
                value={formData.image_url || ''}
                onChange={onImageChange}
                folder="restaurants"
                aspectRatio="16/9"
            />

            {/* SECCIÓN 1: Información Principal */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <Heading level='h2' className='text-orange-500 mb-4'>{t.global.generalInformation}</Heading>
                    <FormInput
                        label={t.restaurants.nameRestaurant}
                        id="name"
                        name="name"
                        value={formData.name}
                        placeholder={t.restaurants.placeholder.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <FormInput
                        label={t.restaurants.kind}
                        id="cuisine_type"
                        name="cuisine_type"
                        value={formData.cuisine_type}
                        placeholder={t.restaurants.placeholder.tag}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <FormInput
                        label={t.form.priceRange}
                        id="price_range"
                        name="price_range"
                        type="select"
                        value={formData.price_range}
                        onChange={handleChange}
                        options={[
                            { value: "$", label: "$ Económico" },
                            { value: "$$", label: "$$ Moderado" },
                            { value: "$$$", label: "$$$ Caro" },
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
                        label={t.form.descriptionLong}
                        id="long_description"
                        name="long_description"
                        type="textarea"
                        value={formData.long_description}
                        placeholder={t.placeholder.descriptionLong}
                        onChange={handleChange}
                    />
                </div>
            </section>

            <hr className="border-gray-100" />

            {/* SECCIÓN 2: Ubicación */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <Heading level='h2' className="text-blue-500 mb-4">{t.global.location}</Heading>
                    <FormInput
                        label={t.form.address}
                        id="address"
                        name="address"
                        value={formData.address}
                        placeholder={t.placeholder.address}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <FormInput
                        label={t.form.city}
                        id="city"
                        name="city"
                        value={formData.city}
                        placeholder={t.placeholder.city}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <FormInput
                        label={t.form.state}
                        id="state"
                        name="state"
                        value={formData.state}
                        placeholder={t.placeholder.state}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        label={t.form.latitude}
                        id="latitude"
                        name="latitude"
                        type="number"
                        value={formData.latitude}
                        placeholder={t.placeholder.latitude}
                        onChange={handleChange}
                        step="any"
                    />
                    <FormInput
                        label={t.form.longitude}
                        id="longitude"
                        name="longitude"
                        type="number"
                        value={formData.longitude}
                        placeholder={t.placeholder.longitude}
                        onChange={handleChange}
                        step="any"
                    />
                </div>
            </section>

            <hr className="border-gray-100" />

            {/* SECCIÓN 3: Contacto */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Heading level='h2' className="text-green-500 mb-4 md:col-span-2">{t.global.contactWeb}</Heading>
                <FormInput
                    label={t.form.phone}
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    placeholder={t.placeholder.phone}
                    onChange={handleChange}
                />
                <FormInput
                    label={t.form.website}
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    placeholder={t.placeholder.website}
                    onChange={handleChange}
                />
            </section>

            <hr className="border-gray-100" />

            {/* SECCIÓN 4: Horarios */}
            <section>
                <Heading level='h2' className="text-purple-600 mb-6">{t.global.attentionHours}</Heading>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DAYS_OF_WEEK.map((day) => {
                        const currentVal = openingHours[day.id];
                        const isClosed = currentVal === 'closed';
                        const [openTime, closeTime] = !isClosed ? currentVal.split('-') : ['', ''];

                        return (
                            <div key={day.id} className={`p-4 rounded-3xl border transition-all ${isClosed ? 'bg-gray-50 opacity-60' : 'bg-white border-purple-100 shadow-sm'}`}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">{day.label}</span>
                                    <label className="flex items-center gap-2 cursor-pointer" htmlFor={`isClosed-${day.id}`}>
                                        <input
                                            id={`isClosed-${day.id}`}
                                            type="checkbox"
                                            checked={isClosed}
                                            onChange={() => handleHourUpdate(day.id, 'isClosed')}
                                            className="w-4 h-4 accent-purple-600"
                                        />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{t.global.closed}</span>
                                    </label>
                                </div>

                                {!isClosed && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="time"
                                            value={openTime}
                                            onChange={(e) => handleHourUpdate(day.id, 'open', e.target.value)}
                                            className="flex-1 p-2 text-sm border rounded-xl bg-purple-50 focus:ring-2 focus:ring-purple-400 outline-none font-bold"
                                        />
                                        <span className="text-gray-300">/</span>
                                        <input
                                            type="time"
                                            value={closeTime}
                                            onChange={(e) => handleHourUpdate(day.id, 'close', e.target.value)}
                                            className="flex-1 p-2 text-sm border rounded-xl bg-purple-50 focus:ring-2 focus:ring-purple-400 outline-none font-bold"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    )
}