import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plane, List } from 'lucide-react'
import PageHeader from '@/app/components/ui/SectionHeader'
import TravelMapViewer from '@/app/components/database/TravelMapViewer'
import type { VisitedLocation } from '@/app/components/database/LocationPicker'

export default async function UserTravelsMapPage({
 params,
}: {
 params: Promise<{ username: string }>
}) {
 const supabase = await createClient()
 const { username } = await params

 const { data: profile } = await supabase
 .from('profiles')
 .select('id, username')
 .eq('username', username)
 .single()

 if (!profile) return notFound()

 const { data: travels } = await supabase
 .from('travels')
 .select('id, name, slug, visited_locations, image_url, start_date')
 .eq('user_id', profile.id)
 .order('start_date', { ascending: false })

 // Agrega y deduplica todas las ubicaciones visitadas
 const dedupKey = (l: VisitedLocation) => `${l.country_code}::${l.region_code || ''}`
 const seen = new Set<string>()
 const aggregated: VisitedLocation[] = []
 const countByCountry = new Map<string, number>()

 ;(travels || []).forEach(tr => {
 if (!Array.isArray(tr.visited_locations)) return
 ;(tr.visited_locations as VisitedLocation[]).forEach(loc => {
 const key = dedupKey(loc)
 if (!seen.has(key)) {
 seen.add(key)
 aggregated.push(loc)
 }
 countByCountry.set(
 loc.country_code,
 (countByCountry.get(loc.country_code) || 0) + 1
 )
 })
 })

 const totalCountries = new Set(aggregated.map(l => l.country_code)).size
 const totalRegions = aggregated.filter(l => l.region_code).length
 const tripsCount = travels?.length || 0

 return (
 <main className="p-6 max-w-7xl mx-auto text-black dark:text-white">
 <PageHeader
 title={`Mapa de viajes de @${username}`}
 description={`${tripsCount} viaje${tripsCount === 1 ? '' : 's'} · ${totalCountries} país${totalCountries === 1 ? '' : 'es'} · ${totalRegions} región${totalRegions === 1 ? '' : 'es'}`}
 back
 />

 <div className="flex justify-end mb-6">
 <Link
 href={`/user/${username}/travels`}
 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-orange-600 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-2 rounded-2xl"
 >
 <List size={14} />
 Ver lista
 </Link>
 </div>

 {tripsCount === 0 ? (
 <div className="mt-12 text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
 <Plane className="mx-auto text-gray-300 mb-4" size={48} />
 <p className="text-gray-500 dark:text-gray-400 font-medium">
 @{username} aún no ha registrado ningún viaje.
 </p>
 </div>
 ) : (
 <TravelMapViewer locations={aggregated} />
 )}
 </main>
 )
}
