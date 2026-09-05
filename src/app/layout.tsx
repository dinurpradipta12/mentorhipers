import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppUpdateNotifier } from "@/components/layout/AppUpdateNotifier";
import { AppGlobalConfig } from "@/components/layout/AppGlobalConfig";
import { TabletZoomOptimizer } from "@/components/layout/TabletZoomOptimizer";
import { APP_DESCRIPTION, APP_FULL_NAME, APP_SHORT_NAME } from "@/lib/brand";

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
  title: APP_FULL_NAME,
  applicationName: APP_SHORT_NAME,
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_SHORT_NAME,
  },
  icons: {
    icon: "/favicon_ruang_campus.svg",
    shortcut: "/favicon_ruang_campus.svg",
    apple: "/favicon_ruang_campus.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#FAFAFA] text-[#0F172A]" suppressHydrationWarning>
        {children}
        <AppGlobalConfig />
        <AppUpdateNotifier />
        <TabletZoomOptimizer />
      </body>
    </html>
  );
}
