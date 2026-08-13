#!/usr/bin/env node

import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "skill", "manifest.json");

async function main() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const docs = Object.entries(manifest.contents?.docs ?? {});
  const destinations = manifest.contents?.specs ?? [];

  if (docs.length === 0 || destinations.length === 0) {
    throw new Error("skill/manifest.json 缺少 contents.docs 或 contents.specs");
  }

  for (const [source] of docs) {
    await stat(join(root, source));
  }

  for (const destination of destinations) {
    const destinationPath = join(root, destination);
    await mkdir(destinationPath, { recursive: true });
    for (const [source, filename] of docs) {
      await copyFile(join(root, source), join(destinationPath, filename));
    }
  }

  console.log(
    `Synced ${docs.length} docs into ${destinations.length} Agent skills.`,
  );
}

main().catch((error) => {
  console.error(`skill:sync-specs failed: ${error.message}`);
  process.exit(1);
});
