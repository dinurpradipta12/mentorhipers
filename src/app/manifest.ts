import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mentorhipers',
    short_name: 'Mentorhipers',
    description: 'Personal branding and social media mentoring platform.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAFA',
    theme_color: '#4880FF',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/favicon.ico',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon.ico',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
