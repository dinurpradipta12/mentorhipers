import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getYouTubeEmbedUrl(url: string) {
  if (!url) return "";

  // If it's already an embed URL, return as is
  if (url.includes("youtube.com/embed/")) {
    // Ensure it has https:
    if (url.startsWith("//")) return "https:" + url;
    return url;
  }

  try {
    const urlObj = new URL(url.startsWith("http") ? url : "https://" + url);
    let videoId = "";

    if (urlObj.hostname.includes("youtube.com")) {
      if (urlObj.pathname === "/watch") {
        videoId = urlObj.searchParams.get("v") || "";
      } else if (urlObj.pathname.startsWith("/v/")) {
        videoId = urlObj.pathname.split("/")[2];
      } else if (urlObj.pathname.startsWith("/live/")) {
         videoId = urlObj.pathname.split("/")[2];
      }
    } else if (urlObj.hostname === "youtu.be") {
      videoId = urlObj.pathname.slice(1);
    }

    if (videoId) {
      // Basic cleanup of ID if it has extra params (though URL object should handle this)
      videoId = videoId.split("&")[0].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (e) {
    // Fallback if URL parsing fails
    console.error("Invalid video URL:", url);
  }

  return url;
}

export function compressImage(file: File, maxWidth = 1200, quality = 0.7): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas to Blob failed'));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
