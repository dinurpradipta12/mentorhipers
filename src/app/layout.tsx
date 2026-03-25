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
// CSS will hide the HTML until this script adds 'mh-zoom-ready' to prevent any flicker
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
      var meta = document.querySelector('meta[name="viewport"]');
      if (!meta) { meta = document.createElement('meta'); meta.name = 'viewport'; document.head.appendChild(meta); }
      meta.content = 'width=device-width, initial-scale=' + scale + ', minimum-scale=' + scale + ', maximum-scale=' + scale + ', user-scalable=0';
      
      // Wait a tiny bit (2 frames + 50ms) for iOS Safari WebView to apply the layout shift, then reveal UI
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          setTimeout(function() {
            document.documentElement.classList.add('mh-zoom-ready');
            document.documentElement.style.display = '';
          }, 50);
        });
      });
    } else {
      document.documentElement.classList.add('mh-zoom-ready');
    }
  } catch(e) {
    document.documentElement.classList.add('mh-zoom-ready');
  }
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
        {/* CSS to perfectly hide any flicker on tablets while zoom applies. Mobile and Desktop are unchanged */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media (min-width: 768px) and (max-width: 1380px) {
            html:not(.mh-zoom-ready) {
              opacity: 0 !important;
              visibility: hidden !important;
              /* Fallback: if JS fails, show page after 1.5 seconds */
              animation: zoom-fallback-show 1ms 1.5s forwards;
            }
          }
          @keyframes zoom-fallback-show {
            to { opacity: 1 !important; visibility: visible !important; }
          }
        `}} />
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
