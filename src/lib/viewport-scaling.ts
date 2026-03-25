/**
 * viewport-scaling.ts
 * 
 * Central utility to manage global scaling via the viewport meta tag.
 * This handles BOTH the viewport zoom and the --tablet-zoom CSS variable.
 */

export function applyViewportScaling(storedZoom: string | null = null) {
  if (typeof window === 'undefined') return;

  // 1. Get current setting (pick from param or localStorage)
  const zoomValue = storedZoom || localStorage.getItem("tablet_zoom_value") || "0.8";
  const zoomFactor = parseFloat(zoomValue);

  // 2. Identify if it's a tablet-sized screen (768px to 1380px)
  // We use this range to target tablets specifically.
  const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1380;

  // 3. Find or create the viewport meta tag
  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    document.head.appendChild(viewport);
  }

  // 4. Calculate universal factor (support both 0.8 and 80 style values)
  const factor = zoomFactor <= 1.0 ? zoomFactor : zoomFactor / 100;

  // 5. Apply Scaling
  if (isTablet) {
    const scale = factor;
    viewport.setAttribute('content', `width=device-width, initial-scale=${scale}, maximum-scale=${scale}, user-scalable=0, viewport-fit=cover`);
    document.documentElement.style.setProperty("--tablet-zoom", factor.toString());
    console.log(`[ViewportScaling] Applied scaling: ${Math.round(factor * 100)}%`);
  } else {
    // Reset to normal for desktop and mobile
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
    document.documentElement.style.setProperty("--tablet-zoom", "1.0");
  }
}
