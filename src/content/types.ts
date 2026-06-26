import type { ReactNode } from 'react';

/**
 * Structured content blocks used to author guide articles. Keeping articles as
 * data (rather than free-form JSX) gives every guide consistent typography and
 * lets us derive FAQ JSON-LD schema automatically for richer search results.
 */
export type Block =
  | { type: 'p'; text: ReactNode }
  | { type: 'h2'; text: string; id?: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: ReactNode[] }
  | { type: 'ol'; items: ReactNode[] }
  | { type: 'callout'; title?: string; text: ReactNode }
  | { type: 'table'; caption?: string; head: string[]; rows: string[][] }
  | { type: 'faq'; items: Array<{ q: string; a: string }> };

export interface ArticleBody {
  /** Lead paragraph shown under the H1 (also feeds the article summary). */
  lead: string;
  blocks: Block[];
  /** Plain-text "key takeaways" rendered as a highlighted summary box. */
  keyTakeaways: string[];
}
