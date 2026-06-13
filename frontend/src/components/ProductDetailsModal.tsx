import React from 'react';
import Image from 'next/image';
import { formatPriceINR } from '@/lib/pricing';
import { MIN_WHOLESALE_QUANTITY } from '@/lib/wholesale';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: number;
    description?: string;
    images: string[];
    sizes?: string[];
    in_stock?: boolean;
  };
}

export default function ProductDetailsModal({ isOpen, onClose, product }: ProductDetailsModalProps) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-600 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Image
              src={product.images[0]}
              alt={product.name}
              width={500}
              height={500}
              className="object-cover rounded"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
            <p className="text-xl text-gray-800 mb-1">{formatPriceINR(product.price)} wholesale unit</p>
            <p className="mb-4 text-xs uppercase tracking-[0.14em] text-gray-500">
              MOQ {MIN_WHOLESALE_QUANTITY} units per style
            </p>
            {product.description && (
              <p className="text-sm text-gray-600 mb-4">{product.description}</p>
            )}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <span className="font-medium mr-2">Sizes:</span>
                {product.sizes.map(size => (
                  <span
                    key={size}
                    className="inline-block border border-gray-300 px-2 py-1 text-xs mr-1"
                  >
                    {size}
                  </span>
                ))}
              </div>
            )}
            <button className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition">
              Add Wholesale Pack
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
