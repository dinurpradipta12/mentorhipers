"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useIsMobile } from "@/hooks/useIsMobile";

const LoginContentDesktop = dynamic(() => import("./LoginContentDesktop"), { 
  loading: () => <div className="min-h-screen flex items-center justify-center font-black text-slate-700 uppercase tracking-widest text-[10px]">Portal Desktop Loading...</div>,
  ssr: false 
});

const LoginContentMobile = dynamic(() => import("./LoginContentMobile"), { 
  loading: () => <div className="min-h-screen flex items-center justify-center font-black text-slate-700 uppercase tracking-widest text-[10px]">Portal Mobile Loading...</div>,
  ssr: false 
});

export default function LoginContent() {
  const isMobile = useIsMobile();

  // Handle initialization/hydration check
  if (isMobile === null) return <div className="min-h-screen bg-slate-950 flex items-center justify-center font-black text-slate-700 uppercase tracking-widest text-[10px] animate-pulse">Establishing Connection...</div>;

  return isMobile ? <LoginContentMobile /> : <LoginContentDesktop />;
}
