export const dynamic = 'force-dynamic';

import React from "react";
import RuangSosmedLayoutClient from "@/app/ruang-sosmed/RuangSosmedLayoutClient";

// V2Layout is a Server Component so the client layout can be mounted consistently.
// It wraps the client-side layout content.

export default function RuangSosmedLayout({ children }: { children: React.ReactNode }) {
  return <RuangSosmedLayoutClient>{children}</RuangSosmedLayoutClient>;
}
