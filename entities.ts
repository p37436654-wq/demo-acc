import "server-only";
import type { PgTable } from "drizzle-orm/pg-core";
import {
  announcements,
  attractions,
  events,
  faqs,
  jobs,
  movies,
  offers,
  restaurants,
  services,
  stores,
} from "@/db/schema";

export const ENTITY_TABLES = {
  stores,
  offers,
  events,
  dining: restaurants,
  entertainment: attractions,
  cinema: movies,
  services,
  faqs,
  announcements,
  jobs,
} as const;

export type EntityKey = keyof typeof ENTITY_TABLES;

export const ENTITY_LABELS: Record<EntityKey, { title: string; singular: string; blurb: string }> = {
  stores: { title: "Stores", singular: "Store", blurb: "The full retail directory across every level." },
  offers: { title: "Offers", singular: "Offer", blurb: "Promotions with automatic expiry handling." },
  events: { title: "Events", singular: "Event", blurb: "Festivals, workshops and live programming." },
  dining: { title: "Dining", singular: "Restaurant", blurb: "Restaurants, cafés, food court and bakeries." },
  entertainment: { title: "Entertainment", singular: "Attraction", blurb: "Cinema, gaming, kids zones and experiences." },
  cinema: { title: "Cinema", singular: "Movie", blurb: "Now showing and coming soon, with showtimes." },
  services: { title: "Services", singular: "Service", blurb: "Guest services shown on the Services screen." },
  faqs: { title: "FAQ", singular: "FAQ", blurb: "Searchable answers grouped by category." },
  announcements: { title: "Announcements", singular: "Announcement", blurb: "Top bar, homepage and What's On banners." },
  jobs: { title: "Careers", singular: "Role", blurb: "Demo job listings on the Careers screen." },
};

export const SEARCHABLE: Record<EntityKey, string[]> = {
  stores: ["name", "category", "floor", "unit", "description", "tagline"],
  offers: ["title", "storeName", "category", "description"],
  events: ["title", "category", "location", "description"],
  dining: ["name", "cuisine", "type", "floor", "description"],
  entertainment: ["name", "type", "location", "description"],
  cinema: ["title", "genre", "language", "screen", "synopsis"],
  services: ["name", "category", "location", "description"],
  faqs: ["question", "answer", "category"],
  announcements: ["title", "message", "placement"],
  jobs: ["title", "department", "employmentType", "description"],
};

export function isEntityKey(value: string): value is EntityKey {
  return Object.prototype.hasOwnProperty.call(ENTITY_TABLES, value);
}

export function entityTable(key: EntityKey): PgTable {
  return ENTITY_TABLES[key] as unknown as PgTable;
}
