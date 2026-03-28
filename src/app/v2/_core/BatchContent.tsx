"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useIsMobile } from "@/hooks/useIsMobile";

// Dynamic imports to ensure we only load what's needed for the device
const BatchContentDesktop = dynamic(() => import("./BatchContentDesktop"), { 
  loading: () => <div className="min-h-screen flex items-center justify-center font-black text-slate-400">Loading Desktop View...</div>,
  ssr: false 
});

const BatchContentMobile = dynamic(() => import("./BatchContentMobile"), { 
  loading: () => <div className="min-h-screen flex items-center justify-center font-black text-slate-400">Loading Mobile Experience...</div>,
  ssr: false 
});

export default function BatchContent({ id }: { id: string }) {
  const isMobile = useIsMobile();

  // Handle initialization/hydration check
  if (isMobile === null) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-400">Detecting Device...</div>;

  return isMobile ? <BatchContentMobile id={id} /> : <BatchContentDesktop id={id} />;
}
