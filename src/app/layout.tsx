import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Ruang Campus — Platform Edukasi LMS Sosmed',
    template: '%s | Ruang Campus',
  },
  description: 'Platform pembelajaran untuk Bootcamp dan Webinar LMS publik Ruang Campus.',
  applicationName: 'Ruang Campus',
  keywords: ['Ruang Campus', 'LMS', 'Bootcamp', 'Webinar', 'Edukasi'],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ruang Campus',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f766e',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
