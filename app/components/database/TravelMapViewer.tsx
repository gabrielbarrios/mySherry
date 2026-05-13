'use client'

import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ArrowLeft, MapPin } from 'lucide-react'
import InteractiveMap from './InteractiveMap'
import type { VisitedLocation } from './LocationPicker'

const COUNTRIES_WITH_DETAIL = new Set(['MX', 'US', 'JP', 'RU'])

interface Props {
 locations: VisitedLocation[]
}

export default function TravelMapViewer({ locations }: Props) {
 const [openCountry, setOpenCountry] = useState<{ code: string; name: string } | null>(null)

 const selectedCountryCodes = useMemo(
 () => new Set(locations.map(l => l.country_code)),
 [locations]
 )

 const selectedRegionCodes = useMemo(
 () =>
 new Set(
 locations
 .filter(l => l.region_code && l.country_code === openCountry?.code)
 .map(l => l.region_code as string)
 ),
 [locations, openCountry]
 )

 const countriesOnlyClickable = (id: string) => selectedCountryCodes.has(id)

 const regionsForOpenCountry = useMemo(
 () =>
 openCountry
 ? locations.filter(l => l.country_code === openCountry.code && l.region_code)
 : [],
 [locations, openCountry]
 )

 if (locations.length === 0) {
 return (
 <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
 <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
 <p className="text-gray-500 dark:text-gray-400 italic text-sm">
 Sin ubicaciones marcadas
 </p>
 </div>
 )
 }

 const countryHasDetail = openCountry ? COUNTRIES_WITH_DETAIL.has(openCountry.code) : false

 return (
 <div>
 <div className="bg-gradient-to-b from-sky-50 to-sky-100 dark:from-sky-950 dark:to-sky-900 rounded-[2rem] p-4 border border-sky-200 dark:border-sky-800">
 <div className="aspect-[965/503] w-full">
 <InteractiveMap
 src="/maps/world.svg"
 selectedIds={selectedCountryCodes}
 onSelect={(id, name) => setOpenCountry({ code: id, name })}
 idFilter={countriesOnlyClickable}
 ariaLabel="Mapa mundial del viaje"
 />
 </div>
 <p className="text-[10px] text-center text-gray-500 dark:text-gray-400 mt-2 font-bold uppercase tracking-widest">
 {locations.length} {locations.length === 1 ? 'país' : 'países'} • haz click en uno marcado para ver detalle
 </p>
 </div>

 {/* Chips de regiones */}
 <div className="flex flex-wrap gap-2 mt-4">
 {locations.map((loc, idx) => (
 <div
 key={`${loc.country_code}-${loc.region_code || 'all'}-${idx}`}
 className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100 px-3 py-1.5 rounded-2xl"
 >
 <MapPin size={12} />
 <span className="text-xs font-bold">
 {loc.region_name ? `${loc.region_name}, ` : ''}{loc.country_name}
 </span>
 </div>
 ))}
 </div>

 {/* Modal con detalle del país */}
 {openCountry && createPortal(
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <div
 className="absolute inset-0 bg-black/50 backdrop-blur-sm"
 onClick={() => setOpenCountry(null)}
 />
 <div className="relative bg-white dark:bg-gray-900 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
 <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
 <button
 type="button"
 onClick={() => setOpenCountry(null)}
 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-orange-600"
 >
 <ArrowLeft size={16} /> Volver
 </button>
 <h2 className="text-xl font-black uppercase tracking-tight">
 {openCountry.name}
 </h2>
 <button
 type="button"
 onClick={() => setOpenCountry(null)}
 className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
 >
 <X size={20} />
 </button>
 </div>

 <div className="flex-1 overflow-auto p-6">
 {countryHasDetail ? (
 <div className="bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-[2rem] p-4 border border-orange-200 dark:border-orange-800">
 <div className="w-full" style={{ minHeight: '50vh' }}>
 <InteractiveMap
 src={`/maps/${openCountry.code}.svg`}
 selectedIds={selectedRegionCodes}
 idFilter={(id) => id.startsWith(`${openCountry.code}-`)}
 ariaLabel={`Mapa de ${openCountry.name}`}
 />
 </div>
 </div>
 ) : (
 <div className="text-center py-12">
 <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
 <p className="text-gray-500 dark:text-gray-400 italic">
 No hay mapa detallado para este país
 </p>
 </div>
 )}

 {regionsForOpenCountry.length > 0 && (
 <div className="mt-6">
 <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-3">
 Regiones visitadas
 </p>
 <div className="flex flex-wrap gap-2">
 {regionsForOpenCountry.map(loc => (
 <span
 key={loc.region_code}
 className="inline-flex items-center gap-2 bg-orange-500 text-white px-3 py-1.5 rounded-2xl text-xs font-bold"
 >
 <MapPin size={12} />
 {loc.region_name}
 </span>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 </div>,
 document.body
 )}
 </div>
 )
}
