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
      // 1. Get current setting (default to 0.8)
      // Read from localStorage which acts as our system preference
      const storedZoom = localStorage.getItem("tablet_zoom_value") || "0.8";
      let zoomFactor = parseFloat(storedZoom);

      // Robust detect: handles both 0.8 (decimal) and 80 (percentage)
      if (zoomFactor > 1.0 && zoomFactor <= 100) {
        zoomFactor = zoomFactor / 100;
      } else if (zoomFactor < 0.1 || zoomFactor > 1.0) {
        // Safety fallback if value is corrupted or out of range
        zoomFactor = 0.8;
      }

      // 2. Target Tablet Range (Standard 768px up to narrow laptops 1380px)
      const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1380;

      // 3. Viewport Manipulation
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.setAttribute('name', 'viewport');
        document.head.appendChild(viewport);
      }

      if (isTablet) {
        const scaleStr = zoomFactor.toFixed(2);
        // Force system-level zoom using multiple viewport scale properties
        viewport.setAttribute('content', `width=device-width, initial-scale=${scaleStr}, minimum-scale=${scaleStr}, maximum-scale=${scaleStr}, user-scalable=0, viewport-fit=cover`);
        
        // Sync CSS variable for components using it as multiplier
        document.documentElement.style.setProperty("--tablet-zoom", scaleStr);
        console.log(`[TabletZoom] Global Scaling: ${Math.round(zoomFactor * 100)}% forced via viewport.`);
      } else {
        // Restore standard view on desktop/mobile
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
        document.documentElement.style.setProperty("--tablet-zoom", "1.0");
      }
    };

    // Initial apply
    applyScaling();

    // Listen for orientation/resize changes
    window.addEventListener('resize', applyScaling);
    
    // Listen for storage changes from other tabs/pages
    const handleStorageChange = (e: StorageEvent) => {
       if (e.key === 'tablet_zoom_value') {
          applyScaling();
       }
    };
    window.addEventListener('storage', handleStorageChange);

    // Custom event for instant same-tab updates (e.g. from Settings slider)
    window.addEventListener('mh_zoom_update', applyScaling);

    return () => {
       window.removeEventListener('resize', applyScaling);
       window.removeEventListener('storage', handleStorageChange);
       window.removeEventListener('mh_zoom_update', applyScaling);
    };
  }, [pathname]);

  return null;
}

export default TabletZoomOptimizer;
