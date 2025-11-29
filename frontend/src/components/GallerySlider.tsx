'use client'

import { ThemeContext } from '@/app/theme-provider'
import { ButtonCircle } from '@/shared/Button'
import { variants } from '@/utils/animationVariants'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useContext, useState, useMemo } from 'react'
import { useSwipeable } from 'react-swipeable'
import { sanitizeImageUrl, sanitizeImageUrls } from '@/utils/imageUtils'

interface GallerySliderProps {
  className?: string
  galleryImgs: (
    | {
        src: string
        width: number
        height: number
      }
    | string
  )[]
  ratioClass?: string
  href?: string
  imageClass?: string
  galleryClass?: string
  navigation?: boolean
}

export default function GallerySlider({
  className,
  galleryImgs,
  ratioClass = 'aspect-w-4 aspect-h-3',
  imageClass,
  galleryClass,
  href = '/stay-listings/the-handle',
  navigation = true,
}: GallerySliderProps) {
  const theme = useContext(ThemeContext)

  const [loaded, setLoaded] = useState(false)
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  
  // Sanitize image URLs to prevent invalid URLs from causing errors
  const images = useMemo(() => {
    if (!galleryImgs || galleryImgs.length === 0) {
      return ['/images/placeholder.jpg']
    }
    
    // Convert galleryImgs to string array and sanitize
    const imageStrings: string[] = galleryImgs.map((img) => {
      if (typeof img === 'string') {
        return sanitizeImageUrl(img)
      }
      // If it's an object with src property
      if (typeof img === 'object' && img !== null && 'src' in img) {
        return sanitizeImageUrl(img.src)
      }
      return '/images/placeholder.jpg'
    })
    
    // Filter out duplicates and ensure at least one image
    const uniqueImages = Array.from(new Set(imageStrings))
    return uniqueImages.length > 0 ? uniqueImages : ['/images/placeholder.jpg']
  }, [galleryImgs])

  function changePhotoId(newVal: number) {
    if (newVal > index) {
      setDirection(theme?.themeDir === 'rtl' ? -1 : 1)
    } else {
      setDirection(theme?.themeDir === 'rtl' ? 1 : -1)
    }
    setIndex(newVal)
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (theme?.themeDir === 'rtl') {
        if (index > 0) {
          changePhotoId(index - 1)
        }
      } else if (index < images?.length - 1) {
        changePhotoId(index + 1)
      }
    },
    onSwipedRight: () => {
      if (theme?.themeDir === 'rtl') {
        if (index < images?.length - 1) {
          changePhotoId(index + 1)
        }
      } else if (index > 0) {
        changePhotoId(index - 1)
      }
    },
    trackMouse: true,
  })

  // Ensure currentImage is always a valid URL
  // images is now always a string array after sanitization
  const currentImage = useMemo(() => {
    const img = images[index] || images[0] || '/images/placeholder.jpg'
    // images is already sanitized and is a string array
    return typeof img === 'string' ? img : '/images/placeholder.jpg'
  }, [images, index])

  return (
    <MotionConfig
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      <div className={clsx(`group/cardGallerySlider group relative`, className)} {...handlers}>
        {/* Main image */}
        <div className={clsx(`w-full overflow-hidden rounded-xl`, galleryClass)}>
          <Link href={href} className={clsx(`relative flex items-center justify-center`, ratioClass)}>
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                variants={variants(340, 1)}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0"
              >
                <Image
                  src={currentImage || ''}
                  fill
                  alt="listing card gallery"
                  className={clsx(`rounded-xl object-cover`, imageClass)}
                  onLoad={() => setLoaded(true)}
                  sizes="(max-width: 1025px) 100vw, 25vw"
                  unoptimized={true}
                />
              </motion.div>
            </AnimatePresence>
          </Link>
        </div>

        {/* Buttons + bottom nav bar */}
        <>
          {/* Buttons */}
          {loaded && navigation && (
            <div className="opacity-0 transition-opacity group-hover/cardGallerySlider:opacity-100">
              {index > 0 && (
                <div className="absolute start-3 top-[calc(50%-1rem)]">
                  <ButtonCircle color="white" onClick={() => changePhotoId(index - 1)} className={'size-8!'}>
                    <ChevronLeftIcon className="size-4! rtl:rotate-180" />
                  </ButtonCircle>
                </div>
              )}
              {index + 1 < images.length && (
                <div className="absolute end-3 top-[calc(50%-1rem)]">
                  <ButtonCircle color="white" onClick={() => changePhotoId(index + 1)} className={'size-8!'}>
                    <ChevronRightIcon className="size-4! rtl:rotate-180" />
                  </ButtonCircle>
                </div>
              )}
            </div>
          )}

          {/* Bottom Nav bar */}
          <div className="absolute inset-x-0 bottom-0 h-10 rounded-b-xl bg-linear-to-t from-neutral-900 opacity-50"></div>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center justify-center gap-x-1.5">
            {images.map((_, i) => (
              <button
                className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/60'}`}
                onClick={() => changePhotoId(i)}
                key={i}
              />
            ))}
          </div>
        </>
      </div>
    </MotionConfig>
  )
}
