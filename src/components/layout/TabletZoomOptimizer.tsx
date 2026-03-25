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
    // 1. Core Scaling Logic
    const getZoomValue = () => {
      const stored = localStorage.getItem("tablet_zoom_value") || "0.8";
      let val = parseFloat(stored);
      if (val > 1.0 && val <= 100) val /= 100;
      else if (val < 0.1 || val > 1.0) val = 0.8;
      return val.toFixed(2);
    };

    const applyScaling = () => {
      const zoom = getZoomValue();
      const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1380;
      
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.setAttribute('name', 'viewport');
        document.head.appendChild(viewport);
      }

      if (isTablet) {
        const content = `width=device-width, initial-scale=${zoom}, minimum-scale=${zoom}, maximum-scale=${zoom}, user-scalable=0, viewport-fit=cover`;
        if (viewport.getAttribute('content') !== content) {
          viewport.setAttribute('content', content);
          console.log(`[TabletZoom] Forced Scale: ${zoom}`);
        }
        document.documentElement.style.setProperty("--tablet-zoom", zoom);
      } else {
        const defaultContent = 'width=device-width, initial-scale=1, viewport-fit=cover';
        if (viewport.getAttribute('content') !== defaultContent) {
           viewport.setAttribute('content', defaultContent);
        }
        document.documentElement.style.setProperty("--tablet-zoom", "1.0");
      }
    };

    // Initial apply
    applyScaling();

    // 2. Aggressive Persistence
    // Watch for ANY changes to the viewport meta tag (e.g. from Next.js router)
    const observer = new MutationObserver((mutations) => {
       mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'content') {
             applyScaling();
          }
       });
    });

    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
       observer.observe(viewportMeta, { attributes: true });
    } else {
       // If meta doesn't exist yet, watch the entire head for additions
       observer.observe(document.head, { childList: true, subtree: true });
    }

    // 3. Event Listeners
    window.addEventListener('resize', applyScaling);
    window.addEventListener('storage', (e) => {
       if (e.key === 'tablet_zoom_value') applyScaling();
    });
    window.addEventListener('mh_zoom_update', applyScaling);

    // Re-apply several times after navigation to clear any racing conditions
    const timers = [10, 50, 100, 250, 500].map(ms => setTimeout(applyScaling, ms));

    return () => {
       observer.disconnect();
       window.removeEventListener('resize', applyScaling);
       window.removeEventListener('storage', applyScaling);
       window.removeEventListener('mh_zoom_update', applyScaling);
       timers.forEach(clearTimeout);
    };
  }, [pathname]);

  return null;
}

export default TabletZoomOptimizer;
