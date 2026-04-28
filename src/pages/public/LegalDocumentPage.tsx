import { ArrowLeft, CalendarDays, FileText, Check } from 'lucide-react';
import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Footer } from '../../components/landing/Footer';
import { Navbar } from '../../components/landing/Navbar';
import { legalDocumentsBySlug } from '../../content/legalDocuments';

export function LegalDocumentPage() {
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!slug || !legalDocumentsBySlug[slug]) {
    return <Navigate to="/" replace />;
  }

  const document = legalDocumentsBySlug[slug];

  return (
    <main className="min-h-screen bg-cream text-charcoal">
      <Navbar mode="sticky" forceSolid />

      <section className="relative overflow-hidden border-b border-charcoal/10 bg-gradient-to-b from-[#fcf3ea] via-cream to-cream">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#2D2A26 1px, transparent 1px), linear-gradient(90deg, #2D2A26 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative mx-auto flex min-h-[360px] max-w-5xl flex-col justify-end px-4 pb-14 pt-16 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-charcoal/70 transition-colors hover:text-terracotta"
          >
            <ArrowLeft size={16} />
            Back to InDesk
          </Link>

          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-terracotta/20 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
              <FileText size={14} />
              Legal Document
            </div>
            <h1 className="text-4xl font-serif font-semibold leading-tight text-charcoal sm:text-5xl">
              {document.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-warm-gray">
              {document.summary}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-charcoal px-4 py-2 text-sm text-white">
              <CalendarDays size={15} />
              Effective date: {document.effectiveDate}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-charcoal/50">
                Included Policies
              </h2>
              <ul className="mt-5 space-y-3 text-sm text-warm-gray">
                {Object.values(legalDocumentsBySlug).map((item) => (
                  <li key={item.slug}>
                    <Link
                      to={`/legal/${item.slug}`}
                      className={`transition-colors hover:text-terracotta ${
                        item.slug === document.slug ? 'font-semibold text-terracotta' : ''
                      }`}
                    >
                      {item.shortTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <article className="space-y-8">
            {/* <div className="rounded-3xl border border-charcoal/10 bg-white p-8 shadow-sm sm:p-10">
              <div className="space-y-5 text-base leading-8 text-warm-gray">
                {document.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div> */}

            {document.sections.map((section, index) => {
              const headingParts = section.heading.split(' ');
              const firstPart = headingParts[0];
              const isNumbered = /^\d+(\.\d+)*$/.test(firstPart);
              const number = isNumbered ? firstPart : null;
              const headingText = isNumbered ? headingParts.slice(1).join(' ') : section.heading;

              return (
                <section
                  key={section.heading}
                  className="rounded-3xl border border-charcoal/10 bg-white p-8 shadow-sm sm:p-10 transition-all hover:shadow-md"
                >
                  <div className="mb-6 flex items-start gap-4">
                    {number && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta text-sm font-bold text-white shadow-sm">
                        {number}
                      </div>
                    )}
                    <h2 className={`text-2xl font-serif font-semibold text-charcoal ${number ? 'pt-1' : ''}`}>
                      {headingText}
                    </h2>
                  </div>

                  <div className="space-y-5 text-base leading-8 text-warm-gray">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>

                  {section.bullets && (
                    <ul className="mt-6 space-y-4 text-base text-warm-gray">
                      {section.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex gap-4 leading-7">
                          <div className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-terracotta text-white">
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="text-charcoal/80">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </article>
        </div>
      </section>

      <Footer />
    </main>
  );
}
