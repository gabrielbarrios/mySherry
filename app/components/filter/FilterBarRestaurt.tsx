"use client";

import Link from 'next/link';
import { Search, Tag, MapPin, Banknote, Eraser, Map as MapIcon } from 'lucide-react';
import Heading from '../ui/Heading';
import FormInput from '../form/FormInput';
import { usePathname } from 'next/navigation';
import ButtonAction from '../ui/ButtonAction';
import { useTranslation } from '@/app/components/context/LanguageProvider';

interface Props {
 // Esto le dice a TS: "Acepta cualquier objeto con llaves y valores string"
 params: Record<string, string | undefined>;
}

export default function FilterBarRestaurant({ params }: Props) {
 const pathname = usePathname();
 const t = useTranslation();

 return (
 <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm mb-12">
 <Heading level="h2" className="mb-6 text-gray-500 dark:text-gray-400">{t.global.filter}</Heading>

 <form method="GET" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

 {/* Nota cómo usamos params['nombre_de_la_columna'] */}
 <div>
 <FormInput
 label={t.form.name}
 id="name"
 name="name"
 defaultValue={params.name}
 placeholder={t.restaurants.placeholder.name}
 icon={Search}
 />
 </div>

 <div>
 <FormInput
 label={t.restaurants.filter.tag}
 id="cuisine"
 name="cuisine"
 defaultValue={params.cuisine}
 placeholder={t.restaurants.placeholder.tag}
 icon={Tag}
 />
 </div>

 <div>
 <FormInput
 label={t.form.city}
 id="city"
 name="city"
 defaultValue={params.city}
 placeholder={t.placeholder.city}
 icon={MapPin}
 />
 </div>

 <div>
 <FormInput
 label={t.form.state}
 id="state"
 name="state"
 defaultValue={params.state}
 placeholder={t.placeholder.state}
 icon={MapIcon}
 />
 </div>

 <div>
 <FormInput
 label={t.form.address}
 id="address"
 name="address"
 defaultValue={params.address}
 placeholder={t.placeholder.address}
 icon={MapIcon}
 />
 </div>

 {/* ... Repite el mismo patrón para los demás campos ... */}

 <div className="flex flex-col gap-2" key={params.price}> {/* <-- Añadimos la key aquí para forzar que se refresque cuando la url cambia*/}
 <FormInput
 label={t.form.price}
 id="price"
 name="price"
 type="select"
 defaultValue={params.price}
 icon={Banknote}
 options={[
 { value: "", label: t.placeholder.price },
 { value: "$", label: "$" },
 { value: "$$", label: "$$" },
 { value: "$$$", label: "$$$" }
 ]}
 />
 </div>

 <div className="flex items-end gap-2 lg:col-span-3 lg:justify-end">
 <ButtonAction
 type="submit"
 >
 {t.global.searchNow}
 </ButtonAction>
 <Link href={pathname} className="flex-1 lg:flex-none p-4 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center group">
 <Eraser size={20} className="group-active:rotate-12 transition-transform" />
 </Link>
 </div>
 </form>
 </section>
 );
}