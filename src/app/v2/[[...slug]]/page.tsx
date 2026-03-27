import dynamic from "next/dynamic";
import React from "react";
import LoginContent from "../_core/LoginContent";
import SelectionContent from "../_core/SelectionContent";

// This catch-all now only handles the base routes (/v2 and /v2/login).
// All routes that use Server Actions (batch/[id], portal/[id], agency/[id])
// now have dedicated page files so Server Action POST routing works correctly.
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
