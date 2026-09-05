import { MetadataRoute } from 'next'
import { APP_DESCRIPTION, APP_FULL_NAME, APP_SHORT_NAME } from '@/lib/brand'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_FULL_NAME,
    short_name: APP_SHORT_NAME,
    description: APP_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAFA',
    theme_color: '#4880FF',
    icons: [
      {
        src: '/favicon_ruang_campus.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
