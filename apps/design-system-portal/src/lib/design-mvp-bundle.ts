import type { PageCanvasBlock, PageCanvasPlan } from "./page-canvas-parser";

export type DesignMvpLayer = {
  id: string;
  type: "component";
  kind: PageCanvasBlock["kind"];
  componentId: string;
  zIndex: number;
};

/** 与 Yueban manifest 对齐的「组件层」描述；bbox 在 DS 组件化路径下由契约代替像素坐标 */
export type DesignMvpReferenceMeta = {
  present: true;
  fileName?: string;
  overlayOpacity?: number;
  restoredFromReference?: boolean;
};

export type DesignMvpManifest = {
  schemaVersion: 1;
  source: "page-canvas";
  generatedAt: string;
  prompt: string;
  viewport: { width: number; height: number };
  designWidthNote: string;
  plan: PageCanvasPlan;
  reference?: DesignMvpReferenceMeta;
  layers: DesignMvpLayer[];
  specHints: {
    foundations: "specs/foundations/*.yaml";
    components: string[];
    interactions: string[];
  };
};

export function planToLayers(plan: PageCanvasPlan): DesignMvpLayer[] {
  return plan.blocks.map((block, index) => ({
    id: `${block.kind}-${index + 1}`,
    type: "component" as const,
    kind: block.kind,
    componentId: block.componentId,
    zIndex: index + 1,
  }));
}

export function buildDesignMvpManifest(input: {
  prompt: string;
  plan: PageCanvasPlan;
  viewportWidth: number;
  viewportHeight: number;
  reference?: DesignMvpReferenceMeta;
}): DesignMvpManifest {
  const componentIds = [
    ...new Set(input.plan.blocks.map((block) => block.componentId)),
  ];
  return {
    schemaVersion: 1,
    source: "page-canvas",
    generatedAt: new Date().toISOString(),
    prompt: input.prompt,
    viewport: {
      width: input.viewportWidth,
      height: input.viewportHeight,
    },
    designWidthNote:
      "Portal 视口为逻辑宽（默认 375）。与 750px 设计稿叠图对比时 scale=2。",
    plan: input.plan,
    ...(input.reference ? { reference: input.reference } : {}),
    layers: planToLayers(input.plan),
    specHints: {
      foundations: "specs/foundations/*.yaml",
      components: componentIds.map((id) => `specs/components/${id}.yaml`),
      interactions: componentIds.map(
        (id) => `specs/interactions/*${id}*.yaml`,
      ),
    },
  };
}

export function buildMonkrenReviewPrompt(input: {
  manifest: DesignMvpManifest;
}): string {
  const { manifest } = input;
  const components = [
    ...new Set(manifest.layers.map((layer) => layer.componentId)),
  ];
  return [
    "只读审查，不要修改任何文件。",
    "",
    "## 对象",
    `- 原型设计 MVP · 意图 \`${manifest.plan.intent}\` · 标题「${manifest.plan.title}」`,
    `- 视口 ${manifest.viewport.width}×${manifest.viewport.height}`,
    `- 用户描述：${manifest.prompt}`,
    "",
    "## 对照规范",
    "- specs/foundations（色彩、字、间距、动效）",
    ...components.map((id) => `- specs/components/${id}.yaml`),
    "- 相关 specs/interactions/*.yaml",
    "",
    "## 模块栈（自上而下）",
    ...manifest.layers.map(
      (layer) =>
        `- z${layer.zIndex} \`${layer.componentId}\` (${layer.kind})`,
    ),
    "",
    "## 执行",
    "- 主模块：monkren-design → skills/04-review/5-dim-review",
    "- 按需追加：ai-slop-check、interaction-states-pass",
    "- 每条发现须引用 spec 条目或（若有）实现文件/行号",
    "- 输出：P0/P1/P2 + 五维简分（带证据）+ 是否可交付",
    "",
    manifest.plan.warnings.length > 0
      ? `## 生成器提示\n${manifest.plan.warnings.map((w) => `- ${w}`).join("\n")}`
      : "",
    manifest.reference?.present
      ? "## 照片参考\n- 用户提供了截图参考；组件栈可能来自布局启发式还原，请对照 foundations + 组件契约做视觉验收。"
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}
