'use client'

import Link from 'next/link'
import { Search, Tag, Eraser } from 'lucide-react'
import Heading from '../ui/Heading'
import ButtonAction from '../ui/ButtonAction'
import FormInput from '../form/FormInput'
import { useTranslation } from '@/app/components/context/LanguageProvider'

interface Props {
 params: { name?: string; tags?: string }
 basePath: string
}

export default function FilterBarAlbum({ params, basePath }: Props) {
 const t = useTranslation()

 return (
 <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm mb-12">
 <Heading level="h2" className="mb-6 text-gray-500 dark:text-gray-400">
 {t.albums.filter.title}
 </Heading>

 <form method="GET" action={basePath} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 <div className="flex flex-col">
 <FormInput
 label={t.albums.filter.name}
 id="name"
 name="name"
 defaultValue={params.name}
 placeholder={t.albums.placeholder.name}
 type="text"
 icon={Search}
 />
 </div>

 <div className="flex flex-col">
 <FormInput
 label={t.albums.filter.tag}
 id="tags"
 name="tags"
 defaultValue={params.tags}
 type="text"
 placeholder={t.albums.placeholder.tags}
 icon={Tag}
 />
 </div>

 <div className="flex items-end gap-2">
 <ButtonAction type="submit">
 {t.albums.filter.search}
 </ButtonAction>
 <Link
 href={basePath}
 className="flex-1 p-4 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl hover:bg-gray-200 hover:text-gray-600 dark:text-gray-300 transition-all flex items-center justify-center group"
 title={t.albums.filter.clean}
 >
 <Eraser size={20} className="group-active:rotate-12 transition-transform" />
 </Link>
 </div>
 </form>
 </section>
 )
}
