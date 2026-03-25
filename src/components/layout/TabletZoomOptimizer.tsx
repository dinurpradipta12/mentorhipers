"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * TabletZoomOptimizer
 * 
 * Dynamically adjusts the viewport meta tag to provide a system-level zoom.
 * This ensures EVERYTHING (including fixed sidebars and headers) scales
 * proportionally on tablet devices without breaking layouts.
 */
import { applyViewportScaling } from "@/lib/viewport-scaling";

/**
 * TabletZoomOptimizer
 * 
 * Re-runs whenever the user navigates (pathname change) or resizes the window
 * to ensure scaling is consistent across different pages and orientations.
 */
export function TabletZoomOptimizer() {
  const pathname = usePathname();

  useEffect(() => {
    // Apply on load and pathname change
    applyViewportScaling();

    // Re-apply on window resize to handle orientation changes
    window.addEventListener('resize', () => applyViewportScaling());
    return () => window.removeEventListener('resize', () => applyViewportScaling());
  }, [pathname]);

  return null;
}

export default TabletZoomOptimizer;
