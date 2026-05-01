import React from 'react';
import { SEO } from './SEO';

export function ContactUs() {
  return (
    <main className="max-w-[900px] mx-auto px-6 py-16">
      <SEO
        title="Contact MyFedPlan"
        description="Contact MyFedPlan for support, API questions, and partnership inquiries."
        canonicalPath="/contact"
      />
      <h1 className="font-serif text-4xl text-navy mb-6">Contact Us</h1>
      <p className="text-text-2 leading-7 mb-6">
        Questions about calculators, retirement assumptions, or API integration? Reach out and we will respond as soon as possible.
      </p>
      <ul className="list-none p-0 m-0 space-y-3 text-text-2">
        <li><strong>General support:</strong> <a className="text-blue" href="mailto:support@myfedplan.com">support@myfedplan.com</a></li>
        <li><strong>API & enterprise:</strong> <a className="text-blue" href="mailto:api@myfedplan.com">api@myfedplan.com</a></li>
        <li><strong>Feedback:</strong> <a className="text-blue" href="mailto:ideas@myfedplan.com">ideas@myfedplan.com</a></li>
      </ul>
    </main>
  );
}
