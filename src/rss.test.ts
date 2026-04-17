import test from "node:test";
import assert from "node:assert/strict";

import type { FeedDefinition } from "./config/feeds.js";
import { addEditionAnchors, cleanFeedHtml, cleanFeedText, sanitizeEditionHtml } from "./lib/rss.js";

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

test("addEditionAnchors converts overview numbers into in-page links and anchors detail headings", () => {
  const html = `
    <h2>概览</h2>
    <ul>
      <li>Anthropic 发布 Claude Opus 4.7 模型 <a href="https://example.com/story">↗</a> <code>#1</code></li>
      <li>OpenAI 发布 Codex 桌面端重大升级 <a href="https://example.com/story-2">↗</a> <code>#2</code></li>
    </ul>
    <hr>
    <h2><a href="https://example.com/story">Anthropic 发布 Claude Opus 4.7 模型</a> <code>#1</code></h2>
    <p>正文 1</p>
    <hr>
    <h2><a href="https://example.com/story-2">OpenAI 发布 Codex 桌面端重大升级</a> <code>#2</code></h2>
    <p>正文 2</p>
  `;

  const anchored = addEditionAnchors(html);

  assert.match(anchored, /<a href="#edition-item-1"><code>#1<\/code><\/a>/);
  assert.match(anchored, /<a href="#edition-item-2"><code>#2<\/code><\/a>/);
  assert.match(anchored, /<h2 id="edition-item-1"><a href="https:\/\/example.com\/story">Anthropic 发布 Claude Opus 4\.7 模型<\/a> <code>#1<\/code><\/h2>/);
  assert.match(anchored, /<h2 id="edition-item-2"><a href="https:\/\/example.com\/story-2">OpenAI 发布 Codex 桌面端重大升级<\/a> <code>#2<\/code><\/h2>/);
});

test("sanitizeEditionHtml keeps generated in-page anchors usable after sanitization", () => {
  const html = `
    <li>Anthropic 发布 Claude Opus 4.7 模型 <a href="https://example.com/story">↗</a> <a href="#edition-item-1"><code>#1</code></a></li>
    <h2 id="edition-item-1"><a href="https://example.com/story">Anthropic 发布 Claude Opus 4.7 模型</a> <code>#1</code></h2>
  `;

  const sanitized = sanitizeEditionHtml(html);

  assert.match(sanitized, /href="#edition-item-1"/);
  assert.match(sanitized, /id="edition-item-1"/);
  assert.match(sanitized, /href="https:\/\/example.com\/story"/);
});

test("realistic edition html links overview numbers to matching detail sections", () => {
  const html = `
    <p><img src="http://testtttt.oss-cn-guangzhou.aliyuncs.com/imagehub/20260417/20260417091142349873d853_cover_7985.png" alt=""></p>
    <h1>AI 早报 2026-04-17</h1>
    <p><strong>视频版</strong>：<a href="https://www.bilibili.com/video/BV1obdBBGEqp">哔哩哔哩</a> ｜ <a href="https://www.youtube.com/watch?v=9TtEAvawNLc">YouTube</a></p>
    <h2>概览</h2>
    <h3>要闻</h3>
    <ul>
      <li>Anthropic 发布 Claude Opus 4.7 模型 <a href="https://www.anthropic.com/news/claude-opus-4-7">↗</a> <code>#1</code></li>
      <li>OpenAI 发布 Codex 桌面端重大升级 <a href="https://openai.com/index/codex-for-almost-everything/">↗</a> <code>#2</code></li>
    </ul>
    <h3>前瞻与传闻</h3>
    <ul>
      <li>Anthropic 拟向美政府和英金融界开放 Claude Mythos <a href="https://www.bloomberg.com/news/articles/2026-04-16/anthropic-plans-to-bring-mythos-to-uk-banks-within-the-next-week?taid=69e0adaabd318b0001e84068&amp;utm_campaign=trueanthem&amp;utm_content=business&amp;utm_medium=social&amp;utm_source=twitter&amp;embedded-checkout=true">↗</a> <code>#20</code></li>
    </ul>
    <hr>
    <h2><a href="https://www.anthropic.com/news/claude-opus-4-7">Anthropic 发布 Claude Opus 4.7 模型</a> <code>#1</code></h2>
    <p>正文 1</p>
    <hr>
    <h2><a href="https://openai.com/index/codex-for-almost-everything/">OpenAI 发布 Codex 桌面端重大升级</a> <code>#2</code></h2>
    <p>正文 2</p>
    <hr>
    <h2><a href="https://www.bloomberg.com/news/articles/2026-04-16/anthropic-plans-to-bring-mythos-to-uk-banks-within-the-next-week?taid=69e0adaabd318b0001e84068&amp;utm_campaign=trueanthem&amp;utm_content=business&amp;utm_medium=social&amp;utm_source=twitter&amp;embedded-checkout=true">Anthropic 拟向美政府和英金融界开放 Claude Mythos</a> <code>#20</code></h2>
    <p>正文 20</p>
  `;

  const cleaned = cleanFeedHtml(juyaFeed, html);
  const anchored = addEditionAnchors(cleaned);
  const sanitized = sanitizeEditionHtml(anchored);

  assert.match(sanitized, /href="#edition-item-1"/);
  assert.match(sanitized, /href="#edition-item-2"/);
  assert.match(sanitized, /href="#edition-item-20"/);
  assert.match(sanitized, /<h2 id="edition-item-1"><a href="https:\/\/www\.anthropic\.com\/news\/claude-opus-4-7"[^>]*>Anthropic 发布 Claude Opus 4\.7 模型<\/a> <code>#1<\/code><\/h2>/);
  assert.match(sanitized, /<h2 id="edition-item-2"><a href="https:\/\/openai\.com\/index\/codex-for-almost-everything\/"[^>]*>OpenAI 发布 Codex 桌面端重大升级<\/a> <code>#2<\/code><\/h2>/);
  assert.match(sanitized, /<h2 id="edition-item-20"><a href="https:\/\/www\.bloomberg\.com\/news\/articles\/2026-04-16\/anthropic-plans-to-bring-mythos-to-uk-banks-within-the-next-week\?taid=69e0adaabd318b0001e84068&amp;utm_campaign=trueanthem&amp;utm_content=business&amp;utm_medium=social&amp;utm_source=twitter&amp;embedded-checkout=true"[^>]*>Anthropic 拟向美政府和英金融界开放 Claude Mythos<\/a> <code>#20<\/code><\/h2>/);
});
