import "server-only";
import { and, asc, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeed } from "@/db/seed";
import {
  announcements,
  attractions,
  events,
  faqs,
  jobs,
  media,
  movies,
  offers,
  restaurants,
  routeMaps,
  services,
  settings,
  stores,
} from "@/db/schema";

export const today = () => new Date().toISOString().slice(0, 10);

export type Stat = { value: string; suffix: string; label: string };
export type Banner = { title: string; subtitle: string; image: string; href: string };

export type MallSettings = {
  name: string;
  tagline: string;
  addressLine: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  hoursWeekdays: string;
  hoursWeekend: string;
  hoursFoodCourt: string;
  hoursCinema: string;
  instagram: string;
  facebook: string;
  youtube: string;
  transport: string[];
};

export type HomepageSettings = {
  heroImage: string;
  heroVideo: string;
  eyebrow: string;
  heroTitle: string;
  heroTagline: string;
  heroDescription: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  stats: Stat[];
  featuredStoreSlugs: string[];
  featuredOfferSlugs: string[];
  featuredEventSlugs: string[];
  featuredDiningSlugs: string[];
  campaignBanners: Banner[];
  editorialTitle: string;
  editorialBody: string;
};

export type ParkingSettings = {
  headline: string;
  intro: string;
  carLevels: string;
  carSpaces: string;
  twoWheelerSpaces: string;
  accessibleSpaces: string;
  evCharging: string;
  entrances: string[];
  rates: string[];
  rules: string[];
  hours: string;
};

export type LocationSettings = {
  headline: string;
  intro: string;
  mapCaption: string;
  landmarks: string[];
};

export type PageContent = {
  title: string;
  eyebrow: string;
  heroImage: string;
  intro: string;
  body: string;
};

export type PagesSettings = Record<string, PageContent>;

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  await ensureSeed();
  try {
    const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    if (!rows[0]) return fallback;
    return { ...fallback, ...(rows[0].value as object) } as T;
  } catch {
    return fallback;
  }
}

export const getMallSettings = () => getSetting<MallSettings>("mall", defaultMall);
export const getHomepageSettings = () => getSetting<HomepageSettings>("homepage", defaultHomepage);
export const getParkingSettings = () => getSetting<ParkingSettings>("parking", defaultParking);
export const getLocationSettings = () => getSetting<LocationSettings>("location", defaultLocation);
export const getPagesSettings = () => getSetting<PagesSettings>("pages", {});
export async function getPage(slug: string): Promise<PageContent | null> {
  const pages = await getPagesSettings();
  return pages[slug] ?? null;
}

export async function getPublishedRouteMap() {
  await ensureSeed();
  try {
    const rows = await db
      .select()
      .from(routeMaps)
      .where(eq(routeMaps.status, "published"))
      .orderBy(desc(routeMaps.publishedAt))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function listStores(options: { includeDrafts?: boolean } = {}) {
  await ensureSeed();
  const query = db.select().from(stores).orderBy(asc(stores.sortOrder), asc(stores.name));
  const rows = await query;
  return options.includeDrafts ? rows : rows.filter((row) => row.status === "published");
}

export async function getStore(slug: string) {
  await ensureSeed();
  const rows = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
  const store = rows[0];
  if (!store || store.status !== "published") return null;
  const storeOffers = await db
    .select()
    .from(offers)
    .where(and(eq(offers.status, "published"), eq(offers.storeSlug, slug)))
    .orderBy(desc(offers.featured));
  const activeOffers = storeOffers.filter((offer) => !offer.expiryDate || offer.expiryDate >= today());
  return { store, offers: activeOffers };
}

export async function listOffers(options: { includeDrafts?: boolean; includeExpired?: boolean } = {}) {
  await ensureSeed();
  const rows = await db.select().from(offers).orderBy(asc(offers.sortOrder), desc(offers.startDate));
  const published = options.includeDrafts ? rows : rows.filter((row) => row.status === "published");
  if (options.includeExpired) return published;
  return published.filter((offer) => !offer.expiryDate || offer.expiryDate >= today());
}

export async function getOffer(slug: string) {
  await ensureSeed();
  const rows = await db.select().from(offers).where(eq(offers.slug, slug)).limit(1);
  const offer = rows[0];
  if (!offer || offer.status !== "published") return null;
  if (offer.expiryDate && offer.expiryDate < today()) return { offer, expired: true };
  return { offer, expired: false };
}

export async function listEvents(options: { includeDrafts?: boolean } = {}) {
  await ensureSeed();
  const rows = await db.select().from(events).orderBy(asc(events.date), asc(events.sortOrder));
  const published = options.includeDrafts ? rows : rows.filter((row) => row.status === "published");
  return published;
}

export async function getEvent(slug: string) {
  await ensureSeed();
  const rows = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  const event = rows[0];
  if (!event || event.status !== "published") return null;
  return event;
}

export async function listRestaurants(options: { includeDrafts?: boolean } = {}) {
  await ensureSeed();
  const rows = await db.select().from(restaurants).orderBy(asc(restaurants.sortOrder), asc(restaurants.name));
  return options.includeDrafts ? rows : rows.filter((row) => row.status === "published");
}

export async function getRestaurant(slug: string) {
  await ensureSeed();
  const rows = await db.select().from(restaurants).where(eq(restaurants.slug, slug)).limit(1);
  const restaurant = rows[0];
  if (!restaurant || restaurant.status !== "published") return null;
  return restaurant;
}

export async function listAttractions(options: { includeDrafts?: boolean } = {}) {
  await ensureSeed();
  const rows = await db.select().from(attractions).orderBy(asc(attractions.sortOrder), asc(attractions.name));
  return options.includeDrafts ? rows : rows.filter((row) => row.status === "published");
}

export async function listMovies(options: { includeDrafts?: boolean } = {}) {
  await ensureSeed();
  const rows = await db.select().from(movies).orderBy(asc(movies.sortOrder), asc(movies.title));
  return options.includeDrafts ? rows : rows.filter((row) => row.status === "published");
}

export async function listServices() {
  await ensureSeed();
  const rows = await db.select().from(services).orderBy(asc(services.sortOrder), asc(services.name));
  return rows.filter((row) => row.status === "published");
}

export async function listFaqs() {
  await ensureSeed();
  const rows = await db.select().from(faqs).orderBy(asc(faqs.sortOrder), asc(faqs.id));
  return rows.filter((row) => row.status === "published");
}

export async function listAnnouncements(placement?: string) {
  await ensureSeed();
  try {
    const rows = await db.select().from(announcements).orderBy(asc(announcements.sortOrder));
    const now = today();
    return rows.filter((row) => {
      if (row.status !== "published") return false;
      if (placement && row.placement !== placement) return false;
      if (row.startDate && row.startDate > now) return false;
      if (row.endDate && row.endDate < now) return false;
      return true;
    });
  } catch {
    return [];
  }
}

export async function listJobs() {
  await ensureSeed();
  const rows = await db.select().from(jobs).orderBy(asc(jobs.sortOrder), asc(jobs.title));
  return rows.filter((row) => row.status === "published");
}

export async function listMedia() {
  await ensureSeed();
  return db
    .select({
      id: media.id,
      title: media.title,
      alt: media.alt,
      fileName: media.fileName,
      mimeType: media.mimeType,
      sizeBytes: media.sizeBytes,
      tags: media.tags,
      folder: media.folder,
      createdAt: media.createdAt,
    })
    .from(media)
    .orderBy(desc(media.createdAt));
}

export type SearchHit = {
  type: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  category: string;
};

export async function searchAll(query: string): Promise<SearchHit[]> {
  await ensureSeed();
  const q = query.trim();
  if (!q) return [];
  const like = `%${q}%`;
  const hits: SearchHit[] = [];

  const [storeRows, diningRows, offerRows, eventRows, attractionRows, movieRows, serviceRows, faqRows] =
    await Promise.all([
      db.select().from(stores).where(and(eq(stores.status, "published"), or(ilike(stores.name, like), ilike(stores.category, like), ilike(stores.description, like)))).limit(8),
      db.select().from(restaurants).where(and(eq(restaurants.status, "published"), or(ilike(restaurants.name, like), ilike(restaurants.cuisine, like), ilike(restaurants.description, like)))).limit(8),
      db.select().from(offers).where(and(eq(offers.status, "published"), or(ilike(offers.title, like), ilike(offers.storeName, like), ilike(offers.description, like)))).limit(6),
      db.select().from(events).where(and(eq(events.status, "published"), or(ilike(events.title, like), ilike(events.category, like), ilike(events.description, like)))).limit(6),
      db.select().from(attractions).where(and(eq(attractions.status, "published"), or(ilike(attractions.name, like), ilike(attractions.type, like), ilike(attractions.description, like)))).limit(6),
      db.select().from(movies).where(and(eq(movies.status, "published"), or(ilike(movies.title, like), ilike(movies.genre, like)))).limit(6),
      db.select().from(services).where(and(eq(services.status, "published"), or(ilike(services.name, like), ilike(services.description, like)))).limit(6),
      db.select().from(faqs).where(and(eq(faqs.status, "published"), or(ilike(faqs.question, like), ilike(faqs.answer, like)))).limit(6),
    ]);

  storeRows.forEach((row) =>
    hits.push({ type: "Store", title: row.name, subtitle: `${row.category} · ${row.floor} · ${row.unit}`, href: `/stores/${row.slug}`, image: row.coverImage, category: row.category }),
  );
  diningRows.forEach((row) =>
    hits.push({ type: "Dining", title: row.name, subtitle: `${row.cuisine} · ${row.floor}`, href: `/dining/${row.slug}`, image: row.coverImage, category: row.type }),
  );
  offerRows.forEach((row) =>
    hits.push({ type: "Offer", title: row.title, subtitle: `${row.storeName} · ${row.category}`, href: `/offers/${row.slug}`, image: row.image, category: row.category }),
  );
  eventRows.forEach((row) =>
    hits.push({ type: "Event", title: row.title, subtitle: `${row.date} · ${row.location}`, href: `/events/${row.slug}`, image: row.image, category: row.category }),
  );
  attractionRows.forEach((row) =>
    hits.push({ type: "Entertainment", title: row.name, subtitle: `${row.type} · ${row.location}`, href: "/entertainment", image: row.image, category: row.type }),
  );
  movieRows.forEach((row) =>
    hits.push({ type: "Cinema", title: row.title, subtitle: `${row.genre} · ${row.language} · ${row.duration}`, href: "/cinema", image: row.poster, category: row.genre }),
  );
  serviceRows.forEach((row) =>
    hits.push({ type: "Service", title: row.name, subtitle: row.location, href: "/services", image: "", category: row.category }),
  );
  faqRows.forEach((row) =>
    hits.push({ type: "FAQ", title: row.question, subtitle: row.answer.slice(0, 90), href: "/faq", image: "", category: row.category }),
  );

  return hits;
}

export async function getContentCounts() {
  await ensureSeed();
  const count = async (table: Parameters<typeof db.select>[0] extends never ? never : never) => table;
  void count;
  const [[storeCount], [offerCount], [eventCount], [diningCount], [attractionCount], [movieCount], [faqCount], [jobCount]] =
    await Promise.all([
      db.select({ value: sql<number>`count(*)::int` }).from(stores).where(eq(stores.status, "published")),
      db.select({ value: sql<number>`count(*)::int` }).from(offers).where(eq(offers.status, "published")),
      db.select({ value: sql<number>`count(*)::int` }).from(events).where(eq(events.status, "published")),
      db.select({ value: sql<number>`count(*)::int` }).from(restaurants).where(eq(restaurants.status, "published")),
      db.select({ value: sql<number>`count(*)::int` }).from(attractions).where(eq(attractions.status, "published")),
      db.select({ value: sql<number>`count(*)::int` }).from(movies).where(eq(movies.status, "published")),
      db.select({ value: sql<number>`count(*)::int` }).from(faqs).where(eq(faqs.status, "published")),
      db.select({ value: sql<number>`count(*)::int` }).from(jobs).where(eq(jobs.status, "published")),
    ]);
  return {
    stores: storeCount?.value ?? 0,
    offers: offerCount?.value ?? 0,
    events: eventCount?.value ?? 0,
    dining: diningCount?.value ?? 0,
    entertainment: attractionCount?.value ?? 0,
    movies: movieCount?.value ?? 0,
    faqs: faqCount?.value ?? 0,
    jobs: jobCount?.value ?? 0,
  };
}

export const defaultMall: MallSettings = {
  name: "NOVA GRAND MALL",
  tagline: "SHOP. DINE. PLAY. EXPERIENCE.",
  addressLine: "Nova Avenue District, Survey No. 42 (Demo), Gachibowli Road",
  city: "Hyderabad",
  region: "Telangana 500032, India",
  phone: "+91 40 0000 0000 (demo)",
  email: "hello@novagrandmall.example",
  hoursWeekdays: "10:00 AM – 10:00 PM",
  hoursWeekend: "10:00 AM – 11:00 PM",
  hoursFoodCourt: "11:00 AM – 11:30 PM",
  hoursCinema: "9:30 AM – 1:00 AM",
  instagram: "https://example.com/nova-demo",
  facebook: "https://example.com/nova-demo",
  youtube: "https://example.com/nova-demo",
  transport: [],
};

export const defaultHomepage: HomepageSettings = {
  heroImage: "",
  heroVideo: "",
  eyebrow: "DEMO EXPERIENCE · HYDERABAD",
  heroTitle: "NOVA GRAND MALL",
  heroTagline: "SHOP. DINE. PLAY. EXPERIENCE.",
  heroDescription: "A destination designed for shopping, dining, entertainment and unforgettable experiences.",
  ctaPrimaryLabel: "EXPLORE THE MALL",
  ctaPrimaryHref: "/stores",
  ctaSecondaryLabel: "PLAN YOUR VISIT",
  ctaSecondaryHref: "/plan-your-visit",
  stats: [],
  featuredStoreSlugs: [],
  featuredOfferSlugs: [],
  featuredEventSlugs: [],
  featuredDiningSlugs: [],
  campaignBanners: [],
  editorialTitle: "An architecture of leisure",
  editorialBody: "",
};

export const defaultParking: ParkingSettings = {
  headline: "Parking at NOVA GRAND MALL",
  intro: "Demo parking information.",
  carLevels: "P1, P2, P3",
  carSpaces: "1,800 sample car spaces",
  twoWheelerSpaces: "600 sample two-wheeler bays",
  accessibleSpaces: "42 accessible bays",
  evCharging: "18 EV charging points (sample)",
  entrances: [],
  rates: [],
  rules: [],
  hours: "Open 24 × 7 (demo)",
};

export const defaultLocation: LocationSettings = {
  headline: "Getting here",
  intro: "Demo route information.",
  mapCaption: "DEMO MAP — SAMPLE DATA.",
  landmarks: [],
};
