import React from "react";
import LoginContent from "../_core/LoginContent";
import SelectionContent from "../_core/SelectionContent";

// This catch-all now only handles /v2 root and /v2/login.
// All specific routes (batch, agency, portal) have dedicated page files.
export const runtime = 'edge';

export default async function V2MasterRouter({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];

  if (slug.length === 0) return <SelectionContent />;
  if (slug[0] === "login") return <LoginContent />;

  // Not Found fallback for anything not matched by specific routes
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-900">404</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest mt-2">Workspace Not Found</p>
      </div>
    </div>
  );
}
