import React from 'react';
import { SEO } from './SEO';
import { AuthorByline } from './AuthorByline';
import { getArticle, getRelatedArticles } from '../content';
import { getAuthor } from '../content/authors';
import type { Block } from '../content/types';

const SITE = 'https://www.myfedplan.us';

const CALCULATOR_LABELS: Record<string, string> = {
  fers: 'FERS Annuity Calculator',
  csrs: 'CSRS Annuity Calculator',
  eligibility: 'Retirement Eligibility Calculator',
  tsp: 'TSP Projection Calculator',
  gap: 'Retirement Savings Gap Calculator',
  military: 'Military Deposit Calculator',
  full: 'Full Retirement Analysis',
  ss: 'Social Security Estimator',
};

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'p':
      return <p className="text-text-2 leading-8 text-[17px]">{block.text}</p>;
    case 'h2':
      return (
        <h2 id={block.id} className="font-serif text-[26px] text-navy mt-10 mb-1 scroll-mt-24">
          {block.text}
        </h2>
      );
    case 'h3':
      return <h3 className="font-serif text-xl text-navy mt-6 mb-1">{block.text}</h3>;
    case 'ul':
      return (
        <ul className="list-disc pl-6 space-y-2 text-text-2 leading-7 text-[17px]">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="list-decimal pl-6 space-y-2 text-text-2 leading-7 text-[17px]">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    case 'callout':
      return (
        <div className="border-l-4 border-blue bg-blue-lt/60 rounded-r-md p-5">
          {block.title && <div className="font-semibold text-navy mb-1">{block.title}</div>}
          <div className="text-text-2 leading-7 text-[16px]">{block.text}</div>
        </div>
      );
    case 'table':
      return (
        <div className="overflow-x-auto">
          {block.caption && (
            <div className="text-sm text-text-3 mb-2 italic">{block.caption}</div>
          )}
          <table className="w-full text-left border-collapse text-[15px]">
            <thead>
              <tr>
                {block.head.map((h, i) => (
                  <th key={i} className="bg-gray-50 text-text-2 font-semibold p-3 border border-border">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="p-3 border border-border text-text-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'faq':
      return (
        <div className="space-y-5">
          {block.items.map((item, i) => (
            <div key={i}>
              <h3 className="font-semibold text-navy text-[17px]">{item.q}</h3>
              <p className="text-text-2 leading-7 mt-1 text-[16px]">{item.a}</p>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export function Article({
  slug,
  onNavigate,
}: {
  slug: string;
  onNavigate: (view: string) => void;
}) {
  const article = getArticle(slug);

  if (!article) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-20 text-center">
        <SEO
          title="Guide not found | MyFedPlan"
          description="The requested federal retirement guide could not be found."
          robots="noindex,follow"
        />
        <h1 className="font-serif text-3xl text-navy mb-4">Guide not found</h1>
        <p className="text-text-2 mb-6">We couldn’t find that guide. Browse all of our federal retirement guides instead.</p>
        <button
          onClick={() => onNavigate('guides')}
          className="text-blue font-medium hover:underline"
        >
          ← All guides
        </button>
      </main>
    );
  }

  const { meta, body } = article;
  const author = getAuthor(meta.authorId);
  const url = `${SITE}/guides/${meta.slug}`;

  // Collect FAQ entries across all faq blocks for FAQPage schema.
  const faqItems = body.blocks
    .filter((b): b is Extract<Block, { type: 'faq' }> => b.type === 'faq')
    .flatMap((b) => b.items);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: meta.h1,
        description: meta.description,
        datePublished: meta.datePublished,
        dateModified: meta.dateModified,
        author: { '@type': 'Organization', name: author.name, url: author.profileUrl },
        publisher: {
          '@type': 'Organization',
          name: 'MyFedPlan',
          url: SITE,
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        articleSection: meta.category,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE}/guides` },
          { '@type': 'ListItem', position: 3, name: meta.h1, item: url },
        ],
      },
      ...(faqItems.length
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: faqItems.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            },
          ]
        : []),
    ],
  };

  const related = getRelatedArticles(meta.slug, 3);

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <SEO
        title={meta.title}
        description={meta.description}
        canonicalPath={`/guides/${meta.slug}`}
        robots="index,follow"
        schema={schema}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-text-3 mb-6" aria-label="Breadcrumb">
        <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-blue">Home</a>
        <span className="mx-2">/</span>
        <a href="/guides" onClick={(e) => { e.preventDefault(); onNavigate('guides'); }} className="hover:text-blue">Guides</a>
        <span className="mx-2">/</span>
        <span className="text-text-2">{meta.category}</span>
      </nav>

      <article>
        <header className="mb-8">
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-blue mb-3">
            {meta.category}
          </div>
          <h1 className="font-serif text-[34px] leading-[1.2] text-navy mb-4">{meta.h1}</h1>
          <p className="text-text-2 text-[19px] leading-8 mb-4">{body.lead}</p>
          <AuthorByline
            authorId={meta.authorId}
            datePublished={meta.datePublished}
            dateModified={meta.dateModified}
            readingMinutes={meta.readingMinutes}
          />
        </header>

        {/* Key takeaways */}
        {body.keyTakeaways.length > 0 && (
          <div className="border border-border rounded-lg bg-white p-6 mb-10">
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-text-3 mb-3">
              Key takeaways
            </div>
            <ul className="list-disc pl-6 space-y-2 text-text-2 leading-7">
              {body.keyTakeaways.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-5">
          {body.blocks.map((block, i) => (
            <BlockView key={i} block={block} />
          ))}
        </div>

        <AuthorByline variant="card" authorId={meta.authorId} />
      </article>

      {/* Related calculators */}
      {meta.relatedCalculators.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl text-navy mb-4">Try the related calculators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {meta.relatedCalculators.map((calc) => (
              <a
                key={calc}
                href={`/${calc}`}
                onClick={(e) => { e.preventDefault(); onNavigate(calc); }}
                className="border border-border rounded-lg p-5 bg-white block no-underline hover:bg-[#FAFBFF] transition-colors"
              >
                <h3 className="font-serif text-lg text-navy">{CALCULATOR_LABELS[calc] || calc}</h3>
                <p className="mt-1 text-text-3 text-[14px]">Free · no account required</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Related guides */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl text-navy mb-4">Related guides</h2>
          <ul className="space-y-3">
            {related.map((r) => (
              <li key={r.meta.slug}>
                <a
                  href={`/guides/${r.meta.slug}`}
                  onClick={(e) => { e.preventDefault(); onNavigate(`guides/${r.meta.slug}`); }}
                  className="text-blue hover:underline text-[17px]"
                >
                  {r.meta.h1}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-12 text-sm text-text-3 border-t border-border pt-6">
        This article is educational information only and is not individualized financial, tax, or legal
        advice. MyFedPlan is an independent resource and is not affiliated with the U.S. government.
        Final retirement eligibility and benefits are determined by the appropriate federal agencies.
      </p>
    </main>
  );
}
