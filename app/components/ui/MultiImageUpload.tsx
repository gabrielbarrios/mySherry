'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { useToast } from './Toast'
import { useTranslation } from '@/app/components/context/LanguageProvider'

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

interface Props {
    value: string[]
    onChange: (urls: string[]) => void
    folder?: string
    label?: string
    maxPhotos?: number
}

export default function MultiImageUpload({
    value = [],
    onChange,
    folder = 'general',
    label,
    maxPhotos = 20,
}: Props) {
    const [uploading, setUploading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()
    const t = useTranslation()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return

        setUploading(true)
        const uploaded: string[] = []

        for (const file of files) {
            if (value.length + uploaded.length >= maxPhotos) break

            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name}: ${t.form.imageMaxSize}`)
                continue
            }

            try {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('upload_preset', UPLOAD_PRESET!)
                formData.append('folder', `mySherry/${folder}`)

                const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                    { method: 'POST', body: formData }
                )
                if (!res.ok) throw new Error()
                const data = await res.json()
                uploaded.push(data.secure_url)
            } catch {
                toast.error(`${t.form.uploadError}: ${file.name}`)
            }
        }

        if (uploaded.length > 0) {
            onChange([...value, ...uploaded])
            toast.success(`${uploaded.length} ${t.form.photosUploaded}`)
        }

        setUploading(false)
        if (inputRef.current) inputRef.current.value = ''
    }

    const removePhoto = (index: number) => {
        onChange(value.filter((_, i) => i !== index))
    }

    const canAddMore = value.length < maxPhotos

    return (
        <div className="space-y-3">
            {label && (
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    {label}
                </p>
            )}

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {value.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}

                {canAddMore && (
                    <button
                        type="button"
                        onClick={() => !uploading && inputRef.current?.click()}
                        disabled={uploading}
                        className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-orange-300 bg-gray-50 hover:bg-orange-50/30 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-wait"
                    >
                        {uploading ? (
                            <Loader2 size={24} className="text-orange-400 animate-spin" />
                        ) : (
                            <>
                                <ImagePlus size={20} className="text-gray-300" />
                                <span className="text-[10px] font-bold text-gray-400 text-center leading-tight px-1">
                                    {t.form.addPhoto}
                                </span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {value.length > 0 && (
                <p className="text-[10px] text-gray-400">
                    {value.length}/{maxPhotos} {t.form.photos}
                </p>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    )
}
