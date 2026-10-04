import Link from "next/link";
import { getMallSettings } from "@/lib/queries";
import { Wordmark } from "@/components/site-chrome";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Discover",
    links: [
      { href: "/stores", label: "Stores" },
      { href: "/dining", label: "Dining" },
      { href: "/offers", label: "Offers" },
      { href: "/events", label: "Events" },
      { href: "/cinema", label: "Cinema" },
      { href: "/entertainment", label: "Entertainment" },
      { href: "/whats-on", label: "What's On" },
    ],
  },
  {
    title: "Visit",
    links: [
      { href: "/plan-your-visit", label: "Plan Your Visit" },
      { href: "/map", label: "Mall Map" },
      { href: "/location", label: "Location" },
      { href: "/parking", label: "Parking" },
      { href: "/services", label: "Services" },
      { href: "/search", label: "Search" },
    ],
  },
  {
    title: "Mall",
    links: [
      { href: "/about", label: "About" },
      { href: "/sustainability", label: "Sustainability" },
      { href: "/careers", label: "Careers" },
      { href: "/leasing", label: "Leasing" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/admin", label: "Admin CMS" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Use" },
      { href: "/cookies", label: "Cookie Policy" },
      { href: "/cookies#settings", label: "Cookie Settings" },
      { href: "/accessibility", label: "Accessibility" },
    ],
  },
];

export default async function Footer() {
  const mall = await getMallSettings();
  return (
    <footer className="relative border-t border-line bg-ink-2/40">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Wordmark />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-bone/55">
              {mall.tagline} A fictional demo destination in {mall.city}, {mall.region}. Every listing,
              statistic and offer in this experience is sample data.
            </p>
            <div className="mt-8 space-y-1 text-sm text-bone/70">
              <p>{mall.addressLine}</p>
              <p>{mall.region}</p>
              <p className="pt-3 text-bone/50">{mall.phone}</p>
              <p className="text-bone/50">{mall.email}</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { label: "Instagram", href: mall.instagram },
                { label: "Facebook", href: mall.facebook },
                { label: "YouTube", href: mall.youtube },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href || "https://example.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-line px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-bone/60 transition-colors hover:border-gold/50 hover:text-gold rounded-[2px]"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="eyebrow mb-5">{column.title}</p>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link href={link.href} className="text-xs text-bone/60 transition-colors hover:text-gold">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-6 border-t border-line pt-8 md:grid-cols-3">
          <div>
            <p className="eyebrow mb-2">Opening hours</p>
            <p className="text-sm text-bone/70">{mall.hoursWeekdays} — Mon to Fri</p>
            <p className="text-sm text-bone/70">{mall.hoursWeekend} — Sat &amp; Sun</p>
          </div>
          <div>
            <p className="eyebrow mb-2">Food &amp; cinema</p>
            <p className="text-sm text-bone/70">Food court {mall.hoursFoodCourt}</p>
            <p className="text-sm text-bone/70">Cinema {mall.hoursCinema}</p>
          </div>
          <div className="md:text-right">
            <p className="eyebrow mb-2">Demo experience</p>
            <p className="text-xs leading-relaxed text-bone/45">
              NOVA GRAND MALL is not a real shopping mall. Sample content, sample imagery, no real
              bookings or payments.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 text-[10px] uppercase tracking-[0.2em] text-mute sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NOVA GRAND MALL — Demo Experience</p>
          <p>Built with Next.js, PostgreSQL and a live CMS</p>
        </div>
      </div>
    </footer>
  );
}
