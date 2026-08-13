#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fetchFigmaDesign } from "./adapters/figma.js";
import { readDesignJson } from "./adapters/json.js";
import { LookinJsonCollector, lookinIntegrationNotes } from "./adapters/lookin.js";
import { auditPage, defaultConfig } from "./diff.js";
import { writeReport } from "./report.js";
import type { AuditConfig, FigmaDesign } from "./types.js";

type CliArgs = {
  figmaJson?: string;
  figmaUrl?: string;
  uiJson?: string;
  out: string;
  sizePt?: number;
  spacingPt?: number;
  alignmentPt?: number;
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.uiJson || (!args.figmaJson && !args.figmaUrl)) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  const config = configFromArgs(args);
  const collector = new LookinJsonCollector(args.uiJson);
  const actual = await collector.collectCurrentPage();
  const design = await loadDesign(args);
  const result = auditPage(design, actual, config);
  const report = await writeReport(result.issues, actual, args.out);

  await mkdir(args.out, { recursive: true });
  await writeFile(
    join(args.out, "summary.json"),
    JSON.stringify(
      {
        pageName: actual.pageName,
        matchedNodes: result.matches.length,
        issues: result.issues.length,
        csvPath: report.csvPath,
        annotationPaths: report.annotationPaths,
        lookinIntegrationNotes,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`Audited ${actual.pageName}`);
  console.log(`Matched nodes: ${result.matches.length}`);
  console.log(`Issues: ${result.issues.length}`);
  console.log(`CSV: ${report.csvPath}`);
}

function parseArgs(values: string[]): CliArgs {
  const args: CliArgs = {
    out: "out",
  };

  for (let index = 0; index < values.length; index += 1) {
    const key = values[index];
    const value = values[index + 1];
    if (!key?.startsWith("--")) {
      continue;
    }

    index += 1;
    switch (key) {
      case "--figma-json":
        args.figmaJson = requiredValue(key, value);
        break;
      case "--figma-url":
        args.figmaUrl = requiredValue(key, value);
        break;
      case "--ui-json":
        args.uiJson = requiredValue(key, value);
        break;
      case "--out":
        args.out = requiredValue(key, value);
        break;
      case "--size-pt":
        args.sizePt = Number(requiredValue(key, value));
        break;
      case "--spacing-pt":
        args.spacingPt = Number(requiredValue(key, value));
        break;
      case "--alignment-pt":
        args.alignmentPt = Number(requiredValue(key, value));
        break;
      default:
        throw new Error(`Unknown argument: ${key}`);
    }
  }

  return args;
}

async function loadDesign(args: CliArgs): Promise<FigmaDesign> {
  if (args.figmaJson) {
    return readDesignJson(args.figmaJson);
  }

  const token = process.env.FIGMA_TOKEN;
  if (!token) {
    throw new Error("FIGMA_TOKEN is required when using --figma-url");
  }

  return fetchFigmaDesign(args.figmaUrl!, token);
}

function configFromArgs(args: CliArgs): AuditConfig {
  return {
    thresholds: {
      ...defaultConfig.thresholds,
      sizePt: args.sizePt ?? defaultConfig.thresholds.sizePt,
      spacingPt: args.spacingPt ?? defaultConfig.thresholds.spacingPt,
      alignmentPt: args.alignmentPt ?? defaultConfig.thresholds.alignmentPt,
    },
  };
}

function requiredValue(key: string, value: string | undefined): string {
  if (!value || value.startsWith("--")) {
    throw new Error(`${key} requires a value`);
  }
  return value;
}

function printHelp() {
  console.log(`Usage:
  npm run audit -- --figma-json samples/figma-page.json --ui-json samples/lookin-page.json --out out
  FIGMA_TOKEN=... npm run audit -- --figma-url "https://www.figma.com/file/..." --ui-json samples/lookin-page.json --out out

Required:
  --ui-json      Normalized Lookin/UI snapshot JSON
  --figma-json   Normalized Figma design JSON
  --figma-url    Figma frame URL, requires FIGMA_TOKEN

Optional:
  --out          Output directory, default out
  --size-pt      Size threshold in pt, default 2
  --spacing-pt   Spacing threshold in pt, default 2
  --alignment-pt Alignment threshold in pt, default 2`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
