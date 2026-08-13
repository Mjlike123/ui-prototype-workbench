#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "skill", "manifest.json");

function hash(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function main() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const docs = Object.entries(manifest.contents?.docs ?? {});
  const destinations = manifest.contents?.specs ?? [];
  const drift = [];

  for (const [source, filename] of docs) {
    const expected = hash(await readFile(join(root, source)));
    for (const destination of destinations) {
      const copyPath = join(root, destination, filename);
      try {
        const actual = hash(await readFile(copyPath));
        if (actual !== expected) {
          drift.push(`${destination}${filename}: hash mismatch`);
        }
      } catch {
        drift.push(`${destination}${filename}: missing`);
      }
    }
  }

  if (drift.length > 0) {
    console.error("Skill spec drift detected:");
    drift.forEach((item) => console.error(`- ${item}`));
    console.error("Run `npm run skill:sync-specs`.");
    process.exit(1);
  }

  console.log(
    `Skill specs in sync (${docs.length} docs × ${destinations.length} skills).`,
  );
}

main().catch((error) => {
  console.error(`skill:check failed: ${error.message}`);
  process.exit(1);
});
