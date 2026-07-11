import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: ' ',
    short_name: 'Shiv Shakti',
    description: 'Avant-garde clothing for the post-apocalyptic era. Deconstructed silhouettes, ritual textures, and ceremonial armor.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon.png?v=trident-large-ss26',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon.png?v=trident-large-ss26',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon.png?v=trident-large-ss26',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png?v=trident-large-ss26',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
