export const dynamic = 'force-dynamic';

import React from "react";
import V2MasterRouterClient from "@/app/ruang-sosmed/[[...slug]]/V2MasterRouterClient";

// THIS IS THE UNIVERSAL V2 CATCH-ALL ROUTER (Server Component Host)
// This file remains a Server Component so dynamic routing stays on the server.
// The actual routing logic is handled by the V2MasterRouterClient component.

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
  return <V2MasterRouterClient slug={resolvedParams.slug} />;
}
