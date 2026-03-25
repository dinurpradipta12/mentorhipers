"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * TabletZoomOptimizer
 *
 * Uses viewport meta initial-scale to provide true OS-level zoom on tablets.
 * This scales EVERYTHING — layout, fonts, icons — at the browser engine level.
 * CSS `zoom` is used as a secondary reinforcement for desktop browsers.
 *
 * Works reliably because we removed the static `export const viewport` from
 * layout.tsx, so Next.js no longer re-injects a conflicting viewport meta.
 */
export function TabletZoomOptimizer() {
  const pathname = usePathname();

  useEffect(() => {
    const getZoomValue = (): number => {
      const stored = localStorage.getItem("tablet_zoom_value") || "0.8";
      let val = parseFloat(stored);
      if (val > 1.0 && val <= 100) val /= 100;
      else if (val < 0.1 || val > 1.0) val = 0.8;
      return val;
    };

    const applyScaling = () => {
      const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1380;
      const zoom = getZoomValue();

      if (isTablet) {
        const zoomStr = zoom.toFixed(2);

        // 1. Viewport meta — scales fonts + layout at the iOS/browser engine level
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
          viewport = document.createElement("meta");
          viewport.setAttribute("name", "viewport");
          document.head.appendChild(viewport);
        }
        const targetContent = `width=device-width, initial-scale=${zoomStr}, minimum-scale=${zoomStr}, maximum-scale=${zoomStr}, user-scalable=0, viewport-fit=cover`;
        viewport.setAttribute("content", targetContent);

        // 2. CSS zoom as backup for desktop Chrome/Edge (doesn't affect iOS fonts but harmless)
        document.documentElement.style.zoom = `${Math.round(zoom * 100)}%`;

        // 3. Explicitly allow text to scale with zoom (override iOS auto-adjust)
        (document.documentElement.style as any)["-webkit-text-size-adjust"] = "none";
        document.documentElement.style.setProperty("text-size-adjust", "none");

        // 4. CSS variable for components
        document.documentElement.style.setProperty("--tablet-zoom", zoomStr);

        console.log(`[TabletZoom] Applied: ${Math.round(zoom * 100)}% (iOS viewport + CSS zoom)`);
      } else {
        // Reset
        let viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover");
        }
        document.documentElement.style.zoom = "100%";
        (document.documentElement.style as any)["-webkit-text-size-adjust"] = "auto";
        document.documentElement.style.setProperty("--tablet-zoom", "1.0");
      }
    };

    // Apply immediately + staggered re-apply to beat navigation race conditions
    applyScaling();
    const timers = [0, 50, 150, 400].map((ms) => setTimeout(applyScaling, ms));

    // Watch for Next.js resetting viewport meta mid-navigation
    const observer = new MutationObserver(() => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        observer.disconnect();
        observer.observe(viewport, { attributes: true, attributeFilter: ["content"] });
        applyScaling();
      }
    });
    observer.observe(document.head, { childList: true, subtree: false });

    // Also observe the viewport element if it already exists
    const existingViewport = document.querySelector('meta[name="viewport"]');
    if (existingViewport) {
      observer.observe(existingViewport, { attributes: true, attributeFilter: ["content"] });
    }

    // Event listeners
    window.addEventListener("resize", applyScaling);
    window.addEventListener("mh_zoom_update", applyScaling);
    window.addEventListener("storage", (e) => {
      if (e.key === "tablet_zoom_value") applyScaling();
    });

    return () => {
      timers.forEach(clearTimeout);
      observer.disconnect();
      window.removeEventListener("resize", applyScaling);
      window.removeEventListener("mh_zoom_update", applyScaling);
    };
  }, [pathname]);

  return null;
}

export default TabletZoomOptimizer;
