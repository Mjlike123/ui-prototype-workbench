import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormatsImport from "ajv-formats";
import { parse } from "yaml";
import { findRepositoryRoot } from "./load.js";

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
      }
      if (relativeDirectory === "specs/components") {
        collectUniqueId(value.id, componentIds, relativePath, errors);
      }
      if (relativeDirectory === "specs/foundations") {
        for (const token of (value.tokens ?? []) as Array<
          Record<string, unknown>
        >) {
          collectUniqueId(token.id, tokenIds, relativePath, errors);
        }
      }
      if (relativeDirectory === "specs/principles") {
        validatePrincipleOrder(value, relativePath, errors);
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
