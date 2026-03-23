'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'

type Props = {
  title: string
  imageCover: string
  images?: string[]
  hasDiscount: boolean
  savePercent: number
}

export default function ProductImageGallery({
  title,
  imageCover,
  images = [],
  hasDiscount,
  savePercent,
}: Props) {
  const galleryImages = useMemo(() => {
    const list = [imageCover, ...images].filter(Boolean)
    return Array.from(new Set(list))
  }, [imageCover, images])

  const [activeImage, setActiveImage] = useState(galleryImages[0] ?? imageCover)

  return (
    <div id="product-images" className="lg:w-1/4">
      <div className="bg-white rounded-xl shadow-sm p-4 sticky top-4">
        <div className="aspect-square bg-white rounded-lg overflow-hidden border border-gray-100 relative">
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Save {savePercent}%</span>
            </div>
          )}
          <Image
            className="w-full h-full object-contain"
            alt={title}
            src={activeImage}
            width={700}
            height={700}
            priority
          />
        </div>

        {galleryImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {galleryImages.map((img, index) => {
              const isActive = img === activeImage
              return (
                <button
                  key={`${img}-${index}`}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors bg-white ${
                    isActive ? 'border-green-500' : 'border-gray-100 hover:border-green-400'
                  }`}
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  onClick={() => setActiveImage(img)}
                >
                  <Image className="w-full h-full object-contain" alt={title} src={img} width={120} height={120} />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
