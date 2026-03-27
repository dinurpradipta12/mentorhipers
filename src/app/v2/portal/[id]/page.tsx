"use client";

import dynamic from "next/dynamic";
import React from "react";

export const runtime = "edge";

const PortalContent = dynamic(() => import("./PortalContent"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Mounting Portal Environment...
        </p>
      </div>
    </div>
  )
});

export default function StudentPortalPage({ params }: { params: Promise<{ id: string }> }) {
  return <PortalContent params={params} />;
}
