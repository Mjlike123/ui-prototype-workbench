import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  findRepositoryRoot,
  loadPortalCatalog,
  type FigmaSyncEntry,
} from "@toptop/design-system-contract";
import {
  fetchFigmaDesign,
  resolveFigmaToken,
} from "../src/adapters/figma.js";

const repositoryRoot = findRepositoryRoot();
const catalog = await loadPortalCatalog(repositoryRoot);
const componentFilter = valueForArgument("--component");
const dryRun = process.argv.includes("--dry-run");
const referencedComponents = catalog.components.filter(
  (component) =>
    component.reference?.figmaUrl &&
    (!componentFilter || component.id === componentFilter),
);

if (dryRun) {
  console.log(
    `Figma sync would update: ${referencedComponents.map((item) => item.id).join(", ") || "none"}`,
  );
  process.exit(0);
}

if (referencedComponents.length === 0) {
  console.log("No matching Figma-backed components found.");
  process.exit(0);
}

const token = await resolveFigmaToken();
const nextIndex: Record<string, FigmaSyncEntry> = {
  ...catalog.figmaSync,
};

for (const component of referencedComponents) {
  const design = await fetchFigmaDesign(
    component.reference!.figmaUrl,
    token,
  );
  nextIndex[component.id] = {
    componentId: component.id,
    fileKey: design.fileKey,
    nodeId: design.nodeId,
    frameName: design.frameName,
    designVersion: design.designVersion,
    lastModified: design.lastModified,
    syncedAt: new Date().toISOString(),
    screenshotData: design.screenshotData,
    screenshotMimeType: design.screenshotMimeType,
  };
  console.log(`Synced ${component.id} from ${design.frameName}.`);
}

const outputDirectory = join(repositoryRoot, "generated", "figma");
await mkdir(outputDirectory, { recursive: true });
await writeFile(
  join(outputDirectory, "index.json"),
  `${JSON.stringify(nextIndex, null, 2)}\n`,
  "utf8",
);

function valueForArgument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}
