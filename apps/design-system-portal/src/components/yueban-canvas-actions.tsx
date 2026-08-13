"use client";

import { useMemo, useRef, useState } from "react";
import type { PageCanvasPlan } from "@/lib/page-canvas-parser";
import type { PageCanvasAgentVisionResult } from "@/lib/page-canvas-agent-vision";
import { loadImageElement } from "@/lib/page-canvas-reference";
import { copyText, downloadJson } from "@/lib/design-mvp-bundle";
import { exportArtboard750Png, downloadBlob } from "@/lib/yueban-artboard";
import {
  compareReferenceImages,
  type YuebanCompareResult,
} from "@/lib/yueban-compare";
import {
  buildYuebanAgentPrompt,
  buildYuebanArtboardMeta,
} from "@/lib/yueban-layers-manifest";
import { normalizeAgentVisionLayers } from "@/lib/page-canvas-agent-vision";

type YuebanCanvasActionsProps = {
  reference: { fileName: string; dataUrl: string } | null;
  plan: PageCanvasPlan;
  viewportWidth: number;
  viewportHeight: number;
  agentVision: PageCanvasAgentVisionResult | null;
};

export function YuebanCanvasActions({
  reference,
  plan,
  viewportWidth,
  viewportHeight,
  agentVision,
}: YuebanCanvasActionsProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [compareResult, setCompareResult] = useState<YuebanCompareResult | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const actualInputRef = useRef<HTMLInputElement>(null);

  const disabled = !reference;
  const manifestReady = Boolean(agentVision?.yuebanLayers.length);

  const hint = useMemo(() => {
    if (!reference) {
      return "先上传照片参考，在 Cursor 中完成视觉分析并粘贴 JSON，再下载 manifest。";
    }
    if (!manifestReady) {
      return "layers.manifest 来自 Agent 测量的 yuebanLayers，不用 Portal 启发式。";
    }
    return "已接入 Cursor 视觉分析结果，可导出 manifest 与 750 叠图验收。";
  }, [reference, manifestReady]);

  function downloadManifest() {
    if (!reference || !agentVision) {
      setStatus("请先应用 Cursor Agent 返回的 JSON（含 yuebanLayers）。");
      return;
    }
    const layers = normalizeAgentVisionLayers(
      agentVision.yuebanLayers,
      agentVision.sourceImage.width,
    );
    const artboard = buildYuebanArtboardMeta({
      sourceWidth: agentVision.sourceImage.width,
      sourceHeight: agentVision.sourceImage.height,
      plan,
    });
    downloadJson("layers.manifest.json", layers);
    downloadJson("layers.manifest.meta.json", {
      artboard,
      generatedAt: new Date().toISOString(),
      referenceFileName: reference.fileName,
      analysisNotes: agentVision.analysisNotes,
    });
    setStatus("已下载 Agent 生成的 layers.manifest（原图坐标 bbox）。");
  }

  async function downloadArtboard750() {
    if (!reference) {
      return;
    }
    setBusy(true);
    try {
      const { blob, width, height } = await exportArtboard750Png(reference.dataUrl);
      downloadBlob(`reference-750-${width}x${height}.png`, blob);
      setStatus(`已导出 ${width}×${height} 参考画板 PNG。`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "导出失败。");
    } finally {
      setBusy(false);
    }
  }

  async function copyYuebanPrompt() {
    if (!reference) {
      return;
    }
    const img = await loadImageElement(reference.dataUrl);
    const text = buildYuebanAgentPrompt({
      referenceFileName: reference.fileName,
      sourceWidth: img.naturalWidth,
      sourceHeight: img.naturalHeight,
      plan,
      portalViewport: { width: viewportWidth, height: viewportHeight },
    });
    await copyText(text);
    setStatus("已复制 Yueban 切图/叠图指令（精修 Agent 已给出的 bbox）。");
  }

  async function compareActual(file: File | null) {
    if (!reference || !file) {
      return;
    }
    setBusy(true);
    setCompareResult(null);
    try {
      const expected = await exportArtboard750Png(reference.dataUrl);
      const expectedUrl = URL.createObjectURL(expected.blob);
      const actualUrl = URL.createObjectURL(file);
      try {
        const result = await compareReferenceImages({
          expectedSrc: expectedUrl,
          actualSrc: actualUrl,
          threshold: 8,
          failRatio: 0.08,
        });
        setCompareResult(result);
        setStatus(
          result.pass
            ? "叠图验收通过（changed_pixel_ratio ≤ 8% 且尺寸一致）。"
            : "叠图存在差异，请查看指标或调整组件预览。",
        );
      } finally {
        URL.revokeObjectURL(expectedUrl);
        URL.revokeObjectURL(actualUrl);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "对比失败。");
    } finally {
      setBusy(false);
      if (actualInputRef.current) {
        actualInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="yuebanCanvasActions">
      <div className="panelHeader">
        <div>
          <h2 className="panelTitle">Yueban 像素验收</h2>
          <p className="panelDescription">{hint}</p>
        </div>
      </div>
      <div className="buttonRow">
        <button
          type="button"
          className="button buttonPrimary"
          disabled={disabled || busy || !manifestReady}
          onClick={() => downloadManifest()}
        >
          下载 layers.manifest
        </button>
        <button
          type="button"
          className="button buttonSecondary"
          disabled={disabled || busy}
          onClick={() => void downloadArtboard750()}
        >
          导出 750 参考 PNG
        </button>
        <button
          type="button"
          className="button buttonSecondary"
          disabled={disabled || busy}
          onClick={() => void copyYuebanPrompt()}
        >
          复制 Yueban 指令
        </button>
      </div>
      <div className="yuebanCompareRow">
        <input
          ref={actualInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="pageCanvasReferenceFileInput"
          disabled={disabled || busy}
          onChange={(event) =>
            void compareActual(event.target.files?.[0] ?? null)
          }
        />
        <button
          type="button"
          className="button buttonSecondary"
          disabled={disabled || busy}
          onClick={() => actualInputRef.current?.click()}
        >
          上传实现截图并叠图对比
        </button>
      </div>
      <p className="yuebanCliHint">
        Skills：<code>page-canvas-vision</code> ·{" "}
        <code>yueban-image-to-code</code> · CLI{" "}
        <code>npm run yueban:preview-bboxes</code>
      </p>
      {status ? <p className="designMvpStatus">{status}</p> : null}
      {compareResult ? (
        <pre className="yuebanCompareResult">
          {JSON.stringify(compareResult, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
