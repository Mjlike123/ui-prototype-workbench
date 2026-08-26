import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const portalRoot = join(import.meta.dirname, "../apps/design-system-portal/public");

/** displaySize in logical px → minimum bitmap edge length */
const AVATAR_ASSETS = [
  { path: "icons/list/message-avatar.png", displaySize: 48 },
  { path: "prototypes/toptop-home/avatar-andrew.png", displaySize: 48 },
  { path: "prototypes/toptop-home/avatar-cassie.png", displaySize: 48 },
  { path: "prototypes/toptop-home/avatar-estelle.png", displaySize: 48 },
  { path: "prototypes/toptop-home/avatar-felix.png", displaySize: 48 },
  { path: "prototypes/toptop-home/friend-avatar.png", displaySize: 48 },
  { path: "prototypes/toptop-home/header-avatar.png", displaySize: 36 },
  { path: "prototypes/message/conversation-1.png", displaySize: 48 },
  { path: "prototypes/message/conversation-2.png", displaySize: 48 },
  { path: "prototypes/message/conversation-3.png", displaySize: 48 },
  { path: "prototypes/message/conversation-4.png", displaySize: 48 },
  { path: "prototypes/message/conversation-5.png", displaySize: 48 },
  { path: "prototypes/message/conversation-6.png", displaySize: 48 },
  { path: "prototypes/message/online-1.png", displaySize: 48 },
  { path: "prototypes/message/online-2.png", displaySize: 48 },
  { path: "prototypes/message/online-3.png", displaySize: 48 },
  { path: "prototypes/message/online-4.png", displaySize: 48 },
  { path: "prototypes/message/group-1.png", displaySize: 28 },
  { path: "prototypes/message/group-2.png", displaySize: 28 },
  { path: "prototypes/message/group-3.png", displaySize: 28 },
  { path: "prototypes/message/group-4.png", displaySize: 28 },
];

function readPixelWidth(absolutePath) {
  const output = execFileSync("sips", ["-g", "pixelWidth", absolutePath], {
    encoding: "utf8",
  });
  const match = output.match(/pixelWidth:\s*(\d+)/);
  return match ? Number(match[1]) : 0;
}

function resizeToSquare(absolutePath, targetSize) {
  execFileSync("sips", ["-z", String(targetSize), String(targetSize), absolutePath], {
    stdio: "inherit",
  });
}

let upgraded = 0;

for (const asset of AVATAR_ASSETS) {
  const absolutePath = join(portalRoot, asset.path);
  if (!existsSync(absolutePath)) {
    console.warn(`skip missing ${asset.path}`);
    continue;
  }

  const targetSize = asset.displaySize * 3;
  const currentSize = readPixelWidth(absolutePath);

  if (currentSize >= targetSize) {
    console.log(`ok ${asset.path} (${currentSize}px >= ${targetSize}px)`);
    continue;
  }

  resizeToSquare(absolutePath, targetSize);
  upgraded += 1;
  console.log(`upscaled ${asset.path}: ${currentSize}px → ${targetSize}px`);
}

console.log(`Done. Upscaled ${upgraded} avatar asset(s) to @3x.`);
