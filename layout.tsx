import type { ReactNode } from "react";
import Footer from "@/components/footer";
import { IntroSequence, SiteHeader } from "@/components/site-chrome";
import { ToastProvider } from "@/components/motion";
import { listAnnouncements } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [announcements] = await Promise.all([listAnnouncements("topbar")]);
  const announcement = announcements[0]
    ? {
        title: announcements[0].title,
        message: announcements[0].message,
        linkLabel: announcements[0].linkLabel,
        linkUrl: announcements[0].linkUrl,
      }
    : null;

  return (
    <ToastProvider>
      <IntroSequence />
      <div className="flex min-h-screen flex-col">
        <SiteHeader announcement={announcement} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
