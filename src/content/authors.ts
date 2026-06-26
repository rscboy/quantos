/**
 * Author / reviewer profiles used for E-E-A-T signals on guide content.
 *
 * ────────────────────────────────────────────────────────────────────────
 * IMPORTANT (Google AdSense E-E-A-T): Google holds finance ("Your Money or
 * Your Life") content to a higher trust bar. Replace the placeholder values
 * below with a REAL person who reviews this content, including their real
 * name, title, credentials, and a short factual bio. A named, credentialed
 * reviewer materially improves approval odds; a generic "editorial team"
 * byline does not. Do not invent credentials — use a real reviewer.
 * ────────────────────────────────────────────────────────────────────────
 */

export interface Author {
  id: string;
  /** TODO: Replace with the real reviewer's full name. */
  name: string;
  /** TODO: Replace with their real role/title. */
  title: string;
  /** TODO: Replace with real, verifiable credentials (e.g. "CFP®", "20 yrs federal HR"). */
  credentials: string;
  /** Short factual bio shown under articles and on the About page. */
  bio: string;
  /** Optional public profile (LinkedIn, etc.) that corroborates the bio. */
  profileUrl?: string;
  /** Optional headshot URL. A real photo strengthens E-E-A-T. */
  imageUrl?: string;
}

export const AUTHORS: Record<string, Author> = {
  editorial: {
    id: 'editorial',
    name: 'MyFedPlan Editorial Team', // TODO: replace with a real named reviewer
    title: 'Federal Retirement Content Team',
    credentials: 'Reviewed against current OPM, TSP, and SSA guidance',
    bio:
      'MyFedPlan content is researched and maintained by our federal retirement content team and checked against publicly available guidance from the U.S. Office of Personnel Management (OPM), the Thrift Savings Plan (TSP), and the Social Security Administration (SSA). Articles are reviewed for accuracy on a recurring schedule. This is educational information, not individualized financial, tax, or legal advice.',
    profileUrl: 'https://www.linkedin.com/company/quantos',
  },
};

export const DEFAULT_AUTHOR_ID = 'editorial';

export function getAuthor(id: string | undefined): Author {
  return (id && AUTHORS[id]) || AUTHORS[DEFAULT_AUTHOR_ID];
}
