"use client";

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from '@/app/components/context/LanguageProvider';

interface BackButtonProps {
 fallback?: string; // Por si quieres forzar una ruta específica
}

export default function BackButton({ fallback }: BackButtonProps) {
 const router = useRouter();

 const t = useTranslation();

 const handleBack = () => {
 // Si le pasamos una ruta específica (ej. /recipes), vamos ahí
 if (fallback) {
 router.push(fallback);
 return;
 }

 // Si no hay fallback, usamos el historial real del navegador
 // Esto funciona para cualquier URL sin importar cuántos segmentos tenga
 if (window.history.length > 1) {
 router.back();
 } else {
 // Si por alguna razón no hay historial (ej. entró directo por link), al inicio
 router.push('/');
 }
 };

 return (
 <button
 onClick={handleBack}
 type="button"
 className="group flex items-center gap-2 text-gray-400 hover:text-orange-600 transition-colors mb-6 font-medium text-sm"
 >
 <div className="p-1.5 rounded-xl bg-gray-50 group-hover:bg-orange-50 transition-colors border border-gray-100 group-hover:border-orange-100">
 <ChevronLeft size={18} />
 </div>
 <span>{t.global.back}</span>
 </button>
 );
}