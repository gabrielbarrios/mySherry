'use client'

import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, MapPin, ArrowLeft, Plus } from 'lucide-react'
import InteractiveMap from './InteractiveMap'
import { useTranslation } from '@/app/components/context/LanguageProvider'

export type VisitedLocation = {
 country_code: string
 country_name: string
 region_code?: string | null
 region_name?: string | null
}

// Países que tienen mapa detallado en /public/maps/{code}.svg
const COUNTRIES_WITH_DETAIL = new Set(['MX', 'US', 'JP', 'RU'])

interface Props {
 value: VisitedLocation[]
 onChange: (locations: VisitedLocation[]) => void
}

export default function LocationPicker({ value, onChange }: Props) {
 const t = useTranslation()
 const [openCountry, setOpenCountry] = useState<{ code: string; name: string } | null>(null)

 const selectedCountryCodes = useMemo(
 () => new Set(value.map(l => l.country_code)),
 [value]
 )

 const selectedRegionCodes = useMemo(
 () =>
 new Set(
 value
 .filter(l => l.region_code && l.country_code === openCountry?.code)
 .map(l => l.region_code as string)
 ),
 [value, openCountry]
 )

 const handleCountryClick = (code: string, name: string) => {
 setOpenCountry({ code, name })
 }

 const addLocation = (loc: VisitedLocation) => {
 // No duplicar exactamente la misma región
 const exists = value.some(
 v =>
 v.country_code === loc.country_code &&
 (v.region_code || null) === (loc.region_code || null)
 )
 if (exists) return
 onChange([...value, loc])
 }

 const removeLocation = (idx: number) => {
 const next = [...value]
 next.splice(idx, 1)
 onChange(next)
 }

 const handleRegionClick = (regionCode: string, regionName: string) => {
 if (!openCountry) return
 // Toggle: si ya está seleccionada, quitarla; si no, agregarla
 const existingIdx = value.findIndex(
 v => v.country_code === openCountry.code && v.region_code === regionCode
 )
 if (existingIdx >= 0) {
 removeLocation(existingIdx)
 return
 }
 addLocation({
 country_code: openCountry.code,
 country_name: openCountry.name,
 region_code: regionCode,
 region_name: regionName,
 })
 }

 const handleAddCountryOnly = () => {
 if (!openCountry) return
 addLocation({
 country_code: openCountry.code,
 country_name: openCountry.name,
 region_code: null,
 region_name: null,
 })
 setOpenCountry(null)
 }

 const countryHasDetail = openCountry ? COUNTRIES_WITH_DETAIL.has(openCountry.code) : false
 // En el mapa del país, filtrar paths que empiecen con "{CC}-" (regiones)
 const regionIdFilter = openCountry
 ? (id: string) => id.startsWith(`${openCountry.code}-`)
 : undefined

 return (
 <div>
 <div className="mb-4">
 <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-2">
 {t.travels.locations.title}
 </p>
 <p className="text-xs text-gray-500 dark:text-gray-400 italic">
 {t.travels.locations.description}
 </p>
 </div>

 {/* Chips de ubicaciones seleccionadas */}
 <div className="mb-6">
 {value.length === 0 ? (
 <p className="text-sm text-gray-400 italic">{t.travels.locations.empty}</p>
 ) : (
 <div className="flex flex-wrap gap-2">
 {value.map((loc, idx) => (
 <div
 key={`${loc.country_code}-${loc.region_code || 'all'}-${idx}`}
 className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100 px-3 py-1.5 rounded-2xl"
 >
 <MapPin size={14} />
 <span className="text-xs font-bold">
 {loc.region_name ? `${loc.region_name}, ` : ''}{loc.country_name}
 </span>
 <button
 type="button"
 onClick={() => removeLocation(idx)}
 className="ml-1 hover:bg-orange-200 dark:hover:bg-orange-900 rounded-full p-0.5"
 aria-label={t.travels.locations.removeLocation}
 >
 <X size={12} />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Mapa mundial */}
 <div className="bg-gradient-to-b from-sky-50 to-sky-100 dark:from-sky-950 dark:to-sky-900 rounded-[2rem] p-4 border border-sky-200 dark:border-sky-800">
 <div className="aspect-[965/503] w-full">
 <InteractiveMap
 src="/maps/world.svg"
 selectedIds={selectedCountryCodes}
 onSelect={handleCountryClick}
 ariaLabel="Mapa mundial"
 />
 </div>
 <p className="text-[10px] text-center text-gray-500 dark:text-gray-400 mt-2 font-bold uppercase tracking-widest">
 {t.travels.locations.selectCountry}
 </p>
 </div>

 {/* Modal con mapa del país */}
 {openCountry && createPortal(
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <div
 className="absolute inset-0 bg-black/50 backdrop-blur-sm"
 onClick={() => setOpenCountry(null)}
 />
 <div className="relative bg-white dark:bg-gray-900 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
 {/* Header */}
 <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
 <button
 type="button"
 onClick={() => setOpenCountry(null)}
 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-orange-600"
 >
 <ArrowLeft size={16} /> {t.travels.locations.back}
 </button>
 <h2 className="text-xl font-black uppercase tracking-tight">
 {openCountry.name}
 </h2>
 <button
 type="button"
 onClick={() => setOpenCountry(null)}
 className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
 aria-label={t.travels.locations.close}
 >
 <X size={20} />
 </button>
 </div>

 {/* Body */}
 <div className="flex-1 overflow-auto p-6">
 {countryHasDetail ? (
 <>
 <div className="bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-[2rem] p-4 border border-orange-200 dark:border-orange-800">
 <div className="w-full" style={{ minHeight: '50vh' }}>
 <InteractiveMap
 src={`/maps/${openCountry.code}.svg`}
 selectedIds={selectedRegionCodes}
 onSelect={handleRegionClick}
 idFilter={regionIdFilter}
 ariaLabel={`Mapa de ${openCountry.name}`}
 />
 </div>
 <p className="text-[10px] text-center text-gray-500 dark:text-gray-400 mt-2 font-bold uppercase tracking-widest">
 {t.travels.locations.selectRegion}
 </p>
 </div>
 <div className="mt-4 flex justify-center">
 <button
 type="button"
 onClick={handleAddCountryOnly}
 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-600 hover:text-orange-700"
 >
 <Plus size={14} />
 {t.travels.locations.addCountryOnly}
 </button>
 </div>
 </>
 ) : (
 <div className="text-center py-12">
 <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
 <p className="text-gray-500 dark:text-gray-400 mb-6 italic">
 {t.travels.locations.mapUnavailable}
 </p>
 <button
 type="button"
 onClick={handleAddCountryOnly}
 className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-sm"
 >
 <Plus size={16} />
 {t.travels.locations.addCountryOnly}
 </button>
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
