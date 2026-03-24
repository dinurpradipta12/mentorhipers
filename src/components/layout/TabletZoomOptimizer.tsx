"use client";

import { useEffect } from "react";

/**
 * TabletZoomOptimizer
 * 
 * Instead of using CSS zoom/transform (which breaks fixed-position sidebars),
 * this component manipulates the viewport meta tag's `width` property.
 * 
 * By setting viewport width to a value LARGER than the actual device width
 * (e.g., 1400 on a 1024px-wide iPad), the browser naturally renders the page
 * as if the screen were 1400px wide and scales everything down to fit.
 * This is the same technique Apple uses for "desktop-class" browsing on iPad.
 * 
 * The result: ALL UI elements (text, buttons, cards, sidebars) scale down
 * proportionally without breaking any CSS layout rules.
 */
export function TabletZoomOptimizer() {
  useEffect(() => {
    const applyTabletZoom = () => {
      const screenWidth = window.screen.width;
      const isTablet = screenWidth >= 768 && screenWidth <= 1366;
      
      if (!isTablet) return;

      // Read saved viewport width from localStorage, default to 1400
      const savedViewportWidth = localStorage.getItem("tablet_viewport_width") || "1400";
      const viewportWidth = parseInt(savedViewportWidth, 10);
      
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute(
          "content",
          `width=${viewportWidth}, initial-scale=${screenWidth / viewportWidth}, viewport-fit=cover`
        );
      }
    };

    applyTabletZoom();

    // Listen for custom event from settings page
    const handleZoomChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.viewportWidth) {
        const meta = document.querySelector('meta[name="viewport"]');
        if (meta) {
          const screenWidth = window.screen.width;
          meta.setAttribute(
            "content",
            `width=${detail.viewportWidth}, initial-scale=${screenWidth / detail.viewportWidth}, viewport-fit=cover`
          );
        }
      }
    };

    window.addEventListener("tablet-zoom-change", handleZoomChange);
    return () => window.removeEventListener("tablet-zoom-change", handleZoomChange);
  }, []);

  return null;
}
