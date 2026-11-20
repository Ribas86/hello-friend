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
import home1792 from "@/assets/home-1792.webp";
import residential from "@/assets/residential.jpg";
import residential640 from "@/assets/residential-640.webp";
import residential1280 from "@/assets/residential-1280.webp";
import maintenance from "@/assets/maintenance.jpg";
import maintenance640 from "@/assets/maintenance-640.webp";
import maintenance1280 from "@/assets/maintenance-1280.webp";

/** pos — какая часть кадра остаётся видна при обрезке (на телефоне), как CSS object-position */
export type Pic = { src: string; webp: string; width: number; height: number; pos?: string };

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
  // Сгенерированное фото: вход в частный дом вечером, камера над дверью (держим её в кадре)
  home: {
    src: home,
    webp: `${home640} 640w, ${home1280} 1280w, ${home1792} 1792w`,
    width: 1792,
    height: 768,
    pos: "85% 0%",
  },
  // Сгенерированное фото двора ЖК с камерой на углу дома: на телефоне держим камеру в кадре
  residential: {
    src: residential,
    webp: `${residential640} 640w, ${residential1280} 1280w`,
    width: 1280,
    height: 720,
    pos: "22% 50%",
  },
  // Сгенерированное фото: мастер обслуживает уличную камеру на фасаде, вечер
  maintenance: {
    src: maintenance,
    webp: `${maintenance640} 640w, ${maintenance1280} 1280w`,
    width: 1280,
    height: 853,
  },
} satisfies Record<string, Pic>;
