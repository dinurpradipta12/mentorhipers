"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * TabletZoomOptimizer
 *
 * Strategy: Apply CSS `zoom` directly on <html> element.
 * This is far more stable than viewport meta manipulation because:
 * - It survives Next.js page transitions without flickering
 * - It cannot be reset by the router's internal viewport management
 * - It scales ALL content proportionally including fixed sidebars
 *
 * We use `zoom` (not `transform: scale`) because `zoom` affects layout flow,
 * keeping scrollbars, fixed elements, and modals all correctly positioned.
 */
export function TabletZoomOptimizer() {
  const pathname = usePathname();

  useEffect(() => {
    const getZoomValue = (): number => {
      const stored = localStorage.getItem("tablet_zoom_value") || "0.8";
      let val = parseFloat(stored);
      // Handle both formats: decimal (0.8) and percentage (80)
      if (val > 1.0 && val <= 100) val /= 100;
      else if (val < 0.1 || val > 1.0) val = 0.8;
      return val;
    };

    const applyScaling = () => {
      const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1380;

      if (isTablet) {
        const zoom = getZoomValue();
        const zoomPercent = `${Math.round(zoom * 100)}%`;

        // Apply CSS zoom directly on <html> — most reliable across navigations
        document.documentElement.style.zoom = zoomPercent;

        // Also keep the CSS variable in sync for any components referencing it
        document.documentElement.style.setProperty("--tablet-zoom", zoom.toFixed(2));

        // Keep viewport simple — no scaling tricks, let CSS zoom do the work
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
          viewport = document.createElement("meta");
          viewport.setAttribute("name", "viewport");
          document.head.appendChild(viewport);
        }
        const targetContent = "width=device-width, initial-scale=1, viewport-fit=cover";
        if (viewport.getAttribute("content") !== targetContent) {
          viewport.setAttribute("content", targetContent);
        }

        console.log(`[TabletZoom] CSS zoom applied: ${zoomPercent}`);
      } else {
        // Reset for desktop/mobile
        document.documentElement.style.zoom = "100%";
        document.documentElement.style.setProperty("--tablet-zoom", "1.0");
      }
    };

    // Apply immediately
    applyScaling();

    // Re-apply in staggered delays to win any race conditions on navigation
    const timers = [0, 16, 100, 300].map((ms) => setTimeout(applyScaling, ms));

    // Listen for manual zoom changes from Settings page
    const handleZoomUpdate = () => applyScaling();
    window.addEventListener("mh_zoom_update", handleZoomUpdate);
    window.addEventListener("resize", applyScaling);
    window.addEventListener("storage", (e) => {
      if (e.key === "tablet_zoom_value") applyScaling();
    });

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("mh_zoom_update", handleZoomUpdate);
      window.removeEventListener("resize", applyScaling);
    };
  }, [pathname]);

  return null;
}

export default TabletZoomOptimizer;
