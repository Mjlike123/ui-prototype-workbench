import { area } from "./geometry.js";
import { normalizeName, textKey } from "./tree.js";
import type {
  ComponentAuditProfile,
  ComponentSemanticMapping,
  ComponentSemanticModel,
  FigmaNode,
  SemanticTabItem,
  UiNode,
} from "./types.js";

type AnyNode = FigmaNode | UiNode;

export type ComponentModelExtraction = {
  design: ComponentSemanticModel;
  actual: ComponentSemanticModel;
  mappings: ComponentSemanticMapping[];
  confidence: number;
  structureConfirmed: boolean;
};

export function extractSecondaryTabModels(
  profile: ComponentAuditProfile,
  designRoot: FigmaNode,
  actualRoot: UiNode,
): ComponentModelExtraction {
  const designItems = extractItems(profile, designRoot, "design");
  assignDesignStates(profile, designItems.items);
  if (!designItems.items.some((item) => item.state === "selected")) {
    designItems.warnings.push("未可靠识别选中态");
  }
  const actualItems = extractItems(profile, actualRoot, "actual");
  const mappings = mapItems(designItems.items, actualItems.items);

  const mappedActualItems: SemanticTabItem[] = [];
  for (const mapping of mappings) {
    const designItem = designItems.items.find(
      (item) => item.itemNodeId === mapping.designItemNodeId,
    );
    const actualItem = actualItems.items.find(
      (item) => item.itemNodeId === mapping.actualItemNodeId,
    );
    if (!designItem || !actualItem) {
      continue;
    }
    actualItem.key = designItem.key;
    actualItem.state = designItem.state;
    actualItem.confidence = mapping.confidence;
    mappedActualItems.push(actualItem);
  }

  const matchRatio =
    designItems.items.length > 0
      ? mappedActualItems.length / designItems.items.length
      : 0;
  const mappingConfidence =
    mappings.length > 0
      ? mappings.reduce((sum, mapping) => sum + mapping.confidence, 0) /
        mappings.length
      : 0;
  const confidence = roundConfidence(
    Math.min(designItems.confidence, actualItems.confidence) *
      0.45 +
      matchRatio * 0.3 +
      mappingConfidence * 0.25,
  );
  const warnings = [
    ...designItems.warnings.map((warning) => `设计稿：${warning}`),
    ...actualItems.warnings.map((warning) => `实机：${warning}`),
  ];
  if (matchRatio < 1) {
    warnings.push(
      `仅匹配 ${mappedActualItems.length}/${designItems.items.length} 个 Tab`,
    );
  }
  const structureConfirmed =
    designItems.items.length >= 2 &&
    mappedActualItems.length >= 2 &&
    matchRatio >= 0.67 &&
    confidence >= 0.62;

  return {
    design: {
      profileId: profile.id,
      side: "design",
      containerNodeId: designRoot.id,
      containerFrame: designRoot.frame,
      items: designItems.items,
      confidence: designItems.confidence,
      warnings: designItems.warnings,
    },
    actual: {
      profileId: profile.id,
      side: "actual",
      containerNodeId: actualRoot.id,
      containerFrame: actualRoot.frame,
      items: mappedActualItems.sort((a, b) => a.frame.x - b.frame.x),
      confidence: actualItems.confidence,
      warnings,
    },
    mappings,
    confidence,
    structureConfirmed,
  };
}

function extractItems(
  profile: ComponentAuditProfile,
  root: AnyNode,
  side: "design" | "actual",
): {
  items: SemanticTabItem[];
  confidence: number;
  warnings: string[];
} {
  const parentById = buildParentMap(root);
  const nodes = flatten(root);
  const labels = deduplicateLabels(
    nodes.filter(
      (node) =>
        typeof node.text === "string" &&
        node.text.trim().length > 0 &&
        node.id !== root.id,
    ),
  ).sort((a, b) => a.frame.x - b.frame.x);
  const warnings: string[] = [];
  const items: SemanticTabItem[] = [];

  for (const labelNode of labels) {
    const itemNode = findItemAncestor(labelNode, root, parentById, side);
    if (!itemNode) {
      warnings.push(`无法确定“${labelNode.text}”的按钮边界`);
      continue;
    }
    const label = labelNode.text?.trim() ?? "";
    items.push({
      key: tabLabelKey(label),
      label,
      state: inferNamedState(profile, itemNode, labelNode) ?? "unselected",
      itemNodeId: itemNode.id,
      labelNodeId: labelNode.id,
      frame: itemNode.frame,
      labelFrame: labelNode.frame,
      leftPadding: round(labelNode.frame.x - itemNode.frame.x),
      rightPadding: round(
        itemNode.frame.x +
          itemNode.frame.width -
          (labelNode.frame.x + labelNode.frame.width),
      ),
      textColor: labelNode.color,
      backgroundColor:
        itemNode.backgroundColor ??
        (side === "design" ? itemNode.color : undefined),
      confidence: boundaryConfidence(itemNode, labelNode, side),
    });
  }

  const uniqueItems = deduplicateItems(items);
  if (uniqueItems.length < 2) {
    warnings.push("可识别的 Tab 少于 2 个");
  }
  const confidence =
    uniqueItems.length > 0
      ? roundConfidence(
          uniqueItems.reduce((sum, item) => sum + item.confidence, 0) /
            uniqueItems.length,
        )
      : 0;
  return { items: uniqueItems, confidence, warnings };
}

function assignDesignStates(
  profile: ComponentAuditProfile,
  items: SemanticTabItem[],
) {
  if (items.some((item) => item.state === "selected")) {
    return;
  }
  const ranked = items
    .map((item, index) => ({
      index,
      score: colorSalience(item.backgroundColor),
    }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  const second = ranked[1];
  if (best && best.score >= 20 && best.score - (second?.score ?? 0) >= 8) {
    items[best.index]!.state = "selected";
    return;
  }

  const selectedAliases = profile.detection.selectedStateAliases ?? [];
  const namedIndex = items.findIndex((item) =>
    selectedAliases.some((alias) =>
      normalizeName(item.label).includes(normalizeName(alias)),
    ),
  );
  if (namedIndex >= 0) {
    items[namedIndex]!.state = "selected";
    return;
  }

  const textRanked = items
    .map((item, index) => ({
      index,
      score: textVisibility(item.textColor),
    }))
    .sort((a, b) => b.score - a.score);
  const mostVisible = textRanked[0];
  const nextVisible = textRanked[1];
  if (
    mostVisible &&
    mostVisible.score >= 80 &&
    mostVisible.score - (nextVisible?.score ?? 0) >= 20
  ) {
    items[mostVisible.index]!.state = "selected";
  }
}

function mapItems(
  designItems: SemanticTabItem[],
  actualItems: SemanticTabItem[],
): ComponentSemanticMapping[] {
  const unusedActual = new Set(actualItems.map((item) => item.itemNodeId));
  const sortedDesign = [...designItems].sort((a, b) => a.frame.x - b.frame.x);
  const sortedActual = [...actualItems].sort((a, b) => a.frame.x - b.frame.x);
  const mappings: ComponentSemanticMapping[] = [];

  sortedDesign.forEach((designItem, index) => {
    let actualItem = sortedActual.find(
      (candidate) =>
        unusedActual.has(candidate.itemNodeId) &&
        candidate.key &&
        candidate.key === designItem.key,
    );
    let confidence = 0.92;
    if (!actualItem) {
      const orderedCandidate = sortedActual[index];
      if (
        orderedCandidate &&
        unusedActual.has(orderedCandidate.itemNodeId)
      ) {
        actualItem = orderedCandidate;
        confidence = 0.58;
      }
    }
    if (!actualItem) {
      mappings.push({
        label: designItem.label,
        state: designItem.state,
        designItemNodeId: designItem.itemNodeId,
        designLabelNodeId: designItem.labelNodeId,
        confidence: 0.3,
      });
      return;
    }
    unusedActual.delete(actualItem.itemNodeId);
    mappings.push({
      label: designItem.label,
      state: designItem.state,
      designItemNodeId: designItem.itemNodeId,
      designLabelNodeId: designItem.labelNodeId,
      actualItemNodeId: actualItem.itemNodeId,
      actualLabelNodeId: actualItem.labelNodeId,
      confidence: roundConfidence(
        Math.min(
          confidence,
          designItem.confidence,
          actualItem.confidence,
        ),
      ),
    });
  });
  return mappings;
}

function findItemAncestor(
  label: AnyNode,
  root: AnyNode,
  parentById: Map<string, AnyNode>,
  side: "design" | "actual",
): AnyNode | undefined {
  const candidates: AnyNode[] = [];
  let current = parentById.get(label.id);
  while (current && current.id !== root.id) {
    if (
      contains(current.frame, label.frame) &&
      current.frame.width >= label.frame.width + 2 &&
      current.frame.height >= label.frame.height &&
      area(current.frame) < area(root.frame) * 0.9
    ) {
      candidates.push(current);
    }
    current = parentById.get(current.id);
  }
  if (candidates.length === 0) {
    return undefined;
  }
  return candidates
    .map((node) => ({
      node,
      score:
        visualContainerScore(node, side) -
        area(node.frame) / Math.max(1, area(root.frame)),
    }))
    .sort((a, b) => b.score - a.score)[0]?.node;
}

function visualContainerScore(
  node: AnyNode,
  side: "design" | "actual",
): number {
  let score = 1;
  const type = node.type.toUpperCase();
  if (
    type.includes("BUTTON") ||
    type.includes("CONTROL") ||
    type.includes("COMPONENT") ||
    type.includes("INSTANCE")
  ) {
    score += 4;
  }
  if (node.backgroundColor || node.cornerRadius !== undefined) {
    score += 2.5;
  }
  if ("selected" in node && node.selected !== undefined) {
    score += 2;
  }
  if (side === "actual" && accessibilityIdentifier(node)) {
    score += 1;
  }
  return score;
}

function inferNamedState(
  profile: ComponentAuditProfile,
  item: AnyNode,
  label: AnyNode,
): "selected" | "unselected" | undefined {
  if ("selected" in item && item.selected === true) {
    return "selected";
  }
  const searchable = [
    item.name,
    label.name,
    accessibilityIdentifier(item),
    ...("componentProperties" in item
      ? Object.values(item.componentProperties ?? {})
      : []),
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalizeName);
  if (
    stateAliasMatches(
      searchable,
      profile.detection.selectedStateAliases ?? [],
    )
  ) {
    return "selected";
  }
  if (
    stateAliasMatches(
      searchable,
      profile.detection.unselectedStateAliases ?? [],
    )
  ) {
    return "unselected";
  }
  return undefined;
}

function stateAliasMatches(values: string[], aliases: string[]): boolean {
  return aliases.some((alias) => {
    const normalizedAlias = normalizeName(alias);
    return values.some(
      (value) =>
        value === normalizedAlias ||
        value.split(" ").includes(normalizedAlias),
    );
  });
}

function boundaryConfidence(
  item: AnyNode,
  label: AnyNode,
  side: "design" | "actual",
): number {
  let confidence = 0.62;
  if (
    item.backgroundColor ||
    item.cornerRadius !== undefined ||
    item.type.toUpperCase().includes("BUTTON") ||
    item.type.toUpperCase().includes("COMPONENT") ||
    item.type.toUpperCase().includes("INSTANCE")
  ) {
    confidence += 0.2;
  }
  if (side === "actual" && accessibilityIdentifier(item)) {
    confidence += 0.12;
  }
  if (
    item.frame.width >= label.frame.width &&
    item.frame.height >= label.frame.height
  ) {
    confidence += 0.06;
  }
  return Math.min(1, confidence);
}

function buildParentMap(root: AnyNode): Map<string, AnyNode> {
  const result = new Map<string, AnyNode>();
  const visit = (node: AnyNode) => {
    for (const child of node.children ?? []) {
      result.set(child.id, node);
      visit(child);
    }
  };
  visit(root);
  return result;
}

function flatten(root: AnyNode): AnyNode[] {
  const result: AnyNode[] = [];
  const visit = (node: AnyNode) => {
    result.push(node);
    for (const child of node.children ?? []) {
      visit(child);
    }
  };
  visit(root);
  return result;
}

function deduplicateLabels(nodes: AnyNode[]): AnyNode[] {
  const seen = new Set<string>();
  return nodes.filter((node) => {
    const key = `${textKey(node.text)}:${round(node.frame.x)}:${round(node.frame.y)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function deduplicateItems(items: SemanticTabItem[]): SemanticTabItem[] {
  const byNodeId = new Map<string, SemanticTabItem>();
  for (const item of items) {
    const existing = byNodeId.get(item.itemNodeId);
    if (!existing || item.confidence > existing.confidence) {
      byNodeId.set(item.itemNodeId, item);
    }
  }
  return [...byNodeId.values()].sort((a, b) => a.frame.x - b.frame.x);
}

function tabLabelKey(value: string): string {
  return textKey(value)
    .replace(/\([^)]*\)/g, "")
    .replace(/\d+/g, "")
    .replace(/[^\p{L}]+/gu, "")
    .replace(/s$/i, "");
}

function contains(container: AnyNode["frame"], child: AnyNode["frame"]): boolean {
  const tolerance = 1;
  return (
    child.x >= container.x - tolerance &&
    child.y >= container.y - tolerance &&
    child.x + child.width <= container.x + container.width + tolerance &&
    child.y + child.height <= container.y + container.height + tolerance
  );
}

function colorSalience(color: SemanticTabItem["backgroundColor"]): number {
  if (!color) {
    return 0;
  }
  const channels = [color.r, color.g, color.b];
  return (
    (Math.max(...channels) - Math.min(...channels)) * (color.a ?? 1)
  );
}

function textVisibility(color: SemanticTabItem["textColor"]): number {
  return color ? (color.a ?? 1) * 100 : 0;
}

function accessibilityIdentifier(node: AnyNode): string | undefined {
  return "accessibilityIdentifier" in node
    ? node.accessibilityIdentifier
    : undefined;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function roundConfidence(value: number): number {
  return Math.round(value * 100) / 100;
}
