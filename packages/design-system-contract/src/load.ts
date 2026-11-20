import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { parse } from "yaml";
import type {
  AuditRuleRegistry,
  ComponentSpec,
  DesignPrinciplesSpec,
  FigmaSyncEntry,
  FoundationSpec,
  InteractionSpec,
  PlatformMappingSpec,
  PortalCatalog,
} from "./types.js";

export function findRepositoryRoot(start = process.cwd()): string {
  let current = resolve(start);
  while (true) {
    if (
      existsSync(join(current, "specs", "components")) &&
      existsSync(join(current, "src", "component-specs.ts"))
    ) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      throw new Error(
        `Unable to locate ui-prototype-workbench repository from ${start}`,
      );
    }
    current = parent;
  }
}

async function loadYamlDirectory<T>(
  repositoryRoot: string,
  relativeDirectory: string,
): Promise<T[]> {
  const directory = join(repositoryRoot, relativeDirectory);
  if (!existsSync(directory)) {
    return [];
  }
  const entries = await readdir(directory, { withFileTypes: true });
  return Promise.all(
    entries
      .filter(
        (entry) =>
          entry.isFile() &&
          (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml")),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(async (entry) =>
        parse(await readFile(join(directory, entry.name), "utf8")),
      ),
  ) as Promise<T[]>;
}

async function loadFigmaSync(
  repositoryRoot: string,
): Promise<Record<string, FigmaSyncEntry>> {
  const path = join(repositoryRoot, "generated", "figma", "index.json");
  if (!existsSync(path)) {
    return {};
  }
  return JSON.parse(await readFile(path, "utf8")) as Record<
    string,
    FigmaSyncEntry
  >;
}

export async function loadIconAssets(
  repositoryRoot: string,
): Promise<Record<string, string[]>> {
  const publicDirectory = join(repositoryRoot, "apps/design-system-portal/public");
  const iconDirectory = join(publicDirectory, "icons");
  if (!existsSync(iconDirectory)) return {};

  const entries = await readdir(iconDirectory, { recursive: true, withFileTypes: true });
  const paths = entries
    .filter((entry) => entry.isFile())
    .map((entry) =>
      "/" + join(entry.parentPath, entry.name).slice(publicDirectory.length + 1)
        .split(sep).join("/"),
    )
    .sort();

  const assets: Record<string, string[]> = {};
  for (const path of paths) {
    const directory = path.slice(0, path.lastIndexOf("/"));
    (assets[directory] ??= []).push(path);
  }
  return assets;
}

export async function loadPortalCatalog(
  repositoryRoot = findRepositoryRoot(),
): Promise<PortalCatalog> {
  const [
    components,
    foundations,
    principles,
    interactions,
    platformMappings,
    auditRegistries,
    figmaSync,
    assets,
  ] = await Promise.all([
    loadYamlDirectory<ComponentSpec>(
      repositoryRoot,
      "specs/components",
    ),
    loadYamlDirectory<FoundationSpec>(
      repositoryRoot,
      "specs/foundations",
    ),
    loadYamlDirectory<DesignPrinciplesSpec>(
      repositoryRoot,
      "specs/principles",
    ),
    loadYamlDirectory<InteractionSpec>(
      repositoryRoot,
      "specs/interactions",
    ),
    loadYamlDirectory<PlatformMappingSpec>(
      repositoryRoot,
      "specs/platform-mappings",
    ),
    loadYamlDirectory<AuditRuleRegistry>(
      repositoryRoot,
      "specs/audit",
    ),
    loadFigmaSync(repositoryRoot),
    loadIconAssets(repositoryRoot),
  ]);

  return {
    components,
    foundations,
    principles,
    interactions,
    platformMappings,
    auditRegistries,
    figmaSync,
    assets,
  };
}

export async function loadContentDocument(
  kind: "components" | "interactions" | "foundations",
  id: string,
  repositoryRoot = findRepositoryRoot(),
): Promise<string | undefined> {
  const path = join(repositoryRoot, "content", kind, `${id}.mdx`);
  if (!existsSync(path)) {
    return undefined;
  }
  return readFile(path, "utf8");
}
