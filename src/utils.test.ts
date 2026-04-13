import test from "node:test";
import assert from "node:assert/strict";

import {
  extractCoverImage,
  getPreferredSlug,
  slugify,
  stripHtml,
  truncateText
} from "./lib/utils.js";

test("slugify keeps chinese text and normalizes separators", () => {
  assert.equal(slugify("AI 早报 / Edition #57"), "ai-早报-edition-57");
});

test("stripHtml removes tags and normalizes whitespace", () => {
  assert.equal(stripHtml("<p>Hello <strong>world</strong></p>"), "Hello world");
});

test("truncateText appends ellipsis when text is too long", () => {
  assert.equal(truncateText("abcdef", 4), "abcd…");
});

test("extractCoverImage prefers https image when available", () => {
  const html = '<img src="http://foo/bar.png" /><img src="https://foo/baz.png" />';
  assert.equal(extractCoverImage(html), "https://foo/baz.png");
});

test("getPreferredSlug uses link path when possible", () => {
  assert.equal(getPreferredSlug("https://example.com/editions/edition-57/", "fallback"), "edition-57");
});
