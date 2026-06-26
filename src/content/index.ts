import { ARTICLE_META, type ArticleMeta } from './articleMeta';
import { ARTICLE_BODIES } from './articleBodies';
import type { ArticleBody } from './types';

export type { ArticleMeta } from './articleMeta';
export type { ArticleBody, Block } from './types';

export interface Article {
  meta: ArticleMeta;
  body: ArticleBody;
}

/** All articles that have both metadata and a written body, newest first. */
export const ARTICLES: Article[] = ARTICLE_META
  .filter((meta) => ARTICLE_BODIES[meta.slug])
  .map((meta) => ({ meta, body: ARTICLE_BODIES[meta.slug] }))
  .sort((a, b) => (a.meta.datePublished < b.meta.datePublished ? 1 : -1));

export function getArticle(slug: string): Article | undefined {
  const meta = ARTICLE_META.find((m) => m.slug === slug);
  if (!meta || !ARTICLE_BODIES[slug]) return undefined;
  return { meta, body: ARTICLE_BODIES[slug] };
}

/** Articles related by shared category, excluding the current one. */
export function getRelatedArticles(slug: string, limit = 3): Article[] {
  const current = getArticle(slug);
  if (!current) return ARTICLES.slice(0, limit);
  const sameCategory = ARTICLES.filter(
    (a) => a.meta.slug !== slug && a.meta.category === current.meta.category,
  );
  const others = ARTICLES.filter(
    (a) => a.meta.slug !== slug && a.meta.category !== current.meta.category,
  );
  return [...sameCategory, ...others].slice(0, limit);
}
