"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function TabletZoomOptimizer() {
  const pathname = usePathname();

  useEffect(() => {
    const applyScaling = () => {
      const stored = localStorage.getItem("tablet_zoom_value") || "0.8";
      let zoom = parseFloat(stored);
      if (zoom > 1.0 && zoom <= 100) zoom /= 100;
      else if (zoom < 0.1 || zoom > 1.0) zoom = 0.8;

      const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1380;
      
      // Save for Server-Side Viewport Rendering to eliminate PWA flicker
      document.cookie = `mh_is_tablet=${isTablet}; path=/; max-age=31536000`;
      document.cookie = `tablet_zoom_value=${zoom}; path=/; max-age=31536000`;

      let viewport = document.querySelector('meta[id="mh-tablet-viewport"]') || document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement("meta");
        viewport.setAttribute("name", "viewport");
        document.head.appendChild(viewport);
      }

      if (isTablet) {
        const scale = zoom.toFixed(2);
        const newContent = `width=device-width, initial-scale=${scale}, minimum-scale=${scale}, maximum-scale=${scale}, user-scalable=0`;
        if (viewport.getAttribute("content") !== newContent) {
          viewport.setAttribute("content", newContent);
        }
        document.documentElement.style.setProperty("--tablet-zoom", scale);
      } else {
        const newContent = "width=device-width, initial-scale=1, viewport-fit=cover";
        if (viewport.getAttribute("content") !== newContent) {
          viewport.setAttribute("content", newContent);
        }
        document.documentElement.style.setProperty("--tablet-zoom", "1.0");
      }
    };

    // Apply immediately, then again after page settles
    applyScaling();
    const t1 = setTimeout(applyScaling, 100);
    const t2 = setTimeout(applyScaling, 500);

    window.addEventListener("resize", applyScaling);
    window.addEventListener("mh_zoom_update", applyScaling);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", applyScaling);
      window.removeEventListener("mh_zoom_update", applyScaling);
    };
  }, [pathname]);

  return null;
}

export default TabletZoomOptimizer;
