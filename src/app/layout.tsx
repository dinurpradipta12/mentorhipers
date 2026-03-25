import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppUpdateNotifier } from "@/components/layout/AppUpdateNotifier";
import { AppGlobalConfig } from "@/components/layout/AppGlobalConfig";
import { TabletZoomOptimizer } from "@/components/layout/TabletZoomOptimizer";

// Viewport is now dynamically controlled by TabletZoomOptimizer.tsx for global zoom consistency

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
      <body className="min-h-full flex flex-col bg-[#FAFAFA] text-[#0F172A]">
        {children}
        <AppGlobalConfig />
        <AppUpdateNotifier />
        <TabletZoomOptimizer />
      </body>
    </html>
  );
}
