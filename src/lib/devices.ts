export type DeviceCategory = "phone" | "tablet" | "desktop";
export type DeviceBrand = "apple" | "samsung" | "google" | "other";
export type FrameStyle =
  | "iphone-dynamic-island"
  | "iphone-notch"
  | "iphone-classic"
  | "android"
  | "tablet"
  | "desktop";

export interface Device {
  id: string;
  name: string;
  brand: DeviceBrand;
  category: DeviceCategory;
  width: number;
  height: number;
  frame: FrameStyle;
}

export const DEVICES: Device[] = [
  // iPhones
  { id: "iphone-17-pro-max", name: "iPhone 17 Pro Max", brand: "apple", category: "phone", width: 440, height: 956, frame: "iphone-dynamic-island" },
  { id: "iphone-17-pro", name: "iPhone 17 Pro", brand: "apple", category: "phone", width: 402, height: 874, frame: "iphone-dynamic-island" },
  { id: "iphone-16-pro", name: "iPhone 16 Pro", brand: "apple", category: "phone", width: 402, height: 874, frame: "iphone-dynamic-island" },
  { id: "iphone-15-pro", name: "iPhone 15 Pro", brand: "apple", category: "phone", width: 393, height: 852, frame: "iphone-dynamic-island" },
  { id: "iphone-14", name: "iPhone 14", brand: "apple", category: "phone", width: 390, height: 844, frame: "iphone-notch" },
  { id: "iphone-13", name: "iPhone 13", brand: "apple", category: "phone", width: 390, height: 844, frame: "iphone-notch" },
  { id: "iphone-se", name: "iPhone SE", brand: "apple", category: "phone", width: 375, height: 667, frame: "iphone-classic" },

  // Samsung
  { id: "galaxy-s24-ultra", name: "Galaxy S24 Ultra", brand: "samsung", category: "phone", width: 412, height: 915, frame: "android" },
  { id: "galaxy-s24-plus", name: "Galaxy S24+", brand: "samsung", category: "phone", width: 400, height: 880, frame: "android" },
  { id: "galaxy-s24", name: "Galaxy S24", brand: "samsung", category: "phone", width: 384, height: 854, frame: "android" },
  { id: "galaxy-s23", name: "Galaxy S23", brand: "samsung", category: "phone", width: 360, height: 780, frame: "android" },
  { id: "galaxy-z-fold-5", name: "Galaxy Z Fold 5", brand: "samsung", category: "phone", width: 344, height: 882, frame: "android" },
  { id: "galaxy-z-flip-5", name: "Galaxy Z Flip 5", brand: "samsung", category: "phone", width: 360, height: 800, frame: "android" },
  { id: "galaxy-a54", name: "Galaxy A54", brand: "samsung", category: "phone", width: 360, height: 780, frame: "android" },

  // Pixel
  { id: "pixel-9-pro-xl", name: "Pixel 9 Pro XL", brand: "google", category: "phone", width: 412, height: 915, frame: "android" },
  { id: "pixel-9-pro", name: "Pixel 9 Pro", brand: "google", category: "phone", width: 412, height: 892, frame: "android" },
  { id: "pixel-9", name: "Pixel 9", brand: "google", category: "phone", width: 412, height: 915, frame: "android" },
  { id: "pixel-8-pro", name: "Pixel 8 Pro", brand: "google", category: "phone", width: 412, height: 915, frame: "android" },
  { id: "pixel-8", name: "Pixel 8", brand: "google", category: "phone", width: 412, height: 915, frame: "android" },
  { id: "pixel-7-pro", name: "Pixel 7 Pro", brand: "google", category: "phone", width: 412, height: 892, frame: "android" },

  // Other Android
  { id: "oneplus-12", name: "OnePlus 12", brand: "other", category: "phone", width: 412, height: 919, frame: "android" },

  // Tablets
  { id: "ipad-pro-13", name: "iPad Pro 13″", brand: "apple", category: "tablet", width: 1024, height: 1366, frame: "tablet" },
  { id: "ipad-pro-11", name: "iPad Pro 11″", brand: "apple", category: "tablet", width: 834, height: 1194, frame: "tablet" },
  { id: "ipad-air", name: "iPad Air", brand: "apple", category: "tablet", width: 820, height: 1180, frame: "tablet" },
  { id: "galaxy-tab-s9", name: "Galaxy Tab S9", brand: "samsung", category: "tablet", width: 800, height: 1280, frame: "tablet" },

  // Desktops
  { id: "desktop-hd", name: "Desktop HD", brand: "other", category: "desktop", width: 1920, height: 1080, frame: "desktop" },
  { id: "desktop", name: "Desktop", brand: "other", category: "desktop", width: 1440, height: 900, frame: "desktop" },
  { id: "laptop", name: "Laptop", brand: "other", category: "desktop", width: 1366, height: 768, frame: "desktop" },
];

export const DEVICES_BY_ID: Record<string, Device> = Object.fromEntries(
  DEVICES.map((d) => [d.id, d]),
);

export const DEFAULT_DEVICE_IDS = ["iphone-17-pro", "pixel-9-pro", "ipad-pro-11"];
