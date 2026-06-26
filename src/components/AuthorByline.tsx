import React from 'react';
import { getAuthor } from '../content/authors';

interface AuthorBylineProps {
  authorId?: string;
  datePublished?: string;
  dateModified?: string;
  readingMinutes?: number;
  /** "compact" renders a single line; "card" renders the full bio box. */
  variant?: 'compact' | 'card';
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function AuthorByline({
  authorId,
  datePublished,
  dateModified,
  readingMinutes,
  variant = 'compact',
}: AuthorBylineProps) {
  const author = getAuthor(authorId);

  if (variant === 'card') {
    return (
      <aside className="mt-12 border border-border rounded-lg bg-white p-6">
        <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-text-3 mb-2">
          About the author
        </div>
        <div className="font-serif text-xl text-navy">{author.name}</div>
        <div className="text-sm text-text-3 mb-3">
          {author.title}
          {author.credentials ? ` · ${author.credentials}` : ''}
        </div>
        <p className="text-text-2 leading-7 text-[15px]">{author.bio}</p>
        {author.profileUrl && (
          <p className="mt-3 text-sm">
            <a
              href={author.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue hover:underline"
            >
              View profile
            </a>
          </p>
        )}
      </aside>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-3">
      <span>
        By <span className="text-text-2 font-medium">{author.name}</span>
      </span>
      {author.credentials && <span aria-hidden="true">·</span>}
      {author.credentials && <span>{author.credentials}</span>}
      {dateModified && <span aria-hidden="true">·</span>}
      {dateModified && <span>Updated {formatDate(dateModified)}</span>}
      {typeof readingMinutes === 'number' && <span aria-hidden="true">·</span>}
      {typeof readingMinutes === 'number' && <span>{readingMinutes} min read</span>}
    </div>
  );
}
