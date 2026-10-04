import "server-only";
import { eq, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
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
  settings,
  stores,
  users,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";

const px = (id: number, w = 1400, h = 900) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

const ARCH = {
  hero: px(1021235, 2000, 1200),
  atrium: px(14230221),
  wide: px(32212151),
  luxury: px(37129754),
  crowd: px(11466353),
  dome: px(9349431),
  green: px(39222554),
  skylight: px(27972901),
  festive: px(19840969),
  frankfurt: px(19335729),
};

const SHOP = [px(8311880), px(8387807), px(8386646), px(13532891), px(5698851), px(8387837), px(8386643), px(8386641), px(8386666), px(8311885)];
const FOOD = [px(8414741), px(15580733), px(36694451), px(38475586), px(4870426), px(14794083), px(27612507), px(13793182), px(29101361), px(16716573)];
const PLAY = [px(34168488), px(9821699), px(9833552), px(36484265), px(12858173), px(9821661), px(9821653), px(20957190), px(39846285), px(31472400)];
const POSTERS = [px(37260262, 900, 1300), px(12995433, 900, 1300), px(7960355, 900, 1300), px(8271458, 900, 1300), px(11916973, 900, 1300), px(18319250, 900, 1300), px(13137879, 900, 1300), px(27499446, 900, 1300)];

function day(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

/** Insert demo rows only when the target table is still empty. */
async function seedIfEmpty(table: PgTable, run: () => Promise<unknown>): Promise<void> {
  try {
    const rows = await db.select({ value: sql<number>`count(*)::int` }).from(table);
    if ((rows[0]?.value ?? 0) > 0) return;
    await run();
  } catch (error) {
    seedFailures += 1;
    console.error("[seed] insert failed", error);
  }
}

let seedFailures = 0;
let seedPromise: Promise<void> | null = null;

/** Idempotent demo-data bootstrap. Runs at most once per server process. */
export async function ensureSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

async function runSeed(): Promise<void> {
  try {
    const marker = await db.select().from(settings).where(eq(settings.key, "seed_state")).limit(1);
    if (marker[0]?.value && (marker[0].value as { done?: boolean }).done) return;
  } catch {
    /* table may not exist yet — drizzle push handles that */
  }

  const email = (process.env.NOVA_ADMIN_EMAIL ?? "admin@novagrandmall.example").toLowerCase();
  const password = process.env.NOVA_ADMIN_PASSWORD ?? "NovaDemo#2026";

  await seedIfEmpty(users, () =>
    db
      .insert(users)
      .values({ email, name: "Nova CMS Admin", role: "admin", passwordHash: hashPassword(password) })
      .onConflictDoNothing(),
  );

  const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  await seedIfEmpty(stores, () =>
    db.insert(stores).values(
      [
        ["Aurelia Couture", "Fashion", "Luxury", "Level 1", "L1-01", true, true, "Editorial Indian luxury, hand-finished.", ARCH.atrium],
        ["Lumen Optics", "Accessories", "Retail", "Level 1", "L1-14", false, true, "Precision eyewear studio and lens lab.", SHOP[1]],
        ["Nordvik Home", "Home", "Lifestyle", "Level 2", "L2-08", true, false, "Scandinavian interiors and quiet design.", SHOP[2]],
        ["Kaya Beauty Atelier", "Beauty", "Retail", "Level 1", "L1-22", true, true, "Skin-first beauty with clean formulations.", SHOP[3]],
        ["Volt & Verse", "Electronics", "Retail", "Level 3", "L3-04", false, true, "Audio, imaging and smart living gear.", SHOP[4]],
        ["Meera Jewels", "Jewellery", "Luxury", "Level 1", "L1-05", true, false, "Handcrafted fine jewellery, demo collection.", SHOP[5]],
        ["Stride Lab", "Footwear", "Sports", "Level 2", "L2-19", false, true, "Performance running and gait analysis.", SHOP[6]],
        ["Tinker Town", "Kids", "Retail", "Level 3", "L3-27", false, false, "Toys, books and imaginative play.", SHOP[7]],
        ["Atlas Sports Co.", "Sports", "Retail", "Level 2", "L2-31", false, false, "Gear for every monsoon and marathon.", SHOP[8]],
        ["Paperline Studio", "Books", "Lifestyle", "Level 2", "L2-12", false, true, "Independent press, stationery and print.", SHOP[9]],
        ["Maison Noir", "Luxury", "Luxury", "Level 1", "L1-09", true, false, "Quiet-luxury wardrobe essentials.", SHOP[0]],
        ["Craft Cartel", "Gifts", "Lifestyle", "Level 3", "L3-11", false, false, "Artisan gifting and small-batch goods.", ARCH.wide],
        ["Glow Society", "Beauty", "Retail", "Level 2", "L2-05", false, false, "Fragrance layering bar and beauty tech.", SHOP[2]],
        ["Urban Thread", "Fashion", "Retail", "Level 2", "L2-24", false, true, "Streetwear drops every first Friday.", SHOP[5]],
        ["Zenith Watches", "Accessories", "Luxury", "Level 1", "L1-18", false, false, "Horology service and curated timepieces.", ARCH.luxury],
        ["Nest & Nook", "Home", "Lifestyle", "Level 3", "L3-16", false, false, "Soft furnishings, ceramics and candles.", SHOP[3]],
      ].map(([name, category, storeType, floor, unit, featured, isNew, tagline, image], index) => ({
        slug: slug(String(name)),
        name: String(name),
        category: String(category),
        storeType: String(storeType),
        floor: String(floor),
        unit: String(unit),
        featured: Boolean(featured),
        isNew: Boolean(isNew),
        tagline: String(tagline),
        description: `${String(name)} is a demo retailer at NOVA GRAND MALL. ${String(tagline)} This sample listing demonstrates the store directory, filters, detail pages and the CMS that powers them.`,
        coverImage: String(image),
        gallery: [String(image), SHOP[(index + 3) % SHOP.length], ARCH.atrium],
        openingHours: "10:00 AM – 10:00 PM",
        phone: "+91 40 0000 0000 (demo)",
        website: "https://example.com",
        instagram: "@novagrandmall.demo",
        status: "published",
        sortOrder: index,
      })),
    ),
  );

  await seedIfEmpty(restaurants, () =>
    db.insert(restaurants).values(
      [
        ["Cinnamon Trail", "Fine Dining", "Modern Indian", "Level 4", "₹₹₹₹", true, FOOD[2]],
        ["Ember & Oak", "Restaurants", "Grill and Smokehouse", "Level 4", "₹₹₹", true, FOOD[1]],
        ["Sakura Nine", "Restaurants", "Japanese", "Level 4", "₹₹₹₹", false, FOOD[6]],
        ["The Daily Grind", "Cafés", "Specialty Coffee", "Level 1", "₹₹", true, FOOD[9]],
        ["Green Bowl", "Fast Food", "Healthy Bowls", "Level 3", "₹₹", false, FOOD[8]],
        ["Bombay Chaat House", "Food Court", "Street Food", "Level 3", "₹", false, FOOD[4]],
        ["Sugar Atlas", "Desserts", "Patisserie", "Level 2", "₹₹", true, FOOD[7]],
        ["Levain & Co.", "Bakeries", "Artisan Bakery", "Level 1", "₹₹", false, FOOD[3]],
        ["Press & Punch", "Beverages", "Cold Press and Tea", "Level 3", "₹", false, FOOD[5]],
        ["Coastal Karma", "Restaurants", "Coastal Indian", "Level 4", "₹₹₹", false, FOOD[0]],
      ].map(([name, type, cuisine, floor, priceLevel, featured, image], index) => ({
        slug: slug(String(name)),
        name: String(name),
        type: String(type),
        cuisine: String(cuisine),
        floor: String(floor),
        priceLevel: String(priceLevel),
        featured: Boolean(featured),
        tagline: `${String(cuisine)} in a demo dining room`,
        description: `${String(name)} is a demo dining concept inside NOVA GRAND MALL serving ${String(cuisine).toLowerCase()}. This sample profile demonstrates the dining directory, filters, menu highlights and detail pages.`,
        coverImage: String(image),
        gallery: [String(image), FOOD[(index + 4) % FOOD.length]],
        menuHighlights: ["Demo signature plate", "Seasonal tasting sampler", "House specialty beverage"],
        unit: `D-${index + 10}`,
        openingHours: "11:00 AM – 11:00 PM",
        phone: "+91 40 0000 0000 (demo)",
        website: "https://example.com",
        status: "published",
        sortOrder: index,
      })),
    ),
  );

  await seedIfEmpty(offers, () =>
    db.insert(offers).values(
      [
        ["Golden Hour Wardrobe", "Aurelia Couture", "Fashion", 30, true, 0],
        ["Two For Tuesday", "The Daily Grind", "Dining", 0, false, 1],
        ["Glow Reset Facial", "Kaya Beauty Atelier", "Beauty", 25, true, 2],
        ["Sound Upgrade Week", "Volt & Verse", "Electronics", 15, false, 3],
        ["Festival Of Lights Edit", "Maison Noir", "Seasonal", 40, true, 4],
        ["72 Hour Flash", "Urban Thread", "Limited Time", 50, false, 5],
        ["Run Club Bundle", "Stride Lab", "Trending", 20, true, 6],
        ["Home Refresh Event", "Nordvik Home", "Seasonal", 35, false, 7],
      ].map(([title, storeName, category, discount, featured, index]) => ({
        slug: slug(String(title)),
        title: String(title),
        storeName: String(storeName),
        storeSlug: slug(String(storeName)),
        category: String(category),
        image: SHOP[Number(index) % SHOP.length],
        description: `Enjoy ${Number(discount)}% off selected demo lines at ${String(storeName)}. This is sample promotional content created to demonstrate the offers platform, expiry handling and CMS controls.`,
        terms: "Valid on selected demo merchandise only. Cannot be combined with other demo offers. Show this screen at billing. Sample terms for demonstration purposes.",
        startDate: day(-3),
        expiryDate: day(Number(index) % 3 === 0 ? 45 : 20),
        promoCode: `NOVA${10 + Number(index)}`,
        featured: Boolean(featured),
        status: "published",
        sortOrder: Number(index),
      })),
    ),
  );

  await seedIfEmpty(events, () =>
    db.insert(events).values(
      [
        ["Nova Night Market", "Shopping Events", 1, "Atrium, Level 1", true, 0],
        ["Little Chefs Workshop", "Kids", 3, "Food Court Studio, Level 3", false, 1],
        ["Indie Sound Sessions", "Special Events", 5, "The Terrace, Level 5", true, 2],
        ["Weekend Makers Bazaar", "Weekend", 2, "Central Court, Level 1", false, 3],
        ["Meet The Maker: Ceramics", "Workshops", 7, "Studio 2, Level 2", false, 4],
        ["Monsoon Food Festival", "Food Events", 9, "Food Court, Level 3", true, 5],
        ["Story Time Sundays", "Kids", 4, "Paperline Studio, Level 2", false, 6],
        ["Grand Beauty Week", "Festivals", 12, "Beauty Hall, Level 1", false, 7],
      ].map(([title, category, offset, location, featured, index]) => ({
        slug: slug(String(title)),
        title: String(title),
        category: String(category),
        image: PLAY[Number(index) % PLAY.length],
        description: `${String(title)} is a sample event created for the NOVA GRAND MALL demo. It demonstrates the events platform, category filters, detail pages and registration actions.`,
        date: day(Number(offset)),
        time: "4:00 PM – 9:00 PM",
        location: String(location),
        registrationUrl: "/contact",
        priceInfo: Number(index) % 2 === 0 ? "Free entry" : "Demo ticket ₹199",
        featured: Boolean(featured),
        status: "published",
        sortOrder: Number(index),
      })),
    ),
  );

  await seedIfEmpty(attractions, () =>
    db.insert(attractions).values(
      [
        ["Nova Grand Cinema", "Cinema", "Level 5", true, PLAY[3]],
        ["Pulse Arena", "Gaming", "Level 5", true, PLAY[4]],
        ["Retro Lane Arcade", "Arcade", "Level 4", false, PLAY[2]],
        ["Tinker Town Play Zone", "Kids Zone", "Level 3", false, PLAY[7]],
        ["Sky Rope Adventure", "Family Activities", "Level 5", true, PLAY[8]],
        ["Mirror Maze Experience", "Experiences", "Level 4", false, PLAY[5]],
        ["Virtual Frontier VR", "Gaming", "Level 5", false, PLAY[1]],
        ["Nova Bowling Club", "Family Activities", "Level 4", false, PLAY[9]],
      ].map(([name, type, location, featured, image], index) => ({
        slug: slug(String(name)),
        name: String(name),
        type: String(type),
        location: String(location),
        featured: Boolean(featured),
        image: String(image),
        description: `${String(name)} is a demo attraction at NOVA GRAND MALL. This listing demonstrates the entertainment module, age guidance, timings and booking links.`,
        timings: "11:00 AM – 10:00 PM",
        ageInfo: index % 2 === 0 ? "All ages" : "Ages 8+ with adult supervision",
        bookingUrl: "/entertainment",
        priceInfo: "Demo pricing from ₹149",
        status: "published",
        sortOrder: index,
      })),
    ),
  );

  await seedIfEmpty(movies, () =>
    db.insert(movies).values(
      [
        ["Midnight Cartographer", "Thriller", "2h 18m", "Hindi", "U/A 16+", "Screen 1", ["11:15 AM", "2:45 PM", "6:30 PM", "9:45 PM"], true, 0],
        ["The Salt Kingdom", "Epic Drama", "2h 42m", "Telugu", "U/A 13+", "Screen 2", ["10:30 AM", "2:00 PM", "7:15 PM"], true, 1],
        ["Neon Monsoon", "Sci-Fi", "2h 06m", "English", "U/A 13+", "Screen 3", ["12:00 PM", "3:30 PM", "8:00 PM", "10:45 PM"], true, 2],
        ["Paper Boats", "Family", "1h 52m", "Hindi", "U", "Screen 4", ["10:00 AM", "1:15 PM", "4:30 PM"], true, 3],
        ["Kite Season", "Romance", "2h 11m", "Telugu", "U", "Screen 5", ["11:45 AM", "3:00 PM", "6:45 PM"], true, 4],
        ["Iron Lullaby", "Action", "2h 25m", "English", "A", "Screen 6", ["1:00 PM", "5:15 PM", "9:30 PM"], true, 5],
        ["The Glass Orchard", "Mystery", "2h 14m", "Hindi", "U/A 16+", "Screen 2", ["12:30 PM", "4:00 PM", "8:30 PM"], false, 6],
        ["Comet Kids", "Animation", "1h 38m", "English", "U", "Screen 4", ["10:15 AM", "12:45 PM", "3:15 PM"], false, 7],
      ].map(([title, genre, duration, language, rating, screen, showtimes, nowShowing, index]) => ({
        slug: slug(String(title)),
        title: String(title),
        genre: String(genre),
        duration: String(duration),
        language: String(language),
        rating: String(rating),
        screen: String(screen),
        showtimes: String(showtimes).split(", "),
        nowShowing: Boolean(nowShowing),
        poster: POSTERS[Number(index) % POSTERS.length],
        synopsis: `${String(title)} is a fictional demo feature presented at Nova Grand Cinema. This sample listing demonstrates the cinema module, showtimes, posters and CMS controls.`,
        bookingUrl: "/cinema",
        status: "published",
        sortOrder: Number(index),
      })),
    ),
  );

  await seedIfEmpty(services, () =>
    db.insert(services).values(
      [
        ["Information Desk", "ℹ️", "Guest Services", "Central Court, Level 1"],
        ["Customer Service", "🛎️", "Guest Services", "Level 1, near North Entrance"],
        ["Wheelchair Assistance", "♿", "Accessibility", "All entrances"],
        ["Baby Care Room", "🍼", "Family", "Level 1 and Level 3"],
        ["Lost & Found", "🔍", "Guest Services", "Level 1, Information Desk"],
        ["First Aid Room", "⛑️", "Health", "Level 1, next to Customer Service"],
        ["ATMs", "🏧", "Banking", "Level 1, 2 and 3"],
        ["Free Mall Wi-Fi", "📶", "Digital", "Mall-wide"],
        ["Charging Stations", "🔌", "Digital", "Food Court and Lounge, Level 3"],
        ["Accessible Restrooms", "🚻", "Accessibility", "Every level"],
        ["Parking Assistance", "🅿️", "Mobility", "Basement levels P1 – P3"],
        ["Valet Drop-off", "🚗", "Mobility", "Grand Portico, Level 0"],
      ].map(([name, icon, category, location], index) => ({
        name: String(name),
        icon: String(icon),
        category: String(category),
        location: String(location),
        description: `${String(name)} is available at NOVA GRAND MALL. Sample demo information — please confirm details at the Information Desk during your visit.`,
        hours: "During mall hours",
        contact: "+91 40 0000 0000 (demo)",
        status: "published",
        sortOrder: index,
      })),
    ),
  );

  await seedIfEmpty(faqs, () =>
    db.insert(faqs).values(
      [
        ["What are the mall timings?", "Mall Timings", "Demo timings are 10:00 AM to 10:00 PM, Monday to Sunday. Food court and cinema operate later. All timings in this demo are sample data."],
        ["Is parking available for visitors?", "Parking", "Yes. The demo parking module describes 2,500+ sample spaces across P1 to P3, including accessible bays and EV charging."],
        ["How many stores are in the mall?", "Stores", "The demo statistics list 150+ stores across six levels. These are fictional sample figures."],
        ["Where can I find dining options?", "Dining", "Dining spans Level 3 and Level 4, including a food court, cafés and fine dining. See the Dining screen for demo listings."],
        ["How do I book cinema tickets?", "Cinema", "Each movie card includes a demo booking action. No real payments are processed in this demonstration."],
        ["Are events free to attend?", "Events", "Many demo events are marked free entry. Where a ticket is shown, it is sample pricing only."],
        ["Is the mall accessible?", "Accessibility", "The demo lists wheelchair assistance, accessible restrooms, elevators on every level and step-free entrances."],
        ["How do I reach the mall?", "Directions", "Use the Location screen for the demo route map. Roads, routes and landmarks shown are fictional sample data."],
        ["I lost an item at the mall.", "Lost & Found", "Visit the Information Desk on Level 1 or use the Contact screen. In this demo, submissions are stored in the CMS inbox."],
        ["Can I bring my pet?", "Customer Service", "Only assistance animals are permitted, as described in the demo visitor policy."],
        ["Do you offer wheelchairs?", "Accessibility", "Yes — the demo listing includes complimentary wheelchairs at the Information Desk with a valid ID."],
        ["Is there a dress code?", "Customer Service", "Smart casual is suggested for fine dining venues in the demo directory."],
      ].map(([question, category, answer], index) => ({
        question: String(question),
        category: String(category),
        answer: String(answer),
        status: "published",
        sortOrder: index,
      })),
    ),
  );

  await seedIfEmpty(announcements, () =>
    db.insert(announcements).values([
      {
        title: "Demo Experience",
        message:
          "NOVA GRAND MALL is a fictional demo mall built to showcase a premium website and CMS. All stores, offers and events are sample data.",
        linkLabel: "About this demo",
        linkUrl: "/about",
        placement: "topbar",
        startDate: day(-30),
        endDate: day(365),
        status: "published",
        sortOrder: 0,
      },
      {
        title: "Grand Shopping Festival",
        message: "Twelve days of demo offers, live music and late-night shopping across all levels.",
        linkLabel: "See what's on",
        linkUrl: "/whats-on",
        placement: "homepage",
        startDate: day(-1),
        endDate: day(30),
        status: "published",
        sortOrder: 1,
      },
      {
        title: "New: Sakura Nine now open",
        message: "A demo Japanese dining room has opened on Level 4.",
        linkLabel: "View dining",
        linkUrl: "/dining",
        placement: "whats_on",
        startDate: day(-2),
        endDate: day(60),
        status: "published",
        sortOrder: 2,
      },
    ]),
  );

  await seedIfEmpty(jobs, () =>
    db.insert(jobs).values([
      {
        title: "Guest Experience Associate",
        department: "Guest Services",
        employmentType: "Full-time",
        description: "Be the first point of contact for visitors across the demo concourse. This is a sample role for the careers module.",
        requirements: "Sample requirements: 1–3 years hospitality experience, strong communication, fluency in English and Telugu or Hindi.",
        applyEmail: "careers@novagrandmall.example",
        status: "published",
        sortOrder: 0,
      },
      {
        title: "Retail Store Manager — Fashion",
        department: "Retail",
        employmentType: "Full-time",
        description: "Lead a demo fashion boutique team, own daily trade and deliver the store experience standard.",
        requirements: "Sample requirements: 4+ years retail management, P&L awareness, team leadership.",
        applyEmail: "careers@novagrandmall.example",
        status: "published",
        sortOrder: 1,
      },
      {
        title: "Sous Chef — Level 4 Dining",
        department: "Dining",
        employmentType: "Full-time",
        description: "Support the demo kitchen brigade across a 120-cover modern Indian dining room.",
        requirements: "Sample requirements: culinary diploma, 3 years in a production kitchen.",
        applyEmail: "careers@novagrandmall.example",
        status: "published",
        sortOrder: 2,
      },
      {
        title: "Digital Marketing Executive",
        department: "Marketing",
        employmentType: "Contract",
        description: "Run demo campaigns across social, CRM and on-site screens.",
        requirements: "Sample requirements: 2 years content and campaign experience.",
        applyEmail: "careers@novagrandmall.example",
        status: "published",
        sortOrder: 3,
      },
      {
        title: "Parking & Traffic Marshal",
        department: "Operations",
        employmentType: "Part-time",
        description: "Keep the demo basement levels moving smoothly during peak hours.",
        requirements: "Sample requirements: valid licence, weekend availability.",
        applyEmail: "careers@novagrandmall.example",
        status: "published",
        sortOrder: 4,
      },
    ]),
  );

  await seedIfEmpty(settings, () =>
    db.insert(settings).values([
      {
        key: "mall",
        value: {
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
          transport: [
            "Demo metro: Blue Line — Nova Avenue Station (sample), 400 m walk",
            "Demo bus: Routes 10, 22 and 118 serve the district interchange (sample)",
            "Demo ride-hailing: designated pick-up at Grand Portico, Level 0",
            "Demo airport: 38 km via the sample expressway corridor",
          ],
        },
      },
      {
        key: "homepage",
        value: {
          heroImage: ARCH.hero,
          heroVideo: "",
          eyebrow: "DEMO EXPERIENCE · HYDERABAD",
          heroTitle: "NOVA GRAND MALL",
          heroTagline: "SHOP. DINE. PLAY. EXPERIENCE.",
          heroDescription: "A destination designed for shopping, dining, entertainment and unforgettable experiences.",
          ctaPrimaryLabel: "EXPLORE THE MALL",
          ctaPrimaryHref: "/stores",
          ctaSecondaryLabel: "PLAN YOUR VISIT",
          ctaSecondaryHref: "/plan-your-visit",
          stats: [
            { value: "150", suffix: "+", label: "Stores" },
            { value: "30", suffix: "+", label: "Dining Experiences" },
            { value: "8", suffix: "", label: "Entertainment Zones" },
            { value: "6", suffix: "", label: "Cinema Screens" },
            { value: "2500", suffix: "+", label: "Parking Spaces" },
          ],
          featuredStoreSlugs: ["aurelia-couture", "kaya-beauty-atelier", "nordvik-home", "meera-jewels"],
          featuredOfferSlugs: ["festival-of-lights-edit", "run-club-bundle", "golden-hour-wardrobe"],
          featuredEventSlugs: ["nova-night-market", "indie-sound-sessions"],
          featuredDiningSlugs: ["cinnamon-trail", "ember-and-oak", "sugar-atlas"],
          campaignBanners: [
            { title: "The Grand Shopping Festival", subtitle: "12 days · 150+ stores · demo campaign", image: ARCH.festive, href: "/whats-on" },
            { title: "Level 4: The Dining Mile", subtitle: "Fine dining, terraces and demo tasting menus", image: FOOD[2], href: "/dining" },
            { title: "Nova Grand Cinema", subtitle: "6 screens · demo showtimes all week", image: PLAY[3], href: "/cinema" },
          ],
          editorialTitle: "An architecture of leisure",
          editorialBody:
            "Six levels of retail, dining and play arranged around a single luminous atrium. This demo homepage is fully controlled by the CMS — every headline, image and statistic can be edited from the admin dashboard without touching code.",
        },
      },
      {
        key: "parking",
        value: {
          headline: "Parking at NOVA GRAND MALL",
          intro: "Everything below is demo/sample data describing a fictional parking system. Replace it from the CMS at any time.",
          carLevels: "P1, P2, P3 (basement levels)",
          carSpaces: "1,800 sample car spaces",
          twoWheelerSpaces: "600 sample two-wheeler bays, Ground Level",
          accessibleSpaces: "42 accessible bays near every lift lobby",
          evCharging: "18 EV charging points (sample) — P1 and P2",
          entrances: [
            "Entrance A — Grand Portico, West approach (sample)",
            "Entrance B — Nova Avenue service road (sample)",
            "Entrance C — District link road, North (sample)",
          ],
          rates: [
            "First 2 hours — ₹0 (demo)",
            "Every additional hour — ₹40 (demo)",
            "Full day maximum — ₹250 (demo)",
            "Two-wheelers — ₹20 flat (demo)",
            "EV charging — ₹18 per unit (demo)",
          ],
          rules: [
            "Sample rule: keep your token with you and pay at any exit kiosk.",
            "Sample rule: accessible bays require a valid permit.",
            "Sample rule: overnight parking is not permitted.",
            "Sample rule: height clearance at all entrances is 2.1 m.",
          ],
          hours: "Open 24 × 7 (demo)",
        },
      },
      {
        key: "location",
        value: {
          headline: "Getting here",
          intro: "The route map and travel notes in this section are clearly labelled demo data. No real roads, coordinates or landmarks are represented.",
          mapCaption: "DEMO MAP — SAMPLE DATA. Not a representation of a real location.",
          landmarks: [
            "Demo landmark — Nova Avenue business district",
            "Demo landmark — Sample lake promenade, 1.2 km",
            "Demo landmark — Fictional metro station on the Blue Line",
          ],
        },
      },
      {
        key: "pages",
        value: {
          about: {
            title: "About the mall",
            eyebrow: "OUR STORY",
            heroImage: ARCH.atrium,
            intro: "NOVA GRAND MALL is a fictional retail destination created as a demonstration project. It exists to show what a premium mall website and CMS can feel like.",
            body:
              "## A fictional destination\nNOVA GRAND MALL is not a real shopping centre. Every store, restaurant, offer, movie and statistic in this experience is sample data created for demonstration.\n\n## Six levels of demo content\nThe demo organises retail on Levels 1 and 2, lifestyle on Level 3, dining on Level 4 and entertainment on Level 5. These allocations are invented for the purpose of the demonstration.\n\n## Built to be managed\nEverything you read is stored in a PostgreSQL database and edited through the CMS dashboard. Content teams can publish, unpublish and preview without touching a line of code.",
          },
          sustainability: {
            title: "Sustainability",
            eyebrow: "RESPONSIBLE BY DESIGN",
            heroImage: ARCH.green,
            intro: "A sample sustainability framework describing how a fictional mall of this scale would approach energy, water, waste and community.",
            body:
              "## Energy\nSample targets: 40% renewable supply, LED retrofit across all common areas, smart metering per tenancy.\n\n## Water\nSample targets: rainwater harvesting, 100% treated water for landscape irrigation, low-flow fixtures throughout.\n\n## Waste\nSample programme: three-stream segregation, organic composting for the food court, a tenant recycling charter.\n\n## Community\nSample programme: school visits, local artisan markets and an annual demo sustainability week.\n\nAll figures on this page are illustrative demo data.",
          },
          accessibility: {
            title: "Accessibility",
            eyebrow: "FOR EVERY VISITOR",
            heroImage: ARCH.skylight,
            intro: "We are committed to an experience that works for everyone — on the website and across the fictional mall.",
            body:
              "## In the building\nStep-free entrances, lifts on every level, accessible restrooms, complimentary wheelchairs and assistance on request. (Demo information.)\n\n## On this website\nSemantic HTML, keyboard navigation, visible focus states, alt text, reduced-motion support and high contrast palettes.\n\n## Tell us\nIf something is difficult to use, send us a note from the Contact screen. This is a demo and no live support desk is connected.",
          },
          privacy: {
            title: "Privacy Policy",
            eyebrow: "LEGAL · DEMO",
            heroImage: ARCH.dome,
            intro: "This is a sample privacy policy for a demonstration website. It is not legal advice and does not describe a real organisation.",
            body:
              "## What we store\nContact and enquiry forms in this demo write directly to the project database so the CMS inbox can display them. Nothing is sold or shared.\n\n## Cookies\nThe demo stores a single secure, http-only session cookie for administrator sign-in. No advertising or tracking cookies are used.\n\n## Your choices\nYou can request removal of demo enquiry data from the Contact screen.",
          },
          terms: {
            title: "Terms of Use",
            eyebrow: "LEGAL · DEMO",
            heroImage: ARCH.frankfurt,
            intro: "Sample terms governing use of this demonstration website and its fictional content.",
            body:
              "## Demonstration only\nNOVA GRAND MALL is fictional. Nothing here is an offer, invitation or representation of a real business.\n\n## Content\nText, imagery and data are provided as-is for evaluation. Sample imagery is licensed stock photography.\n\n## Liability\nNo warranties are provided. Use of this demo is at your own discretion.",
          },
          cookies: {
            title: "Cookie Policy",
            eyebrow: "LEGAL · DEMO",
            heroImage: ARCH.crowd,
            intro: "A sample explanation of the very small number of cookies this demo uses.",
            body:
              "## Strictly necessary\nOne http-only session cookie keeps administrators signed in. It contains no personal marketing data.\n\n## Preference\nInterface preferences are held in a cookie you control from the settings below. Nothing important depends on localStorage.\n\n## Analytics and advertising\nNone are used in this demo.",
          },
          leasing: {
            title: "Leasing & partnerships",
            eyebrow: "BUSINESS WITH NOVA",
            heroImage: ARCH.luxury,
            intro: "Sample commercial information for brands considering space, advertising or partnerships at the fictional NOVA GRAND MALL.",
            body:
              "## Retail leasing\nSample portfolio: 150+ units from 350 sq ft kiosks to 28,000 sq ft anchors across six levels. Sample footfall: 1.1 M monthly.\n\n## Advertising\nSample inventory: atrium domination, digital sails, elevator panels, cinema pre-roll, parking branding and experiential pop-ups.\n\n## Brand partnerships\nSample collaborations: seasonal takeovers, loyalty integrations, co-branded festivals and product launches.\n\n## Event partnerships\nSample venues: central atrium, terrace, food court stage and the demo cinema foyer.\n\nAll figures are illustrative demo data — submit the enquiry form to see it land in the CMS inbox.",
          },
          careers: {
            title: "Careers",
            eyebrow: "JOIN THE DEMO TEAM",
            heroImage: ARCH.crowd,
            intro: "Sample opportunities at a fictional mall. Positions below demonstrate the careers module and its CMS controls.",
            body:
              "## How hiring works here\nSubmit an application through the form on this page. In this demo, applications are stored in the CMS inbox so an administrator can review them.\n\n## What we look for\nSample values: warmth, ownership, precision and a genuine interest in guest experience.",
          },
        },
      },
    ]),
  );

  if (seedFailures === 0) {
    await db
      .insert(settings)
      .values({ key: "seed_state", value: { done: true, at: new Date().toISOString() } })
      .onConflictDoNothing();
  }
}
