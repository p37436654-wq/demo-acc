import Link from "next/link";
import { Badge, StatusDot } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { cn, formatDate, isOpenNow } from "@/lib/utils";

export function CardImage({
  src,
  alt,
  className,
  ratio = "aspect-[4/3]",
  priority,
}: {
  src?: string;
  alt: string;
  className?: string;
  ratio?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-ink-3", ratio, className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="img-zoom size-full object-cover"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      ) : (
        <div className="grid size-full place-items-center text-gold/40" aria-hidden>
          ✦
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-80" />
    </div>
  );
}

export function StoreCard({
  store,
  index = 0,
}: {
  store: {
    slug: string;
    name: string;
    category: string;
    floor: string;
    unit: string;
    coverImage?: string;
    openingHours: string;
    tagline?: string;
    featured?: boolean;
    isNew?: boolean;
  };
  index?: number;
}) {
  const open = isOpenNow(store.openingHours);
  return (
    <Reveal as="article" delay={(index % 3) * 70} className="group h-full">
      <Link
        href={`/stores/${store.slug}`}
        className="flex h-full flex-col border border-line bg-ink-2/50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-gold/40 hover:bg-ink-2 rounded-[3px]"
      >
        <div className="relative">
          <CardImage src={store.coverImage} alt={store.name} />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {store.featured ? <Badge tone="gold">Featured</Badge> : null}
            {store.isNew ? <Badge tone="new">New</Badge> : null}
          </div>
          <div className="absolute bottom-3 left-3">
            <Badge tone="muted" className="bg-ink/70">
              {store.floor} · {store.unit}
            </Badge>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <p className="eyebrow">{store.category}</p>
            <h3 className="mt-2 text-xl leading-tight transition-colors group-hover:text-gold">{store.name}</h3>
          </div>
          {store.tagline ? <p className="text-xs leading-relaxed text-bone/50">{store.tagline}</p> : null}
          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
            <StatusDot open={open} />
            <span className="text-[10px] uppercase tracking-[0.2em] text-mute">{store.openingHours}</span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export function DiningCard({
  item,
  index = 0,
}: {
  item: {
    slug: string;
    name: string;
    cuisine: string;
    type: string;
    floor: string;
    coverImage?: string;
    openingHours: string;
    priceLevel: string;
    tagline?: string;
    featured?: boolean;
  };
  index?: number;
}) {
  return (
    <Reveal as="article" delay={(index % 3) * 70} className="group h-full">
      <Link
        href={`/dining/${item.slug}`}
        className="flex h-full flex-col border border-line bg-ink-2/50 transition-all duration-700 hover:border-gold/40 hover:bg-ink-2 rounded-[3px]"
      >
        <CardImage src={item.coverImage} alt={item.name} ratio="aspect-[5/4]" />
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow">{item.type}</p>
            <span className="text-xs text-gold">{item.priceLevel}</span>
          </div>
          <h3 className="text-xl leading-tight transition-colors group-hover:text-gold">{item.name}</h3>
          <p className="text-xs text-bone/55">{item.cuisine}</p>
          {item.tagline ? <p className="text-xs leading-relaxed text-bone/45">{item.tagline}</p> : null}
          <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-[10px] uppercase tracking-[0.2em] text-mute">
            <span>{item.floor}</span>
            <span>{item.openingHours}</span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export function OfferCard({
  offer,
  index = 0,
}: {
  offer: {
    slug: string;
    title: string;
    storeName: string;
    category: string;
    image?: string;
    description: string;
    expiryDate: string;
    startDate: string;
    featured?: boolean;
  };
  index?: number;
}) {
  return (
    <Reveal as="article" delay={(index % 3) * 70} className="group h-full">
      <Link
        href={`/offers/${offer.slug}`}
        className="flex h-full flex-col border border-line bg-ink-2/50 transition-all duration-700 hover:border-gold/40 hover:bg-ink-2 rounded-[3px]"
      >
        <div className="relative">
          <CardImage src={offer.image} alt={offer.title} ratio="aspect-[16/10]" />
          <div className="absolute left-3 top-3">
            <Badge tone={offer.featured ? "gold" : "muted"} className={offer.featured ? "" : "bg-ink/70"}>
              {offer.category}
            </Badge>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="text-xl leading-tight transition-colors group-hover:text-gold">{offer.title}</h3>
          <p className="eyebrow">{offer.storeName}</p>
          <p className="text-xs leading-relaxed text-bone/55">{offer.description}</p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-[10px] uppercase tracking-[0.18em] text-mute">
            <span>Ends {formatDate(offer.expiryDate)}</span>
            <span className="text-gold">View offer →</span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export function EventCard({
  event,
  index = 0,
}: {
  event: {
    slug: string;
    title: string;
    category: string;
    image?: string;
    date: string;
    time: string;
    location: string;
    priceInfo?: string;
    featured?: boolean;
  };
  index?: number;
}) {
  const date = new Date(event.date);
  const valid = !Number.isNaN(date.getTime());
  return (
    <Reveal as="article" delay={(index % 3) * 70} className="group h-full">
      <Link
        href={`/events/${event.slug}`}
        className="flex h-full gap-4 border border-line bg-ink-2/50 p-4 transition-all duration-700 hover:border-gold/40 hover:bg-ink-2 rounded-[3px]"
      >
        <div className="flex w-16 shrink-0 flex-col items-center justify-center border border-line bg-ink py-3">
          <span className="text-[9px] uppercase tracking-[0.2em] text-mute">
            {valid ? date.toLocaleDateString("en-IN", { month: "short" }) : "—"}
          </span>
          <span className="font-display text-2xl text-gold">{valid ? date.getDate() : "·"}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="eyebrow truncate">{event.category}</p>
            {event.featured ? <Badge tone="gold">Featured</Badge> : null}
          </div>
          <h3 className="mt-2 truncate text-lg leading-tight transition-colors group-hover:text-gold">
            {event.title}
          </h3>
          <p className="mt-1 text-xs text-bone/50">
            {event.time} · {event.location}
          </p>
          {event.priceInfo ? <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gold/80">{event.priceInfo}</p> : null}
        </div>
      </Link>
    </Reveal>
  );
}

export function MovieCard({
  movie,
  index = 0,
}: {
  movie: {
    slug: string;
    title: string;
    poster?: string;
    genre: string;
    duration: string;
    language: string;
    rating: string;
    screen: string;
    showtimes: string[];
  };
  index?: number;
}) {
  return (
    <Reveal as="article" delay={(index % 4) * 60} className="group h-full">
      <div className="flex h-full flex-col border border-line bg-ink-2/50 transition-all duration-700 hover:border-gold/40 rounded-[3px]">
        <CardImage src={movie.poster} alt={`${movie.title} poster`} ratio="aspect-[2/3]" />
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="text-lg leading-tight transition-colors group-hover:text-gold">{movie.title}</h3>
          <p className="text-[10px] uppercase tracking-[0.18em] text-mute">
            {movie.genre} · {movie.language} · {movie.duration}
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-gold/80">
            {movie.rating} · {movie.screen}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {movie.showtimes.slice(0, 4).map((time) => (
              <span key={time} className="border border-line px-2 py-1 text-[10px] text-bone/70">
                {time}
              </span>
            ))}
          </div>
          <Link
            href={`/cinema#${movie.slug}`}
            className="mt-auto pt-4 text-[10px] uppercase tracking-[0.2em] text-gold hover:text-gold-soft"
          >
            Book tickets →
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

export function AttractionCard({
  item,
  index = 0,
}: {
  item: {
    slug: string;
    name: string;
    type: string;
    image?: string;
    description: string;
    location: string;
    timings: string;
    ageInfo: string;
    bookingUrl?: string;
  };
  index?: number;
}) {
  return (
    <Reveal as="article" delay={(index % 3) * 70} className="group h-full">
      <div className="flex h-full flex-col border border-line bg-ink-2/50 transition-all duration-700 hover:border-gold/40 rounded-[3px]">
        <CardImage src={item.image} alt={item.name} ratio="aspect-[16/10]" />
        <div className="flex flex-1 flex-col gap-3 p-5">
          <p className="eyebrow">{item.type}</p>
          <h3 className="text-xl leading-tight transition-colors group-hover:text-gold">{item.name}</h3>
          <p className="text-xs leading-relaxed text-bone/55">{item.description}</p>
          <dl className="mt-auto space-y-1.5 pt-3 text-[10px] uppercase tracking-[0.18em] text-mute">
            <div className="flex justify-between gap-3">
              <dt>Where</dt>
              <dd className="text-bone/70">{item.location}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Timings</dt>
              <dd className="text-bone/70">{item.timings}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Ages</dt>
              <dd className="text-bone/70">{item.ageInfo}</dd>
            </div>
          </dl>
          {item.bookingUrl ? (
            <Link
              href={item.bookingUrl}
              className="pt-3 text-[10px] uppercase tracking-[0.2em] text-gold hover:text-gold-soft"
            >
              Booking details →
            </Link>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}

export function ServiceCard({
  service,
  index = 0,
}: {
  service: { name: string; icon: string; description: string; location: string; hours: string; category: string };
  index?: number;
}) {
  return (
    <Reveal delay={(index % 4) * 50} className="group h-full">
      <div className="flex h-full flex-col gap-4 border border-line bg-ink-2/40 p-6 transition-all duration-700 hover:border-gold/40 hover:bg-ink-2 rounded-[3px]">
        <span className="text-2xl" aria-hidden>
          {service.icon || "✦"}
        </span>
        <div>
          <p className="eyebrow">{service.category}</p>
          <h3 className="mt-2 text-lg leading-tight transition-colors group-hover:text-gold">{service.name}</h3>
        </div>
        <p className="text-xs leading-relaxed text-bone/55">{service.description}</p>
        <p className="mt-auto text-[10px] uppercase tracking-[0.18em] text-mute">
          {service.location} · {service.hours}
        </p>
      </div>
    </Reveal>
  );
}
