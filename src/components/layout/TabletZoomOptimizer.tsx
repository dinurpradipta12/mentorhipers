"use client";

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

/**
 * TabletZoomOptimizer
 * 
 * Manipulates the viewport meta tag width to make the entire UI
 * proportionally smaller on tablet screens.
 * 
 * Uses usePathname() to re-apply the viewport on every route change,
 * and a MutationObserver to guard against Next.js resetting the meta tag.
 */
export function TabletZoomOptimizer() {
  const pathname = usePathname();

  const applyTabletZoom = useCallback(() => {
    // Check both screen.width (physical) and innerWidth (CSS viewport)
    const screenWidth = Math.max(window.screen.width, window.innerWidth);
    const minDim = Math.min(window.screen.width, window.screen.height);
    
    // Detect tablet: screen between 768-1366px, or touch device in that range
    const isTablet = (minDim >= 600 && minDim <= 1366) || 
                     (screenWidth >= 768 && screenWidth <= 1400 && navigator.maxTouchPoints > 0);
    
    if (!isTablet) return;

    const savedViewportWidth = localStorage.getItem("tablet_viewport_width") || "1400";
    const viewportWidth = parseInt(savedViewportWidth, 10);
    
    // Don't modify if set to device-width equivalent
    if (viewportWidth <= 1024) return;

    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      const newContent = `width=${viewportWidth}, initial-scale=1, viewport-fit=cover, user-scalable=no`;
      if (meta.getAttribute("content") !== newContent) {
        meta.setAttribute("content", newContent);
      }
    }
  }, []);

  // Apply on mount + every route change
  useEffect(() => {
    // Apply immediately
    applyTabletZoom();
    
    // Also apply after a short delay to beat Next.js meta resets
    const timer1 = setTimeout(applyTabletZoom, 100);
    const timer2 = setTimeout(applyTabletZoom, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname, applyTabletZoom]);

  // MutationObserver: re-apply if something resets the viewport meta
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;

    const observer = new MutationObserver(() => {
      applyTabletZoom();
    });

    observer.observe(meta, { attributes: true, attributeFilter: ["content"] });

    return () => observer.disconnect();
  }, [applyTabletZoom]);

  // Listen for custom event from settings page
  useEffect(() => {
    const handleZoomChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.viewportWidth) {
        localStorage.setItem("tablet_viewport_width", String(detail.viewportWidth));
        applyTabletZoom();
      }
    };

    window.addEventListener("tablet-zoom-change", handleZoomChange);
    return () => window.removeEventListener("tablet-zoom-change", handleZoomChange);
  }, [applyTabletZoom]);

  return null;
}
