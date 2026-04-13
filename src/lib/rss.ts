import Parser from "rss-parser";
import sanitizeHtml from "sanitize-html";

import type { FeedDefinition } from "../config/feeds.js";
import type { NewsEdition, RawFeedItem } from "./types.js";
import {
  createContentHash,
  extractCoverImage,
  getPreferredSlug,
  stripHtml,
  truncateText
} from "./utils.js";

const parser = new Parser<Record<string, never>, RawFeedItem>({
  customFields: {
    item: ["content:encoded"]
  }
});

const juyaVideoHtmlPattern = /<p>\s*<strong>\s*视频版\s*<\/strong>[\s\S]*?<\/p>/gi;
const juyaVideoTextPattern =
  /视频版[:：]\s*[^。！？\n]*?(?=概览|要闻|模型发布|开发生态|产品应用|行业动态|技术与洞察|前瞻与传闻|其他|提示|$)/g;
const juyaBrandPattern = /橘鸦/gi;
const juyaPromoHtmlPattern =
  /<p>\s*作者\s*<code>\s*Juya\s*<\/code>\s*，?\s*视频版在同名[\s\S]*?<\/p>/gi;
const juyaPromoTextPattern = /作者\s*Juya\s*，?\s*视频版在同名[^。！？\n]*[。！？]?/gi;

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "blockquote",
    "strong",
    "em",
    "code",
    "pre",
    "hr",
    "br"
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "loading"]
  },
  allowedSchemes: ["http", "https"],
  transformTags: {
    a: (_tagName, attribs) => ({
      tagName: "a",
      attribs: {
        ...attribs,
        target: "_blank",
        rel: "noreferrer noopener"
      }
    }),
    img: (_tagName, attribs) => {
      const upgradedSrc = upgradeInsecureHttpUrl(attribs.src);

      return {
        tagName: "img",
        attribs: {
          ...attribs,
          ...(upgradedSrc ? { src: upgradedSrc } : {}),
          loading: "lazy"
        }
      };
    }
  }
};

function upgradeInsecureHttpUrl(value: string | undefined): string | undefined {
  if (!value) {
    return value;
  }

  return value.startsWith("http://") ? `https://${value.slice("http://".length)}` : value;
}

export function cleanFeedHtml(feed: FeedDefinition, html: string): string {
  if (feed.profile !== "juya-ai-daily") {
    return html.trim();
  }

  return html
    .replace(juyaVideoHtmlPattern, "")
    .replace(juyaPromoHtmlPattern, "")
    .replace(juyaBrandPattern, "")
    .replace(/<p>\s*<\/p>/gi, "")
    .trim();
}

export function cleanFeedText(feed: FeedDefinition, text: string): string {
  if (feed.profile !== "juya-ai-daily") {
    return text.trim();
  }

  return text
    .replace(juyaVideoTextPattern, "")
    .replace(juyaPromoTextPattern, "")
    .replace(juyaBrandPattern, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeEdition(feed: FeedDefinition, item: RawFeedItem, fetchedAt: string): NewsEdition {
  const title = cleanFeedText(feed, item.title?.trim() || "未命名期刊");
  const link = item.link?.trim() || "#";
  const guid = item.guid?.trim() || link || title;
  const publishedAt = item.isoDate || item.pubDate || fetchedAt;
  const rawHtml =
    typeof item["content:encoded"] === "string"
      ? item["content:encoded"]
      : item.content || item.description || "";
  const cleanedHtml = cleanFeedHtml(feed, rawHtml);

  const contentHtml = sanitizeHtml(cleanedHtml, sanitizeOptions);
  const summarySource = cleanFeedText(
    feed,
    stripHtml(item.description || item.contentSnippet || cleanedHtml)
  );
  const summary = truncateText(summarySource, 180);
  const slug = getPreferredSlug(link, title);
  const id = createContentHash(`${feed.id}:${guid}:${publishedAt}:${title}`);
  const coverImage = extractCoverImage(contentHtml);

  return {
    id,
    slug,
    sourceId: feed.id,
    sourceTitle: feed.title,
    title,
    link,
    guid,
    publishedAt,
    fetchedAt,
    summary,
    coverImage,
    contentHtml
  };
}

export async function fetchEditions(feeds: FeedDefinition[]): Promise<NewsEdition[]> {
  const fetchedAt = new Date().toISOString();
  const editions: NewsEdition[] = [];

  for (const feed of feeds) {
    const parsed = await parser.parseURL(feed.url);
    for (const item of parsed.items) {
      editions.push(normalizeEdition(feed, item, fetchedAt));
    }
  }

  const deduped = new Map<string, NewsEdition>();
  for (const edition of editions) {
    const dedupeKey = edition.guid || `${edition.link}:${edition.publishedAt}`;
    if (!deduped.has(dedupeKey)) {
      deduped.set(dedupeKey, edition);
    }
  }

  return [...deduped.values()].sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
  );
}
