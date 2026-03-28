"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useIsMobile } from "@/hooks/useIsMobile";

// Dynamic imports to ensure we only load what's needed for the device
const PortalContentDesktop = dynamic(() => import("./PortalContentDesktop"), { 
  loading: () => <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest text-[10px]">Portal Desktop Loading...</div>,
  ssr: false 
});

const PortalContentMobile = dynamic(() => import("./PortalContentMobile"), { 
  loading: () => <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest text-[10px]">Portal Mobile Loading...</div>,
  ssr: false 
});

export default function PortalContent({ id }: { id: string }) {
  const isMobile = useIsMobile();

  // Handle initialization/hydration check
  if (isMobile === null) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-400 uppercase tracking-widest text-[10px] animate-pulse">Establishing Connection...</div>;

  return isMobile ? <PortalContentMobile id={id} /> : <PortalContentDesktop id={id} />;
}
