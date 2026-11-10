#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(
  root,
  ".monkren/ix-design/app-login-flow-2026-10-23/exports",
);
const baseUrl =
  process.env.CAPTURE_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

const shots = [
  { state: "landing", file: "login-landing-375.png", width: 375, height: 812 },
  { state: "phone", file: "login-phone-375.png", width: 375, height: 812 },
  { state: "otp-error", file: "login-otp-error-375.png", width: 375, height: 812 },
  { state: "success", file: "login-success-375.png", width: 375, height: 812 },
  { state: "landing", file: "login-landing-466.png", width: 466, height: 678 },
  { state: "phone", file: "login-phone-466.png", width: 466, height: 678 },
  { state: "otp-error", file: "login-otp-error-466.png", width: 466, height: 678 },
  { state: "success", file: "login-success-466.png", width: 466, height: 678 },
  { state: "landing", file: "login-landing-890.png", width: 890, height: 626 },
  { state: "phone", file: "login-phone-890.png", width: 890, height: 626 },
  { state: "otp-error", file: "login-otp-error-890.png", width: 890, height: 626 },
  { state: "success", file: "login-success-890.png", width: 890, height: 626 },
];

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  const manifest = { baseUrl, capturedAt: new Date().toISOString(), files: [] };

  for (const shot of shots) {
    await page.setViewportSize({
      width: Math.max(shot.width + 80, 520),
      height: Math.max(shot.height + 140, 760),
    });
    const url = `${baseUrl}/prototype-runtime/studio/app-login-flow?theme=light&width=${shot.width}&height=${shot.height}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
    const device = page.locator(".studioLoginDevice");
    await device.waitFor({ state: "visible" });

    if (shot.state !== "landing") {
      await page.waitForFunction(() => {
        const button = document.querySelector(".studioLoginFlowControl");
        return (
          button &&
          Object.getOwnPropertyNames(button).some((key) =>
            key.startsWith("__reactProps"),
          )
        );
      });
    }

    if (shot.state === "phone") {
      await device.getByRole("button", { name: /手机号/ }).click();
      await device.getByRole("heading", { name: "使用手机号登录" }).waitFor();
    } else if (shot.state === "otp-error") {
      await page.getByRole("tab", { name: "验证码错误" }).click();
      await device.getByText("验证码不正确，请重新输入").waitFor();
    } else if (shot.state === "success") {
      await page.getByRole("tab", { name: "成功" }).click();
      await device.getByRole("heading", { name: "登录成功" }).waitFor();
    }

    const filePath = path.join(outDir, shot.file);
    await device.screenshot({ path: filePath });
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
