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
      
      // Save for Server-Side or Client-Side memory
      document.cookie = `mh_is_tablet=${isTablet}; path=/; max-age=31536000`;
      document.cookie = `tablet_zoom_value=${zoom}; path=/; max-age=31536000`;

      if (isTablet) {
        document.documentElement.style.setProperty("--tablet-zoom", zoom.toFixed(2));
      } else {
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
