/**
 * Article metadata registry (pure data, no JSX).
 *
 * This module is intentionally framework-free so it can be imported BOTH by the
 * React app (to render the guide index and per-article SEO) AND by
 * `vite.config.ts` at build time (to emit a static HTML file per guide URL with
 * the correct <title>, description, and canonical — matching the existing
 * staticRoutesPlugin pattern used for calculator routes).
 *
 * Article bodies live in `./articleBodies.tsx` keyed by the same slug.
 */

export interface ArticleMeta {
  slug: string;
  /** <title> tag + browser tab. */
  title: string;
  /** On-page <h1>. */
  h1: string;
  /** Meta description + index card summary. */
  description: string;
  /** ISO date (YYYY-MM-DD). */
  datePublished: string;
  /** ISO date (YYYY-MM-DD). */
  dateModified: string;
  authorId: string;
  category: 'FERS' | 'CSRS' | 'TSP' | 'Social Security' | 'Military' | 'Planning';
  /** Estimated reading time in minutes. */
  readingMinutes: number;
  /** Calculator view ids this article links readers to. */
  relatedCalculators: string[];
}

const AUTHOR = 'editorial';

export const ARTICLE_META: ArticleMeta[] = [
  {
    slug: 'fers-high-3-salary-explained',
    title: 'FERS High-3 Salary: How It Is Calculated (With Examples) | MyFedPlan',
    h1: 'FERS High-3 Salary: How It Is Calculated (With Examples)',
    description:
      'Your FERS pension is built on your High-3 average salary. Learn exactly what counts as basic pay, how the 36-month window is chosen, and how to find your own High-3 with worked examples.',
    datePublished: '2026-01-14',
    dateModified: '2026-05-12',
    authorId: AUTHOR,
    category: 'FERS',
    readingMinutes: 7,
    relatedCalculators: ['fers', 'full'],
  },
  {
    slug: 'fers-vs-csrs',
    title: 'FERS vs CSRS: Key Differences for Federal Retirement | MyFedPlan',
    h1: 'FERS vs CSRS: Key Differences for Federal Retirement',
    description:
      'FERS and CSRS are the two main federal retirement systems. Compare their pension formulas, Social Security treatment, TSP matching, and who falls under each system.',
    datePublished: '2026-01-21',
    dateModified: '2026-04-30',
    authorId: AUTHOR,
    category: 'Planning',
    readingMinutes: 8,
    relatedCalculators: ['fers', 'csrs', 'full'],
  },
  {
    slug: 'fers-minimum-retirement-age',
    title: 'FERS Minimum Retirement Age (MRA): Full Chart and Rules | MyFedPlan',
    h1: 'What Is the FERS Minimum Retirement Age (MRA)?',
    description:
      'Your FERS Minimum Retirement Age (MRA) ranges from 55 to 57 depending on birth year. See the full MRA chart and the age-and-service combinations that let you retire.',
    datePublished: '2026-01-28',
    dateModified: '2026-05-02',
    authorId: AUTHOR,
    category: 'FERS',
    readingMinutes: 6,
    relatedCalculators: ['eligibility', 'fers'],
  },
  {
    slug: 'mra-10-vs-postponed-retirement',
    title: 'FERS MRA+10 vs Postponed Retirement: Avoiding the Penalty | MyFedPlan',
    h1: 'FERS MRA+10 vs Postponed Retirement: Avoiding the Age Penalty',
    description:
      'Retiring under MRA+10 triggers a 5%-per-year age reduction — but postponing your annuity can erase it and protect FEHB. Learn how the two paths compare.',
    datePublished: '2026-02-04',
    dateModified: '2026-05-12',
    authorId: AUTHOR,
    category: 'FERS',
    readingMinutes: 8,
    relatedCalculators: ['eligibility', 'fers', 'full'],
  },
  {
    slug: 'fers-special-retirement-supplement',
    title: 'The FERS Special Retirement Supplement Explained | MyFedPlan',
    h1: 'The FERS Special Retirement Supplement Explained',
    description:
      'The FERS Special Retirement Supplement bridges the gap between retirement and age 62 for eligible retirees. Learn who qualifies, how it is estimated, and the earnings test.',
    datePublished: '2026-02-11',
    dateModified: '2026-05-05',
    authorId: AUTHOR,
    category: 'FERS',
    readingMinutes: 7,
    relatedCalculators: ['fers', 'ss', 'full'],
  },
  {
    slug: 'tsp-agency-matching-explained',
    title: 'TSP Agency Matching: How to Get the Full 5% | MyFedPlan',
    h1: 'TSP Agency Matching: How to Get the Full 5%',
    description:
      'FERS employees can earn up to a 5% agency match in the Thrift Savings Plan. Learn how the automatic 1% and matching tiers work, and the mistake that leaves money on the table.',
    datePublished: '2026-02-18',
    dateModified: '2026-04-28',
    authorId: AUTHOR,
    category: 'TSP',
    readingMinutes: 6,
    relatedCalculators: ['tsp', 'full'],
  },
  {
    slug: 'tsp-withdrawal-strategies',
    title: 'TSP Withdrawal Strategies in Retirement | MyFedPlan',
    h1: 'TSP Withdrawal Strategies in Retirement',
    description:
      'When you retire, how you draw down your TSP matters as much as how you saved. Compare installment payments, partial withdrawals, annuities, and rollovers — plus RMD timing.',
    datePublished: '2026-02-25',
    dateModified: '2026-05-12',
    authorId: AUTHOR,
    category: 'TSP',
    readingMinutes: 9,
    relatedCalculators: ['tsp', 'gap', 'full'],
  },
  {
    slug: 'military-deposit-buy-back',
    title: 'Military Service Deposit: Is Buying Back Your Time Worth It? | MyFedPlan',
    h1: 'Military Service Deposit: Is Buying Back Your Time Worth It?',
    description:
      'Paying a military deposit lets you credit active-duty time toward your federal pension. Learn how the deposit is calculated, the interest deadlines, and when the buy-back pays off.',
    datePublished: '2026-03-04',
    dateModified: '2026-05-08',
    authorId: AUTHOR,
    category: 'Military',
    readingMinutes: 8,
    relatedCalculators: ['military', 'fers'],
  },
  {
    slug: 'survivor-benefit-election',
    title: 'FERS Survivor Benefit Election and FEHB in Retirement | MyFedPlan',
    h1: 'FERS Survivor Benefit Election and FEHB in Retirement',
    description:
      'Electing a survivor annuity reduces your pension but can preserve a spouse’s income and federal health coverage. Understand the 50% and 25% options and the FEHB link.',
    datePublished: '2026-03-11',
    dateModified: '2026-05-10',
    authorId: AUTHOR,
    category: 'Planning',
    readingMinutes: 7,
    relatedCalculators: ['fers', 'full'],
  },
  {
    slug: 'csrs-offset-explained',
    title: 'CSRS Offset Explained: How It Differs From CSRS and FERS | MyFedPlan',
    h1: 'CSRS Offset Explained: How It Differs From CSRS and FERS',
    description:
      'CSRS Offset employees pay into both CSRS and Social Security. Learn how the offset reduces your CSRS annuity at 62 and why your total income usually stays about the same.',
    datePublished: '2026-03-18',
    dateModified: '2026-05-06',
    authorId: AUTHOR,
    category: 'CSRS',
    readingMinutes: 7,
    relatedCalculators: ['csrs', 'ss', 'full'],
  },
  {
    slug: 'unused-sick-leave-credit',
    title: 'How Unused Sick Leave Increases Your FERS/CSRS Annuity | MyFedPlan',
    h1: 'How Unused Sick Leave Increases Your FERS and CSRS Annuity',
    description:
      'Unused sick leave is converted to extra creditable service in your pension calculation. Learn how the hours-to-months conversion works and why it does not change eligibility.',
    datePublished: '2026-03-25',
    dateModified: '2026-05-04',
    authorId: AUTHOR,
    category: 'Planning',
    readingMinutes: 6,
    relatedCalculators: ['fers', 'csrs'],
  },
  {
    slug: 'wep-gpo-repeal',
    title: 'WEP and GPO Repeal: What the Social Security Fairness Act Means | MyFedPlan',
    h1: 'WEP and GPO Repeal: What the Social Security Fairness Act Means for Federal Retirees',
    description:
      'The Social Security Fairness Act eliminated the Windfall Elimination Provision (WEP) and Government Pension Offset (GPO). Learn what changed for CSRS retirees and public servants.',
    datePublished: '2026-04-01',
    dateModified: '2026-05-12',
    authorId: AUTHOR,
    category: 'Social Security',
    readingMinutes: 7,
    relatedCalculators: ['ss', 'csrs', 'full'],
  },
];

export function getArticleMeta(slug: string): ArticleMeta | undefined {
  return ARTICLE_META.find((a) => a.slug === slug);
}

export const ARTICLE_SLUGS: string[] = ARTICLE_META.map((a) => a.slug);
