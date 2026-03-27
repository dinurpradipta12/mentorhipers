"use client";

import dynamic from "next/dynamic";
import React from "react";

// THIS IS THE UNIVERSAL V2 CATCH-ALL SHELL
// By using a single [[...slug]] catch-all route, we reduce 8 Edge Functions into ONE module (~1.6MB).
// This is the ONLY way to beat the Cloudflare Free Plan 3MB total deployment limit.
export const runtime = "edge";

const SelectionContent = dynamic(() => import("../_core/SelectionContent"), { ssr: false });
const LoginContent = dynamic(() => import("../_core/LoginContent"), { ssr: false });
const BatchListContent = dynamic(() => import("../_core/BatchListContent"), { ssr: false });
const BatchContent = dynamic(() => import("../_core/BatchContent"), { ssr: false });
const AgencyListContent = dynamic(() => import("../_core/AgencyListContent"), { ssr: false });
const AgencyContent = dynamic(() => import("../_core/AgencyContent"), { ssr: false });
const PortalContent = dynamic(() => import("../_core/PortalContent"), { ssr: false });

export default function V2MasterRouter({ params }: { params: Promise<{ slug?: string[] }> }) {
  const [resolvedParams, setResolvedParams] = React.useState<{ slug?: string[] } | null>(null);

  React.useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  if (!resolvedParams) return (
     <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
     </div>
  );

  const slug = resolvedParams.slug || [];

  // Routing Logic
  if (slug.length === 0) return <SelectionContent />;
  if (slug[0] === "login") return <LoginContent />;
  
  if (slug[0] === "batch") {
    if (slug[1]) return <BatchContent params={Promise.resolve({ id: slug[1] })} />;
    return <BatchListContent />;
  }
  
  if (slug[0] === "agency") {
    if (slug[1]) return <AgencyContent params={Promise.resolve({ id: slug[1] })} />;
    return <AgencyListContent />;
  }
  
  if (slug[0] === "portal" && slug[1]) {
    return <PortalContent params={Promise.resolve({ id: slug[1] })} />;
  }

  // Not Found fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-900">404</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest mt-2">Workspace Not Found</p>
      </div>
    </div>
  );
}
