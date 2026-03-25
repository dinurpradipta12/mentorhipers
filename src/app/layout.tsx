import React from "react";
import type { Metadata } from "next";
import Script from "next/script";
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

// Inline script that runs BEFORE first paint to set viewport zoom
// This prevents the glitch caused by TabletZoomOptimizer running after hydration
const viewportZoomScript = `
(function() {
  try {
    var stored = localStorage.getItem('tablet_zoom_value') || '0.8';
    var zoom = parseFloat(stored);
    if (zoom > 1.0 && zoom <= 100) zoom /= 100;
    else if (zoom < 0.1 || zoom > 1.0) zoom = 0.8;
    var w = window.innerWidth || screen.width;
    if (w >= 768 && w <= 1380) {
      // Prevent FOUC/Glitch on PWA by briefly hiding while the browser applies zoom
      document.documentElement.style.display = 'none';
      var scale = zoom.toFixed(2);
      var meta = document.querySelector('meta[name="viewport"]');
      if (!meta) { meta = document.createElement('meta'); meta.name = 'viewport'; document.head.appendChild(meta); }
      // Removed viewport-fit=cover so it aligns with TabletZoomOptimizer
      meta.content = 'width=device-width, initial-scale=' + scale + ', minimum-scale=' + scale + ', maximum-scale=' + scale + ', user-scalable=0';
      
      // Force repaint with new scale before un-hiding
      setTimeout(function() {
        document.documentElement.style.display = '';
      }, 30);
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
    >
      <head>
        {/* Pre-paint viewport zoom — must run before any render to prevent glitch */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" suppressHydrationWarning />
        <Script id="viewport-zoom" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: viewportZoomScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAFAFA] text-[#0F172A]">
        {children}
        <AppGlobalConfig />
        <AppUpdateNotifier />
        <TabletZoomOptimizer />
      </body>
    </html>
  );
}
