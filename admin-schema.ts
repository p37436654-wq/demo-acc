export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "select"
  | "date"
  | "image"
  | "lines";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  help?: string;
  required?: boolean;
  full?: boolean;
};

export type EntityConfig = {
  key: string;
  label: string;
  singular: string;
  blurb: string;
  titleField: string;
  subtitleFields: string[];
  imageField?: string;
  statusField: string;
  fields: FieldDef[];
  categories?: { field: string; label: string; options: string[] };
};

const STATUS: FieldDef = {
  name: "status",
  label: "Status",
  type: "select",
  options: ["draft", "published"],
};

const COMMON_TAIL: FieldDef[] = [
  { name: "featured", label: "Featured", type: "checkbox" },
  { name: "sortOrder", label: "Sort order", type: "number" },
  STATUS,
];

export const ENTITY_CONFIGS: Record<string, EntityConfig> = {
  stores: {
    key: "stores",
    label: "Stores",
    singular: "Store",
    blurb: "Retail directory, floors, units and opening hours.",
    titleField: "name",
    subtitleFields: ["category", "floor", "unit"],
    imageField: "coverImage",
    statusField: "status",
    categories: {
      field: "category",
      label: "Category",
      options: ["Fashion", "Beauty", "Electronics", "Jewellery", "Footwear", "Sports", "Kids", "Home", "Lifestyle", "Luxury", "Accessories", "Books", "Gifts", "Services"],
    },
    fields: [
      { name: "name", label: "Store name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "text", help: "Leave blank to auto-generate." },
      { name: "category", label: "Category", type: "select", options: ["Fashion", "Beauty", "Electronics", "Jewellery", "Footwear", "Sports", "Kids", "Home", "Lifestyle", "Luxury", "Accessories", "Books", "Gifts", "Services"] },
      { name: "storeType", label: "Store type", type: "select", options: ["Retail", "Anchor", "Luxury", "Kiosk", "Flagship"] },
      { name: "floor", label: "Floor", type: "text", placeholder: "Level 1" },
      { name: "unit", label: "Unit", type: "text", placeholder: "L1-01" },
      { name: "tagline", label: "Tagline", type: "text", full: true },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "coverImage", label: "Cover image", type: "image", full: true },
      { name: "logo", label: "Logo", type: "image", full: true },
      { name: "gallery", label: "Gallery", type: "lines", full: true, help: "One image URL per line." },
      { name: "openingHours", label: "Opening hours", type: "text", placeholder: "10:00 AM – 10:00 PM" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "website", label: "Website", type: "text" },
      { name: "instagram", label: "Social handle", type: "text" },
      { name: "isNew", label: "Mark as new store", type: "checkbox" },
      ...COMMON_TAIL,
    ],
  },
  offers: {
    key: "offers",
    label: "Offers",
    singular: "Offer",
    blurb: "Promotions with start dates, expiry and terms.",
    titleField: "title",
    subtitleFields: ["storeName", "category"],
    imageField: "image",
    statusField: "status",
    categories: {
      field: "category",
      label: "Category",
      options: ["Fashion", "Dining", "Beauty", "Electronics", "Seasonal", "Limited Time", "Trending"],
    },
    fields: [
      { name: "title", label: "Offer title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "text", help: "Leave blank to auto-generate." },
      { name: "storeName", label: "Store name", type: "text" },
      { name: "storeSlug", label: "Store slug", type: "text", help: "Links the offer to a store page." },
      { name: "category", label: "Category", type: "select", options: ["Fashion", "Dining", "Beauty", "Electronics", "Seasonal", "Limited Time", "Trending"] },
      { name: "image", label: "Offer image", type: "image", full: true },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "terms", label: "Terms & conditions", type: "textarea", full: true },
      { name: "startDate", label: "Start date", type: "date" },
      { name: "expiryDate", label: "Expiry date", type: "date", help: "Offers expire automatically after this date." },
      { name: "promoCode", label: "Promo code", type: "text" },
      ...COMMON_TAIL,
    ],
  },
  events: {
    key: "events",
    label: "Events",
    singular: "Event",
    blurb: "Festivals, workshops, kids activities and live shows.",
    titleField: "title",
    subtitleFields: ["category", "date", "location"],
    imageField: "image",
    statusField: "status",
    categories: {
      field: "category",
      label: "Category",
      options: ["Today", "Weekend", "Kids", "Workshops", "Festivals", "Shopping Events", "Food Events", "Special Events"],
    },
    fields: [
      { name: "title", label: "Event name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "text", help: "Leave blank to auto-generate." },
      { name: "category", label: "Category", type: "select", options: ["Today", "Weekend", "Kids", "Workshops", "Festivals", "Shopping Events", "Food Events", "Special Events"] },
      { name: "image", label: "Event image", type: "image", full: true },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "date", label: "Date", type: "date" },
      { name: "endDate", label: "End date", type: "date" },
      { name: "time", label: "Time", type: "text", placeholder: "4:00 PM – 9:00 PM" },
      { name: "location", label: "Location", type: "text", placeholder: "Atrium, Level 1" },
      { name: "registrationUrl", label: "Registration URL", type: "text" },
      { name: "priceInfo", label: "Price information", type: "text" },
      ...COMMON_TAIL,
    ],
  },
  dining: {
    key: "dining",
    label: "Dining",
    singular: "Restaurant",
    blurb: "Restaurants, cafés, food court outlets, bakeries and bars.",
    titleField: "name",
    subtitleFields: ["cuisine", "type", "floor"],
    imageField: "coverImage",
    statusField: "status",
    categories: {
      field: "type",
      label: "Type",
      options: ["Restaurants", "Cafés", "Fast Food", "Food Court", "Desserts", "Bakeries", "Beverages", "Fine Dining"],
    },
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "text", help: "Leave blank to auto-generate." },
      { name: "type", label: "Type", type: "select", options: ["Restaurants", "Cafés", "Fast Food", "Food Court", "Desserts", "Bakeries", "Beverages", "Fine Dining"] },
      { name: "cuisine", label: "Cuisine", type: "text" },
      { name: "priceLevel", label: "Price indicator", type: "select", options: ["₹", "₹₹", "₹₹₹", "₹₹₹₹"] },
      { name: "floor", label: "Floor", type: "text" },
      { name: "unit", label: "Unit", type: "text" },
      { name: "tagline", label: "Tagline", type: "text", full: true },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "coverImage", label: "Cover image", type: "image", full: true },
      { name: "gallery", label: "Gallery", type: "lines", full: true, help: "One image URL per line." },
      { name: "menuHighlights", label: "Menu highlights", type: "lines", full: true, help: "One dish per line." },
      { name: "openingHours", label: "Timings", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "website", label: "Website", type: "text" },
      ...COMMON_TAIL,
    ],
  },
  entertainment: {
    key: "entertainment",
    label: "Entertainment",
    singular: "Attraction",
    blurb: "Cinema, gaming, arcade, kids zones and experiences.",
    titleField: "name",
    subtitleFields: ["type", "location"],
    imageField: "image",
    statusField: "status",
    categories: {
      field: "type",
      label: "Type",
      options: ["Cinema", "Gaming", "Arcade", "Kids Zone", "Family Activities", "Experiences"],
    },
    fields: [
      { name: "name", label: "Attraction name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "text", help: "Leave blank to auto-generate." },
      { name: "type", label: "Type", type: "select", options: ["Cinema", "Gaming", "Arcade", "Kids Zone", "Family Activities", "Experiences"] },
      { name: "image", label: "Image", type: "image", full: true },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "location", label: "Location", type: "text" },
      { name: "timings", label: "Timings", type: "text" },
      { name: "ageInfo", label: "Age information", type: "text" },
      { name: "priceInfo", label: "Price information", type: "text" },
      { name: "bookingUrl", label: "Booking link", type: "text" },
      ...COMMON_TAIL,
    ],
  },
  cinema: {
    key: "cinema",
    label: "Cinema",
    singular: "Movie",
    blurb: "Now showing and coming soon with showtimes and posters.",
    titleField: "title",
    subtitleFields: ["genre", "language", "screen"],
    imageField: "poster",
    statusField: "status",
    categories: {
      field: "language",
      label: "Language",
      options: ["Hindi", "Telugu", "English", "Tamil", "Malayalam", "Kannada"],
    },
    fields: [
      { name: "title", label: "Movie title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "text", help: "Leave blank to auto-generate." },
      { name: "genre", label: "Genre", type: "text" },
      { name: "language", label: "Language", type: "text" },
      { name: "duration", label: "Duration", type: "text", placeholder: "2h 10m" },
      { name: "rating", label: "Rating", type: "text", placeholder: "U/A 13+" },
      { name: "screen", label: "Screen", type: "text", placeholder: "Screen 1" },
      { name: "poster", label: "Poster", type: "image", full: true },
      { name: "synopsis", label: "Synopsis", type: "textarea", full: true },
      { name: "showtimes", label: "Showtimes", type: "lines", full: true, help: "One showtime per line, e.g. 11:15 AM" },
      { name: "bookingUrl", label: "Booking URL", type: "text" },
      { name: "nowShowing", label: "Now showing (uncheck for coming soon)", type: "checkbox" },
      { name: "sortOrder", label: "Sort order", type: "number" },
      STATUS,
    ],
  },
  services: {
    key: "services",
    label: "Services",
    singular: "Service",
    blurb: "Guest services, accessibility and visitor facilities.",
    titleField: "name",
    subtitleFields: ["category", "location"],
    statusField: "status",
    categories: {
      field: "category",
      label: "Category",
      options: ["Guest Services", "Accessibility", "Family", "Health", "Banking", "Digital", "Mobility"],
    },
    fields: [
      { name: "name", label: "Service name", type: "text", required: true },
      { name: "icon", label: "Icon (emoji)", type: "text" },
      { name: "category", label: "Category", type: "select", options: ["Guest Services", "Accessibility", "Family", "Health", "Banking", "Digital", "Mobility"] },
      { name: "location", label: "Location", type: "text" },
      { name: "hours", label: "Hours", type: "text" },
      { name: "contact", label: "Contact", type: "text" },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "sortOrder", label: "Sort order", type: "number" },
      STATUS,
    ],
  },
  faqs: {
    key: "faqs",
    label: "FAQ",
    singular: "FAQ",
    blurb: "Searchable questions grouped by category.",
    titleField: "question",
    subtitleFields: ["category"],
    statusField: "status",
    categories: {
      field: "category",
      label: "Category",
      options: ["Mall Timings", "Parking", "Stores", "Dining", "Cinema", "Events", "Accessibility", "Directions", "Lost & Found", "Customer Service"],
    },
    fields: [
      { name: "question", label: "Question", type: "text", required: true, full: true },
      { name: "answer", label: "Answer", type: "textarea", full: true, required: true },
      { name: "category", label: "Category", type: "select", options: ["Mall Timings", "Parking", "Stores", "Dining", "Cinema", "Events", "Accessibility", "Directions", "Lost & Found", "Customer Service"] },
      { name: "sortOrder", label: "Sort order", type: "number", help: "Lower numbers appear first. Use this to reorder." },
      STATUS,
    ],
  },
  announcements: {
    key: "announcements",
    label: "Announcements",
    singular: "Announcement",
    blurb: "Top notification bar, homepage banner and What's On strip.",
    titleField: "title",
    subtitleFields: ["placement", "endDate"],
    statusField: "status",
    categories: {
      field: "placement",
      label: "Placement",
      options: ["topbar", "homepage", "whats_on"],
    },
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "placement", label: "Placement", type: "select", options: ["topbar", "homepage", "whats_on"] },
      { name: "message", label: "Message", type: "textarea", full: true },
      { name: "linkLabel", label: "Link label", type: "text" },
      { name: "linkUrl", label: "Link URL", type: "text" },
      { name: "startDate", label: "Start date", type: "date" },
      { name: "endDate", label: "End date", type: "date" },
      { name: "sortOrder", label: "Sort order", type: "number" },
      STATUS,
    ],
  },
  jobs: {
    key: "jobs",
    label: "Careers",
    singular: "Role",
    blurb: "Demo job listings for the Careers screen.",
    titleField: "title",
    subtitleFields: ["department", "employmentType"],
    statusField: "status",
    categories: {
      field: "department",
      label: "Department",
      options: ["Guest Services", "Retail", "Dining", "Marketing", "Operations", "Entertainment", "Security", "Engineering"],
    },
    fields: [
      { name: "title", label: "Job title", type: "text", required: true },
      { name: "department", label: "Department", type: "select", options: ["Guest Services", "Retail", "Dining", "Marketing", "Operations", "Entertainment", "Security", "Engineering"] },
      { name: "employmentType", label: "Employment type", type: "select", options: ["Full-time", "Part-time", "Contract", "Internship"] },
      { name: "location", label: "Location", type: "text" },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "requirements", label: "Requirements", type: "textarea", full: true },
      { name: "applyEmail", label: "Apply email", type: "text" },
      { name: "sortOrder", label: "Sort order", type: "number" },
      STATUS,
    ],
  },
};

export const MANAGED_ENTITIES = Object.keys(ENTITY_CONFIGS);

export function emptyRecord(config: EntityConfig): Record<string, unknown> {
  const record: Record<string, unknown> = { status: "draft" };
  for (const field of config.fields) {
    if (field.name === "status") continue;
    if (field.type === "checkbox") record[field.name] = false;
    else if (field.type === "number") record[field.name] = 0;
    else if (field.type === "lines") record[field.name] = [];
    else record[field.name] = "";
  }
  return record;
}
