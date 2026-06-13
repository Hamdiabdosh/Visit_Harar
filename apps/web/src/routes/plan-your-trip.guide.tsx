import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { getPublishedPage } from "@/lib/pages-fns";
import { getItineraries } from "@/lib/itineraries-fns";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import { buildHeadAsync, excerptFromHtml } from "@/lib/metadata";

export const Route = createFileRoute("/plan-your-trip/guide")({
  loader: async () => {
    const [page, itineraries] = await Promise.all([
      getPublishedPage({ data: "plan" }),
      getItineraries({ data: { published: true } }),
    ]);
    return { page, itineraries };
  },
  head: async ({ loaderData }) => {
    const page = loaderData?.page;
    const content = (page?.content ?? {}) as { getting_here?: string };
    return buildHeadAsync({
      title: "Harar Visitor Guide (PDF)",
      description:
        excerptFromHtml(content.getting_here) ??
        "Downloadable visitor guide for Harar — transport, visas, and suggested itineraries.",
      canonicalPath: "/plan-your-trip/guide",
    });
  },
  component: PrintGuide,
});

function PrintGuide() {
  const { page, itineraries } = Route.useLoaderData();

  if (!page) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
          <p className="text-ink-muted">
            The visitor guide will be available once Plan Your Trip is published.
          </p>
          <Link to="/plan-your-trip" className="text-brand mt-4 inline-block">
            ← Plan Your Trip
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const c = page.content as Record<string, unknown>;
  const sections = [
    { title: "Getting here", html: c.getting_here as string },
    { title: "Best time to visit", html: c.best_time as string },
    { title: "Visa information", html: c.visa_info as string },
    { title: "Packing list", html: c.packing_list as string },
    { title: "Estimated costs", html: c.estimated_costs as string },
    { title: "Dire Dawa transfer", html: c.dire_dawa_transfer as string },
    { title: "Where to stay", html: c.accommodation as string },
  ].filter((s) => typeof s.html === "string" && s.html.trim());

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-guide { box-shadow: none; border: none; }
        }
      `}</style>
      <PublicLayout>
        <div className="no-print max-w-3xl mx-auto px-5 lg:px-8 py-8 flex flex-wrap gap-3 justify-between items-center">
          <Link
            to="/plan-your-trip"
            className="text-sm text-brand hover:underline"
          >
            ← Back to Plan Your Trip
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-md bg-brand text-white text-sm font-semibold hover:bg-brand-dark"
          >
            Print / Save as PDF
          </button>
        </div>

        <article className="print-guide max-w-3xl mx-auto px-5 lg:px-8 pb-16 bg-white border border-border rounded-lg shadow-sm my-4 md:my-8 p-8 md:p-12">
          <header className="border-b border-border pb-6 mb-8">
            <p className="text-xs uppercase tracking-widest text-ink-muted">
              Visit Harar · Official Visitor Guide
            </p>
            <h1 className="font-serif text-4xl font-bold mt-2">{page.title}</h1>
            <p className="text-sm text-ink-muted mt-2">
              Harari Tourism Commission · visitharar.gov.et
            </p>
          </header>

          {sections.map((s) => (
            <section key={s.title} className="mb-8 break-inside-avoid">
              <h2 className="font-serif text-2xl font-bold mb-3">{s.title}</h2>
              <div
                className="prose prose-stone max-w-none text-sm"
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichHtml(s.html),
                }}
              />
            </section>
          ))}

          {itineraries.length > 0 ? (
            <section className="mb-8 break-inside-avoid">
              <h2 className="font-serif text-2xl font-bold mb-4">
                Suggested itineraries
              </h2>
              {itineraries.map((it) => (
                <div key={it.id} className="mb-6">
                  <h3 className="font-serif text-lg font-bold">
                    {it.title}{" "}
                    <span className="text-sm font-normal text-ink-muted">
                      ({it.duration})
                    </span>
                  </h3>
                  {it.summary ? (
                    <p className="text-sm text-ink-muted mt-1">{it.summary}</p>
                  ) : null}
                  {it.days.map((day, i) => (
                    <div key={i} className="mt-3">
                      <p className="font-semibold text-sm">{day.label}</p>
                      <ul className="mt-1 text-sm text-ink-muted list-disc pl-5">
                        {day.items.map((item, j) => (
                          <li key={j}>{item.title}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </section>
          ) : null}

          <footer className="border-t border-border pt-6 text-xs text-ink-muted">
            <p>
              For the latest information, visit{" "}
              <span className="font-mono">visitharar.gov.et</span> or contact
              the commission via the Contact page.
            </p>
          </footer>
        </article>
      </PublicLayout>
    </>
  );
}
