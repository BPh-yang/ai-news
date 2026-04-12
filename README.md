# AI News Daily

一个从 RSS 自动抓取 AI 资讯、生成美观静态页面，并支持每天早上 8 点自动更新的项目。

## 当前实现

- 支持通过 `src/config/feeds.ts` 配置多个 RSS 源
- 抓取 RSS 后生成标准化数据
- 输出一个偏编辑部风格的静态页面到 `dist/`
- 生成每期单独详情页与 `dist/data/issues.json`
- 提供本地预览服务
- 提供本地定时任务脚本（每天早上 8 点，Asia/Shanghai）
- 提供 GitHub Actions 定时工作流（UTC 00:00，对应北京时间 08:00）

## 快速开始

```bash
npm install
npm run build
npm run preview
```

访问：`http://localhost:4173`

## 常用命令

### 1) 立即抓取并生成页面

```bash
npm run build
```

### 2) 启动本地定时任务

```bash
npm run schedule
```

启动后会先立刻执行一次抓取，然后每天北京时间早上 8 点再次执行。

### 3) 本地预览静态页面

```bash
npm run preview
```

## 增加更多 RSS 源

编辑 `src/config/feeds.ts`：

```ts
export const feeds = [
  {
    id: "juya-ai-daily",
    title: "橘鸦 AI 早报",
    url: "https://imjuya.github.io/juya-ai-daily/rss.xml"
  },
  {
    id: "another-feed",
    title: "Another Feed",
    url: "https://example.com/rss.xml"
  }
];
```

## GitHub Actions 每天 8 点自动执行

项目已经附带 `.github/workflows/daily-ai-news.yml`。

如果你把仓库推到 GitHub：

1. 打开 **Settings → Pages**
2. 将 **Build and deployment** 设置为 **GitHub Actions**
3. 保持默认分支为 `main`

之后工作流会每天北京时间 8 点构建并发布最新静态页面。

## 输出结构

```text
dist/
  index.html
  issues/
    issue-57.html
    issue-56.html
  assets/
    styles.css
  data/
    issues.json
data/
  issues.json
```

## 说明

- 页面会对 RSS 中的 HTML 内容做服务端清洗，避免把不安全标签直接输出到页面。
- 当前这一个 RSS 源本身就是"日报型"输出，所以首页展示为"最新一期 + 往期归档"的阅读体验。
- 后续如果你给我更多 RSS 源，我可以继续把它改成真正的多源聚合新闻门户。
