"use client";

import dynamic from "next/dynamic";
import React from "react";

// The actual V2 layout logic is now moved to V2LayoutContent.tsx 
// This shell ensures the heavy dependencies (lucide, framer, supabase) 
// are NOT bundled into our Cloudflare Edge Worker (avoiding the 3MB limit).

const V2LayoutContent = dynamic(() => import("./V2LayoutContent"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
          Synchronizing Workspace Data...
        </p>
      </div>
    </div>
  )
});

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return <V2LayoutContent>{children}</V2LayoutContent>;
}
