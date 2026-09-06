export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import React from "react";
import RuangSosmedLayoutClient from "@/app/ruang-sosmed/RuangSosmedLayoutClient";

// V2Layout is now a Server Component to correctly handle 'edge' runtime and 'dynamic' exports.
// It wraps the client-side layout content.

export default function RuangSosmedLayout({ children }: { children: React.ReactNode }) {
  return <RuangSosmedLayoutClient>{children}</RuangSosmedLayoutClient>;
}
