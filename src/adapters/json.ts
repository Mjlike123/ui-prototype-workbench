import { readFile } from "node:fs/promises";
import type { FigmaDesign, UiSnapshot } from "../types.js";

export async function readDesignJson(path: string): Promise<FigmaDesign> {
  return JSON.parse(await readFile(path, "utf8")) as FigmaDesign;
}

export async function readUiSnapshotJson(path: string): Promise<UiSnapshot> {
  return JSON.parse(await readFile(path, "utf8")) as UiSnapshot;
}
