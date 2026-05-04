import React from 'react';
import { SEO } from './SEO';

export function ContactUs() {
  return (
    <main className="max-w-[900px] mx-auto px-6 py-16">
      <SEO title="Contact MyFedPlan" description="Contact MyFedPlan for calculator support and editorial questions." canonicalPath="/contact" />
      <h1 className="font-serif text-4xl text-navy mb-6">Contact Us</h1>
      <p className="text-text-2 leading-7 mb-6">Email us at <a className="text-blue" href="mailto:support@myfedplan.us">support@myfedplan.us</a> or use the form below.</p>
      <form className="grid gap-4 bg-white border border-border rounded-lg p-6" onSubmit={(e) => e.preventDefault()}>
        <label className="grid gap-1"><span>Name</span><input required className="border rounded px-3 py-2" name="name" /></label>
        <label className="grid gap-1"><span>Email</span><input required type="email" className="border rounded px-3 py-2" name="email" /></label>
        <label className="grid gap-1"><span>Message</span><textarea required className="border rounded px-3 py-2 min-h-32" name="message" /></label>
        <button className="bg-blue text-white px-4 py-2 rounded w-fit">Send message</button>
      </form>
    </main>
  );
}
