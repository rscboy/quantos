import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  schema?: Record<string, any>;
  canonicalPath?: string;
  robots?: string;
}

export function SEO({ title, description, schema, canonicalPath, robots }: SEOProps) {
  const path = canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : '');
  const canonicalUrl = `https://www.myfedplan.us${path}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {robots && <meta name="robots" content={robots} />}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
