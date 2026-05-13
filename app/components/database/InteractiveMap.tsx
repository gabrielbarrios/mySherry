'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Plus, Minus, Maximize2 } from 'lucide-react'

interface InteractiveMapProps {
 src: string
 selectedIds: Set<string>
 onSelect?: (id: string, name: string) => void
 idFilter?: (id: string) => boolean
 className?: string
 ariaLabel?: string
}

const MIN_SCALE = 1
const MAX_SCALE = 6
const ZOOM_STEP = 1.5
const PAN_THRESHOLD = 5 // px — más que esto, es pan; menos, es click

type Gesture = {
 type: 'pan' | 'pinch'
 startScale: number
 startX: number
 startY: number
 startClientX: number
 startClientY: number
 pinchInitialDist: number
 pinchInitialCenter: { x: number; y: number }
 moved: boolean
}

export default function InteractiveMap({
 src,
 selectedIds,
 onSelect,
 idFilter,
 className,
 ariaLabel,
}: InteractiveMapProps) {
 const wrapperRef = useRef<HTMLDivElement>(null)
 const containerRef = useRef<HTMLDivElement>(null)
 const [status, setStatus] = useState<{ loading: boolean; error: string | null }>({
 loading: true,
 error: null,
 })
 const [hovered, setHovered] = useState<{ id: string; name: string; x: number; y: number } | null>(null)
 const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 })

 // Refs para evitar stale closures dentro de handlers
 const transformRef = useRef(transform)
 useEffect(() => {
 transformRef.current = transform
 }, [transform])

 const gestureRef = useRef<Gesture | null>(null)

 const clampTransform = useCallback((scale: number, x: number, y: number) => {
 const s = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale))
 if (!wrapperRef.current) return { scale: s, x: 0, y: 0 }
 const rect = wrapperRef.current.getBoundingClientRect()
 const w = rect.width
 const h = rect.height
 const minX = -(s - 1) * w
 const minY = -(s - 1) * h
 return {
 scale: s,
 x: Math.max(minX, Math.min(0, x)),
 y: Math.max(minY, Math.min(0, y)),
 }
 }, [])

 const zoomAtPoint = useCallback(
 (newScale: number, anchorClientX: number, anchorClientY: number) => {
 const current = transformRef.current
 if (!wrapperRef.current) return
 const rect = wrapperRef.current.getBoundingClientRect()
 const px = anchorClientX - rect.left
 const py = anchorClientY - rect.top
 const oldScale = current.scale
 const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale))
 if (clampedScale === oldScale) return
 const ratio = clampedScale / oldScale
 const newX = px - (px - current.x) * ratio
 const newY = py - (py - current.y) * ratio
 setTransform(clampTransform(clampedScale, newX, newY))
 },
 [clampTransform]
 )

 const zoomCentered = useCallback(
 (factor: number) => {
 if (!wrapperRef.current) return
 const rect = wrapperRef.current.getBoundingClientRect()
 const cx = rect.left + rect.width / 2
 const cy = rect.top + rect.height / 2
 zoomAtPoint(transformRef.current.scale * factor, cx, cy)
 },
 [zoomAtPoint]
 )

 const resetTransform = useCallback(() => {
 setTransform({ scale: 1, x: 0, y: 0 })
 }, [])

 // ====== Carga del SVG ======
 useEffect(() => {
 let cancelled = false

 fetch(src)
 .then(r => {
 if (!r.ok) throw new Error(`No se pudo cargar ${src}`)
 return r.text()
 })
 .then(svgText => {
 if (cancelled || !containerRef.current) return
 containerRef.current.innerHTML = svgText
 const svg = containerRef.current.querySelector('svg')
 if (svg) {
 svg.setAttribute('width', '100%')
 svg.setAttribute('height', '100%')
 svg.removeAttribute('style')
 svg.style.display = 'block'
 if (ariaLabel) svg.setAttribute('aria-label', ariaLabel)
 }
 setStatus({ loading: false, error: null })
 })
 .catch(err => {
 if (cancelled) return
 setStatus({ loading: false, error: err.message || 'Error cargando el mapa' })
 })

 return () => {
 cancelled = true
 }
 }, [src, ariaLabel])

 // ====== Repinta selección ======
 useEffect(() => {
 const root = containerRef.current
 if (!root) return
 root.querySelectorAll<SVGPathElement>('path.land').forEach(p => {
 const id = p.getAttribute('id') || ''
 if (idFilter && !idFilter(id)) {
 p.classList.add('mysherry-disabled')
 return
 }
 p.classList.remove('mysherry-disabled')
 if (selectedIds.has(id)) p.classList.add('mysherry-selected')
 else p.classList.remove('mysherry-selected')
 })
 }, [selectedIds, status.loading, idFilter])

 // ====== Wheel zoom (desktop) ======
 const handleWheel = (e: React.WheelEvent) => {
 e.preventDefault()
 const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
 zoomAtPoint(transformRef.current.scale * factor, e.clientX, e.clientY)
 }

 // ====== Touch (mobile) ======
 const handleTouchStart = (e: React.TouchEvent) => {
 if (e.touches.length === 2) {
 const t1 = e.touches[0]
 const t2 = e.touches[1]
 const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
 const center = {
 x: (t1.clientX + t2.clientX) / 2,
 y: (t1.clientY + t2.clientY) / 2,
 }
 gestureRef.current = {
 type: 'pinch',
 startScale: transformRef.current.scale,
 startX: transformRef.current.x,
 startY: transformRef.current.y,
 startClientX: center.x,
 startClientY: center.y,
 pinchInitialDist: dist,
 pinchInitialCenter: center,
 moved: false,
 }
 } else if (e.touches.length === 1 && transformRef.current.scale > 1) {
 const t = e.touches[0]
 gestureRef.current = {
 type: 'pan',
 startScale: transformRef.current.scale,
 startX: transformRef.current.x,
 startY: transformRef.current.y,
 startClientX: t.clientX,
 startClientY: t.clientY,
 pinchInitialDist: 0,
 pinchInitialCenter: { x: 0, y: 0 },
 moved: false,
 }
 }
 }

 const handleTouchMove = (e: React.TouchEvent) => {
 const g = gestureRef.current
 if (!g) return

 if (g.type === 'pinch' && e.touches.length === 2 && wrapperRef.current) {
 e.preventDefault()
 const t1 = e.touches[0]
 const t2 = e.touches[1]
 const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
 const center = {
 x: (t1.clientX + t2.clientX) / 2,
 y: (t1.clientY + t2.clientY) / 2,
 }
 const ratio = dist / g.pinchInitialDist
 const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, g.startScale * ratio))
 const rect = wrapperRef.current.getBoundingClientRect()
 const px = g.pinchInitialCenter.x - rect.left
 const py = g.pinchInitialCenter.y - rect.top
 const scaleRatio = newScale / g.startScale
 const newX = px - (px - g.startX) * scaleRatio + (center.x - g.pinchInitialCenter.x)
 const newY = py - (py - g.startY) * scaleRatio + (center.y - g.pinchInitialCenter.y)
 setTransform(clampTransform(newScale, newX, newY))
 g.moved = true
 } else if (g.type === 'pan' && e.touches.length === 1) {
 const t = e.touches[0]
 const dx = t.clientX - g.startClientX
 const dy = t.clientY - g.startClientY
 if (Math.abs(dx) > PAN_THRESHOLD || Math.abs(dy) > PAN_THRESHOLD) g.moved = true
 setTransform(clampTransform(g.startScale, g.startX + dx, g.startY + dy))
 }
 }

 const handleTouchEnd = (e: React.TouchEvent) => {
 if (e.touches.length === 0) {
 // Pequeño delay para que el evento click pueda leer `moved` antes de limpiar
 const g = gestureRef.current
 setTimeout(() => {
 if (gestureRef.current === g) gestureRef.current = null
 }, 0)
 }
 }

 // ====== Mouse drag pan (desktop) ======
 const handleMouseDown = (e: React.MouseEvent) => {
 if (transformRef.current.scale <= 1) return
 gestureRef.current = {
 type: 'pan',
 startScale: transformRef.current.scale,
 startX: transformRef.current.x,
 startY: transformRef.current.y,
 startClientX: e.clientX,
 startClientY: e.clientY,
 pinchInitialDist: 0,
 pinchInitialCenter: { x: 0, y: 0 },
 moved: false,
 }
 }

 const handleMouseUp = () => {
 const g = gestureRef.current
 setTimeout(() => {
 if (gestureRef.current === g) gestureRef.current = null
 }, 0)
 }

 // ====== Mouse move: pan + tooltip ======
 const handleMouseMove = (e: React.MouseEvent) => {
 const g = gestureRef.current
 if (g && g.type === 'pan' && e.buttons === 1) {
 const dx = e.clientX - g.startClientX
 const dy = e.clientY - g.startClientY
 if (Math.abs(dx) > PAN_THRESHOLD || Math.abs(dy) > PAN_THRESHOLD) g.moved = true
 setTransform(clampTransform(g.startScale, g.startX + dx, g.startY + dy))
 if (hovered) setHovered(null)
 return
 }

 // Tooltip de hover
 const path = (e.target as Element).closest('path.land') as SVGPathElement | null
 if (!path) {
 if (hovered) setHovered(null)
 return
 }
 const id = path.getAttribute('id') || ''
 const name = path.getAttribute('title') || ''
 if (idFilter && !idFilter(id)) {
 if (hovered) setHovered(null)
 return
 }
 const rect = wrapperRef.current?.getBoundingClientRect()
 if (!rect) return
 const x = e.clientX - rect.left
 const y = e.clientY - rect.top
 setHovered({ id, name, x, y })
 }

 // ====== Click: ignora si fue pan/pinch ======
 const handleClick = (e: React.MouseEvent) => {
 if (gestureRef.current?.moved) return
 if (!onSelect) return
 const path = (e.target as Element).closest('path.land') as SVGPathElement | null
 if (!path) return
 const id = path.getAttribute('id')
 const name = path.getAttribute('title')
 if (!id || !name) return
 if (idFilter && !idFilter(id)) return
 onSelect(id, name)
 }

 const canPan = transform.scale > 1
 const isAnimating = !gestureRef.current

 return (
 <div className={`relative ${className || ''}`}>
 <style jsx global>{`
 .mysherry-map path.land {
 fill: #f3f4f6;
 stroke: #9ca3af;
 stroke-width: 0.4;
 transition: fill 0.15s ease;
 cursor: pointer;
 }
 .mysherry-map path.land:hover {
 fill: #fed7aa;
 }
 .mysherry-map path.land.mysherry-selected {
 fill: #f97316;
 stroke: #c2410c;
 stroke-width: 0.6;
 }
 .mysherry-map path.land.mysherry-disabled {
 cursor: not-allowed;
 opacity: 0.85;
 }
 .mysherry-map path.land.mysherry-disabled:hover {
 fill: #f3f4f6;
 }
 .dark .mysherry-map path.land {
 fill: #1f2937;
 stroke: #4b5563;
 }
 .dark .mysherry-map path.land:hover {
 fill: #7c2d12;
 }
 .dark .mysherry-map path.land.mysherry-selected {
 fill: #ea580c;
 }
 `}</style>

 <div
 ref={wrapperRef}
 className="relative w-full h-full overflow-hidden"
 onWheel={handleWheel}
 onMouseDown={handleMouseDown}
 onMouseMove={handleMouseMove}
 onMouseUp={handleMouseUp}
 onMouseLeave={() => {
 setHovered(null)
 handleMouseUp()
 }}
 onTouchStart={handleTouchStart}
 onTouchMove={handleTouchMove}
 onTouchEnd={handleTouchEnd}
 onClick={handleClick}
 style={{
 cursor: canPan ? (gestureRef.current?.type === 'pan' ? 'grabbing' : 'grab') : 'auto',
 touchAction: 'none',
 }}
 >
 <div
 style={{
 transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
 transformOrigin: '0 0',
 transition: isAnimating ? 'transform 0.2s ease' : 'none',
 width: '100%',
 height: '100%',
 }}
 >
 <div ref={containerRef} className="mysherry-map w-full h-full" />
 </div>
 </div>

 {/* Botones de zoom */}
 <div className="absolute bottom-3 right-3 flex flex-col gap-1 bg-white/95 dark:bg-gray-900/95 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-1 z-20">
 <button
 type="button"
 onClick={() => zoomCentered(ZOOM_STEP)}
 disabled={transform.scale >= MAX_SCALE}
 className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
 title="Acercar"
 aria-label="Acercar"
 >
 <Plus size={16} />
 </button>
 <button
 type="button"
 onClick={() => zoomCentered(1 / ZOOM_STEP)}
 disabled={transform.scale <= MIN_SCALE}
 className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
 title="Alejar"
 aria-label="Alejar"
 >
 <Minus size={16} />
 </button>
 <button
 type="button"
 onClick={resetTransform}
 disabled={transform.scale === 1 && transform.x === 0 && transform.y === 0}
 className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
 title="Restablecer"
 aria-label="Restablecer"
 >
 <Maximize2 size={14} />
 </button>
 </div>

 {status.loading && (
 <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-gray-900/80 z-10">
 <div className="animate-pulse text-sm font-bold text-gray-500">Cargando mapa...</div>
 </div>
 )}
 {status.error && (
 <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-950/40 z-10">
 <div className="text-sm font-bold text-red-600 px-4 text-center">{status.error}</div>
 </div>
 )}
 {hovered && (
 <div
 className="pointer-events-none absolute -translate-x-1/2 -translate-y-full bg-black/85 text-white text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider whitespace-nowrap shadow-xl z-10"
 style={{ left: hovered.x, top: Math.max(hovered.y - 8, 16) }}
 >
 {hovered.name}
 </div>
 )}
 </div>
 )
}
