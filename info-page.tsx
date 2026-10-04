import Link from "next/link";
import { Btn, PageHero, RichText } from "@/components/ui";
import { CookiePreferences } from "@/components/forms";
import { getPage } from "@/lib/queries";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InfoPage({
  slug,
  fallbackTitle,
  fallbackEyebrow,
  fallbackIntro,
  showCookies,
}: {
  slug: string;
  fallbackTitle: string;
  fallbackEyebrow: string;
  fallbackIntro: string;
  showCookies?: boolean;
}) {
  const page = await getPage(slug);
  if (!page) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow || fallbackEyebrow}
        title={page.title || fallbackTitle}
        description={page.intro || fallbackIntro}
        image={page.heroImage}
      />

      <section className="shell py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <RichText text={page.body} />
          <aside className="space-y-6">
            <div className="border border-line bg-ink-2/40 p-6 rounded-[3px]">
              <p className="eyebrow mb-3">Demo notice</p>
              <p className="text-xs leading-relaxed text-bone/60">
                NOVA GRAND MALL is a fictional mall created for this demonstration. This page and every
                statement on it are sample content managed from the CMS.
              </p>
            </div>
            <div className="border border-line bg-ink-2/40 p-6 rounded-[3px]">
              <p className="eyebrow mb-3">Related</p>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/privacy" className="text-bone/70 hover:text-gold">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-bone/70 hover:text-gold">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-bone/70 hover:text-gold">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="/accessibility" className="text-bone/70 hover:text-gold">
                    Accessibility
                  </Link>
                </li>
              </ul>
            </div>
            <Btn href="/contact" variant="outline">
              Contact the mall
            </Btn>
          </aside>
        </div>
      </section>

      {showCookies ? (
        <section id="settings" className="scroll-mt-24 border-t border-line bg-ink-2/30 py-14 md:py-20">
          <div className="shell">
            <p className="eyebrow">Cookie settings</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Your preferences</h2>
            <CookiePreferences />
          </div>
        </section>
      ) : null}
    </>
  );
}
