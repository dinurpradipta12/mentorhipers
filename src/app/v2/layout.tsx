import nextDynamic from "next/dynamic";
import React from "react";

// The V2 Layout is converted to a Server Component to stabilize the Edge bundle.
// This prevents hydration mismatches and stabilizes RSC (500) prefetch requests on Cloudflare.
// The content (sidebar, auth check, etc.) still runs only on the client via dynamic(..., { ssr: false }).
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const V2LayoutContent = nextDynamic(() => import("./V2LayoutContent"), {
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
