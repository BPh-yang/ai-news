import process from "node:process";
import { pathToFileURL } from "node:url";

import cron from "node-cron";

import { siteConfig } from "./config/feeds.js";
import { buildSite } from "./build.js";

const cronExpression = "0 8 * * *";

export async function startScheduler(): Promise<void> {
  console.log(
    `[scheduler] Starting daily AI news scheduler with cron "${cronExpression}" (${siteConfig.timezone}).`
  );

  cron.schedule(
    cronExpression,
    async () => {
      console.log("[scheduler] Running scheduled build...");
      try {
        const output = await buildSite();
        console.log(
          `[scheduler] Build completed. Latest edition: ${output.editions[0]?.title ?? "unknown"}.`
        );
      } catch (error: unknown) {
        console.error("[scheduler] Scheduled build failed.");
        console.error(error);
      }
    },
    {
      timezone: siteConfig.timezone
    }
  );

  try {
    await buildSite();
    console.log("[scheduler] Initial build completed.");
  } catch (error: unknown) {
    console.error("[scheduler] Initial build failed, but the daily schedule remains active.");
    console.error(error);
  }
}

const directRunTarget = process.argv[1];
if (directRunTarget && import.meta.url === pathToFileURL(directRunTarget).href) {
  startScheduler().catch((error: unknown) => {
    console.error("[scheduler] Failed to start scheduler.");
    console.error(error);
    process.exitCode = 1;
  });
}
