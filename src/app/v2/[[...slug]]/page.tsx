"use client";

import nextDynamic from "next/dynamic";
import React, { use } from "react";

// THIS IS THE UNIVERSAL V2 CATCH-ALL ROUTER (Client-side version)
// Moved to 'use client' to allow 'ssr: false' on dynamic imports, which is required
// for stabilizing the Edge bundle size while avoiding Server Component restrictions.

const SelectionContent = nextDynamic(() => import("../_core/SelectionContent"), { ssr: false });
const LoginContent = nextDynamic(() => import("../_core/LoginContent"), { ssr: false });
const BatchListContent = nextDynamic(() => import("../_core/BatchListContent"), { ssr: false });
const BatchContent = nextDynamic(() => import("../_core/BatchContent"), { ssr: false });
const AgencyListContent = nextDynamic(() => import("../_core/AgencyListContent"), { ssr: false });
const AgencyContent = nextDynamic(() => import("../_core/AgencyContent"), { ssr: false });
const PortalContent = nextDynamic(() => import("../_core/PortalContent"), { ssr: false });

export default function V2MasterRouter({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug || [];

  // Routing Logic
  if (slug.length === 0) return <SelectionContent />;
  if (slug[0] === "login") return <LoginContent />;
  
  if (slug[0] === "batch") {
    if (slug[1]) return <BatchContent id={slug[1]} />;
    return <BatchListContent />;
  }
  
  if (slug[0] === "agency") {
    if (slug[1]) return <AgencyContent id={slug[1]} />;
    return <AgencyListContent />;
  }
  
  if (slug[0] === "portal" && slug[1]) {
    return <PortalContent id={slug[1]} />;
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
