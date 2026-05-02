'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { useToast } from './Toast'
import { useTranslation } from '@/app/components/context/LanguageProvider'

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

interface Props {
 value: string
 onChange: (url: string) => void
 folder?: string
 aspectRatio?: '16/9' | '1/1'
 label?: string
}

export default function ImageUpload({
 value,
 onChange,
 folder = 'general',
 aspectRatio = '16/9',
 label,
}: Props) {
 const [uploading, setUploading] = useState(false)
 const inputRef = useRef<HTMLInputElement>(null)
 const { toast } = useToast()
 const t = useTranslation()

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0]
 if (!file) return

 // 10 MB limit
 if (file.size > 10 * 1024 * 1024) {
 toast.error('La imagen no debe superar 10 MB')
 return
 }

 setUploading(true)
 try {
 const formData = new FormData()
 formData.append('file', file)
 formData.append('upload_preset', UPLOAD_PRESET!)
 formData.append('folder', `mySherry/${folder}`)

 const res = await fetch(
 `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
 { method: 'POST', body: formData }
 )

 if (!res.ok) throw new Error('Upload failed')
 const data = await res.json()
 onChange(data.secure_url)
 toast.success('Imagen subida correctamente')
 } catch {
 toast.error('Error al subir la imagen. Intenta de nuevo.')
 } finally {
 setUploading(false)
 if (inputRef.current) inputRef.current.value = ''
 }
 }

 const aspectClass = aspectRatio === '1/1' ? 'aspect-square max-h-48' : 'aspect-video max-h-52'

 return (
 <div className="space-y-2">
 {label && (
 <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">
 {label}
 </p>
 )}

 <div
 onClick={() => !uploading && inputRef.current?.click()}
 className={`
 relative rounded-[2rem] overflow-hidden border-2 border-dashed
 cursor-pointer transition-all duration-200
 ${value
 ? `${aspectClass} border-transparent`
 : 'h-36 border-gray-200 dark:border-gray-700 hover:border-orange-300 bg-gray-50 dark:bg-gray-800 hover:bg-orange-50/30'
 }
 ${uploading ? 'cursor-wait' : ''}
 `}
 >
 {value ? (
 <>
 <img
 src={value}
 alt="preview"
 className="w-full h-full object-cover"
 />
 <div className="absolute inset-0 bg-black/0 dark:bg-gray-950/0 hover:bg-black/40 dark:bg-gray-950/40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
 <span className="text-white font-black text-sm bg-black/50 dark:bg-gray-950/50 px-4 py-2 rounded-full">
 {t.form.changeImage}
 </span>
 </div>
 </>
 ) : (
 <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
 <ImagePlus size={32} className="text-gray-300" />
 <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
 {t.form.uploadImage}
 </span>
 <span className="text-[10px] text-gray-300">
 {t.form.imageFormats}
 </span>
 </div>
 )}

 {uploading && (
 <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-900/70">
 <Loader2 size={32} className="text-orange-500 animate-spin" />
 </div>
 )}
 </div>

 {value && (
 <button
 type="button"
 onClick={() => onChange('')}
 className="flex items-center gap-1 text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
 >
 <X size={12} /> {t.form.removeImage}
 </button>
 )}

 <input
 ref={inputRef}
 type="file"
 accept="image/*"
 className="hidden"
 onChange={handleFileChange}
 />
 </div>
 )
}
