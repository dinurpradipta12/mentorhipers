import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppUpdateNotifier } from "@/components/layout/AppUpdateNotifier";
import { AppGlobalConfig } from "@/components/layout/AppGlobalConfig";
import { TabletZoomOptimizer } from "@/components/layout/TabletZoomOptimizer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const runtime = 'edge';

export const metadata: Metadata = {
  title: "Mentorhipers | Mentoring & Content Planning",
  description: "Personal branding and social media mentoring platform.",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mentorhipers',
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

import { cookies } from "next/headers";

export async function generateViewport(): Promise<Viewport> {
  const cookieStore = await cookies();
  const isTablet = cookieStore.get('mh_is_tablet')?.value === 'true';
  const zoomVal = cookieStore.get('tablet_zoom_value')?.value || '0.8';

  if (isTablet) {
    let scale = parseFloat(zoomVal);
    if (isNaN(scale) || scale < 0.1 || scale > 1.0) scale = 0.8;
    return {
      width: "device-width",
      initialScale: scale,
      minimumScale: scale,
      maximumScale: scale,
      userScalable: false,
    };
  }

  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  };
}

// Inline script that runs BEFORE first paint to set viewport zoom
// Native script guarantees synchronicity. We mutate the exact tag.
const viewportZoomScript = `
(function() {
  try {
    var stored = localStorage.getItem('tablet_zoom_value') || '0.8';
    var zoom = parseFloat(stored);
    if (zoom > 1.0 && zoom <= 100) zoom /= 100;
    else if (zoom < 0.1 || zoom > 1.0) zoom = 0.8;
    var w = window.innerWidth || screen.width;
    
    if (w >= 768 && w <= 1380) {
      var scale = zoom.toFixed(2);
      
      // Override Next.js's viewport meta by appending our own at the very end of head
      // This ensures 100% priority and avoids React hydration restoring the original
      var overrideMeta = document.createElement('meta');
      overrideMeta.name = 'viewport';
      overrideMeta.id = 'mh-tablet-viewport';
      overrideMeta.content = 'width=device-width, initial-scale=' + scale + ', minimum-scale=' + scale + ', maximum-scale=' + scale + ', user-scalable=0';
      document.head.appendChild(overrideMeta);
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased font-sans`}
      suppressHydrationWarning
    >
      <head>
        {/* We use a native synchronous script to avoid Next.js _next_s deferred array load */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: viewportZoomScript }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAFAFA] text-[#0F172A]" suppressHydrationWarning>
        {children}
        <AppGlobalConfig />
        <AppUpdateNotifier />
        <TabletZoomOptimizer />
      </body>
    </html>
  );
}
