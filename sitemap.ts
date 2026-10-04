import type { MetadataRoute } from "next";

const ROUTES = [
  "",
  "/stores",
  "/dining",
  "/offers",
  "/events",
  "/entertainment",
  "/cinema",
  "/whats-on",
  "/map",
  "/plan-your-visit",
  "/location",
  "/parking",
  "/services",
  "/about",
  "/sustainability",
  "/careers",
  "/leasing",
  "/faq",
  "/contact",
  "/search",
  "/privacy",
  "/terms",
  "/cookies",
  "/accessibility",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://novagrandmall.example";
  const now = new Date();
  return ROUTES.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
