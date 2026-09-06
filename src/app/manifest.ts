import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ruang Campus — Platform Edukasi LMS Sosmed',
    short_name: 'Ruang Campus',
    description: 'Platform pembelajaran Bootcamp dan Webinar LMS publik Ruang Campus.',
    start_url: '/ruang-sosmed',
    display: 'standalone',
    background_color: '#f7fafc',
    theme_color: '#0f766e',
    icons: [
      {
        src: '/favicon.png',
        sizes: '64x64',
        type: 'image/png',
      },
    ],
  };
}
