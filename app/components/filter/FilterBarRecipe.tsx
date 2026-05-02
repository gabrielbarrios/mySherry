"use client";

import Link from 'next/link';
import { Search, Tag, Eraser } from 'lucide-react';
import Heading from '../ui/Heading';
import ButtonAction from '../ui/ButtonAction';
import FormInput from '../form/FormInput';

import { useTranslation } from '@/app/components/context/LanguageProvider';

interface Props {
    params: { name?: string; tags?: string };
    basePath: string; // Ej: "/recipes" o "/restaurants"
}

export default function FilterBarRecipe({
    params,
    basePath
}: Props) {
    const t = useTranslation();

    return (
        <section className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm mb-12">
            <Heading level="h2" className="mb-6 text-gray-400">
                {t.recipes.filter.title}
            </Heading>

            <form method="GET" action={basePath} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Búsqueda por Nombre */}
                <div className="flex flex-col">
                    <div className="relative">
                        <FormInput
                            label={t.recipes.filter.name}
                            id='name'
                            name='name'
                            defaultValue={params.name}
                            placeholder={t.recipes.placeholder.name}
                            type='text'
                            className=''
                            icon={Search}
                        />

                    </div>
                </div>

                {/* Filtro de Tags */}
                <div className="flex flex-col">
                    <div className="relative">
                        <FormInput
                            label={t.recipes.filter.tag}
                            id='tags'
                            name='tags'
                            defaultValue={params.tags}
                            type='text'
                            className=''
                            placeholder={t.recipes.placeholder.tags}
                            icon={Tag}
                        />

                    </div>
                </div>


                {/* Botones de Acción */}
                <div className="flex items-end gap-2">
                    <ButtonAction
                        type="submit"
                    >
                        {t.recipes.filter.search}
                    </ButtonAction>
                    <Link
                        href={basePath}
                        className="flex-1 p-4 bg-gray-100 text-gray-400 rounded-2xl hover:bg-gray-200 hover:text-gray-600 transition-all flex items-center justify-center group"
                        title={t.recipes.filter.clean}
                    >
                        <Eraser size={20} className="group-active:rotate-12 transition-transform" />
                    </Link>
                </div>
            </form>
        </section>
    );
}