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

      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement("meta");
        viewport.setAttribute("name", "viewport");
        document.head.appendChild(viewport);
      }

      if (isTablet) {
        const scale = zoom.toFixed(2);
        viewport.setAttribute(
          "content",
          // Use viewport-fit=auto (NOT cover) so iOS respects safe-area-insets
          // and content doesn't slide under the status bar when zoomed
          `width=device-width, initial-scale=${scale}, minimum-scale=${scale}, maximum-scale=${scale}, user-scalable=0`
        );
        document.documentElement.style.setProperty("--tablet-zoom", scale);
      } else {
        viewport.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover");
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
