import { readUiSnapshotJson } from "./json.js";
import type { UiSnapshot } from "../types.js";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type LookinCollector = {
  collectCurrentPage(): Promise<UiSnapshot>;
};

export class LookinJsonCollector implements LookinCollector {
  constructor(private readonly exportPath: string) {}

  async collectCurrentPage(): Promise<UiSnapshot> {
    return readUiSnapshotJson(this.exportPath);
  }
}

export type RealLookinCollectorOptions = {
  binaryPath: string;
  mode?: "usb" | "simulator" | "both";
  bundleId?: string;
};

export class RealLookinCollector implements LookinCollector {
  constructor(private readonly options: RealLookinCollectorOptions) {}

  async collectCurrentPage(): Promise<UiSnapshot> {
    const args = ["--mode", this.options.mode ?? "both"];
    if (this.options.bundleId) {
      args.push("--bundle-id", this.options.bundleId);
    }

    const { stdout } = await execFileAsync(this.options.binaryPath, args, {
      timeout: 15000,
      maxBuffer: 20 * 1024 * 1024,
    });
    const payload = JSON.parse(stdout) as
      | { ok: true; snapshot: UiSnapshot }
      | { ok: false; error: string };

    if (!payload.ok) {
      throw new Error(payload.error);
    }
    return payload.snapshot;
  }
}

export const lookinIntegrationNotes = [
  "LookinServer already exposes the required runtime data: hierarchy, frames, properties, and screenshots.",
  "The current Lookin macOS app is GUI-first, so the MVP consumes a normalized JSON export.",
  "The production collector should either fork Lookin to add Export JSON or reuse the Lookin/KKConnector protocol in a small CLI.",
  "The collector must never be used with Release builds that include LookinServer.",
];
