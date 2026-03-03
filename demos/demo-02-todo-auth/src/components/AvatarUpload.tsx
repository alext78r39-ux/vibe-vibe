'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AvatarUploadProps {
  initials: string
  currentImage?: string | null
  onUploaded: (imageUrl: string) => void
}

export function AvatarUpload({ initials, currentImage, onUploaded }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        try {
          const res = await fetch('/api/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64 }),
          })
          if (!res.ok) throw new Error()
          toast.success('头像已更新')
          onUploaded(base64)
        } catch {
          toast.error('头像上传失败')
          setPreview(null)
        }
      }
      reader.readAsDataURL(file)
    },
    [onUploaded]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 2 * 1024 * 1024,
    multiple: false,
  })

  const displayImage = preview || currentImage

  return (
    <div {...getRootProps()} className="group relative cursor-pointer">
      <input {...getInputProps()} />
      <Avatar className="h-16 w-16">
        {displayImage && <AvatarImage src={displayImage} alt="头像" />}
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div
        className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/40 transition-opacity ${
          isDragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <Upload size={18} className="text-white" />
      </div>
    </div>
  )
}
