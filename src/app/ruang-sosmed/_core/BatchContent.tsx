"use client";

import React from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import BatchContentDesktop from "./BatchContentDesktop";
import BatchContentMobile from "./BatchContentMobile";

export default function BatchContent({ id }: { id: string }) {
  const isMobile = useIsMobile();

 //Handle initialization/hydration check
  if (isMobile === null) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-400">Detecting Device...</div>;

  return isMobile ? <BatchContentMobile id={id}/> : <BatchContentDesktop id={id}/>;
}
