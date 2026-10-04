"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/* ---------------- Scroll reveal ---------------- */

export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header";
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={cn("reveal", className)}
      data-shown={shown}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ---------------- Animated counter ---------------- */

export function Counter({ value, suffix = "", className }: { value: string; suffix?: string; className?: string }) {
  const numeric = Number(String(value).replace(/[^0-9.]/g, ""));
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const valid = Number.isFinite(numeric) && numeric > 0;

  useEffect(() => {
    if (!valid) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setDisplay(numeric);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      observer.disconnect();
      const duration = 1400;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(numeric * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [numeric, valid]);

  return (
    <span ref={ref} className={className}>
      {valid ? display.toLocaleString("en-IN") : value}
      {suffix}
    </span>
  );
}

/* ---------------- Magnetic CTA ---------------- */

export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  return (
    <span
      ref={ref}
      className={cn("inline-block", className)}
      onMouseMove={(event) => {
        const node = ref.current;
        if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const rect = node.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.18;
        node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }}
      onMouseLeave={() => {
        const node = ref.current;
        if (node) node.style.transform = "translate3d(0,0,0)";
      }}
    >
      {children}
    </span>
  );
}

/* ---------------- Accordion ---------------- */

export function Accordion({
  items,
  className,
}: {
  items: { id: string | number; question: string; answer: string; meta?: string }[];
  className?: string;
}) {
  const [open, setOpen] = useState<(string | number) | null>(items[0]?.id ?? null);
  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:text-gold"
              >
                <span className="text-lg leading-snug md:text-xl">{item.question}</span>
                <span
                  className={cn(
                    "mt-1 grid size-7 shrink-0 place-items-center border border-line text-xs transition-transform duration-500",
                    isOpen && "rotate-45 border-gold text-gold",
                  )}
                  aria-hidden
                >
                  +
                </span>
              </button>
            </h3>
            <div
              className="grid overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="min-h-0">
                <p className="max-w-3xl pb-7 text-sm leading-relaxed text-bone/60">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Modal / drawer ---------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  side = "center",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: "center" | "right";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Close overlay"
        onClick={onClose}
        className="absolute inset-0 bg-ink/85 backdrop-blur-sm animate-rise"
      />
      <div
        className={cn(
          "relative z-10 flex max-h-full w-full flex-col overflow-hidden border border-line bg-ink-2 animate-rise",
          side === "center"
            ? "m-auto max-w-2xl rounded-md"
            : "ml-auto h-full max-w-xl border-l",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-lg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase tracking-[0.2em] text-mute hover:text-gold"
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Toasts ---------------- */

type Toast = { id: number; message: string; tone: "success" | "error" | "info" };
const ToastContext = createContext<{ push: (message: string, tone?: Toast["tone"]) => void }>({
  push: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 5200);
  }, []);
  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-5 left-1/2 z-[200] flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col gap-2"
        aria-live="polite"
        role="status"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto animate-rise border bg-ink-2/95 px-4 py-3 text-xs backdrop-blur rounded-sm",
              toast.tone === "success" && "border-jade/50 text-jade",
              toast.tone === "error" && "border-clay/60 text-clay",
              toast.tone === "info" && "border-line text-bone/80",
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/* ---------------- Tabs ---------------- */

export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("scroll-x flex gap-1 overflow-x-auto border-b border-line", className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative shrink-0 px-4 py-3 text-[11px] uppercase tracking-[0.2em] transition-colors",
            active === tab.id ? "text-gold" : "text-mute hover:text-bone",
          )}
        >
          {tab.label}
          {typeof tab.count === "number" ? (
            <span className="ml-2 text-[10px] opacity-60">{tab.count}</span>
          ) : null}
          {active === tab.id ? (
            <span className="absolute inset-x-2 -bottom-px h-px bg-gold" aria-hidden />
          ) : null}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Filter chips ---------------- */

export function FilterChips({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="scroll-x flex items-center gap-2 overflow-x-auto" role="group" aria-label={label}>
      {["All", ...options].map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "shrink-0 rounded-[2px] border px-3.5 py-2 text-[10px] uppercase tracking-[0.2em] transition-all duration-500",
            value === option
              ? "border-gold bg-gold text-ink"
              : "border-line text-bone/60 hover:border-bone/40 hover:text-bone",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Spinner ---------------- */

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn("spin inline-block size-4 rounded-full border border-current border-t-transparent", className)}
      aria-hidden
    />
  );
}
