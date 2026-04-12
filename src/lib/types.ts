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

export type NewsIssue = {
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
  issueCount: number;
  latestIssueSlug: string;
  issues: NewsIssue[];
};
