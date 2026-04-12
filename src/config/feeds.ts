export type FeedDefinition = {
  id: string;
  title: string;
  profile?: "default" | "juya-ai-daily";
  url: string;
};

export const feeds: FeedDefinition[] = [
  {
    id: "frontline-briefing",
    title: "Ai前哨战",
    profile: "juya-ai-daily",
    url: "https://imjuya.github.io/juya-ai-daily/rss.xml"
  }
];

export const siteConfig = {
  title: "Ai前哨战",
  subtitle: "每天早上 8 点自动更新的 AI 资讯日报",
  description:
    "每天自动抓取 AI 资讯，清洗订阅内容，并整理成更适合阅读的静态早报页面。",
  scheduleLabel: "每日 08:00",
  timezone: "Asia/Shanghai",
  locale: "zh-CN"
} as const;
