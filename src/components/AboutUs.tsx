import React from 'react';
import { SEO } from './SEO';
import { AuthorByline } from './AuthorByline';

export function AboutUs() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About MyFedPlan',
    url: 'https://www.myfedplan.us/about',
    publisher: {
      '@type': 'Organization',
      name: 'MyFedPlan',
      url: 'https://www.myfedplan.us',
      email: 'support@myfedplan.us',
    },
  };

  return (
    <main className="max-w-[820px] mx-auto px-6 py-16">
      <SEO
        title="About MyFedPlan | Federal Retirement Planning"
        description="Learn who is behind MyFedPlan, our mission, our editorial and review process, and how we build federal retirement planning tools."
        canonicalPath="/about"
        schema={schema}
      />
      <h1 className="font-serif text-4xl text-navy mb-6">About MyFedPlan</h1>
      <p className="text-text-2 leading-8 text-[18px] mb-4">
        MyFedPlan is an independent retirement-planning resource built specifically for U.S. federal
        employees and their families. Federal retirement rules are notoriously complicated — spread
        across FERS, CSRS, the Thrift Savings Plan, military service credit, and Social Security. Our
        goal is to make those rules understandable through free calculators, plain-English guides, and
        worked examples, so you can make informed decisions before you talk to your agency or a financial
        professional.
      </p>

      <h2 className="font-serif text-2xl text-navy mt-10 mb-3">Our mission</h2>
      <p className="text-text-2 leading-8 mb-4">
        We aim to provide transparent, easy-to-use tools for evaluating CSRS and FERS annuities, TSP
        growth, Social Security coordination, military deposits, and overall retirement-income adequacy.
        We prioritize clarity, data quality, and responsible financial education over hype. Our tools are
        free, require no account to use, and do not sell your personal information.
      </p>

      <h2 className="font-serif text-2xl text-navy mt-10 mb-3">How we research and review content</h2>
      <p className="text-text-2 leading-8 mb-4">
        Every guide and calculator on MyFedPlan is built from publicly available, authoritative sources —
        primarily the U.S. Office of Personnel Management (OPM), the Thrift Savings Plan (TSP), the
        Social Security Administration (SSA), and the IRS. Our editorial process works like this:
      </p>
      <ul className="list-disc pl-6 text-text-2 leading-8 space-y-2 mb-4">
        <li>We draft each guide against the current published rules and cite the governing agency.</li>
        <li>We translate formulas into reproducible, deterministic calculations — the same inputs always produce the same outputs.</li>
        <li>We review content on a recurring schedule and after major legislative or rule changes (for example, the repeal of WEP and GPO).</li>
        <li>We clearly date when each guide was last reviewed so you know how current it is.</li>
      </ul>

      <h2 className="font-serif text-2xl text-navy mt-10 mb-3">Who we serve</h2>
      <ul className="list-disc pl-6 text-text-2 leading-8 space-y-2 mb-4">
        <li>Federal employees planning retirement timelines and annuity outcomes.</li>
        <li>HR and benefits professionals supporting workforce retirement readiness.</li>
        <li>Financial advisors who assist federal clients with pension-aware planning.</li>
      </ul>

      <h2 className="font-serif text-2xl text-navy mt-10 mb-3">Important disclaimer</h2>
      <p className="text-text-2 leading-8 mb-4">
        MyFedPlan is an independent educational resource and is <strong>not affiliated with the U.S.
        government</strong>, OPM, the TSP, or the SSA. Our calculators provide estimates for planning and
        education only and are not individualized financial, tax, or legal advice. Your official
        retirement eligibility and benefit amounts are determined solely by the appropriate federal
        agencies.
      </p>

      <h2 className="font-serif text-2xl text-navy mt-10 mb-3">Contact</h2>
      <p className="text-text-2 leading-8 mb-6">
        Questions, corrections, or feedback are welcome at{' '}
        <a href="mailto:support@myfedplan.us" className="text-blue hover:underline">support@myfedplan.us</a>.
        We take accuracy seriously and respond to reported errors promptly.
      </p>

      <AuthorByline variant="card" />
    </main>
  );
}
