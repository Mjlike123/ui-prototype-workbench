import { colorDistance, round } from "./geometry.js";
import { auditScope } from "./diff.js";
import { extractSecondaryTabModels } from "./component-model.js";
import { normalizeFigmaToDevice } from "./normalize.js";
import { flattenFigma, flattenUi } from "./tree.js";
import type {
  AuditIssue,
  ComponentAuditProfile,
  ComponentAuditRule,
  ComponentRuleCategory,
  FigmaDesign,
  Rect,
  RGBA,
  SemanticTabItem,
  UiNode,
  UiSnapshot,
} from "./types.js";

export function auditComponent(
  rawDesign: FigmaDesign,
  actual: UiSnapshot,
  actualNodeId: string,
  profile: ComponentAuditProfile,
) {
  const actualNode = flattenUi(actual.root).find(
    (node) => node.id === actualNodeId,
  );
  if (!actualNode) {
    throw new Error(`UI node not found: ${actualNodeId}`);
  }
  const requiredRoles = ["container", "tabItem", "label"] as const;
  if (!requiredRoles.every((role) => profile.roles.includes(role))) {
    throw new Error(`Unsupported component audit profile: ${profile.id}`);
  }

  const scopedActual = { ...actual, root: actualNode };
  const design = normalizeFigmaToDevice(rawDesign, scopedActual);
  const extraction = extractSecondaryTabModels(
    profile,
    design.root,
    actualNode,
  );
  const debugAudit = auditScope(rawDesign, actual, actualNodeId);

  const issues = extraction.structureConfirmed
    ? evaluateRules(
        profile,
        extraction.design.items,
        extraction.actual.items,
        extraction.confidence,
        actual.pageName,
        design,
        actualNode,
      )
    : [
        structureIssue(
          profile,
          extraction.confidence,
          extraction.actual.warnings,
          actual.pageName,
          design.root,
          actualNode,
        ),
      ];

  return {
    design,
    profile: {
      id: profile.id,
      version: profile.version,
      title: profile.title,
    },
    recognition: {
      confidence: extraction.confidence,
      structureConfirmed: extraction.structureConfirmed,
      warnings: extraction.actual.warnings,
    },
    semanticModels: {
      design: extraction.design,
      actual: extraction.actual,
    },
    semanticMapping: extraction.mappings,
    issues: issues.map((issue, index) => ({
      ...issue,
      id: `UI-${String(index + 1).padStart(3, "0")}`,
    })),
    debugIssues: debugAudit.issues,
    matches: debugAudit.matches,
    scope: {
      actualNode,
      designNode: design.root,
    },
  };
}

function evaluateRules(
  profile: ComponentAuditProfile,
  designItems: SemanticTabItem[],
  actualItems: SemanticTabItem[],
  modelConfidence: number,
  pageName: string,
  design: FigmaDesign,
  actualRoot: UiNode,
): Array<Omit<AuditIssue, "id">> {
  const issues: Array<Omit<AuditIssue, "id">> = [];
  const actualByKey = new Map(actualItems.map((item) => [item.key, item]));
  const pairs = designItems
    .map((designItem) => ({
      design: designItem,
      actual: actualByKey.get(designItem.key),
    }))
    .filter(
      (
        pair,
      ): pair is { design: SemanticTabItem; actual: SemanticTabItem } =>
        Boolean(pair.actual),
    );
  const designNodes = new Map(
    flattenFigma(design.root).map((node) => [node.id, node]),
  );
  const actualNodes = new Map(
    flattenUi(actualRoot).map((node) => [node.id, node]),
  );

  for (const rule of profile.rules) {
    const result = evaluateRule(rule, pairs, design, actualRoot);
    if (!result || result.details.length === 0) {
      continue;
    }
    const firstAffected = result.affectedPairs[0];
    const confidence = roundConfidence(
      Math.min(
        modelConfidence,
        ...result.affectedPairs.map((pair) =>
          Math.min(pair.design.confidence, pair.actual.confidence),
        ),
      ),
    );
    const actualFrames = result.affectedPairs.map(
      (pair) => pair.actual.frame,
    );
    issues.push({
      pageName,
      type: issueType(rule),
      severity: severityForDelta(result.maxDelta),
      status: confidence < 0.62 ? "needs_confirmation" : "open",
      ruleId: rule.id,
      group: rule.category,
      profileId: profile.id,
      affectedItems: result.affectedPairs.map((pair) => pair.design.label),
      details: result.details,
      description: `${rule.title}存在 ${result.details.length} 处不一致`,
      suggestion: suggestionForRule(rule),
      designValue: result.designSummary,
      actualValue: result.actualSummary,
      delta: `最大偏差 ${round(result.maxDelta)}${rule.metric.includes("Color") ? " channel" : "pt"}`,
      confidence,
      designNodeId: firstAffected?.design.itemNodeId ?? design.root.id,
      actualNodeId: firstAffected?.actual.itemNodeId ?? actualRoot.id,
      designNode: firstAffected
        ? designNodes.get(firstAffected.design.itemNodeId)
        : design.root,
      actualNode: firstAffected
        ? actualNodes.get(firstAffected.actual.itemNodeId)
        : actualRoot,
      cropHint: unionRects(actualFrames) ?? actualRoot.frame,
    });
  }
  return issues;
}

type ItemPair = {
  design: SemanticTabItem;
  actual: SemanticTabItem;
};

type RuleEvaluation = {
  affectedPairs: ItemPair[];
  details: string[];
  designSummary: string;
  actualSummary: string;
  maxDelta: number;
};

function evaluateRule(
  rule: ComponentAuditRule,
  pairs: ItemPair[],
  design: FigmaDesign,
  actualRoot: UiNode,
): RuleEvaluation | undefined {
  if (rule.id === "container.height") {
    const delta = round(actualRoot.frame.height - design.root.frame.height);
    if (Math.abs(delta) <= rule.tolerance) {
      return undefined;
    }
    const representative =
      pairs[0] ??
      ({
        design: fallbackItem(design.root.id, design.root.frame),
        actual: fallbackItem(actualRoot.id, actualRoot.frame),
      } satisfies ItemPair);
    return {
      affectedPairs: [representative],
      details: [
        `整体高度：设计 ${round(design.root.frame.height)}pt，实际 ${round(actualRoot.frame.height)}pt`,
      ],
      designSummary: `${round(design.root.frame.height)}pt`,
      actualSummary: `${round(actualRoot.frame.height)}pt`,
      maxDelta: Math.abs(delta),
    };
  }

  if (rule.id === "item.gap") {
    return evaluateGaps(rule, pairs);
  }

  const statePairs = rule.state
    ? pairs.filter((pair) => pair.design.state === rule.state)
    : pairs;
  const affectedPairs: ItemPair[] = [];
  const details: string[] = [];
  let maxDelta = 0;

  for (const pair of statePairs) {
    const comparison = comparePair(rule, pair);
    if (!comparison || comparison.delta <= rule.tolerance) {
      continue;
    }
    affectedPairs.push(pair);
    details.push(`${pair.design.label}：${comparison.detail}`);
    maxDelta = Math.max(maxDelta, comparison.delta);
  }
  if (details.length === 0) {
    return undefined;
  }
  return {
    affectedPairs,
    details,
    designSummary: summarizeValues(
      affectedPairs.map((pair) => valueForRule(rule, pair.design)),
    ),
    actualSummary: summarizeValues(
      affectedPairs.map((pair) => valueForRule(rule, pair.actual)),
    ),
    maxDelta,
  };
}

function comparePair(
  rule: ComponentAuditRule,
  pair: ItemPair,
): { delta: number; detail: string } | undefined {
  switch (rule.metric) {
    case "width": {
      const delta = Math.abs(pair.actual.frame.width - pair.design.frame.width);
      return {
        delta,
        detail: `宽度设计 ${round(pair.design.frame.width)}pt，实际 ${round(pair.actual.frame.width)}pt`,
      };
    }
    case "height": {
      const delta = Math.abs(
        pair.actual.frame.height - pair.design.frame.height,
      );
      return {
        delta,
        detail: `高度设计 ${round(pair.design.frame.height)}pt，实际 ${round(pair.actual.frame.height)}pt`,
      };
    }
    case "horizontalPadding": {
      const leftDelta = Math.abs(
        pair.actual.leftPadding - pair.design.leftPadding,
      );
      const rightDelta = Math.abs(
        pair.actual.rightPadding - pair.design.rightPadding,
      );
      return {
        delta: Math.max(leftDelta, rightDelta),
        detail:
          `左右内边距设计 ${round(pair.design.leftPadding)}/${round(pair.design.rightPadding)}pt，` +
          `实际 ${round(pair.actual.leftPadding)}/${round(pair.actual.rightPadding)}pt`,
      };
    }
    case "textColor":
    case "backgroundColor": {
      const designColor =
        rule.metric === "textColor"
          ? pair.design.textColor
          : pair.design.backgroundColor;
      const actualColor =
        rule.metric === "textColor"
          ? pair.actual.textColor
          : pair.actual.backgroundColor;
      const delta = styleColorDistance(designColor, actualColor);
      return {
        delta,
        detail: `设计 ${formatColor(designColor)}，实际 ${formatColor(actualColor)}`,
      };
    }
    case "gap":
      return undefined;
  }
}

function evaluateGaps(
  rule: ComponentAuditRule,
  pairs: ItemPair[],
): RuleEvaluation | undefined {
  const sorted = [...pairs].sort(
    (a, b) => a.design.frame.x - b.design.frame.x,
  );
  const affectedPairs: ItemPair[] = [];
  const details: string[] = [];
  const designValues: number[] = [];
  const actualValues: number[] = [];
  let maxDelta = 0;
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (!previous || !current) {
      continue;
    }
    const designGap =
      current.design.frame.x -
      (previous.design.frame.x + previous.design.frame.width);
    const actualGap =
      current.actual.frame.x -
      (previous.actual.frame.x + previous.actual.frame.width);
    const delta = Math.abs(actualGap - designGap);
    if (delta <= rule.tolerance) {
      continue;
    }
    affectedPairs.push(current);
    designValues.push(designGap);
    actualValues.push(actualGap);
    maxDelta = Math.max(maxDelta, delta);
    details.push(
      `${previous.design.label} → ${current.design.label}：设计 ${round(designGap)}pt，实际 ${round(actualGap)}pt`,
    );
  }
  if (details.length === 0) {
    return undefined;
  }
  return {
    affectedPairs,
    details,
    designSummary: summarizeValues(designValues),
    actualSummary: summarizeValues(actualValues),
    maxDelta,
  };
}

function valueForRule(
  rule: ComponentAuditRule,
  item: SemanticTabItem,
): number | string {
  switch (rule.metric) {
    case "width":
      return item.frame.width;
    case "height":
      return item.frame.height;
    case "horizontalPadding":
      return `${round(item.leftPadding)}/${round(item.rightPadding)}pt`;
    case "textColor":
      return formatColor(item.textColor);
    case "backgroundColor":
      return formatColor(item.backgroundColor);
    case "gap":
      return "-";
  }
}

function structureIssue(
  profile: ComponentAuditProfile,
  confidence: number,
  warnings: string[],
  pageName: string,
  designNode: FigmaDesign["root"],
  actualNode: UiNode,
): AuditIssue {
  const plainWarnings = warnings.map(humanizeStructureWarning);
  return {
    id: "UI-001",
    pageName,
    type: "structure",
    severity: "medium",
    status: "needs_confirmation",
    ruleId: "component.structure",
    group: "structure",
    profileId: profile.id,
    affectedItems: [],
    details: plainWarnings,
    description: `暂时没法自动比对「${profile.title}」`,
    suggestion:
      `请先人工核对：① Lookin 里是否选中了整块「${profile.title}」（不要只选某一个标题或图标）；` +
      `② 组件规范是否选对；③ 标题个数、文案是否和设计稿一致。仍不对时可粘贴具体 Figma 帧链接再验收。`,
    designValue: "设计稿里能数清的标题/按钮",
    actualValue: plainWarnings.join("；") || "实机里标题或按钮识别不全",
    delta: "structure uncertain",
    confidence,
    designNodeId: designNode.id,
    actualNodeId: actualNode.id,
    designNode,
    actualNode,
    cropHint: actualNode.frame,
  };
}

function humanizeStructureWarning(warning: string): string {
  return warning
    .replace(/^设计稿：未可靠识别选中态$/, "设计稿：看不出哪一项是选中态")
    .replace(/^实机：未可靠识别选中态$/, "实机：看不出哪一项是选中态")
    .replace(/^设计稿：可识别的 Tab 少于 2 个$/, "设计稿：标题/按钮少于 2 个，无法对比")
    .replace(/^实机：可识别的 Tab 少于 2 个$/, "实机：标题/按钮少于 2 个，无法对比")
    .replace(
      /^仅匹配 (\d+)\/(\d+) 个 Tab$/,
      "设计稿有 $2 个标题，实机只对上了 $1 个",
    )
    .replace(/^设计稿：(.+)$/, "设计稿：$1")
    .replace(/^实机：(.+)$/, "实机：$1");
}

function issueType(rule: ComponentAuditRule): AuditIssue["type"] {
  if (rule.metric === "gap" || rule.metric === "horizontalPadding") {
    return "spacing";
  }
  if (
    rule.metric === "textColor" ||
    rule.metric === "backgroundColor"
  ) {
    return "color";
  }
  return "size";
}

function suggestionForRule(rule: ComponentAuditRule): string {
  switch (rule.metric) {
    case "height":
      return rule.id === "container.height"
        ? "按设计稿调整二级 Tab 整体高度"
        : "按设计稿统一按钮高度";
    case "width":
      return "按设计稿调整对应按钮宽度";
    case "horizontalPadding":
      return "调整文字容器，使左右内边距与设计稿一致";
    case "gap":
      return "统一相邻 Tab 的水平间距";
    case "textColor":
      return `调整${rule.state === "selected" ? "选中态" : "未选中态"}文字颜色`;
    case "backgroundColor":
      return `调整${rule.state === "selected" ? "选中态" : "未选中态"}背景颜色`;
  }
}

function styleColorDistance(a?: RGBA, b?: RGBA): number {
  const alphaA = a ? (a.a ?? 1) : 0;
  const alphaB = b ? (b.a ?? 1) : 0;
  if (alphaA <= 0.001 && alphaB <= 0.001) {
    return 0;
  }
  if (!a || !b) {
    return 255;
  }
  return Math.max(
    colorDistance(a, b),
    Math.abs((a.a ?? 1) * 255 - (b.a ?? 1) * 255),
  );
}

function formatColor(color?: RGBA): string {
  if (!color) {
    return "transparent";
  }
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${round(color.a ?? 1)})`;
}

function summarizeValues(values: Array<number | string>): string {
  return [...new Set(values.map((value) => String(roundIfNumber(value))))].join(
    " / ",
  );
}

function roundIfNumber(value: number | string): number | string {
  return typeof value === "number" ? `${round(value)}pt` : value;
}

function unionRects(rects: Rect[]): Rect | undefined {
  if (rects.length === 0) {
    return undefined;
  }
  const left = Math.min(...rects.map((rect) => rect.x));
  const top = Math.min(...rects.map((rect) => rect.y));
  const right = Math.max(...rects.map((rect) => rect.x + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.height));
  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
}

function fallbackItem(id: string, frame: Rect): SemanticTabItem {
  return {
    key: id,
    label: "整体",
    state: "unselected",
    itemNodeId: id,
    labelNodeId: id,
    frame,
    labelFrame: frame,
    leftPadding: 0,
    rightPadding: 0,
    confidence: 1,
  };
}

function severityForDelta(delta: number): AuditIssue["severity"] {
  if (delta >= 12) return "high";
  if (delta >= 6) return "medium";
  return "low";
}

function roundConfidence(value: number): number {
  return Math.round(value * 100) / 100;
}
