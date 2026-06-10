import React from 'react';
import { SEO } from './SEO';

type RouteMetaInfo = { title: string; description: string };

const CALCULATOR_META: Record<string, RouteMetaInfo> = {
  fers: {
    title: 'FERS Annuity Calculator | MyFedPlan',
    description:
      'Free FERS retirement calculator. Estimate your Federal Employees Retirement System basic annuity using High-3 salary, years of creditable service, and special provisions.',
  },
  csrs: {
    title: 'CSRS Annuity Calculator | MyFedPlan',
    description:
      'Free CSRS pension calculator for the Civil Service Retirement System. Model deposits, redeposits, sick leave credit, and survivor elections.',
  },
  eligibility: {
    title: 'Federal Retirement Eligibility Calculator | MyFedPlan',
    description:
      'Find the soonest date you can retire from federal service and still receive an annuity, based on your age and years of creditable service.',
  },
  tsp: {
    title: 'TSP Calculator | Thrift Savings Plan Projections | MyFedPlan',
    description:
      'Project your Thrift Savings Plan balance over 5, 10, or 20 years, including agency match and Lifecycle (L) Fund allocation assumptions.',
  },
  gap: {
    title: 'Retirement Savings Gap Calculator | MyFedPlan',
    description:
      'See whether your federal pension, Social Security, and TSP savings are on track to cover your projected retirement expenses.',
  },
  military: {
    title: 'Military Deposit Calculator | MyFedPlan',
    description:
      'Calculate the military service deposit required to buy back active-duty time and increase your federal retirement annuity.',
  },
  full: {
    title: 'Full Federal Retirement Analysis | MyFedPlan',
    description:
      'Run a complete federal retirement analysis combining FERS or CSRS annuity, TSP, Social Security, and savings-gap projections in one place.',
  },
  ss: {
    title: 'Social Security Estimator for Federal Employees | MyFedPlan',
    description:
      'Estimate your monthly Social Security benefit at retirement and coordinate it with your federal pension and TSP withdrawals.',
  },
};

type RouteMetaProps = {
  view: string;
};

export function RouteMeta({ view }: RouteMetaProps) {
  const meta = CALCULATOR_META[view];
  if (!meta) {
    return null;
  }

  return (
    <SEO
      title={meta.title}
      description={meta.description}
      canonicalPath={`/${view}`}
      robots="index,follow"
    />
  );
}
