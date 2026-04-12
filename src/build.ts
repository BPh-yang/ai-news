import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { feeds } from "./config/feeds.js";
import { renderIndexPage, renderIssuePage, renderStyles } from "./lib/render.js";
import { fetchIssues } from "./lib/rss.js";
import type { BuildOutput } from "./lib/types.js";
import { writeJsonFile, writeTextFile } from "./lib/utils.js";

const projectRoot = process.cwd();

export async function buildSite(): Promise<BuildOutput> {
  const issues = await fetchIssues(feeds);

  if (issues.length === 0) {
    throw new Error("No RSS items were fetched. Build aborted.");
  }

  const output: BuildOutput = {
    generatedAt: new Date().toISOString(),
    issueCount: issues.length,
    latestIssueSlug: issues[0].slug,
    issues
  };

  const distDir = path.join(projectRoot, "dist");
  const sharedDataPath = path.join(projectRoot, "data", "issues.json");
  const distDataPath = path.join(distDir, "data", "issues.json");
  const stylesheetPath = path.join(distDir, "assets", "styles.css");
  const indexPath = path.join(distDir, "index.html");

  await Promise.all([
    writeJsonFile(sharedDataPath, output),
    writeJsonFile(distDataPath, output),
    writeTextFile(stylesheetPath, renderStyles()),
    writeTextFile(indexPath, renderIndexPage(output))
  ]);

  await Promise.all(
    issues.map((issue) =>
      writeTextFile(
        path.join(distDir, "issues", `${issue.slug}.html`),
        renderIssuePage(issue, issues)
      )
    )
  );

  return output;
}

async function run(): Promise<void> {
  const output = await buildSite();
  const latestIssue = output.issues[0];

  console.log(
    `[build] Generated ${output.issueCount} issues. Latest: ${latestIssue.title} (${latestIssue.slug}).`
  );
}

const directRunTarget = process.argv[1];
if (directRunTarget && import.meta.url === pathToFileURL(directRunTarget).href) {
  run().catch((error: unknown) => {
    console.error("[build] Failed to generate AI news site.");
    console.error(error);
    process.exitCode = 1;
  });
}
