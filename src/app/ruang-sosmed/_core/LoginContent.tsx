"use client";

import React from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import LoginContentDesktop from "./LoginContentDesktop";
import LoginContentMobile from "./LoginContentMobile";

export default function LoginContent() {
  const isMobile = useIsMobile();

 //Handle initialization/hydration check
  if (isMobile === null) return <div className="min-h-screen bg-slate-950 flex items-center justify-center font-black text-slate-700 uppercase tracking-widest text-[10px] animate-pulse">Establishing Connection...</div>;

  return isMobile ? <LoginContentMobile/> : <LoginContentDesktop/>;
}
