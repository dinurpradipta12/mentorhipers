import dynamic from "next/dynamic";
import React from "react";

// THIS IS THE UNIVERSAL V2 CATCH-ALL ROUTER
// We maintain Server Component status to resolve params on the server (fixing 404s).
// To comply with build rules, we remove 'ssr: false' but keep 'dynamic' for code splitting.
export const runtime = "edge";

const SelectionContent = dynamic(() => import("../_core/SelectionContent"));
const LoginContent = dynamic(() => import("../_core/LoginContent"));
const BatchListContent = dynamic(() => import("../_core/BatchListContent"));
const BatchContent = dynamic(() => import("../_core/BatchContent"));
const AgencyListContent = dynamic(() => import("../_core/AgencyListContent"));
const AgencyContent = dynamic(() => import("../_core/AgencyContent"));
const PortalContent = dynamic(() => import("../_core/PortalContent"));

export default async function V2MasterRouter({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
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
