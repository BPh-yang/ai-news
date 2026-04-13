export type RawFeedItem = {
  title?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  isoDate?: string;
  content?: string;
  contentSnippet?: string;
  description?: string;
  [key: string]: unknown;
};

export type NewsEdition = {
  id: string;
  slug: string;
  sourceId: string;
  sourceTitle: string;
  title: string;
  link: string;
  guid: string;
  publishedAt: string;
  fetchedAt: string;
  summary: string;
  coverImage: string | null;
  contentHtml: string;
};

export type BuildOutput = {
  generatedAt: string;
  editionCount: number;
  latestEditionSlug: string;
  editions: NewsEdition[];
};
