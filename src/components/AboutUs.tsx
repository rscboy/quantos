import React from 'react';
import { SEO } from './SEO';

export function AboutUs() {
  return (
    <main className="max-w-[900px] mx-auto px-6 py-16">
      <SEO
        title="About MyFedPlan | Federal Retirement Planning"
        description="Learn who is behind MyFedPlan, our mission, and how we build federal retirement planning tools."
        canonicalPath="/about"
      />
      <h1 className="font-serif text-4xl text-navy mb-6">About MyFedPlan</h1>
      <p className="text-text-2 leading-7 mb-4">
        MyFedPlan is an independent retirement planning resource focused on U.S. federal employees and their families.
        Our goal is to make complex retirement rules easier to understand through calculators, educational content, and
        practical examples.
      </p>
      <h2 className="font-serif text-2xl text-navy mt-8 mb-3">Our mission</h2>
      <p className="text-text-2 leading-7 mb-4">
        We aim to provide transparent, easy-to-use tools for evaluating CSRS, FERS, TSP, Social Security coordination,
        and retirement income adequacy. We prioritize clarity, data quality, and responsible financial education.
      </p>
      <h2 className="font-serif text-2xl text-navy mt-8 mb-3">Who we serve</h2>
      <ul className="list-disc pl-6 text-text-2 leading-7 space-y-2">
        <li>Federal employees planning retirement timelines and annuity outcomes.</li>
        <li>HR and benefits professionals supporting workforce retirement readiness.</li>
        <li>Financial advisors who assist federal clients with pension-aware planning.</li>
      </ul>
    </main>
  );
}
