import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------------- Buttons ---------------- */

type ButtonVariant = "primary" | "ghost" | "outline" | "dark" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-ink hover:bg-gold-soft border border-gold hover:border-gold-soft shadow-[0_10px_30px_-12px_rgba(200,169,106,0.6)]",
  outline: "border border-bone/30 text-bone hover:border-gold hover:text-gold bg-transparent",
  ghost: "text-bone/70 hover:text-gold bg-transparent border border-transparent",
  dark: "bg-ink-3 text-bone border border-line hover:border-gold/60",
  danger: "border border-clay/60 text-clay hover:bg-clay hover:text-bone",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "text-[11px] px-3.5 py-2 tracking-[0.18em]",
  md: "text-[12px] px-5 py-3 tracking-[0.2em]",
  lg: "text-[13px] px-7 py-4 tracking-[0.22em]",
};

const baseButton =
  "inline-flex items-center justify-center gap-2 uppercase font-medium transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-40 disabled:pointer-events-none rounded-[3px]";

export function Btn({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  external,
  ...rest
}: {
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  external?: boolean;
} & Omit<ComponentProps<"button">, "className">) {
  const classes = cn(baseButton, variantClass[variant], sizeClass[size], className);
  if (href) {
    if (external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return (
        <a
          href={href}
          className={classes}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}

/* ---------------- Badges & chips ---------------- */

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "gold" | "live" | "muted" | "new";
  className?: string;
}) {
  const tones: Record<string, string> = {
    default: "border-line text-bone/70 bg-ink-2/80",
    gold: "border-gold/50 text-gold bg-gold/10",
    live: "border-jade/50 text-jade bg-jade/10",
    muted: "border-line text-mute bg-transparent",
    new: "border-clay/60 text-clay bg-clay/10",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] rounded-[2px]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ open }: { open: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
      <span
        className={cn("size-1.5 rounded-full", open ? "bg-jade" : "bg-clay")}
        aria-hidden
      />
      <span className={open ? "text-jade" : "text-clay"}>{open ? "Open now" : "Closed"}</span>
    </span>
  );
}

/* ---------------- Section framing ---------------- */

export function SectionHead({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
        <h2 className="text-3xl leading-[1.05] sm:text-4xl md:text-5xl">{title}</h2>
        {description ? (
          <p className="mt-5 text-sm leading-relaxed text-bone/60 md:text-base">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line", className)} aria-hidden />;
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <header className="relative isolate overflow-hidden border-b border-line pt-32 pb-16 md:pt-44 md:pb-24">
      {image ? (
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="size-full object-cover opacity-30" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/60" />
        </div>
      ) : null}
      <div className="shell">
        {eyebrow ? <p className="eyebrow animate-rise">{eyebrow}</p> : null}
        <h1 className="mt-4 max-w-4xl text-4xl leading-[0.98] animate-rise sm:text-5xl md:text-6xl lg:text-7xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-bone/65 animate-rise md:text-base">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </header>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel flex flex-col items-center gap-4 px-6 py-16 text-center rounded-md">
      <span className="font-display text-4xl text-gold/60" aria-hidden>
        ✦
      </span>
      <h3 className="text-xl">{title}</h3>
      {description ? <p className="max-w-md text-sm text-bone/55">{description}</p> : null}
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-sm", className)} />;
}

/* ---------------- Long-form CMS text ---------------- */

export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = (text ?? "").split(/\n{2,}/).filter(Boolean);
  return (
    <div className={cn("space-y-6", className)}>
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={index} className="pt-4 text-2xl md:text-3xl">
              {trimmed.replace(/^##\s*/, "")}
            </h3>
          );
        }
        const lines = trimmed.split("\n").filter(Boolean);
        if (lines.every((line) => line.trim().startsWith("- "))) {
          return (
            <ul key={index} className="space-y-2.5">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex} className="flex gap-3 text-sm leading-relaxed text-bone/65">
                  <span className="mt-2 size-1 shrink-0 bg-gold" aria-hidden />
                  <span>{line.replace(/^-\s*/, "")}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="text-sm leading-relaxed text-bone/65 md:text-base">
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {line}
                {lineIndex < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-3 last:border-0">
      <span className="text-[10px] uppercase tracking-[0.22em] text-mute">{label}</span>
      <span className="text-right text-sm text-bone/85">{value || "—"}</span>
    </div>
  );
}
