import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormatsImport from "ajv-formats";
import { parse } from "yaml";
import { findRepositoryRoot, loadIconAssets } from "./load.js";
import SYSTEM_ICON_ASSETS from "./system-icon-assets.json" with { type: "json" };
import type { ComponentSpec, FoundationSpec } from "./types.js";

export type ContractValidationResult = {
  valid: boolean;
  checkedFiles: number;
  errors: string[];
};

const schemaGroups = [
  ["specs/components", "component-audit.schema.json"],
  ["specs/foundations", "foundation.schema.json"],
  ["specs/principles", "design-principles.schema.json"],
  ["specs/interactions", "interaction.schema.json"],
  ["specs/platform-mappings", "platform-mapping.schema.json"],
  ["specs/audit", "audit-registry.schema.json"],
] as const;

export async function validateDesignSystem(
  repositoryRoot = findRepositoryRoot(),
): Promise<ContractValidationResult> {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const addFormats = addFormatsImport as unknown as (
    instance: Ajv2020,
  ) => void;
  addFormats(ajv);
  const errors: string[] = [];
  let checkedFiles = 0;
  const componentIds = new Set<string>();
  const tokenIds = new Set<string>();
  const colorTokenIds = new Set<string>();
  const components: Array<{ spec: ComponentSpec; path: string }> = [];

  for (const [relativeDirectory, schemaName] of schemaGroups) {
    const directory = join(repositoryRoot, relativeDirectory);
    if (!existsSync(directory)) {
      continue;
    }
    const schema = JSON.parse(
      await readFile(
        join(repositoryRoot, "specs", "schema", schemaName),
        "utf8",
      ),
    );
    const validate = ajv.compile(schema);
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (
        !entry.isFile() ||
        (!entry.name.endsWith(".yaml") && !entry.name.endsWith(".yml"))
      ) {
        continue;
      }
      checkedFiles += 1;
      const relativePath = `${relativeDirectory}/${entry.name}`;
      const value = parse(
        await readFile(join(directory, entry.name), "utf8"),
      ) as Record<string, unknown>;
      if (!validate(value)) {
        for (const error of validate.errors ?? []) {
          errors.push(
            `${relativePath}${error.instancePath || "/"} ${error.message}`,
          );
        }
        continue;
      }
      if (relativeDirectory === "specs/components") {
        collectUniqueId(value.id, componentIds, relativePath, errors);
        components.push({ spec: value as ComponentSpec, path: relativePath });
      }
      if (relativeDirectory === "specs/foundations") {
        const foundation = value as FoundationSpec;
        for (const token of foundation.tokens) {
          collectUniqueId(token.id, tokenIds, relativePath, errors);
          if (foundation.category === "color") colorTokenIds.add(token.id);
        }
      }
      if (relativeDirectory === "specs/principles") {
        validatePrincipleOrder(value, relativePath, errors);
      }
    }
  }

  const assets = new Set(Object.values(await loadIconAssets(repositoryRoot)).flat());
  for (const { spec, path } of components) {
    const variants = new Map(spec.variants?.map(({ name, values }) => [name, values]));
    const slots = new Set(spec.anatomy?.flatMap(({ id }) => [id, `${id}-leading`, `${id}-trailing`]));
    for (const [index, visual] of (spec.variantVisuals ?? []).entries()) {
      const source = `${path}/variantVisuals/${index}`;
      const values = variants.get(visual.variant);
      if (!values) errors.push(`${source} unknown variant "${visual.variant}"`);
      else if (!values.includes(visual.value)) {
        errors.push(`${source} unknown value "${visual.value}" for variant "${visual.variant}"`);
      }
      if (visual.slot && !slots.has(visual.slot)) {
        errors.push(`${source} unknown anatomy slot "${visual.slot}"`);
      }
      if (visual.gapToken && !tokenIds.has(visual.gapToken)) {
        errors.push(`${source} unknown gapToken "${visual.gapToken}"`);
      }
      for (const token of [visual.colorToken, visual.backgroundToken, ...(visual.assetLayers ?? []).map((layer) => layer.colorToken)]) {
        if (token && !colorTokenIds.has(token)) {
          errors.push(`${source} unknown color token "${token}"`);
        }
      }
      for (const asset of [visual.asset, ...(visual.assetLayers ?? []).map((layer) => layer.asset)]) {
        if (asset && !assets.has(asset)) errors.push(`${source} missing asset "${asset}"`);
      }
      if (visual.systemIcon) {
        const asset = SYSTEM_ICON_ASSETS[visual.systemIcon as keyof typeof SYSTEM_ICON_ASSETS];
        if (!Object.hasOwn(SYSTEM_ICON_ASSETS, visual.systemIcon)) {
          errors.push(`${source} unknown systemIcon "${visual.systemIcon}"`);
        } else if (!assets.has(asset)) {
          errors.push(`${source} missing systemIcon asset "${asset}"`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    checkedFiles,
    errors,
  };
}

function validatePrincipleOrder(
  value: Record<string, unknown>,
  source: string,
  errors: string[],
) {
  const principles = (value.principles ?? []) as Array<
    Record<string, unknown>
  >;
  const principleIds = new Set(
    principles
      .map((principle) => principle.id)
      .filter((id): id is string => typeof id === "string"),
  );
  const decisionOrder = (value.decisionOrder ?? []) as unknown[];

  for (const id of decisionOrder) {
    if (typeof id === "string" && !principleIds.has(id)) {
      errors.push(`${source} decisionOrder references unknown principle "${id}"`);
    }
  }
  for (const id of principleIds) {
    if (!decisionOrder.includes(id)) {
      errors.push(`${source} decisionOrder is missing principle "${id}"`);
    }
  }
}

function collectUniqueId(
  value: unknown,
  seen: Set<string>,
  source: string,
  errors: string[],
) {
  if (typeof value !== "string") {
    return;
  }
  if (seen.has(value)) {
    errors.push(`${source} duplicates id "${value}"`);
  }
  seen.add(value);
}
