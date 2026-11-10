#!/usr/bin/env node
/**
 * Extract text and per-page PNGs from a PDF for toptop-ix-designer intake.
 * Requires poppler: pdftotext, pdftoppm (brew install poppler)
 *
 * Usage:
 *   node scripts/ingest-pdf.mjs <pdf-path> [--out <dir>]
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function usage() {
  console.error(`Usage: node scripts/ingest-pdf.mjs <pdf-path> [--out <dir>]`);
  process.exit(1);
}

function which(cmd) {
  const result = spawnSync("which", [cmd], { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
}

const args = process.argv.slice(2);
if (args.length < 1) usage();

const pdfPath = path.resolve(args[0]);
let outDir = path.resolve(
  `.monkren/ix-design/${path.basename(pdfPath, path.extname(pdfPath))}-ingest`,
);

for (let i = 1; i < args.length; i += 1) {
  if (args[i] === "--out" && args[i + 1]) {
    outDir = path.resolve(args[++i]);
  }
}

if (!fs.existsSync(pdfPath)) {
  console.error(`PDF not found: ${pdfPath}`);
  process.exit(1);
}

const pdftotext = which("pdftotext");
const pdftoppm = which("pdftoppm");

if (!pdftotext || !pdftoppm) {
  console.error(
    "poppler not found. Install: brew install poppler\n" +
      "Fallback: export PDF pages as images manually, or copy text from PDF.",
  );
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
const pagesDir = path.join(outDir, "pages");
fs.mkdirSync(pagesDir, { recursive: true });

const textOut = path.join(outDir, "text.txt");
const textResult = spawnSync(pdftotext, ["-layout", pdfPath, textOut], {
  encoding: "utf8",
});
if (textResult.status !== 0) {
  console.error("pdftotext failed:", textResult.stderr || textResult.stdout);
  process.exit(1);
}

const prefix = path.join(pagesDir, "page");
const ppmResult = spawnSync(
  pdftoppm,
  ["-png", "-r", "150", pdfPath, prefix],
  { encoding: "utf8" },
);
if (ppmResult.status !== 0) {
  console.error("pdftoppm failed:", ppmResult.stderr || ppmResult.stdout);
  process.exit(1);
}

const pageFiles = fs
  .readdirSync(pagesDir)
  .filter((f) => f.endsWith(".png"))
  .sort();

const manifest = {
  schemaVersion: 1,
  source: pdfPath,
  extractedAt: new Date().toISOString().split("T")[0],
  textFile: "text.txt",
  pages: pageFiles.map((f, i) => ({
    index: i + 1,
    file: path.join("pages", f),
  })),
  hint:
    "Feed text.txt + pages/*.png to toptop-ix-designer Phase 0 (requirement-ingest).",
};

fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`PDF ingested → ${outDir}`);
console.log(`  text: ${textOut}`);
console.log(`  pages: ${pageFiles.length} PNG(s) in pages/`);
