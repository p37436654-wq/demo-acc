import type { Metadata } from "next";
import { PublicForm } from "@/components/forms";
import { Badge, MetaRow, PageHero, SectionHead } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { getPage, getMallSettings, listJobs } from "@/lib/queries";
import { RichText } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Careers — Work at the mall",
  description:
    "Demo job opportunities at NOVA GRAND MALL across guest services, retail, dining, marketing and operations. Applications are stored in the CMS.",
};

export default async function CareersPage() {
  const [page, jobs, mall] = await Promise.all([getPage("careers"), listJobs(), getMallSettings()]);
  const departments = Array.from(new Set(jobs.map((job) => job.department)));

  return (
    <>
      <PageHero
        eyebrow={page?.eyebrow ?? "Careers"}
        title={page?.title ?? "Careers"}
        description={page?.intro}
        image={page?.heroImage}
      />

      {page ? (
        <section className="shell py-14 md:py-16">
          <div className="max-w-3xl">
            <RichText text={page.body} />
          </div>
        </section>
      ) : null}

      <section className="border-y border-line bg-ink-2/30 py-14">
        <div className="shell flex flex-wrap gap-2">
          {departments.map((department) => (
            <span
              key={department}
              className="border border-line px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-bone/60"
            >
              {department}
            </span>
          ))}
        </div>
      </section>

      <section className="shell py-14 md:py-20">
        <SectionHead eyebrow="Open roles" title={`${jobs.length} demo positions`} description="Sample listings to demonstrate the careers module." />
        <div className="mt-10 space-y-px bg-line">
          {jobs.map((job, index) => (
            <Reveal key={job.id} delay={index * 40} className="bg-ink">
              <details className="group px-6 py-6">
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-4 list-none">
                  <div>
                    <h3 className="text-lg transition-colors group-hover:text-gold md:text-xl">{job.title}</h3>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-mute">
                      {job.department} · {job.employmentType} · {job.location}
                    </p>
                  </div>
                  <Badge tone="gold">View role</Badge>
                </summary>
                <div className="mt-6 grid gap-8 border-t border-line pt-6 lg:grid-cols-[1.5fr_1fr]">
                  <div>
                    <p className="text-sm leading-relaxed text-bone/70">{job.description}</p>
                    <p className="mt-4 text-sm leading-relaxed text-bone/55">{job.requirements}</p>
                  </div>
                  <div className="border border-line bg-ink-2/50 p-5 rounded-[3px]">
                    <MetaRow label="Department" value={job.department} />
                    <MetaRow label="Type" value={job.employmentType} />
                    <MetaRow label="Location" value={job.location} />
                    <MetaRow label="Apply" value={job.applyEmail} />
                  </div>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-ink-2/30 py-16 md:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="border border-line bg-ink p-6 md:p-10 rounded-[3px]">
            <p className="eyebrow mb-6">Apply now</p>
            <PublicForm kind="careers" />
          </div>
          <aside className="space-y-6">
            <div className="border border-line bg-ink-2/50 p-6 rounded-[3px]">
              <p className="eyebrow mb-4">Talent contact</p>
              <MetaRow label="Email" value="careers@novagrandmall.example" />
              <MetaRow label="Phone" value={mall.phone} />
              <MetaRow label="Location" value={`${mall.city}, ${mall.region}`} />
            </div>
            <div className="border border-line bg-ink-2/50 p-6 rounded-[3px]">
              <p className="eyebrow mb-3">What we look for</p>
              <ul className="space-y-2 text-xs leading-relaxed text-bone/60">
                <li>· Warmth with every guest interaction</li>
                <li>· Ownership of the small details</li>
                <li>· Precision under peak-hour pressure</li>
                <li>· Curiosity about retail and experience design</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
