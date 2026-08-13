import { center, iou } from "./geometry.js";
import { flattenFigma, flattenUi, normalizeName, textKey } from "./tree.js";
import type { FigmaDesign, FigmaNode, MatchPair, UiNode, UiSnapshot } from "./types.js";

export function matchNodes(design: FigmaDesign, actual: UiSnapshot): MatchPair[] {
  const designNodes = flattenFigma(design.root).filter(isComparableDesignNode);
  const actualNodes = flattenUi(actual.root).filter(isComparableUiNode);
  const usedActual = new Set<string>();
  const matches: MatchPair[] = [];

  for (const designNode of designNodes) {
    const candidates = actualNodes
      .filter((actualNode) => !usedActual.has(actualNode.id))
      .map((actualNode) =>
        scoreCandidate(
          designNode,
          actualNode,
          design.root.frame,
          actual.root.frame,
          false,
        ),
      )
      .filter((candidate) => candidate.score >= 0.4)
      .sort((a, b) => b.score - a.score);

    const best = candidates[0];
    if (best) {
      usedActual.add(best.actual.id);
      matches.push(best);
    }
  }

  return matches;
}

export function matchSubtrees(
  designRoot: FigmaNode,
  actualRoot: UiNode,
): MatchPair[] {
  const matches: MatchPair[] = [
    {
      design: designRoot,
      actual: actualRoot,
      score: 1,
      confidence: "high",
      reasons: ["manual-root"],
    },
  ];
  const usedActual = new Set<string>([actualRoot.id]);
  const designParents = parentMap(designRoot);
  const actualParents = parentMap(actualRoot);
  const actualNodes = flattenUi(actualRoot).filter(
    (node) => node.id !== actualRoot.id && isComparableUiNode(node),
  );
  const designNodes = flattenFigma(designRoot).filter(
    (node) => node.id !== designRoot.id && isScopedComparableDesignNode(node),
  );

  for (const designNode of designNodes) {
    const designParentId = designParents.get(designNode.id);
    const matchedParent = matches.find(
      (match) => match.design.id === designParentId,
    );
    const candidates = actualNodes
      .filter((node) => !usedActual.has(node.id))
      .map((actualNode) => {
        const actualParentId = actualParents.get(actualNode.id);
        return scoreCandidate(
          designNode,
          actualNode,
          designRoot.frame,
          actualRoot.frame,
          Boolean(
            matchedParent && matchedParent.actual.id === actualParentId,
          ),
        );
      })
      .filter((candidate) => candidate.score >= 0.38)
      .sort((a, b) => b.score - a.score);
    const best = candidates[0];
    if (best) {
      usedActual.add(best.actual.id);
      matches.push(best);
    }
  }
  return matches;
}

export function findUnmatchedDesignNodes(
  design: FigmaDesign,
  matches: MatchPair[],
): FigmaNode[] {
  const matched = new Set(matches.map((match) => match.design.id));
  return flattenFigma(design.root).filter(
    (node) => isComparableDesignNode(node) && !matched.has(node.id),
  );
}

export function findUnmatchedActualNodes(
  actual: UiSnapshot,
  matches: MatchPair[],
): UiNode[] {
  const matched = new Set(matches.map((match) => match.actual.id));
  return flattenUi(actual.root).filter(
    (node) => isComparableUiNode(node) && !matched.has(node.id),
  );
}

function scoreCandidate(
  design: FigmaNode,
  actual: UiNode,
  designRootFrame: FigmaNode["frame"],
  actualRootFrame: UiNode["frame"],
  parentMatched: boolean,
): MatchPair {
  const reasons: string[] = [];
  let score = 0;

  if (design.text && textKey(design.text) === textKey(actual.text)) {
    score += 0.5;
    reasons.push("text");
  }

  const designName = normalizeName(design.name);
  const actualName = normalizeName(actual.name ?? actual.accessibilityIdentifier);
  if (designName && actualName && (designName.includes(actualName) || actualName.includes(designName))) {
    score += 0.16;
    reasons.push("name");
  }

  if (
    actual.accessibilityIdentifier &&
    designName === normalizeName(actual.accessibilityIdentifier)
  ) {
    score += 0.68;
    reasons.push("accessibilityIdentifier");
  }

  const typeScore = typeCompatibility(design, actual);
  if (typeScore > 0) {
    score += typeScore;
    reasons.push("type");
  }

  if (parentMatched) {
    score += 0.16;
    reasons.push("parent");
  }

  const overlap = iou(design.frame, actual.frame);
  if (overlap > 0) {
    score += Math.min(0.22, overlap * 0.22);
    reasons.push("position");
  }

  const designCenter = center(design.frame);
  const actualCenter = center(actual.frame);
  const centerDistance = Math.hypot(designCenter.x - actualCenter.x, designCenter.y - actualCenter.y);
  if (centerDistance <= 24) {
    score += 0.12;
    reasons.push("center");
  }

  const widthRatio = ratioSimilarity(design.frame.width, actual.frame.width);
  const heightRatio = ratioSimilarity(design.frame.height, actual.frame.height);
  score += 0.14 * ((widthRatio + heightRatio) / 2);
  reasons.push("size");

  const relativeDistance = normalizedRelativeDistance(
    design.frame,
    actual.frame,
    designRootFrame,
    actualRootFrame,
  );
  if (relativeDistance <= 0.12) {
    score += 0.12;
    reasons.push("relative-position");
  } else if (relativeDistance <= 0.25) {
    score += 0.06;
    reasons.push("relative-position");
  }

  const normalizedScore = Math.min(1, score);

  return {
    design,
    actual,
    score: normalizedScore,
    confidence: confidenceFor(normalizedScore),
    reasons,
  };
}

function ratioSimilarity(a: number, b: number): number {
  const max = Math.max(Math.abs(a), Math.abs(b));
  return max === 0 ? 1 : 1 - Math.min(1, Math.abs(a - b) / max);
}

function isComparableDesignNode(node: FigmaNode): boolean {
  return node.type !== "FRAME" || Boolean(node.text);
}

function isScopedComparableDesignNode(node: FigmaNode): boolean {
  return node.frame.width > 0 && node.frame.height > 0;
}

function isComparableUiNode(node: UiNode): boolean {
  if (node.type === "UIWindow" || node.id === "root") {
    return false;
  }
  return node.visible !== false && node.frame.width > 0 && node.frame.height > 0;
}

function confidenceFor(score: number): MatchPair["confidence"] {
  if (score >= 0.8) {
    return "high";
  }
  if (score >= 0.62) {
    return "medium";
  }
  return "low";
}

function typeCompatibility(design: FigmaNode, actual: UiNode): number {
  const designType = design.type.toUpperCase();
  const actualTypes = [actual.type, ...(actual.classChain ?? [])].map((type) =>
    type.toUpperCase(),
  );
  if (
    designType === "TEXT" &&
    actualTypes.some((type) =>
      ["UILABEL", "UITEXTVIEW", "UITEXTFIELD", "CATEXTLAYER"].includes(type),
    )
  ) {
    return 0.16;
  }
  if (
    designType === "IMAGE" &&
    actualTypes.some((type) => type.includes("IMAGE"))
  ) {
    return 0.16;
  }
  if (
    ["FRAME", "GROUP", "COMPONENT", "INSTANCE"].includes(designType) &&
    actualTypes.some(
      (type) =>
        type.includes("VIEW") ||
        type.includes("CELL") ||
        type.includes("CONTROL"),
    )
  ) {
    return 0.1;
  }
  return 0;
}

function normalizedRelativeDistance(
  design: FigmaNode["frame"],
  actual: UiNode["frame"],
  designRoot: FigmaNode["frame"],
  actualRoot: UiNode["frame"],
): number {
  const designX =
    (design.x - designRoot.x + design.width / 2) /
    Math.max(1, designRoot.width);
  const designY =
    (design.y - designRoot.y + design.height / 2) /
    Math.max(1, designRoot.height);
  const actualX =
    (actual.x - actualRoot.x + actual.width / 2) /
    Math.max(1, actualRoot.width);
  const actualY =
    (actual.y - actualRoot.y + actual.height / 2) /
    Math.max(1, actualRoot.height);
  return Math.hypot(designX - actualX, designY - actualY);
}

function parentMap<T extends FigmaNode | UiNode>(root: T): Map<string, string> {
  const result = new Map<string, string>();
  const visit = (node: T) => {
    for (const child of node.children ?? []) {
      result.set(child.id, node.id);
      visit(child as T);
    }
  };
  visit(root);
  return result;
}
