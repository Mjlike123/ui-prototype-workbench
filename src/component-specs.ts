import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { flattenFigma, normalizeName } from "./tree.js";
import type {
  ComponentAuditProfile,
  ComponentAuditRule,
  FigmaDesign,
  UiNode,
  UiSnapshot,
} from "./types.js";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const componentSpecsDirectory = join(projectRoot, "specs", "components");
const platformMappingsDirectory = join(
  projectRoot,
  "specs",
  "platform-mappings",
);

export type ProfileDetection = {
  profile?: ComponentAuditProfile;
  confidence: number;
  reason: string;
};

export async function loadComponentProfiles(): Promise<
  ComponentAuditProfile[]
> {
  const entries = await readdir(componentSpecsDirectory, {
    withFileTypes: true,
  });
  const profiles = await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.isFile() &&
          (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml")),
      )
      .map(async (entry) => {
        const source = await readFile(
          join(componentSpecsDirectory, entry.name),
          "utf8",
        );
        return validateProfile(parse(source), entry.name);
      }),
  );
  return profiles.sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
}

export async function resolveAuditProfile(
  requestedProfile: string | undefined,
  design: FigmaDesign,
): Promise<ProfileDetection> {
  const profiles = await loadComponentProfiles();
  if (requestedProfile && requestedProfile !== "auto") {
    const profile = profiles.find(
      (candidate) => candidate.id === requestedProfile,
    );
    if (!profile) {
      throw new Error(`Unknown component audit profile: ${requestedProfile}`);
    }
    return {
      profile,
      confidence: 1,
      reason: "manual-selection",
    };
  }

  const nodes = flattenFigma(design.root);
  const candidates = profiles.map((profile) => {
    let confidence = 0;
    let reason = "no-match";
    for (const node of nodes) {
      const componentIdentifiers = [node.componentId, node.id].filter(
        (value): value is string => Boolean(value),
      );
      const allowedFileKeys = profile.detection.figmaFileKeys ?? [];
      const fileKeyMatches =
        allowedFileKeys.length === 0 ||
        Boolean(
          design.fileKey && allowedFileKeys.includes(design.fileKey),
        );
      if (
        fileKeyMatches &&
        componentIdentifiers.some((identifier) =>
          profile.detection.figmaComponentIds.includes(identifier),
        )
      ) {
        return { profile, confidence: 1, reason: "figma-component-id" };
      }

      const componentName = normalizeName(node.componentName);
      const nodeName = normalizeName(node.name);
      for (const alias of profile.detection.nameAliases) {
        const normalizedAlias = normalizeName(alias);
        if (
          normalizedAlias &&
          componentName &&
          namesMatch(componentName, normalizedAlias) &&
          confidence < 0.88
        ) {
          confidence = 0.88;
          reason = "figma-component-name";
        } else if (
          normalizedAlias &&
          nodeName &&
          namesMatch(nodeName, normalizedAlias) &&
          confidence < 0.74
        ) {
          confidence = 0.74;
          reason = "figma-node-name";
        }
      }
    }
    return { profile, confidence, reason };
  });

  const best = candidates.sort((a, b) => b.confidence - a.confidence)[0];
  if (!best) {
    return { confidence: 0, reason: "no-profiles" };
  }
  if (best.confidence < 0.7) {
    return {
      confidence: best.confidence,
      reason: "no-confident-profile-match",
    };
  }
  return best;
}

type IOSPlatformMapping = {
  componentId: string;
  platforms?: {
    ios?: {
      componentName?: string;
      identifiers?: string[];
    };
  };
};

export async function resolveRuntimeAuditProfile(
  requestedProfile: string | undefined,
  snapshot: UiSnapshot,
): Promise<ProfileDetection> {
  const profiles = await loadComponentProfiles();
  if (requestedProfile && requestedProfile !== "auto") {
    const profile = profiles.find(
      (candidate) => candidate.id === requestedProfile,
    );
    if (!profile) {
      throw new Error(`Unknown component audit profile: ${requestedProfile}`);
    }
    return { profile, confidence: 1, reason: "manual-selection" };
  }

  const mappings = await loadIOSPlatformMappings();
  const mappingByComponent = new Map(
    mappings.map((mapping) => [mapping.componentId, mapping]),
  );
  const nodes = flattenRuntimeNodes(snapshot.root);
  const candidates = profiles.map((profile) => {
    const mapping = mappingByComponent.get(profile.id)?.platforms?.ios;
    const componentName = normalizeName(mapping?.componentName);
    const identifierPrefixes = (mapping?.identifiers ?? []).map((identifier) =>
      normalizeName(identifier.split("{")[0]),
    );
    const aliases = [profile.id, ...profile.detection.nameAliases]
      .map(normalizeName)
      .filter(Boolean);
    let confidence = 0;
    let reason = "no-runtime-match";

    for (const { node, depth } of nodes) {
      const accessibilityIdentifier = normalizeName(
        node.accessibilityIdentifier,
      );
      if (
        accessibilityIdentifier &&
        identifierPrefixes.some((prefix) =>
          accessibilityIdentifier.startsWith(prefix),
        )
      ) {
        const score = depth === 0 ? 1 : 0.9;
        if (score > confidence) {
          confidence = score;
          reason = "ios-accessibility-identifier";
        }
      }

      const runtimeClasses = [node.type, ...(node.classChain ?? [])]
        .map(normalizeName)
        .filter(Boolean);
      if (
        componentName &&
        runtimeClasses.some((runtimeClass) =>
          namesMatch(runtimeClass, componentName),
        )
      ) {
        const score = depth === 0 ? 0.98 : 0.78;
        if (score > confidence) {
          confidence = score;
          reason = "ios-component-class";
        }
      }

      const runtimeNames = [node.name, node.type]
        .map(normalizeName)
        .filter(Boolean);
      if (
        aliases.some((alias) =>
          runtimeNames.some((runtimeName) => namesMatch(runtimeName, alias)),
        )
      ) {
        const score = depth === 0 ? 0.82 : 0.68;
        if (score > confidence) {
          confidence = score;
          reason = "ios-runtime-name";
        }
      }
    }
    return { profile, confidence, reason };
  });

  const best = candidates.sort((a, b) => b.confidence - a.confidence)[0];
  if (!best || best.confidence < 0.7) {
    return {
      confidence: best?.confidence ?? 0,
      reason: "no-confident-runtime-profile-match",
    };
  }
  return best;
}

async function loadIOSPlatformMappings(): Promise<IOSPlatformMapping[]> {
  const entries = await readdir(platformMappingsDirectory, {
    withFileTypes: true,
  });
  return Promise.all(
    entries
      .filter(
        (entry) =>
          entry.isFile() &&
          (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml")),
      )
      .map(async (entry) =>
        parse(
          await readFile(
            join(platformMappingsDirectory, entry.name),
            "utf8",
          ),
        ),
      ),
  ) as Promise<IOSPlatformMapping[]>;
}

function flattenRuntimeNodes(
  root: UiNode,
  depth = 0,
): Array<{ node: UiNode; depth: number }> {
  return [
    { node: root, depth },
    ...(root.children ?? []).flatMap((child) =>
      flattenRuntimeNodes(child, depth + 1),
    ),
  ];
}

function namesMatch(value: string, alias: string): boolean {
  const compactValue = value.replace(/\s+/g, "");
  const compactAlias = alias.replace(/\s+/g, "");
  return (
    compactValue.includes(compactAlias) ||
    compactAlias.includes(compactValue)
  );
}

function validateProfile(
  value: unknown,
  sourceName: string,
): ComponentAuditProfile {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid component profile ${sourceName}: object required`);
  }
  const profile = value as Partial<ComponentAuditProfile>;
  if (
    profile.schemaVersion !== 1 ||
    !profile.id ||
    !profile.version ||
    !profile.title ||
    !Array.isArray(profile.platforms) ||
    !profile.detection ||
    !Array.isArray(profile.roles) ||
    !Array.isArray(profile.rules)
  ) {
    throw new Error(
      `Invalid component profile ${sourceName}: required fields are missing`,
    );
  }
  if (!/^[a-z0-9-]+$/.test(profile.id)) {
    throw new Error(
      `Invalid component profile ${sourceName}: id must be kebab-case`,
    );
  }
  profile.rules.forEach((rule, index) =>
    validateRule(rule, `${sourceName}#rules[${index}]`),
  );
  return profile as ComponentAuditProfile;
}

function validateRule(
  rule: Partial<ComponentAuditRule>,
  location: string,
) {
  if (
    !rule.id ||
    !rule.title ||
    !rule.category ||
    !rule.metric ||
    typeof rule.tolerance !== "number" ||
    rule.tolerance < 0 ||
    rule.aggregate !== "rule"
  ) {
    throw new Error(`Invalid component rule ${location}`);
  }
}
