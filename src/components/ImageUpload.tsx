/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ImageUpload.tsx
'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { uploadImage, deleteImage } from '@/src/lib/storage'
import { useNotification } from '@/src/context/NotificationContext'

interface ImageUploadProps {
    bucket: 'produtos' | 'perfis'
    folder?: string
    currentImageUrl?: string
    currentImagePath?: string
    onUploadSuccess: (url: string, path: string) => void
    label?: string
    maxSizeMB?: number
}

export default function ImageUpload({
    bucket,
    folder,
    currentImageUrl,
    currentImagePath,
    onUploadSuccess,
    label = 'Escolher imagem',
    maxSizeMB = 5
}: ImageUploadProps) {
    const { success, error } = useNotification()
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validar tamanho
        const maxSize = maxSizeMB * 1024 * 1024
        if (file.size > maxSize) {
            error(`Imagem muito grande. Máximo ${maxSizeMB}MB`)
            return
        }

        // Criar preview local
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload
        setLoading(true)
        try {
            const result = await uploadImage(file, bucket, folder)
            onUploadSuccess(result.url, result.path)
            success('Imagem enviada com sucesso!')
        } catch (err: any) {
            error(err.message || 'Erro ao enviar imagem')
            setPreview(currentImageUrl || null)
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = async () => {
        if (!currentImagePath) return

        setLoading(true)
        try {
            await deleteImage(bucket, currentImagePath)
            setPreview(null)
            onUploadSuccess('', '')
            success('Imagem removida')
        } catch {
            error('Erro ao remover imagem')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-3">
            <label className="block text-base font-semibold text-neutral-700">
                {label}
            </label>

            {/* Preview */}
            {preview ? (
                <div className="relative w-full h-64 bg-neutral-100 rounded-xl overflow-hidden border-2 border-neutral-300">
                    <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                    />
                    {!loading && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 bg-error text-neutral-0 rounded-full p-2 shadow-lg active:opacity-80 btn-touch"
                        >
                            <X size={20} />
                        </button>
                    )}
                    {loading && (
                        <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center">
                            <Loader2 size={40} className="text-neutral-0 animate-spin" />
                        </div>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={loading}
                    className="w-full h-64 bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center gap-3 active:bg-neutral-200 transition-all disabled:opacity-50 btn-touch"
                >
                    {loading ? (
                        <Loader2 size={48} className="text-neutral-400 animate-spin" />
                    ) : (
                        <>
                            <Upload size={48} className="text-neutral-400" />
                            <p className="text-neutral-600 font-medium">Clique para escolher</p>
                            <p className="text-sm text-neutral-500">
                                JPG, PNG ou WebP (máx. {maxSizeMB}MB)
                            </p>
                        </>
                    )}
                </button>
            )}

            {/* Input escondido */}
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    )
}
