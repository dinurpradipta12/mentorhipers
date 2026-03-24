"use client";

import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ zoom: "80%" }}>
      {children}
    </div>
  );
}
