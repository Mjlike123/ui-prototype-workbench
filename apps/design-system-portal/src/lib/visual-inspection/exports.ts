import type { InspectionResult, InspectionSeverity } from "./types";

const severityOrder: InspectionSeverity[] = ["严重", "中等", "轻微"];

export function inspectionJson(result: InspectionResult) {
  return JSON.stringify(result, null, 2);
}

export function inspectionMarkdown(result: InspectionResult) {
  const lines = [
    "# UI 视觉走查结果",
    "",
    `- 参考图：${result.reference.fileName}（${result.reference.width} × ${result.reference.height}）`,
    `- 实现图：${result.implementation.fileName}（${result.implementation.width} × ${result.implementation.height}）`,
    `- 模式：${result.mode === "exact" ? "同尺寸像素基线" : "全局缩放基线"}`,
    `- 置信度：${result.confidence}%`,
    `- 变化像素：${formatPercent(result.totalChangedPixelRatio)}`,
    "",
  ];

  for (const severity of severityOrder) {
    const issues = result.issues.filter((issue) => issue.severity === severity);
    if (issues.length === 0) continue;
    lines.push(`## ${severity}（${issues.length}）`, "");
    for (const issue of issues) {
      lines.push(
        `- [ ] ${issue.id} · ${issue.type} · ${issue.summary}`,
        `  - 区域：x ${issue.bbox.x}, y ${issue.bbox.y}, ${issue.bbox.width} × ${issue.bbox.height}`,
      );
    }
    lines.push("");
  }

  if (result.issues.length === 0) {
    lines.push("未发现超过当前阈值的可见差异。", "");
  }
  lines.push("注：基础像素结果仅用于辅助走查，不作为自动验收门禁。");
  return lines.join("\n");
}

export async function buildInspectionBoard(
  result: InspectionResult,
  implementation: HTMLImageElement,
): Promise<Blob> {
  const imageWidth = implementation.naturalWidth;
  const imageHeight = implementation.naturalHeight;
  const panelWidth = Math.max(320, Math.min(520, Math.round(imageWidth * 0.46)));
  const rowHeight = 74;
  const panelHeight = 112 + Math.max(1, result.issues.length) * rowHeight;
  const canvas = document.createElement("canvas");
  canvas.width = imageWidth + panelWidth;
  canvas.height = Math.max(imageHeight, panelHeight);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("当前浏览器无法生成验收板。");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(implementation, 0, 0, imageWidth, imageHeight);
  context.font = "700 14px sans-serif";
  context.textBaseline = "middle";
  result.issues.forEach((issue, index) => {
    const { x, y, width, height } = issue.bbox;
    context.strokeStyle = "#d92d20";
    context.lineWidth = 3;
    context.strokeRect(x, y, width, height);
    const labelX = Math.min(imageWidth - 16, x + width);
    const labelY = Math.max(14, y);
    context.fillStyle = "#d92d20";
    context.beginPath();
    context.arc(labelX, labelY, 13, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.fillText(String(index + 1), labelX, labelY + 1);
  });

  const panelX = imageWidth;
  context.fillStyle = "#f5f5f7";
  context.fillRect(panelX, 0, panelWidth, canvas.height);
  context.fillStyle = "#1d1d1f";
  context.textAlign = "left";
  context.font = "700 24px sans-serif";
  context.fillText("视觉走查问题", panelX + 24, 38);
  context.font = "400 13px sans-serif";
  context.fillStyle = "#6e6e73";
  context.fillText(
    `${result.issues.length} 个问题 · 置信度 ${result.confidence}%`,
    panelX + 24,
    70,
  );
  result.issues.forEach((issue, index) => {
    const top = 102 + index * rowHeight;
    context.fillStyle = "#ffffff";
    context.fillRect(panelX + 16, top, panelWidth - 32, rowHeight - 8);
    context.fillStyle = "#1d1d1f";
    context.font = "700 14px sans-serif";
    context.fillText(
      `${index + 1}. ${issue.severity} · ${issue.type}`,
      panelX + 28,
      top + 22,
    );
    context.fillStyle = "#6e6e73";
    context.font = "400 12px sans-serif";
    drawWrappedText(context, issue.summary, panelX + 28, top + 44, panelWidth - 56, 16);
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("验收板生成失败。"))),
      "image/png",
    );
  });
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const characters = [...text];
  let line = "";
  let lineIndex = 0;
  for (const character of characters) {
    const next = line + character;
    if (context.measureText(next).width > maxWidth && line) {
      context.fillText(line, x, y + lineIndex * lineHeight);
      line = character;
      lineIndex += 1;
      if (lineIndex >= 2) break;
    } else {
      line = next;
    }
  }
  if (line && lineIndex < 2) context.fillText(line, x, y + lineIndex * lineHeight);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}
