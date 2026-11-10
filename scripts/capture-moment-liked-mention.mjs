#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(
  root,
  ".monkren/ix-design/moment-structure-liked-mention-2026-10-28/exports",
);
const baseUrl =
  process.env.CAPTURE_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

const shots = [
  {
    state: "feed-open",
    file: "moment-feed-open-375.png",
    width: 375,
    height: 812,
    scene: "feed-structure",
    region: "open",
  },
  {
    state: "feed-closed",
    file: "moment-feed-closed-375.png",
    width: 375,
    height: 812,
    scene: "feed-structure",
    region: "closed",
  },
  {
    state: "liked-list",
    file: "moment-liked-list-375.png",
    width: 375,
    height: 812,
    scene: "liked-list",
  },
  {
    state: "profile-liked-entry",
    file: "moment-profile-liked-375.png",
    width: 375,
    height: 812,
    scene: "profile-liked",
  },
  {
    state: "compose-mention",
    file: "moment-compose-mention-375.png",
    width: 375,
    height: 812,
    scene: "compose-mention",
    openMention: true,
  },
  {
    state: "notifications-dialog",
    file: "moment-notify-clear-375.png",
    width: 375,
    height: 812,
    scene: "notifications",
    openClearDialog: true,
  },
  {
    state: "feed-open",
    file: "moment-feed-open-466.png",
    width: 466,
    height: 678,
    scene: "feed-structure",
    region: "open",
  },
  {
    state: "liked-list",
    file: "moment-liked-list-466.png",
    width: 466,
    height: 678,
    scene: "liked-list",
  },
  {
    state: "feed-open",
    file: "moment-feed-open-890.png",
    width: 890,
    height: 626,
    scene: "feed-structure",
    region: "open",
  },
  {
    state: "liked-list",
    file: "moment-liked-list-890.png",
    width: 890,
    height: 626,
    scene: "liked-list",
  },
];

function buildUrl(shot) {
  const params = new URLSearchParams({
    theme: "light",
    width: String(shot.width),
    height: String(shot.height),
    scene: shot.scene,
  });
  if (shot.region) params.set("region", shot.region);
  return `${baseUrl}/prototype-runtime/studio/moment-liked-mention?${params}`;
}

function shotLocator(page, shot) {
  if (shot.scene === "feed-structure") {
    return page.locator(
      `[data-capture-scene="${shot.scene}"] .prototypeDestinationDevice--feed`,
    );
  }
  if (shot.scene === "liked-list") {
    return page.locator('[data-capture-scene="liked-list"]');
  }
  if (shot.scene === "compose-mention") {
    return page.locator(".feedComposeDevice");
  }
  if (shot.scene === "notifications") {
    return page.locator('[data-capture-scene="notifications"]');
  }
  return page.locator(".pageCanvasDevice").first();
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  const manifest = { baseUrl, capturedAt: new Date().toISOString(), files: [] };

  for (const shot of shots) {
    await page.setViewportSize({
      width: Math.max(shot.width + 80, 520),
      height: Math.max(shot.height + 160, 780),
    });
    const url = buildUrl(shot);
    await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });

    const target = shotLocator(page, shot);
    await target.waitFor({ state: "visible", timeout: 30_000 });

    if (shot.openMention) {
      await page.getByRole("button", { name: "提及好友" }).click();
      await page
        .getByRole("dialog", { name: "提及好友" })
        .waitFor({ state: "visible" });
      await page
        .getByRole("button", { name: /Latifa Alghanim/ })
        .click();
      await page.waitForTimeout(350);
    }

    if (shot.openClearDialog) {
      await page.getByRole("button", { name: "清空" }).click();
      await page
        .getByRole("dialog", { name: "清空全部通知？" })
        .waitFor({ state: "visible" });
      await page.waitForTimeout(350);
    }

    const filePath = path.join(outDir, shot.file);
    await target.screenshot({ path: filePath });
    manifest.files.push({ ...shot, path: filePath, url });
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
