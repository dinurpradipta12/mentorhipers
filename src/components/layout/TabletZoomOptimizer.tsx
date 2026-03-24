"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * TabletZoomOptimizer
 * 
 * Simple approach: set --tablet-zoom CSS variable on documentElement.
 * The actual zoom is applied via CSS media query in globals.css.
 * Re-applies on every route change to ensure persistence.
 */
export function TabletZoomOptimizer() {
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem("tablet_zoom_value");
    if (stored) {
      document.documentElement.style.setProperty("--tablet-zoom", stored);
    }
  }, [pathname]);

  return null;
}
