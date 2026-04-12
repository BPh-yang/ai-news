import { siteConfig } from "../config/feeds.js";
import type { BuildOutput, NewsIssue } from "./types.js";
import { escapeHtml, formatDate, formatDateShort } from "./utils.js";

function pageShell({
  title,
  description,
  stylesheetPath,
  body,
  latestIssue
}: {
  title: string;
  description: string;
  stylesheetPath: string;
  body: string;
  latestIssue: NewsIssue;
}): string {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />
    ${
      latestIssue.coverImage
        ? `<meta property="og:image" content="${escapeHtml(latestIssue.coverImage)}" />`
        : ""
    }
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@500;700;900&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="${stylesheetPath}" />
  </head>
  <body>
    ${body}
  </body>
</html>`;
}

function renderIssueCards(issues: NewsIssue[]): string {
  return issues
    .map(
      (issue) => `
        <a class="issue-card" href="./issues/${encodeURIComponent(issue.slug)}.html">
          <div class="issue-card__meta">
            <span>${escapeHtml(formatDateShort(issue.publishedAt, siteConfig.locale))}</span>
          </div>
          <h3>${escapeHtml(issue.title)}</h3>
          <p>${escapeHtml(issue.summary)}</p>
          <span class="issue-card__link">查看详情</span>
        </a>
      `
    )
    .join("\n");
}

export function renderIndexPage(output: BuildOutput): string {
  const latestIssue = output.issues[0];
  const archiveIssues = output.issues.slice(1);

  const body = `
    <div class="site-shell">
      <div class="site-shell__grain"></div>
      <header class="hero">
        <div class="hero__eyebrow">${escapeHtml(siteConfig.subtitle)}</div>
        <div class="hero__header-row">
          <div>
            <p class="hero__brand">每日 AI 资讯早报</p>
            <h1>${escapeHtml(siteConfig.title)}</h1>
            <p class="hero__lead">
              每天自动抓取 AI 资讯，去掉冗余的视频版信息，隐藏来源展示，并整理成更适合阅读与归档的静态早报页面。
            </p>
          </div>
          <div class="hero__stats">
            <div>
              <span>最新更新时间</span>
              <strong>${escapeHtml(formatDate(output.generatedAt, siteConfig.locale))}</strong>
            </div>
            <div>
              <span>收录期数</span>
              <strong>${output.issueCount}</strong>
            </div>
            <div>
              <span>更新计划</span>
              <strong>${escapeHtml(siteConfig.scheduleLabel)}</strong>
            </div>
          </div>
        </div>
      </header>

      <main class="layout">
        <section class="feature-panel">
          <div class="feature-panel__header">
            <div>
              <p class="section-kicker">Latest issue</p>
              <h2>${escapeHtml(latestIssue.title)}</h2>
            </div>
            <a class="ghost-link" href="./issues/${encodeURIComponent(latestIssue.slug)}.html">打开完整页</a>
          </div>
          <div class="feature-panel__meta">
            <span>${escapeHtml(formatDate(latestIssue.publishedAt, siteConfig.locale))}</span>
          </div>
          <p class="feature-panel__summary">${escapeHtml(latestIssue.summary)}</p>
          <article class="issue-content">${latestIssue.contentHtml}</article>
        </section>

        <aside class="archive-panel">
          <div class="archive-panel__sticky">
            <div class="archive-panel__header">
              <p class="section-kicker">Archive</p>
              <h2>往期日报</h2>
            </div>
            <div class="issue-grid">
              ${renderIssueCards(archiveIssues.length > 0 ? archiveIssues : [latestIssue])}
            </div>
          </div>
        </aside>
      </main>
    </div>
  `;

  return pageShell({
    title: `${latestIssue.title} · ${siteConfig.title}`,
    description: latestIssue.summary || siteConfig.description,
    stylesheetPath: "./assets/styles.css",
    body,
    latestIssue
  });
}

export function renderIssuePage(issue: NewsIssue, allIssues: NewsIssue[]): string {
  const related = allIssues.filter((candidate) => candidate.id !== issue.id).slice(0, 6);
  const body = `
    <div class="site-shell site-shell--detail">
      <div class="site-shell__grain"></div>
      <header class="detail-hero">
        <a class="ghost-link" href="../index.html">← 返回首页</a>
        <div class="detail-hero__copy">
          <p class="hero__brand">${escapeHtml(siteConfig.title)}</p>
          <h1>${escapeHtml(issue.title)}</h1>
          <p class="hero__lead">${escapeHtml(issue.summary)}</p>
          <div class="feature-panel__meta">
            <span>${escapeHtml(formatDate(issue.publishedAt, siteConfig.locale))}</span>
          </div>
        </div>
      </header>

      <main class="layout layout--detail">
        <section class="feature-panel">
          <article class="issue-content">${issue.contentHtml}</article>
        </section>
        <aside class="archive-panel">
          <div class="archive-panel__sticky">
            <div class="archive-panel__header">
              <p class="section-kicker">More issues</p>
              <h2>继续阅读</h2>
            </div>
            <div class="issue-grid">
              ${renderIssueCards(related)}
            </div>
          </div>
        </aside>
      </main>
    </div>
  `;

  return pageShell({
    title: `${issue.title} · ${siteConfig.title}`,
    description: issue.summary || siteConfig.description,
    stylesheetPath: "../assets/styles.css",
    body,
    latestIssue: issue
  });
}

export function renderStyles(): string {
  return `
:root {
  --bg: #0b1119;
  --bg-soft: rgba(18, 26, 38, 0.84);
  --panel: rgba(14, 19, 31, 0.78);
  --panel-strong: rgba(8, 12, 20, 0.92);
  --line: rgba(255, 255, 255, 0.12);
  --text: #f5efe3;
  --muted: rgba(245, 239, 227, 0.7);
  --accent: #f3a65a;
  --accent-2: #8dc6ff;
  --shadow: 0 30px 90px rgba(0, 0, 0, 0.35);
  --radius-xl: 28px;
  --radius-lg: 22px;
  --radius-md: 16px;
  --content-width: 1500px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  color: var(--text);
  background:
    radial-gradient(circle at top left, rgba(243, 166, 90, 0.18), transparent 25%),
    radial-gradient(circle at top right, rgba(141, 198, 255, 0.16), transparent 30%),
    linear-gradient(135deg, #06080d 0%, #0c1420 45%, #111a27 100%);
  font-family: "Noto Sans SC", sans-serif;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(circle at center, black 20%, transparent 80%);
  pointer-events: none;
}

a {
  color: inherit;
}

img {
  max-width: 100%;
  display: block;
}

.site-shell {
  position: relative;
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.site-shell__grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.08;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
}

.hero,
.detail-hero {
  position: relative;
  overflow: hidden;
  padding: 36px;
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  background: linear-gradient(145deg, rgba(11, 17, 25, 0.95), rgba(18, 31, 45, 0.72));
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
}

.hero::after,
.detail-hero::after {
  content: "";
  position: absolute;
  inset: auto -15% -45% auto;
  width: 360px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(243, 166, 90, 0.24), transparent 68%);
}

.hero__eyebrow,
.section-kicker,
.hero__brand {
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.76rem;
  color: var(--accent-2);
}

.hero__brand {
  font-family: "Ma Shan Zheng", cursive;
  font-size: 1.6rem;
  text-transform: none;
  letter-spacing: 0.04em;
  color: var(--accent);
}

.hero__header-row {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(280px, 0.9fr);
  gap: 28px;
  align-items: start;
}

.hero h1,
.detail-hero h1,
.archive-panel h2,
.feature-panel h2,
.issue-card h3 {
  margin: 0;
  font-family: "Noto Serif SC", serif;
  line-height: 1.1;
}

.hero h1 {
  max-width: 12ch;
  font-size: clamp(2.8rem, 7vw, 5.6rem);
}

.detail-hero h1,
.feature-panel h2 {
  font-size: clamp(2rem, 4vw, 3rem);
}

.hero__lead,
.feature-panel__summary,
.issue-card p {
  color: var(--muted);
  line-height: 1.8;
}

.hero__lead {
  max-width: 62ch;
  margin: 18px 0 0;
  font-size: 1.03rem;
}

.hero__stats {
  display: grid;
  gap: 16px;
}

.hero__stats div,
.feature-panel,
.archive-panel__sticky {
  background: var(--bg-soft);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
}

.hero__stats div {
  padding: 18px 20px;
}

.hero__stats span,
.feature-panel__meta,
.issue-card__meta,
.ghost-link {
  color: var(--muted);
  font-size: 0.92rem;
}

.hero__stats strong {
  display: block;
  margin-top: 6px;
  font-size: 1.15rem;
  color: var(--text);
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.75fr) minmax(320px, 0.95fr);
  gap: 24px;
  margin-top: 28px;
}

.layout--detail {
  align-items: start;
}

.feature-panel {
  padding: 30px;
  box-shadow: var(--shadow);
}

.feature-panel__header,
.archive-panel__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
}

.feature-panel__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin: 18px 0 12px;
}

.feature-panel__meta a,
.ghost-link,
.issue-card__link {
  text-decoration: none;
  color: var(--accent);
}

.issue-content {
  margin-top: 26px;
}

.issue-content > :first-child {
  margin-top: 0;
}

.issue-content h1,
.issue-content h2,
.issue-content h3,
.issue-content h4 {
  margin: 1.8em 0 0.55em;
  font-family: "Noto Serif SC", serif;
  line-height: 1.24;
}

.issue-content h1 {
  font-size: clamp(2rem, 3vw, 2.8rem);
}

.issue-content h2 {
  padding-top: 18px;
  border-top: 1px solid var(--line);
  font-size: clamp(1.45rem, 2.4vw, 2rem);
}

.issue-content h3 {
  font-size: 1.24rem;
}

.issue-content p,
.issue-content li,
.issue-content blockquote {
  color: rgba(245, 239, 227, 0.9);
  line-height: 1.9;
  font-size: 1rem;
}

.issue-content ul,
.issue-content ol {
  padding-left: 1.4rem;
}

.issue-content li + li {
  margin-top: 0.5rem;
}

.issue-content img {
  margin: 24px 0;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.26);
}

.issue-content blockquote {
  margin: 20px 0;
  padding: 18px 20px;
  border-left: 3px solid var(--accent);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 0 16px 16px 0;
}

.issue-content code {
  padding: 0.15rem 0.4rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  font-family: "SFMono-Regular", "Monaco", monospace;
  font-size: 0.92em;
}

.issue-content pre {
  overflow-x: auto;
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
}

.archive-panel__sticky {
  position: sticky;
  top: 24px;
  padding: 24px;
}

.issue-grid {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.issue-card {
  position: relative;
  display: block;
  padding: 18px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
  text-decoration: none;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.issue-card:hover {
  transform: translateY(-2px);
  border-color: rgba(243, 166, 90, 0.45);
  background: linear-gradient(180deg, rgba(243, 166, 90, 0.08), rgba(255, 255, 255, 0.03));
}

.issue-card__meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.issue-card__source {
  color: var(--accent-2);
}

.issue-card h3 {
  margin-bottom: 10px;
  font-size: 1.18rem;
}

.issue-card p {
  margin: 0 0 12px;
  font-size: 0.94rem;
}

.detail-hero {
  display: grid;
  gap: 22px;
}

@media (max-width: 1100px) {
  .hero__header-row,
  .layout {
    grid-template-columns: 1fr;
  }

  .archive-panel__sticky {
    position: static;
  }
}

@media (max-width: 720px) {
  .site-shell {
    padding: 18px 14px 56px;
  }

  .hero,
  .detail-hero,
  .feature-panel,
  .archive-panel__sticky {
    padding: 22px;
  }

  .hero h1 {
    font-size: 2.5rem;
  }

  .feature-panel__header,
  .archive-panel__header,
  .issue-card__meta,
  .feature-panel__meta {
    flex-direction: column;
    align-items: start;
  }
}
`;
}
