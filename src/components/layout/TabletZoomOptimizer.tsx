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
export function TabletZoomOptimizer() {
  const pathname = usePathname();

  useEffect(() => {
    const applyScaling = () => {
      // 1. Get current setting from localStorage (default to 80 for tablets)
      const storedZoom = localStorage.getItem("tablet_zoom_value") || "80";
      const zoomFactor = parseFloat(storedZoom);

      // 2. Identify if it's a tablet-sized screen (768px to 1380px)
      const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1380;

      // 3. Find or create the viewport meta tag
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.setAttribute('name', 'viewport');
        document.head.appendChild(viewport);
      }

      // 4. Apply the magic scaling
      if (isTablet) {
        const scale = zoomFactor / 100;
        viewport.setAttribute('content', `width=device-width, initial-scale=${scale}, maximum-scale=${scale}, user-scalable=0, viewport-fit=cover`);
        document.documentElement.style.setProperty("--tablet-zoom", (zoomFactor / 100).toString());
        console.log(`[TabletZoom] Optimized for tablet at ${zoomFactor}% scaling via viewport.`);
      } else {
        // Reset to normal for desktop and mobile
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
        document.documentElement.style.setProperty("--tablet-zoom", "1.0");
      }
    };

    // Apply on load and pathname change
    applyScaling();

    // Re-apply on window resize to handle orientation changes
    window.addEventListener('resize', applyScaling);
    return () => window.removeEventListener('resize', applyScaling);
  }, [pathname]);

  return null;
}

export default TabletZoomOptimizer;
