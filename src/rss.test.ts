import test from "node:test";
import assert from "node:assert/strict";

import type { FeedDefinition } from "./config/feeds.js";
import { cleanFeedHtml, cleanFeedText, sanitizeEditionHtml } from "./lib/rss.js";

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

test("sanitizeEditionHtml preserves same-page anchor targets and ids", () => {
  const html = `
    <p><a href="#1">#1</a></p>
    <h2 id="1">Anthropic 发布 Claude Opus 4.7 模型</h2>
  `;

  const sanitized = sanitizeEditionHtml(html);

  assert.match(sanitized, /href="#1"/);
  assert.match(sanitized, /<h2 id="1">/);
  assert.doesNotMatch(sanitized, /target="_blank"/);
  assert.doesNotMatch(sanitized, /rel="noreferrer noopener"/);
});

test("sanitizeEditionHtml keeps external links opening in a new tab", () => {
  const html = `<p><a href="https://example.com/story">查看原文</a></p>`;

  const sanitized = sanitizeEditionHtml(html);

  assert.match(sanitized, /href="https:\/\/example.com\/story"/);
  assert.match(sanitized, /target="_blank"/);
  assert.match(sanitized, /rel="noreferrer noopener"/);
});
