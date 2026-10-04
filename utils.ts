export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateLong(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function toDateInput(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

/** Pure client-safe "is this venue open right now" heuristic based on mall hours text. */
export function isOpenNow(openingHours: string, now = new Date()): boolean {
  if (!openingHours) return false;
  const match = openingHours.match(/(\d{1,2})[:.](\d{2})?\s*(AM|PM)?\s*[–\-to]+\s*(\d{1,2})[:.](\d{2})?\s*(AM|PM)?/i);
  if (!match) return /24/i.test(openingHours);
  const [, sh, sm = "00", smeridiem, eh, em = "00", emeridiem] = match;
  let start = Number(sh) % 24;
  let end = Number(eh) % 24;
  if ((smeridiem ?? "").toUpperCase() === "PM" && start < 12) start += 12;
  if ((smeridiem ?? "").toUpperCase() === "AM" && start === 12) start = 0;
  if ((emeridiem ?? "").toUpperCase() === "PM" && end < 12) end += 12;
  if ((emeridiem ?? "").toUpperCase() === "AM" && end === 12) end = 0;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = start * 60 + Number(sm);
  const endMinutes = end * 60 + Number(em);
  if (endMinutes <= startMinutes) return minutes >= startMinutes || minutes <= endMinutes;
  return minutes >= startMinutes && minutes <= endMinutes;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function truncate(value: string, max = 160): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

export const MALL = {
  name: "NOVA GRAND MALL",
  tagline: "SHOP. DINE. PLAY. EXPERIENCE.",
  city: "Hyderabad",
  region: "Telangana, India",
  addressLine: "Nova Avenue District, Survey No. 42 (Demo), Gachibowli Road",
  address: "Nova Avenue District, Survey No. 42 (Demo), Gachibowli Road, Hyderabad, Telangana 500032, India",
  phone: "+91 40 0000 0000 (demo)",
  email: "hello@novagrandmall.example",
  hours: "10:00 AM – 10:00 PM",
} as const;
