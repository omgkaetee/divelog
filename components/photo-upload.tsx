'use client'

import { useRef, ChangeEvent } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PhotoUploadProps {
  photos: string[]
  onChange: (photos: string[]) => void
  className?: string
}

export function PhotoUpload({ photos, onChange, className }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', quality))
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Promise.all(Array.from(files).map(f => compressImage(f))).then((newPhotos) => {
      onChange([...photos, ...newPhotos])
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="w-full border-dashed border-2 h-20 hover:border-primary/50 hover:bg-primary/5"
      >
        <ImagePlus className="size-5 mr-2" />
        Add Memory Photos
      </Button>

      {photos.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 group"
            >
              <img
                src={photo}
                alt={`Dive memory ${index + 1}`}
                className="size-20 object-cover rounded-lg border border-border"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 size-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
