import React from 'react';
import { SEO } from './SEO';

type RouteMetaProps = {
  view: string;
};

const NOINDEX_ROUTES = new Set(['fers', 'csrs', 'eligibility', 'tsp', 'gap', 'military', 'full', 'ss']);

export function RouteMeta({ view }: RouteMetaProps) {
  if (!NOINDEX_ROUTES.has(view)) {
    return null;
  }

  return (
    <SEO
      title="Federal Retirement Calculators | MyFedPlan"
      description="Interactive calculator workspace for existing MyFedPlan users."
      canonicalPath={view === 'home' ? '/' : `/${view}`}
      robots="noindex,follow"
    />
  );
}

