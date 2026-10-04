import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull().default("Administrator"),
    role: text("role").notNull().default("admin"), // admin | editor
    passwordHash: text("password_hash").notNull(),
    resetToken: text("reset_token"),
    resetTokenExpiresAt: timestamp("reset_token_expires_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  actorName: text("actor_name").notNull().default("system"),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityLabel: text("entity_label").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Media library                                                       */
/* ------------------------------------------------------------------ */

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default(""),
  alt: text("alt").notNull().default(""),
  fileName: text("file_name").notNull().default("upload"),
  mimeType: text("mime_type").notNull().default("image/jpeg"),
  sizeBytes: integer("size_bytes").notNull().default(0),
  /** base64 payload — keeps uploads persistent across deploys */
  data: text("data").notNull().default(""),
  tags: text("tags").notNull().default(""),
  folder: text("folder").notNull().default("general"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Directory content                                                   */
/* ------------------------------------------------------------------ */

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull().default("Fashion"),
  logo: text("logo").notNull().default(""),
  coverImage: text("cover_image").notNull().default(""),
  gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  floor: text("floor").notNull().default("Ground Floor"),
  unit: text("unit").notNull().default("G-01"),
  openingHours: text("opening_hours").notNull().default("10:00 AM – 10:00 PM"),
  phone: text("phone").notNull().default(""),
  website: text("website").notNull().default(""),
  instagram: text("instagram").notNull().default(""),
  storeType: text("store_type").notNull().default("Retail"),
  featured: boolean("featured").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
  status: text("status").notNull().default("published"), // draft | published
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull().default("Restaurants"),
  cuisine: text("cuisine").notNull().default("Multi-Cuisine"),
  coverImage: text("cover_image").notNull().default(""),
  gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  menuHighlights: jsonb("menu_highlights").$type<string[]>().notNull().default([]),
  priceLevel: text("price_level").notNull().default("₹₹"),
  floor: text("floor").notNull().default("Food Court, Level 3"),
  unit: text("unit").notNull().default("FC-01"),
  openingHours: text("opening_hours").notNull().default("11:00 AM – 11:00 PM"),
  phone: text("phone").notNull().default(""),
  website: text("website").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  status: text("status").notNull().default("published"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  storeName: text("store_name").notNull().default(""),
  storeSlug: text("store_slug").notNull().default(""),
  category: text("category").notNull().default("Fashion"),
  image: text("image").notNull().default(""),
  description: text("description").notNull().default(""),
  terms: text("terms").notNull().default(""),
  startDate: text("start_date").notNull().default(""),
  expiryDate: text("expiry_date").notNull().default(""),
  promoCode: text("promo_code").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  status: text("status").notNull().default("published"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull().default("Special Events"),
  image: text("image").notNull().default(""),
  description: text("description").notNull().default(""),
  date: text("date").notNull().default(""),
  endDate: text("end_date").notNull().default(""),
  time: text("time").notNull().default(""),
  location: text("location").notNull().default(""),
  registrationUrl: text("registration_url").notNull().default(""),
  priceInfo: text("price_info").notNull().default("Free entry"),
  featured: boolean("featured").notNull().default(false),
  status: text("status").notNull().default("published"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const attractions = pgTable("attractions", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull().default("Gaming"),
  image: text("image").notNull().default(""),
  description: text("description").notNull().default(""),
  location: text("location").notNull().default("Level 4"),
  timings: text("timings").notNull().default("11:00 AM – 10:00 PM"),
  ageInfo: text("age_info").notNull().default("All ages"),
  bookingUrl: text("booking_url").notNull().default(""),
  priceInfo: text("price_info").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  status: text("status").notNull().default("published"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  poster: text("poster").notNull().default(""),
  genre: text("genre").notNull().default("Drama"),
  duration: text("duration").notNull().default("2h 10m"),
  language: text("language").notNull().default("Hindi"),
  rating: text("rating").notNull().default("U/A 13+"),
  synopsis: text("synopsis").notNull().default(""),
  screen: text("screen").notNull().default("Screen 1"),
  showtimes: jsonb("showtimes").$type<string[]>().notNull().default([]),
  bookingUrl: text("booking_url").notNull().default(""),
  nowShowing: boolean("now_showing").notNull().default(true),
  status: text("status").notNull().default("published"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("✦"),
  description: text("description").notNull().default(""),
  location: text("location").notNull().default("Ground Floor"),
  hours: text("hours").notNull().default("Mall hours"),
  contact: text("contact").notNull().default(""),
  category: text("category").notNull().default("Guest Services"),
  status: text("status").notNull().default("published"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull().default("Mall Timings"),
  status: text("status").notNull().default("published"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull().default(""),
  linkLabel: text("link_label").notNull().default(""),
  linkUrl: text("link_url").notNull().default(""),
  placement: text("placement").notNull().default("topbar"), // topbar | homepage | whats_on
  startDate: text("start_date").notNull().default(""),
  endDate: text("end_date").notNull().default(""),
  status: text("status").notNull().default("published"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department").notNull().default("Operations"),
  employmentType: text("employment_type").notNull().default("Full-time"),
  location: text("location").notNull().default("NOVA GRAND MALL, Hyderabad"),
  description: text("description").notNull().default(""),
  requirements: text("requirements").notNull().default(""),
  applyEmail: text("apply_email").notNull().default("careers@novagrandmall.example"),
  status: text("status").notNull().default("published"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull().default("contact"), // contact | leasing | careers
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  subject: text("subject").notNull().default(""),
  message: text("message").notNull(),
  extra: jsonb("extra").$type<Record<string, string>>().notNull().default({}),
  handled: boolean("handled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Settings / long-form pages / map / homepage                         */
/* ------------------------------------------------------------------ */

export const settings = pgTable(
  "settings",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    value: jsonb("value").$type<Record<string, unknown>>().notNull().default({}),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("settings_key_unique").on(table.key)],
);

export const routeMaps = pgTable("route_maps", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Demo Route Map"),
  caption: text("caption").notNull().default(""),
  imageData: text("image_data").notNull().default(""),
  externalUrl: text("external_url").notNull().default(""),
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
