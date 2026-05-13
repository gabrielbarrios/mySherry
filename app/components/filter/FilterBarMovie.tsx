"use client";

import Link from 'next/link';
import { Search, Tag, Calendar, User, Eraser, Globe } from 'lucide-react';
import Heading from '../ui/Heading';
import FormInput from '../form/FormInput';
import { usePathname } from 'next/navigation';
import ButtonAction from '../ui/ButtonAction';
import { useTranslation } from '@/app/components/context/LanguageProvider';

interface Props {
 params: Record<string, string | undefined>;
}

export default function FilterBarMovie({ params }: Props) {
 const pathname = usePathname();
 const t = useTranslation();

 return (
 <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm mb-12">
 <Heading level="h2" className="mb-6 text-gray-500 dark:text-gray-400">{t.global.filter}</Heading>

 <form method="GET" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

 <div>
 <FormInput
 label={t.form.name}
 id="name"
 name="name"
 defaultValue={params.name}
 placeholder={t.movies.placeholder.name}
 icon={Search}
 />
 </div>

 <div>
 <FormInput
 label={t.movies.filter.tag}
 id="genre"
 name="genre"
 defaultValue={params.genre}
 placeholder={t.movies.placeholder.tag}
 icon={Tag}
 />
 </div>

 <div>
 <FormInput
 label={t.movies.director}
 id="director"
 name="director"
 defaultValue={params.director}
 placeholder={t.movies.placeholder.director}
 icon={User}
 />
 </div>

 <div>
 <FormInput
 label={t.movies.releaseYear}
 id="year"
 name="year"
 type="number"
 defaultValue={params.year}
 placeholder={t.movies.placeholder.releaseYear}
 icon={Calendar}
 />
 </div>

 <div>
 <FormInput
 label={t.movies.country}
 id="country"
 name="country"
 defaultValue={params.country}
 placeholder={t.movies.placeholder.country}
 icon={Globe}
 />
 </div>

 <div className="flex items-end gap-2 lg:col-span-3 lg:justify-end">
 <ButtonAction type="submit">
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
