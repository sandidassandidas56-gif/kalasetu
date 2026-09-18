import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KalaSetu',
    short_name: 'KalaSetu',
    description: 'Discover one-of-a-kind Indian handmade crafts and artisan stories.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f3ec',
    theme_color: '#1e503e',
    orientation: 'portrait-primary',
    categories: ['shopping', 'lifestyle', 'commerce'],
    lang: 'en',
    scope: '/',
    icons: [
      {
        src: '/kalasetu.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }
}
