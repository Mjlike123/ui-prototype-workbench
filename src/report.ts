import { mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import type { AuditIssue, FigmaDesign, UiSnapshot } from "./types.js";

export type ReportResult = {
  csvPath: string;
  annotationPaths: string[];
};

export async function writeReport(
  issues: AuditIssue[],
  snapshot: UiSnapshot,
  outputDir: string,
  options: {
    design?: FigmaDesign;
    profile?: { id: string; version: string };
  } = {},
): Promise<ReportResult> {
  await mkdir(outputDir, { recursive: true });

  const annotationPaths: string[] = [];
  for (const issue of issues) {
    const annotationPath = join(outputDir, `${issue.id}.svg`);
    await writeFile(
      annotationPath,
      renderAnnotation(issue, snapshot, options.design),
      "utf8",
    );
    annotationPaths.push(annotationPath);
  }

  const csvPath = join(outputDir, "lark-report.csv");
  await writeFile(
    csvPath,
    renderCsv(issues, annotationPaths, options.design, options.profile),
    "utf8",
  );

  return {
    csvPath,
    annotationPaths,
  };
}

export function renderCsv(
  issues: AuditIssue[],
  annotationPaths: string[],
  design?: FigmaDesign,
  profile?: { id: string; version: string },
): string {
  const header = [
    "页面",
    "问题编号",
    "问题截图",
    "问题类型",
    "问题描述",
    "建议修复",
    "设计值",
    "实际值",
    "偏差",
    "匹配置信度",
    "Figma 节点 ID",
    "Lookin 节点 ID",
    "设计版本",
    "组件规范",
    "规则 ID",
    "严重程度",
    "状态",
    "负责人",
  ];

  const rows = issues.map((issue, index) => [
    issue.pageName,
    issue.id,
    basename(annotationPaths[index] ?? ""),
    issue.type,
    issue.description,
    issue.suggestion,
    issue.designValue,
    issue.actualValue,
    issue.delta,
    `${Math.round(issue.confidence * 100)}%`,
    issue.designNodeId ?? "",
    issue.actualNodeId ?? "",
    design?.designVersion ?? "",
    profile ? `${profile.id}@${profile.version}` : issue.profileId ?? "",
    issue.ruleId ?? "",
    issue.severity,
    statusLabel(issue.status),
    "",
  ]);

  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export function renderAnnotation(
  issue: AuditIssue,
  snapshot: UiSnapshot,
  design?: FigmaDesign,
): string {
  const absoluteRect = issue.cropHint ?? issue.actualNode?.frame ?? issue.designNode?.frame ?? {
    x: 0,
    y: 0,
    width: snapshot.device.width,
    height: snapshot.device.height,
  };
  const rootFrame = snapshot.root.frameToRoot ?? snapshot.root.frame;
  const rect = {
    x: absoluteRect.x - rootFrame.x,
    y: absoluteRect.y - rootFrame.y,
    width: absoluteRect.width,
    height: absoluteRect.height,
  };
  const width = Math.max(1, rootFrame.width);
  const height = Math.max(1, rootFrame.height);
  const screenshot = snapshot.screenshotData ?? snapshot.root.screenshotData;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="600">`,
    "<defs>",
    '<marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#d92d20"/></marker>',
    "</defs>",
    `<rect x="0" y="0" width="${width}" height="${height}" fill="#f7f8fa"/>`,
    screenshot
      ? `<image href="data:image/png;base64,${screenshot}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="none"/>`
      : renderDeviceOutline(width, height),
    `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" fill="rgba(255,0,0,0.08)" stroke="#d92d20" stroke-width="2"/>`,
    `<line x1="${rect.x}" y1="0" x2="${rect.x}" y2="${height}" stroke="#d92d20" stroke-width="1" stroke-dasharray="4 3" opacity=".7"/>`,
    `<line x1="${rect.x + rect.width}" y1="0" x2="${rect.x + rect.width}" y2="${height}" stroke="#d92d20" stroke-width="1" stroke-dasharray="4 3" opacity=".7"/>`,
    `<line x1="${rect.x}" y1="${Math.max(8, rect.y - 8)}" x2="${rect.x + rect.width}" y2="${Math.max(8, rect.y - 8)}" stroke="#d92d20" marker-start="url(#arrow)" marker-end="url(#arrow)"/>`,
    `<text x="${rect.x + rect.width / 2}" y="${Math.max(7, rect.y - 11)}" text-anchor="middle" fill="#d92d20" font-size="10" font-family="Arial">${escapeXml(`${roundValue(rect.width)}pt`)}</text>`,
    `<line x1="${Math.min(width - 8, rect.x + rect.width + 8)}" y1="${rect.y}" x2="${Math.min(width - 8, rect.x + rect.width + 8)}" y2="${rect.y + rect.height}" stroke="#d92d20" marker-start="url(#arrow)" marker-end="url(#arrow)"/>`,
    `<text x="${Math.min(width - 10, rect.x + rect.width + 13)}" y="${rect.y + rect.height / 2}" fill="#d92d20" font-size="10" font-family="Arial">${escapeXml(`${roundValue(rect.height)}pt`)}</text>`,
    `<circle cx="${rect.x}" cy="${rect.y}" r="10" fill="#d92d20"/>`,
    `<text x="${rect.x + 14}" y="${Math.max(16, rect.y - 8)}" fill="#d92d20" font-size="14" font-family="Arial">${escapeXml(issue.id)} ${escapeXml(issue.type)}</text>`,
    `<rect x="${Math.max(4, Math.min(rect.x, width - 250))}" y="${Math.min(height - 32, rect.y + rect.height + 8)}" width="246" height="24" rx="4" fill="rgba(255,255,255,.92)"/>`,
    `<text x="${Math.max(8, Math.min(rect.x + 4, width - 246))}" y="${Math.min(height - 15, rect.y + rect.height + 24)}" fill="#1f2329" font-size="11" font-family="Arial">${escapeXml(issue.suggestion)}</text>`,
    design?.nodeId
      ? `<text x="6" y="${height - 6}" fill="#646a73" font-size="8" font-family="Arial">Figma ${escapeXml(design.nodeId)} · Lookin ${escapeXml(issue.actualNodeId ?? "-")}</text>`
      : "",
    "</svg>",
  ].join("\n");
}

function renderDeviceOutline(width: number, height: number): string {
  return `<rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="#c9cdd4" stroke-width="1"/>`;
}

function csvCell(value: string): string {
  const normalized = value.replace(/\r?\n/g, " ");
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusLabel(status: AuditIssue["status"]): string {
  switch (status) {
    case "confirmed":
      return "已确认";
    case "ignored":
      return "已忽略";
    case "needs_confirmation":
      return "需确认";
    case "open":
      return "待处理";
  }
}

function roundValue(value: number): number {
  return Math.round(value * 10) / 10;
}
