// Картинки в нескольких размерах: телефон получает 640 px вместо 1920, современные браузеры — WebP.
import hero from "@/assets/hero-camera.jpg";
import hero640 from "@/assets/hero-camera-640.webp";
import hero1280 from "@/assets/hero-camera-1280.webp";
import hero1920 from "@/assets/hero-camera-1920.webp";
import business from "@/assets/business.jpg";
import business640 from "@/assets/business-640.webp";
import business1280 from "@/assets/business-1280.webp";
import home from "@/assets/home.jpg";
import home640 from "@/assets/home-640.webp";
import home1280 from "@/assets/home-1280.webp";
import maintenance from "@/assets/maintenance.jpg";
import maintenance640 from "@/assets/maintenance-640.webp";
import maintenance1280 from "@/assets/maintenance-1280.webp";

export type Pic = { src: string; webp: string; width: number; height: number };

export const pics = {
  hero: {
    src: hero,
    webp: `${hero640} 640w, ${hero1280} 1280w, ${hero1920} 1920w`,
    width: 1920,
    height: 1088,
  },
  business: {
    src: business,
    webp: `${business640} 640w, ${business1280} 1280w`,
    width: 1280,
    height: 896,
  },
  home: { src: home, webp: `${home640} 640w, ${home1280} 1280w`, width: 1280, height: 896 },
  maintenance: {
    src: maintenance,
    webp: `${maintenance640} 640w, ${maintenance1280} 1280w`,
    width: 1280,
    height: 896,
  },
} satisfies Record<string, Pic>;
