import React from 'react';
import Image from 'next/image';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
}

export default function ImageLightbox({ isOpen, onClose, imageSrc, imageAlt }: ImageLightboxProps) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white text-2xl"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>
      <div className="max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <Image src={imageSrc} alt={imageAlt} width={800} height={800} className="object-contain" />
      </div>
    </div>
  );
}
