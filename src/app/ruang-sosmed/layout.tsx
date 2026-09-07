export const dynamic = 'force-dynamic';

import React from "react";
import RuangSosmedLayoutClient from "@/app/ruang-sosmed/RuangSosmedLayoutClient";

// V2Layout remains a Server Component and wraps the client-side layout content.

export default function RuangSosmedLayout({ children }: { children: React.ReactNode }) {
  return <RuangSosmedLayoutClient>{children}</RuangSosmedLayoutClient>;
}
