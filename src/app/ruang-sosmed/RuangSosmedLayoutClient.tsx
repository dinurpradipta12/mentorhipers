"use client";

import React from "react";
import RuangSosmedLayoutContent from "@/app/ruang-sosmed/RuangSosmedLayoutContent";

export default function RuangSosmedLayoutClient({ children }: { children: React.ReactNode }) {
  return <RuangSosmedLayoutContent>{children}</RuangSosmedLayoutContent>;
}
