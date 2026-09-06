"use client";

import React from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import PortalContentDesktop from "./PortalContentDesktop";
import PortalContentMobile from "./PortalContentMobile";

export default function PortalContent({ id }: { id: string }) {
  const isMobile = useIsMobile();

 //Handle initialization/hydration check
  if (isMobile === null) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-400 uppercase tracking-widest text-[10px] animate-pulse">Establishing Connection...</div>;

  return isMobile ? <PortalContentMobile id={id}/> : <PortalContentDesktop id={id}/>;
}
