#!/usr/bin/env node
/**
 * Export black-background prototype PNGs for recipe community redesign.
 * Usage: node scripts/capture-recipe-community-design.mjs
 * Requires: portal built or dev on CAPTURE_BASE_URL (default http://localhost:3000)
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(
  root,
  ".monkren/ix-design/recipe-community-home-2026-10-16/exports",
);

const baseUrl =
  process.env.CAPTURE_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

const shots = [
  { scene: "quality", file: "selected-quality-direction-375.png", width: 375, height: 812 },
  {
    scene: "quality",
    state: "slot-selection",
    file: "selected-quality-write-slots-375.png",
    width: 375,
    height: 812,
  },
  {
    scene: "quality",
    state: "write-success",
    file: "selected-quality-write-success-375.png",
    width: 375,
    height: 812,
  },
  { scene: "quality", file: "selected-quality-direction-466.png", width: 466, height: 678 },
  { scene: "quality", file: "selected-quality-direction-890.png", width: 890, height: 626 },
  { scene: "filmsim", file: "scheme-d-filmsim-reference-home.png", width: 375, height: 812 },
  { scene: "fujistyle", file: "scheme-a-fujistyle-home.png", width: 375, height: 812 },
  { scene: "fuji-recipes", file: "scheme-b-fuji-recipes-home.png", width: 375, height: 812 },
  { scene: "recipe-room", file: "scheme-c-recipe-room-home.png", width: 375, height: 812 },
  { scene: "compare", file: "module-comparison-table.png", width: 375, height: 812 },
];

async function main() {
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 430, height: 920 },
    deviceScaleFactor: 2,
  });

  const manifest = { baseUrl, capturedAt: new Date().toISOString(), files: [] };

  for (const shot of shots) {
    await page.setViewportSize({
      width: Math.max(shot.width + 40, 430),
      height: Math.max(shot.height + 80, 720),
    });
    const url = `${baseUrl}/prototype-runtime/studio/recipe-community-redesign?theme=dark&scene=${shot.scene}&width=${shot.width}&height=${shot.height}`;
    await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
    await page.waitForSelector(".pageCanvasDevice, .studioRecipeCommunityCompare", {
      timeout: 30_000,
    });
    if (shot.state === "slot-selection" || shot.state === "write-success") {
      await page.locator(".studioRecipeQualityWriteButton").click();
      await page.locator(".studioRecipeQualitySheet").waitFor();
    }
    if (shot.state === "write-success") {
      await page.locator(".studioRecipeQualitySlotList .regularListMain").first().click();
      await page.locator(".studioRecipeQualityStatusIcon--success").waitFor();
    }
    const selector =
      shot.scene === "compare"
        ? ".studioRecipeCommunityCompare"
        : ".pageCanvasDevice";
    const filePath = path.join(outDir, shot.file);
    await page.locator(selector).first().screenshot({ path: filePath });
    manifest.files.push({
      scene: shot.scene,
      state: shot.state ?? "default",
      width: shot.width,
      height: shot.height,
      path: filePath,
      url,
    });
    console.log(`Wrote ${filePath}`);
  }

  await browser.close();
  await writeFile(
    path.join(outDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
