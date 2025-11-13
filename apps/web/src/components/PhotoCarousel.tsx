'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PhotoCarouselProps {
  images: string[];
  alt: string;
}

export function PhotoCarousel({ images, alt }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-96 bg-gray-200 flex items-center justify-center">
        <p className="text-gray-400">No images available</p>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full">
      {/* Main image */}
      <div className="relative w-full h-96 md:h-[500px] overflow-hidden rounded-lg">
        <Image
          src={images[currentIndex]}
          alt={`${alt} - Image ${currentIndex + 1}`}
          fill
          className="object-cover"
          priority
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 md:grid-cols-8 gap-2">
          {images.slice(0, 8).map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative h-16 md:h-20 overflow-hidden rounded-md ${
                currentIndex === index ? 'ring-2 ring-pink-600' : 'opacity-70 hover:opacity-100'
              } transition-all`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
          {images.length > 8 && (
            <div className="relative h-16 md:h-20 bg-gray-200 rounded-md flex items-center justify-center text-gray-600 text-sm font-medium">
              +{images.length - 8}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
