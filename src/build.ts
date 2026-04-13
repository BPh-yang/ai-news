import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { feeds } from "./config/feeds.js";
import { renderEditionPage, renderIndexPage, renderStyles } from "./lib/render.js";
import { fetchEditions } from "./lib/rss.js";
import type { BuildOutput } from "./lib/types.js";
import { writeJsonFile, writeTextFile } from "./lib/utils.js";

const projectRoot = process.cwd();

export async function buildSite(): Promise<BuildOutput> {
  const editions = await fetchEditions(feeds);

  if (editions.length === 0) {
    throw new Error("No RSS entries were fetched. Build aborted.");
  }

  const output: BuildOutput = {
    generatedAt: new Date().toISOString(),
    editionCount: editions.length,
    latestEditionSlug: editions[0].slug,
    editions
  };

  const distDir = path.join(projectRoot, "dist");
  const sharedDataPath = path.join(projectRoot, "data", "editions.json");
  const distDataPath = path.join(distDir, "data", "editions.json");
  const stylesheetPath = path.join(distDir, "assets", "styles.css");
  const indexPath = path.join(distDir, "index.html");

  await Promise.all([
    writeJsonFile(sharedDataPath, output),
    writeJsonFile(distDataPath, output),
    writeTextFile(stylesheetPath, renderStyles()),
    writeTextFile(indexPath, renderIndexPage(output))
  ]);

  await Promise.all(
    editions.map((edition) =>
      writeTextFile(
        path.join(distDir, "editions", `${edition.slug}.html`),
        renderEditionPage(edition, editions)
      )
    )
  );

  return output;
}

async function run(): Promise<void> {
  const output = await buildSite();
  const latestEdition = output.editions[0];

  console.log(
    `[build] Generated ${output.editionCount} editions. Latest: ${latestEdition.title} (${latestEdition.slug}).`
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
