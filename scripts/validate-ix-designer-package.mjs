#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import YAML from "yaml";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const coreRoot = join(root, ".agents/skills/ix-designer-core");
const profileRoot = join(root, ".agents/skills/toptop-profile");
const adapterRoot = join(root, ".agents/skills/cursor-adapter");
const compatibilityEntry = join(
  root,
  ".agents/skills/toptop-ix-designer/SKILL.md",
);

async function readYaml(path) {
  return YAML.parse(await readFile(path, "utf8"));
}

async function requireFiles(paths) {
  for (const path of paths) {
    await stat(path);
  }
}

async function validateYaml(schemaName, dataPath) {
  const schema = await readYaml(join(coreRoot, "specs", schemaName));
  const data = await readYaml(dataPath);
  const validate = new Ajv2020({ allErrors: true, strict: false }).compile(schema);
  if (!validate(data)) {
    throw new Error(
      `${dataPath} does not match ${schemaName}:\n${JSON.stringify(validate.errors, null, 2)}`,
    );
  }
}

async function main() {
  await requireFiles([
    join(coreRoot, "SKILL.md"),
    join(coreRoot, "references/composition-contract.md"),
    join(coreRoot, "references/profile-authoring.md"),
    join(coreRoot, "references/deliverables.md"),
    join(coreRoot, "specs/requirement-brief.schema.yaml"),
    join(coreRoot, "specs/interaction-spec.schema.yaml"),
    join(coreRoot, "specs/business-profile.schema.yaml"),
    join(coreRoot, "specs/agent-adapter.schema.yaml"),
    join(profileRoot, "SKILL.md"),
    join(profileRoot, "profile.yaml"),
    join(adapterRoot, "SKILL.md"),
    join(adapterRoot, "adapter.yaml"),
    compatibilityEntry,
    join(root, "skill/ix-designer-portable.manifest.json"),
  ]);

  const coreSkill = await readFile(join(coreRoot, "SKILL.md"), "utf8");
  if (coreSkill.split("\n").length > 500) {
    throw new Error("ix-designer-core/SKILL.md must stay under 500 lines");
  }

  const forbiddenCoreCoupling = [
    ["TopTop", /\bTopTop\b/i],
    ["Cursor", /\bCursor\b/i],
    ["Feishu/Lark", /\b(?:Feishu|Lark)\b/i],
    [".monkren", /\.monkren/],
    ["portal path", /apps\/design-system-portal/],
  ];
  for (const [label, pattern] of forbiddenCoreCoupling) {
    if (pattern.test(coreSkill)) {
      throw new Error(`ix-designer-core contains business/platform coupling: ${label}`);
    }
  }

  const entrySkill = await readFile(compatibilityEntry, "utf8");
  for (const dependency of [
    "ix-designer-core/SKILL.md",
    "toptop-profile/SKILL.md",
    "cursor-adapter/SKILL.md",
  ]) {
    if (!entrySkill.includes(dependency)) {
      throw new Error(`toptop-ix-designer does not load ${dependency}`);
    }
  }

  const featureReadme = await readFile(
    join(root, "specs/features/README.md"),
    "utf8",
  );
  if (!featureReadme.includes(".agents/skills/ix-designer-core/specs/")) {
    throw new Error("specs/features/README.md must point to the Core schemas");
  }

  await validateYaml(
    "business-profile.schema.yaml",
    join(profileRoot, "profile.yaml"),
  );
  await validateYaml(
    "business-profile.schema.yaml",
    join(coreRoot, "templates/business-profile.example.yaml"),
  );
  await validateYaml(
    "agent-adapter.schema.yaml",
    join(adapterRoot, "adapter.yaml"),
  );

  JSON.parse(
    await readFile(join(root, "skill/ix-designer-portable.manifest.json"), "utf8"),
  );

  console.log("IX Designer package valid: core + toptop-profile + cursor-adapter.");
}

main().catch((error) => {
  console.error(`ix-designer:validate failed: ${error.message}`);
  process.exit(1);
});
