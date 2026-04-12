import test from "node:test";
import assert from "node:assert/strict";

import type { FeedDefinition } from "./config/feeds.js";
import { cleanFeedHtml, cleanFeedText } from "./lib/rss.js";

const juyaFeed: FeedDefinition = {
  id: "frontline-briefing",
  title: "Ai前哨战",
  profile: "juya-ai-daily",
  url: "https://imjuya.github.io/juya-ai-daily/rss.xml"
};

test("cleanFeedHtml removes the video section for juya ai daily", () => {
  const html = `
    <h1>AI 早报 2026-04-12</h1>
    <p><strong>视频版</strong>：<a href="https://example.com/video">哔哩哔哩</a> ｜ <a href="https://example.com/youtube">YouTube</a></p>
    <h2>概览</h2>
  `;

  const cleaned = cleanFeedHtml(juyaFeed, html);

  assert.doesNotMatch(cleaned, /视频版/);
  assert.match(cleaned, /概览/);
});

test("cleanFeedText removes video text and brand mentions for juya ai daily", () => {
  const text = "橘鸦 AI 早报 2026-04-12 视频版：哔哩哔哩 ｜ YouTube 概览 要闻";

  const cleaned = cleanFeedText(juyaFeed, text);

  assert.equal(cleaned, "AI 早报 2026-04-12 概览 要闻");
});

test("cleanFeedHtml removes juya promotional footer", () => {
  const html = `
    <p>正文内容</p>
    <p>作者<code>Juya</code>，视频版在同名<strong>哔哩哔哩</strong>。欢迎<strong>点赞、关注、分享</strong>。</p>
  `;

  const cleaned = cleanFeedHtml(juyaFeed, html);

  assert.equal(cleaned, "<p>正文内容</p>");
});
