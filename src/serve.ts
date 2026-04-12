import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const distDir = path.join(process.cwd(), "dist");
const port = Number(process.env.PORT || 4173);

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

async function createServer(): Promise<void> {
  await access(path.join(distDir, "index.html"));

  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    const incomingPath = url.pathname === "/" ? "/index.html" : url.pathname;
    const normalizedPath = path
      .normalize(decodeURIComponent(incomingPath))
      .replace(/^([/\\])+/, "");
    const resolvedPath = path.resolve(distDir, normalizedPath);
    const relativePath = path.relative(distDir, resolvedPath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    const filePath = resolvedPath;

    try {
      await access(filePath);
      const extension = path.extname(filePath).toLowerCase();
      response.writeHead(200, {
        "Content-Type": contentTypes[extension] ?? "application/octet-stream"
      });
      createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });

  server.listen(port, () => {
    console.log(`[preview] Serving dist at http://localhost:${port}`);
  });
}

const directRunTarget = process.argv[1];
if (directRunTarget && import.meta.url === pathToFileURL(directRunTarget).href) {
  createServer().catch((error: unknown) => {
    console.error("[preview] Failed to start preview server.");
    console.error(error);
    process.exitCode = 1;
  });
}
