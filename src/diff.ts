import { colorDistance, rectToString, round } from "./geometry.js";
import {
  findUnmatchedActualNodes,
  findUnmatchedDesignNodes,
  matchNodes,
  matchSubtrees,
} from "./matcher.js";
import { normalizeFigmaToDevice } from "./normalize.js";
import { flattenFigma, flattenUi } from "./tree.js";
import type {
  AuditConfig,
  AuditIssue,
  FigmaDesign,
  FigmaNode,
  MatchPair,
  UiNode,
  UiSnapshot,
} from "./types.js";

type DraftIssue = Omit<
  AuditIssue,
  "id" | "status" | "confidence" | "designNodeId" | "actualNodeId"
> &
  Partial<
    Pick<
      AuditIssue,
      "status" | "confidence" | "designNodeId" | "actualNodeId"
    >
  >;

export const defaultConfig: AuditConfig = {
  thresholds: {
    sizePt: 2,
    sizePercent: 0.05,
    spacingPt: 2,
    alignmentPt: 2,
    colorChannel: 12,
    fontSizePt: 1,
    lineHeightPt: 2,
    cornerRadiusPt: 1,
    lowConfidence: 0.62,
  },
};

export function auditPage(
  rawDesign: FigmaDesign,
  actual: UiSnapshot,
  config: AuditConfig = defaultConfig,
): { design: FigmaDesign; matches: MatchPair[]; issues: AuditIssue[] } {
  const design = normalizeFigmaToDevice(rawDesign, actual);
  const matches = matchNodes(design, actual);
  const issues: DraftIssue[] = [];

  for (const match of matches) {
    issues.push(...diffMatchedNode(match, actual.pageName, config));
  }

  issues.push(...diffSpacing(matches, actual.pageName, config));
  issues.push(...diffSiblingAlignment(matches, actual.pageName, config));
  issues.push(...diffMissing(design, matches, actual.pageName));
  issues.push(...diffExtra(actual, matches, actual.pageName));

  return {
    design,
    matches,
    issues: numberIssues(issues, config),
  };
}

export function auditScope(
  rawDesign: FigmaDesign,
  actual: UiSnapshot,
  actualNodeId: string,
  config: AuditConfig = defaultConfig,
): {
  design: FigmaDesign;
  matches: MatchPair[];
  issues: AuditIssue[];
  scope: { actualNode: UiNode; designNode?: FigmaNode };
} {
  const actualNode = flattenUi(actual.root).find((node) => node.id === actualNodeId);
  if (!actualNode) {
    throw new Error(`UI node not found: ${actualNodeId}`);
  }
  const scopedActual = { ...actual, root: actualNode };
  const design = normalizeFigmaToDevice(rawDesign, scopedActual);
  const designNode = design.root;
  const scopedMatches = matchSubtrees(designNode, actualNode);
  const issues: DraftIssue[] = [];

  for (const match of scopedMatches) {
    issues.push(...diffMatchedNode(match, actual.pageName, config));
  }
  issues.push(...diffSpacing(scopedMatches, actual.pageName, config));
  issues.push(...diffSiblingAlignment(scopedMatches, actual.pageName, config));

  issues.push(...diffMissingForScope(designNode, scopedMatches, actual.pageName));
  issues.push(...diffExtraForScope(actualNode, scopedMatches, actual.pageName));

  return {
    design,
    matches: scopedMatches,
    issues: numberIssues(issues, config),
    scope: {
      actualNode,
      designNode,
    },
  };
}

function numberIssues(
  issues: DraftIssue[],
  config: AuditConfig,
): AuditIssue[] {
  return issues.map((issue, index) => {
    const confidence = issue.confidence ?? 0.4;
    return {
      ...issue,
      id: `UI-${String(index + 1).padStart(3, "0")}`,
      confidence,
      status:
        issue.status ??
        (confidence < config.thresholds.lowConfidence
          ? "needs_confirmation"
          : "open"),
      designNodeId: issue.designNodeId ?? issue.designNode?.id,
      actualNodeId: issue.actualNodeId ?? issue.actualNode?.id,
    };
  });
}

function diffMatchedNode(
  match: MatchPair,
  pageName: string,
  config: AuditConfig,
): DraftIssue[] {
  const issues: DraftIssue[] = [];
  const { design, actual } = match;
  const thresholds = config.thresholds;
  const widthDelta = round(actual.frame.width - design.frame.width);
  const heightDelta = round(actual.frame.height - design.frame.height);
  const widthPercent = Math.abs(widthDelta) / Math.max(1, design.frame.width);
  const heightPercent = Math.abs(heightDelta) / Math.max(1, design.frame.height);
  const isImage = design.type.toUpperCase() === "IMAGE";

  if (
    Math.abs(widthDelta) > thresholds.sizePt &&
    widthPercent > thresholds.sizePercent
  ) {
    issues.push({
      pageName,
      type: isImage ? "image" : "size",
      severity: severityFor(Math.abs(widthDelta)),
      description: `${label(design)} ${isImage ? "图片" : ""}宽度与设计不一致`,
      suggestion:
        widthDelta > 0
          ? `宽度减少 ${Math.abs(widthDelta)}pt 到 ${round(design.frame.width)}pt`
          : `宽度增加 ${Math.abs(widthDelta)}pt 到 ${round(design.frame.width)}pt`,
      designValue: `${round(design.frame.width)}pt`,
      actualValue: `${round(actual.frame.width)}pt`,
      delta: `${widthDelta > 0 ? "+" : ""}${widthDelta}pt`,
      designNode: design,
      actualNode: actual,
      cropHint: actual.frame,
    });
  }

  if (
    Math.abs(heightDelta) > thresholds.sizePt &&
    heightPercent > thresholds.sizePercent
  ) {
    issues.push({
      pageName,
      type: isImage ? "image" : "size",
      severity: severityFor(Math.abs(heightDelta)),
      description: `${label(design)} ${isImage ? "图片" : ""}高度与设计不一致`,
      suggestion:
        heightDelta > 0
          ? `高度减少 ${Math.abs(heightDelta)}pt 到 ${round(design.frame.height)}pt`
          : `高度增加 ${Math.abs(heightDelta)}pt 到 ${round(design.frame.height)}pt`,
      designValue: `${round(design.frame.height)}pt`,
      actualValue: `${round(actual.frame.height)}pt`,
      delta: `${heightDelta > 0 ? "+" : ""}${heightDelta}pt`,
      designNode: design,
      actualNode: actual,
      cropHint: actual.frame,
    });
  }

  const xDelta = round(actual.frame.x - design.frame.x);
  if (Math.abs(xDelta) > thresholds.alignmentPt) {
    issues.push({
      pageName,
      type: "alignment",
      severity: severityFor(Math.abs(xDelta)),
      description: `${label(design)} 左边缘未对齐`,
      suggestion:
        xDelta > 0
          ? `左边距减少 ${Math.abs(xDelta)}pt`
          : `左边距增加 ${Math.abs(xDelta)}pt`,
      designValue: rectToString(design.frame),
      actualValue: rectToString(actual.frame),
      delta: `${xDelta > 0 ? "+" : ""}${xDelta}pt`,
      designNode: design,
      actualNode: actual,
      cropHint: actual.frame,
    });
  }

  const yDelta = round(actual.frame.y - design.frame.y);
  if (Math.abs(yDelta) > thresholds.alignmentPt) {
    issues.push({
      pageName,
      type: "alignment",
      severity: severityFor(Math.abs(yDelta)),
      description: `${label(design)} 上边缘未对齐`,
      suggestion:
        yDelta > 0
          ? `向上移动 ${Math.abs(yDelta)}pt`
          : `向下移动 ${Math.abs(yDelta)}pt`,
      designValue: rectToString(design.frame),
      actualValue: rectToString(actual.frame),
      delta: `${yDelta > 0 ? "+" : ""}${yDelta}pt`,
      designNode: design,
      actualNode: actual,
      cropHint: actual.frame,
    });
  }

  const textChanged = design.text && actual.text && design.text.trim() !== actual.text.trim();
  if (textChanged) {
    issues.push({
      pageName,
      type: "text",
      severity: "medium",
      description: `${label(design)} 文案与设计不一致`,
      suggestion: `文案改为“${design.text}”`,
      designValue: design.text ?? "",
      actualValue: actual.text ?? "",
      delta: "text mismatch",
      designNode: design,
      actualNode: actual,
      cropHint: actual.frame,
    });
  }

  const designColor = displayColor(design);
  const actualColor = actual.color ?? actual.backgroundColor;
  const colorDelta = colorDistance(designColor, actualColor);
  if (colorDelta > thresholds.colorChannel) {
    issues.push({
      pageName,
      type: "color",
      severity: colorDelta > 32 ? "medium" : "low",
      description: `${label(design)} 颜色与设计不一致`,
      suggestion: "调整为设计稿颜色",
      designValue: designColor ? rgb(designColor) : "-",
      actualValue: actualColor ? rgb(actualColor) : "-",
      delta: `${round(colorDelta)} channel`,
      designNode: design,
      actualNode: actual,
      cropHint: actual.frame,
    });
  }

  if (
    design.fontSize !== undefined &&
    actual.fontSize !== undefined &&
    Math.abs(actual.fontSize - design.fontSize) > thresholds.fontSizePt
  ) {
    const delta = round(actual.fontSize - design.fontSize);
    issues.push({
      pageName,
      type: "font",
      severity: severityFor(Math.abs(delta)),
      description: `${label(design)} 字号与设计不一致`,
      suggestion: `字号调整为 ${round(design.fontSize)}pt`,
      designValue: `${round(design.fontSize)}pt`,
      actualValue: `${round(actual.fontSize)}pt`,
      delta: `${delta > 0 ? "+" : ""}${delta}pt`,
      designNode: design,
      actualNode: actual,
      cropHint: actual.frame,
    });
  }

  if (
    design.fontWeight !== undefined &&
    actual.fontWeight !== undefined &&
    normalizeFontWeight(design.fontWeight) !==
      normalizeFontWeight(actual.fontWeight)
  ) {
    issues.push({
      pageName,
      type: "font",
      severity: "medium",
      description: `${label(design)} 字重与设计不一致`,
      suggestion: `字重调整为 ${normalizeFontWeight(design.fontWeight)}`,
      designValue: String(normalizeFontWeight(design.fontWeight)),
      actualValue: String(normalizeFontWeight(actual.fontWeight)),
      delta: "font-weight mismatch",
      designNode: design,
      actualNode: actual,
      cropHint: actual.frame,
    });
  }

  if (
    design.lineHeight !== undefined &&
    actual.lineHeight !== undefined &&
    Math.abs(actual.lineHeight - design.lineHeight) > thresholds.lineHeightPt
  ) {
    const delta = round(actual.lineHeight - design.lineHeight);
    issues.push({
      pageName,
      type: "font",
      severity: severityFor(Math.abs(delta)),
      description: `${label(design)} 行高与设计不一致`,
      suggestion: `行高调整为 ${round(design.lineHeight)}pt`,
      designValue: `${round(design.lineHeight)}pt`,
      actualValue: `${round(actual.lineHeight)}pt`,
      delta: `${delta > 0 ? "+" : ""}${delta}pt`,
      designNode: design,
      actualNode: actual,
      cropHint: actual.frame,
    });
  }

  if (
    design.cornerRadius !== undefined &&
    actual.cornerRadius !== undefined &&
    Math.abs(actual.cornerRadius - design.cornerRadius) >
      thresholds.cornerRadiusPt
  ) {
    const delta = round(actual.cornerRadius - design.cornerRadius);
    issues.push({
      pageName,
      type: "cornerRadius",
      severity: severityFor(Math.abs(delta)),
      description: `${label(design)} 圆角与设计不一致`,
      suggestion: `圆角调整为 ${round(design.cornerRadius)}pt`,
      designValue: `${round(design.cornerRadius)}pt`,
      actualValue: `${round(actual.cornerRadius)}pt`,
      delta: `${delta > 0 ? "+" : ""}${delta}pt`,
      designNode: design,
      actualNode: actual,
      cropHint: actual.frame,
    });
  }

  return issues.map((issue) => ({
    ...issue,
    confidence: match.score,
  }));
}

function diffSpacing(
  matches: MatchPair[],
  pageName: string,
  config: AuditConfig,
): DraftIssue[] {
  const issues: DraftIssue[] = [];
  const vertical = [...matches].sort(
    (a, b) => a.design.frame.y - b.design.frame.y,
  );

  for (let index = 1; index < vertical.length; index += 1) {
    const previous = vertical[index - 1];
    const current = vertical[index];
    if (!previous || !current || !sameColumn(previous.design, current.design)) {
      continue;
    }

    const designGap = round(
      current.design.frame.y -
        (previous.design.frame.y + previous.design.frame.height),
    );
    const actualGap = round(
      current.actual.frame.y -
        (previous.actual.frame.y + previous.actual.frame.height),
    );
    const delta = round(actualGap - designGap);

    if (
      designGap >= 0 &&
      actualGap >= 0 &&
      Math.abs(delta) > config.thresholds.spacingPt
    ) {
      issues.push({
        pageName,
        type: "spacing",
        severity: severityFor(Math.abs(delta)),
        description: `${label(previous.design)} 与 ${label(current.design)} 的垂直间距不一致`,
        suggestion:
          delta > 0
            ? `间距减少 ${Math.abs(delta)}pt 到 ${designGap}pt`
            : `间距增加 ${Math.abs(delta)}pt 到 ${designGap}pt`,
        designValue: `${designGap}pt`,
        actualValue: `${actualGap}pt`,
        delta: `${delta > 0 ? "+" : ""}${delta}pt`,
        designNode: current.design,
        actualNode: current.actual,
        cropHint: current.actual.frame,
        confidence: Math.min(previous.score, current.score),
      });
    }
  }

  const horizontal = [...matches].sort(
    (a, b) => a.design.frame.x - b.design.frame.x,
  );
  for (let index = 1; index < horizontal.length; index += 1) {
    const previous = horizontal[index - 1];
    const current = horizontal[index];
    if (!previous || !current || !sameRow(previous.design, current.design)) {
      continue;
    }
    const designGap = round(
      current.design.frame.x -
        (previous.design.frame.x + previous.design.frame.width),
    );
    const actualGap = round(
      current.actual.frame.x -
        (previous.actual.frame.x + previous.actual.frame.width),
    );
    const delta = round(actualGap - designGap);
    if (
      designGap >= 0 &&
      actualGap >= 0 &&
      Math.abs(delta) > config.thresholds.spacingPt
    ) {
      issues.push({
        pageName,
        type: "spacing",
        severity: severityFor(Math.abs(delta)),
        description: `${label(previous.design)} 与 ${label(current.design)} 的水平间距不一致`,
        suggestion:
          delta > 0
            ? `间距减少 ${Math.abs(delta)}pt 到 ${designGap}pt`
            : `间距增加 ${Math.abs(delta)}pt 到 ${designGap}pt`,
        designValue: `${designGap}pt`,
        actualValue: `${actualGap}pt`,
        delta: `${delta > 0 ? "+" : ""}${delta}pt`,
        designNode: current.design,
        actualNode: current.actual,
        cropHint: current.actual.frame,
        confidence: Math.min(previous.score, current.score),
      });
    }
  }

  return issues;
}

function diffSiblingAlignment(
  matches: MatchPair[],
  pageName: string,
  config: AuditConfig,
): DraftIssue[] {
  const issues: DraftIssue[] = [];
  for (let leftIndex = 0; leftIndex < matches.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < matches.length;
      rightIndex += 1
    ) {
      const first = matches[leftIndex];
      const second = matches[rightIndex];
      if (!first || !second) {
        continue;
      }
      const relation = alignedRelation(first.design, second.design);
      if (!relation) {
        continue;
      }
      const actualDelta = round(
        alignmentValue(second.actual.frame, relation.axis) -
          alignmentValue(first.actual.frame, relation.axis),
      );
      if (Math.abs(actualDelta) <= config.thresholds.alignmentPt) {
        continue;
      }
      issues.push({
        pageName,
        type: "alignment",
        severity: severityFor(Math.abs(actualDelta)),
        description: `${label(first.design)} 与 ${label(second.design)} 的${relation.label}未对齐`,
        suggestion: `将 ${label(second.design)} ${relation.suggestion} ${Math.abs(actualDelta)}pt`,
        designValue: `${relation.label}一致`,
        actualValue: `相差 ${Math.abs(actualDelta)}pt`,
        delta: `${actualDelta > 0 ? "+" : ""}${actualDelta}pt`,
        designNode: second.design,
        actualNode: second.actual,
        cropHint: second.actual.frame,
        confidence: Math.min(first.score, second.score),
      });
    }
  }
  return issues;
}

function diffMissing(
  design: FigmaDesign,
  matches: MatchPair[],
  pageName: string,
): DraftIssue[] {
  return findUnmatchedDesignNodes(design, matches).map((node) => ({
    pageName,
    type: "missing",
    severity: "high",
    description: `${label(node)} 在实机页面缺失`,
    suggestion: "补齐该设计元素或确认设计稿是否已废弃",
    designValue: rectToString(node.frame),
    actualValue: "-",
    delta: "missing",
    designNode: node,
    cropHint: node.frame,
  }));
}

function diffExtra(
  actual: UiSnapshot,
  matches: MatchPair[],
  pageName: string,
): DraftIssue[] {
  return findUnmatchedActualNodes(actual, matches)
    .filter((node) => node.frame.width * node.frame.height > 100)
    .map((node) => ({
      pageName,
      type: "extra",
      severity: "low",
      description: `${node.name ?? node.type} 是设计稿中未匹配到的实机元素`,
      suggestion: "确认是否为动态内容；如非预期请移除或同步设计稿",
      designValue: "-",
      actualValue: rectToString(node.frame),
      delta: "extra",
      actualNode: node,
      cropHint: node.frame,
    }));
}

function diffMissingForScope(
  designNode: FigmaNode,
  matches: MatchPair[],
  pageName: string,
): DraftIssue[] {
  const matched = new Set(matches.map((match) => match.design.id));
  return flattenFigma(designNode)
    .filter((node) => node.id !== designNode.id && (node.type !== "FRAME" || Boolean(node.text)))
    .filter((node) => !matched.has(node.id))
    .map((node) => ({
      pageName,
      type: "missing",
      severity: "high",
      description: `${label(node)} 在选中模块内缺失`,
      suggestion: "补齐该设计元素或确认该模块设计是否已变化",
      designValue: rectToString(node.frame),
      actualValue: "-",
      delta: "missing",
      designNode: node,
      cropHint: node.frame,
    }));
}

function diffExtraForScope(
  actualNode: UiNode,
  matches: MatchPair[],
  pageName: string,
): DraftIssue[] {
  const matched = new Set(matches.map((match) => match.actual.id));
  return flattenUi(actualNode)
    .filter((node) => node.id !== actualNode.id)
    .filter((node) => node.visible !== false && node.frame.width * node.frame.height > 100)
    .filter((node) => !matched.has(node.id))
    .map((node) => ({
      pageName,
      type: "extra",
      severity: "low",
      description: `${node.name ?? node.type} 是选中模块内未匹配到的实机元素`,
      suggestion: "确认是否为动态内容；如非预期请移除或同步设计稿",
      designValue: "-",
      actualValue: rectToString(node.frame),
      delta: "extra",
      actualNode: node,
      cropHint: node.frame,
    }));
}

function sameColumn(a: FigmaNode, b: FigmaNode): boolean {
  return Math.abs(a.frame.x - b.frame.x) <= 8 || Math.abs(a.frame.x + a.frame.width / 2 - (b.frame.x + b.frame.width / 2)) <= 8;
}

function sameRow(a: FigmaNode, b: FigmaNode): boolean {
  return (
    Math.abs(a.frame.y - b.frame.y) <= 8 ||
    Math.abs(
      a.frame.y +
        a.frame.height / 2 -
        (b.frame.y + b.frame.height / 2),
    ) <= 8
  );
}

function label(node: FigmaNode): string {
  return node.text ? `“${node.text}”` : node.name;
}

function severityFor(delta: number): "low" | "medium" | "high" {
  if (delta >= 12) {
    return "high";
  }
  if (delta >= 6) {
    return "medium";
  }
  return "low";
}

function rgb(color: { r: number; g: number; b: number }): string {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

function displayColor(node: FigmaNode) {
  return node.type.toUpperCase() === "TEXT"
    ? node.color
    : node.backgroundColor ?? node.color;
}

function normalizeFontWeight(value: number | string): number | string {
  if (typeof value === "number") {
    return Math.round(value / 100) * 100;
  }
  const normalized = value.toLowerCase();
  if (normalized.includes("bold")) return 700;
  if (normalized.includes("semibold")) return 600;
  if (normalized.includes("medium")) return 500;
  if (normalized.includes("light")) return 300;
  if (normalized.includes("regular")) return 400;
  return normalized;
}

type AlignmentAxis =
  | "left"
  | "right"
  | "centerX"
  | "top"
  | "centerY"
  | "baseline";

function alignedRelation(
  first: FigmaNode,
  second: FigmaNode,
):
  | {
      axis: AlignmentAxis;
      label: string;
      suggestion: string;
    }
  | undefined {
  const tolerance = 1;
  const firstIsText = first.type.toUpperCase() === "TEXT";
  const secondIsText = second.type.toUpperCase() === "TEXT";
  const candidates: Array<{
    axis: AlignmentAxis;
    label: string;
    suggestion: string;
  }> = [
    ...(firstIsText && secondIsText
      ? [
          {
            axis: "baseline" as const,
            label: "文字基线",
            suggestion: "沿垂直方向移动",
          },
        ]
      : []),
    { axis: "centerX", label: "水平中心", suggestion: "沿水平方向移动" },
    { axis: "left", label: "左边缘", suggestion: "沿水平方向移动" },
    { axis: "right", label: "右边缘", suggestion: "沿水平方向移动" },
    { axis: "centerY", label: "垂直中心", suggestion: "沿垂直方向移动" },
    { axis: "top", label: "上边缘", suggestion: "沿垂直方向移动" },
  ];
  return candidates.find(
    (candidate) =>
      Math.abs(
        alignmentValue(first.frame, candidate.axis) -
          alignmentValue(second.frame, candidate.axis),
      ) <= tolerance,
  );
}

function alignmentValue(
  frame: FigmaNode["frame"],
  axis: AlignmentAxis,
): number {
  switch (axis) {
    case "left":
      return frame.x;
    case "right":
      return frame.x + frame.width;
    case "centerX":
      return frame.x + frame.width / 2;
    case "top":
      return frame.y;
    case "centerY":
      return frame.y + frame.height / 2;
    case "baseline":
      return frame.y + frame.height;
  }
}
