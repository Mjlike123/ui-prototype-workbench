"use client";

/* eslint-disable @next/next/no-img-element -- user-selected object URLs cannot use next/image */

import { useEffect, useMemo, useRef, useState } from "react";
import { downloadBlob } from "@/lib/yueban-artboard";
import { inspectBrowserImages } from "@/lib/visual-inspection/browser-engine";
import {
  buildInspectionBoard,
  inspectionJson,
  inspectionMarkdown,
} from "@/lib/visual-inspection/exports";
import {
  appendInspectionHistory,
  clearInspectionHistory,
  loadInspectionHistory,
  type VisualInspectionHistoryEntry,
} from "@/lib/visual-inspection/history";
import type {
  InspectionIssue,
  InspectionIssueType,
  InspectionMode,
  InspectionResult,
  InspectionSeverity,
} from "@/lib/visual-inspection/types";

type LoadedImage = {
  fileName: string;
  url: string;
  image: HTMLImageElement;
};

type ViewMode = "annotated" | "split" | "overlay";
type SeverityFilter = InspectionSeverity | "全部";
type TypeFilter = InspectionIssueType | "全部";

const severityOptions: SeverityFilter[] = ["全部", "严重", "中等", "轻微"];
const typeOptions: TypeFilter[] = ["全部", "颜色", "位置", "内容", "布局"];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function VisualInspectionWorkbench() {
  const [reference, setReference] = useState<LoadedImage | null>(null);
  const [implementation, setImplementation] = useState<LoadedImage | null>(null);
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [history, setHistory] = useState<VisualInspectionHistoryEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("annotated");
  const [opacity, setOpacity] = useState(50);
  const [zoom, setZoom] = useState(100);
  const [severity, setSeverity] = useState<SeverityFilter>("全部");
  const [type, setType] = useState<TypeFilter>("全部");
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("请上传设计稿和实现截图。");
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const implementationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setHistory(loadInspectionHistory()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(
    () => () => {
      if (reference) URL.revokeObjectURL(reference.url);
    },
    [reference],
  );
  useEffect(
    () => () => {
      if (implementation) URL.revokeObjectURL(implementation.url);
    },
    [implementation],
  );

  const filteredIssues = useMemo(
    () =>
      (result?.issues ?? []).filter(
        (issue) =>
          (severity === "全部" || issue.severity === severity) &&
          (type === "全部" || issue.type === type),
      ),
    [result, severity, type],
  );
  const activeIssue =
    filteredIssues.find((issue) => issue.id === activeIssueId) ?? null;

  async function selectImage(
    file: File | null,
    setter: (image: LoadedImage | null) => void,
    kind: "参考图" | "实现图",
  ) {
    if (!file) return;
    try {
      const loaded = await loadSelectedImage(file);
      setter(loaded);
      setResult(null);
      setActiveIssueId(null);
      setStatus(`${kind}已就绪：${file.name}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : `${kind}读取失败。`);
    }
  }

  async function inspect() {
    if (!reference || !implementation) return;
    setBusy(true);
    setStatus("正在读取像素并定位差异…");
    try {
      const next = await inspectBrowserImages({
        reference: reference.image,
        implementation: implementation.image,
        referenceFileName: reference.fileName,
        implementationFileName: implementation.fileName,
      });
      setResult(next);
      setActiveIssueId(next.issues[0]?.id ?? null);
      setHistory(appendInspectionHistory(next));
      setStatus(
        next.issues.length
          ? `走查完成：发现 ${next.issues.length} 个可见差异区域。`
          : "走查完成：未发现超过当前阈值的差异。",
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "走查失败。");
    } finally {
      setBusy(false);
    }
  }

  function restoreHistory(entry: VisualInspectionHistoryEntry) {
    setResult(entry.result);
    setReference(null);
    setImplementation(null);
    setActiveIssueId(entry.result.issues[0]?.id ?? null);
    setStatus("已恢复历史结论；如需查看画布或重新走查，请重新选择两张原图。");
  }

  async function exportBoard() {
    if (!result || !implementation) {
      setStatus("导出 PNG 验收板需要重新选择实现图。");
      return;
    }
    setBusy(true);
    try {
      const blob = await buildInspectionBoard(result, implementation.image);
      downloadBlob("visual-inspection-board.png", blob);
      setStatus("已导出 PNG 验收板。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "PNG 导出失败。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="visualInspection">
      <section className="visualInspectionCommand" aria-label="视觉走查输入">
        <ImageInput
          title="设计稿"
          step="1"
          image={reference}
          inputRef={referenceInputRef}
          onChange={(file) => void selectImage(file, setReference, "参考图")}
        />
        <ImageInput
          title="实现截图"
          step="2"
          image={implementation}
          inputRef={implementationInputRef}
          onChange={(file) =>
            void selectImage(file, setImplementation, "实现图")
          }
        />
        <button
          type="button"
          className="button buttonPrimary visualInspectionRun"
          disabled={!reference || !implementation || busy}
          onClick={() => void inspect()}
        >
          {busy ? "处理中…" : result ? "重新走查" : "开始走查"}
        </button>
      </section>

      <div className="visualInspectionNotice" role="note">
        <strong>实验性像素基线</strong>
        <span>
          同尺寸走精确对比；宽屏非等比图按「边缘固定 + 中间拉伸」重映射（对齐视觉基础 · 宽屏与多尺寸适配）；等比缩放仍用全局缩放基线。不作为自动验收门禁。
        </span>
      </div>

      <section className="visualInspectionWorkspace">
        <div className="visualInspectionStage panel">
          <header className="visualInspectionToolbar">
            <div>
              <h2 className="panelTitle">差异画布</h2>
              <p className="panelDescription">
                {result
                  ? `${modeLabel(result.mode)} · 置信度 ${result.confidence}% · 变化像素 ${(result.totalChangedPixelRatio * 100).toFixed(2)}%${
                      result.adaptive
                        ? ` · 边距 ${result.adaptive.targetGutters.left}/${result.adaptive.targetGutters.right}px`
                        : ""
                    }`
                  : "完成双图上传后开始走查"}
              </p>
            </div>
            <div className="visualInspectionViewTabs" role="tablist" aria-label="对比视图">
              {[
                ["annotated", "实现图标注"],
                ["split", "平铺对比"],
                ["overlay", "透明叠加"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={viewMode === value}
                  className={viewMode === value ? "active" : ""}
                  onClick={() => setViewMode(value as ViewMode)}
                  disabled={!implementation}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="visualInspectionTools">
              {viewMode === "overlay" ? (
                <label>
                  设计稿 {opacity}%
                  <input
                    aria-label="设计稿透明度"
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={opacity}
                    onChange={(event) => setOpacity(Number(event.target.value))}
                  />
                </label>
              ) : null}
              <label>
                缩放
                <select
                  aria-label="画布缩放"
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                >
                  <option value="50">50%</option>
                  <option value="75">75%</option>
                  <option value="100">100%</option>
                  <option value="125">125%</option>
                  <option value="150">150%</option>
                </select>
              </label>
            </div>
          </header>
          <ComparisonViewer
            reference={reference}
            implementation={implementation}
            result={result}
            issues={filteredIssues}
            activeIssue={activeIssue}
            viewMode={viewMode}
            opacity={opacity}
            zoom={zoom}
            onIssueSelect={setActiveIssueId}
          />
        </div>

        <aside className="visualInspectionRail panel" aria-label="走查问题清单">
          <header className="visualInspectionRailHeader">
            <div>
              <h2 className="panelTitle">问题清单</h2>
              <p className="panelDescription">
                {result ? `${filteredIssues.length} / ${result.issues.length} 个区域` : "尚未走查"}
              </p>
            </div>
            {activeIssueId ? (
              <button
                className="textLink"
                type="button"
                onClick={() => setActiveIssueId(null)}
              >
                取消定位
              </button>
            ) : null}
          </header>
          <FilterGroup
            label="严重度"
            options={severityOptions}
            value={severity}
            onChange={setSeverity}
            count={(option) =>
              option === "全部"
                ? result?.issues.length ?? 0
                : result?.issues.filter((issue) => issue.severity === option).length ?? 0
            }
          />
          <FilterGroup
            label="类型"
            options={typeOptions}
            value={type}
            onChange={setType}
          />
          <div className="visualInspectionIssues" role="list">
            {filteredIssues.length ? (
              filteredIssues.map((issue, index) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  index={result ? result.issues.indexOf(issue) + 1 : index + 1}
                  active={activeIssueId === issue.id}
                  onSelect={() => setActiveIssueId(issue.id)}
                />
              ))
            ) : (
              <div className="visualInspectionEmpty">
                {result ? "当前筛选下没有问题。" : "走查结果会显示在这里。"}
              </div>
            )}
          </div>
          <ExportActions
            result={result}
            implementationReady={Boolean(implementation)}
            busy={busy}
            onBoard={() => void exportBoard()}
            onStatus={setStatus}
          />
        </aside>
      </section>

      <section className="visualInspectionHistory panel" aria-label="最近走查">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">最近走查</h2>
            <p className="panelDescription">
              保存结果摘要，不保存原始截图；恢复后可查看结论。
            </p>
          </div>
          {history.length ? (
            <button
              type="button"
              className="button buttonSecondary"
              onClick={() => {
                clearInspectionHistory();
                setHistory([]);
              }}
            >
              清空历史
            </button>
          ) : null}
        </div>
        {history.length ? (
          <div className="visualInspectionHistoryList">
            {history.map((entry) => (
              <button
                type="button"
                key={entry.id}
                onClick={() => restoreHistory(entry)}
              >
                <span>
                  <strong>{entry.referenceFileName}</strong>
                  <small>对比 {entry.implementationFileName}</small>
                </span>
                <span>
                  {entry.issueCounts.严重} 严重 · {entry.issueCounts.中等} 中等 ·{" "}
                  {entry.issueCounts.轻微} 轻微
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="visualInspectionEmpty">还没有走查记录。</p>
        )}
      </section>

      <p className="visualInspectionStatus" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

function ImageInput({
  title,
  step,
  image,
  inputRef,
  onChange,
}: {
  title: string;
  step: string;
  image: LoadedImage | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className={`visualInspectionInput${image ? " ready" : ""}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <span className="visualInspectionStep">{step}</span>
      <span>
        <strong>{title}</strong>
        <small>
          {image
            ? `${image.fileName} · ${image.image.naturalWidth}×${image.image.naturalHeight}`
            : "PNG / JPG / WebP · 8MB 内"}
        </small>
      </span>
      {image ? <img src={image.url} alt="" /> : null}
    </label>
  );
}

export function ComparisonViewer({
  reference,
  implementation,
  result,
  issues,
  activeIssue,
  viewMode,
  opacity,
  zoom,
  onIssueSelect,
}: {
  reference: LoadedImage | null;
  implementation: LoadedImage | null;
  result: InspectionResult | null;
  issues: InspectionIssue[];
  activeIssue: InspectionIssue | null;
  viewMode: ViewMode;
  opacity: number;
  zoom: number;
  onIssueSelect: (id: string) => void;
}) {
  if (!implementation) {
    return (
      <div className="visualInspectionCanvasEmpty">
        <strong>等待实现截图</strong>
        <span>上传两张图片后可平铺、叠加和标注差异。</span>
      </div>
    );
  }
  if (viewMode === "split") {
    return (
      <div className="visualInspectionCanvasScroll">
        <div
          className="visualInspectionSplit"
          style={{ width: `${Math.max(100, zoom * 2)}%` }}
        >
          <figure>
            {reference ? <img src={reference.url} alt="设计稿" /> : null}
            <figcaption>设计稿</figcaption>
          </figure>
          <figure>
            <div className="visualInspectionSplitImage">
              <img src={implementation.url} alt="实现截图" />
              <AnnotationLayer
                result={result}
                issues={issues}
                activeIssue={activeIssue}
                onIssueSelect={onIssueSelect}
              />
            </div>
            <figcaption>实现截图</figcaption>
          </figure>
        </div>
      </div>
    );
  }
  return (
    <div className="visualInspectionCanvasScroll">
      <div
        className="visualInspectionImageStage"
        style={{
          width: `${zoom}%`,
          aspectRatio: `${implementation.image.naturalWidth} / ${implementation.image.naturalHeight}`,
        }}
      >
        <img src={implementation.url} alt="实现截图" />
        {viewMode === "overlay" && reference ? (
          <img
            className="visualInspectionOverlay"
            src={reference.url}
            alt=""
            aria-hidden="true"
            style={{ opacity: opacity / 100 }}
          />
        ) : null}
        <AnnotationLayer
          result={result}
          issues={issues}
          activeIssue={activeIssue}
          onIssueSelect={onIssueSelect}
        />
      </div>
    </div>
  );
}

function AnnotationLayer({
  result,
  issues,
  activeIssue,
  onIssueSelect,
}: {
  result: InspectionResult | null;
  issues: InspectionIssue[];
  activeIssue: InspectionIssue | null;
  onIssueSelect: (id: string) => void;
}) {
  if (!result) return null;
  return (
    <div className="visualInspectionAnnotationLayer" aria-label="差异标注">
      {issues.map((issue) => {
        const number = result.issues.indexOf(issue) + 1;
        return (
          <button
            type="button"
            key={issue.id}
            aria-label={`定位问题 ${number}：${issue.summary}`}
            aria-pressed={activeIssue?.id === issue.id}
            className={`visualInspectionAnnotation${activeIssue?.id === issue.id ? " active" : ""}`}
            style={{
              left: `${(issue.bbox.x / result.implementation.width) * 100}%`,
              top: `${(issue.bbox.y / result.implementation.height) * 100}%`,
              width: `${(issue.bbox.width / result.implementation.width) * 100}%`,
              height: `${(issue.bbox.height / result.implementation.height) * 100}%`,
            }}
            onClick={() => onIssueSelect(issue.id)}
          >
            <span>{number}</span>
          </button>
        );
      })}
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  count,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  count?: (value: T) => number;
}) {
  return (
    <div className="visualInspectionFilters" aria-label={label}>
      {options.map((option) => (
        <button
          type="button"
          key={option}
          aria-pressed={value === option}
          className={value === option ? "active" : ""}
          onClick={() => onChange(option)}
        >
          {option}
          {count ? <span>{count(option)}</span> : null}
        </button>
      ))}
    </div>
  );
}

function IssueRow({
  issue,
  index,
  active,
  onSelect,
}: {
  issue: InspectionIssue;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="listitem"
      className={`visualInspectionIssue${active ? " active" : ""}`}
      aria-current={active ? "true" : undefined}
      onClick={onSelect}
    >
      <span className={`visualInspectionIssueNumber severity-${issue.severity}`}>
        {index}
      </span>
      <span>
        <strong>
          {issue.severity} · {issue.type}
        </strong>
        <small>{issue.summary}</small>
        <small>
          x {issue.bbox.x}, y {issue.bbox.y} · {issue.bbox.width}×
          {issue.bbox.height}
        </small>
      </span>
    </button>
  );
}

function ExportActions({
  result,
  implementationReady,
  busy,
  onBoard,
  onStatus,
}: {
  result: InspectionResult | null;
  implementationReady: boolean;
  busy: boolean;
  onBoard: () => void;
  onStatus: (status: string) => void;
}) {
  function downloadText(name: string, content: string, type: string) {
    downloadBlob(name, new Blob([content], { type }));
    onStatus(`已导出 ${name}。`);
  }
  return (
    <div className="visualInspectionExports">
      <strong>导出结果</strong>
      <div className="buttonRow">
        <button
          type="button"
          className="button buttonSecondary"
          disabled={!result || !implementationReady || busy}
          onClick={onBoard}
        >
          PNG 验收板
        </button>
        <button
          type="button"
          className="button buttonSecondary"
          disabled={!result || busy}
          onClick={() =>
            result &&
            downloadText(
              "visual-inspection.md",
              inspectionMarkdown(result),
              "text/markdown;charset=utf-8",
            )
          }
        >
          Markdown
        </button>
        <button
          type="button"
          className="button buttonSecondary"
          disabled={!result || busy}
          onClick={() =>
            result &&
            downloadText(
              "visual-inspection.json",
              inspectionJson(result),
              "application/json;charset=utf-8",
            )
          }
        >
          JSON
        </button>
      </div>
    </div>
  );
}

async function loadSelectedImage(file: File): Promise<LoadedImage> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    throw new Error("请选择 PNG、JPG 或 WebP 图片。");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("图片过大，请使用 8MB 以内的截图。");
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const next = new Image();
      next.onload = () => resolve(next);
      next.onerror = () => reject(new Error("图片读取失败。"));
      next.src = url;
    });
    return { fileName: file.name, url, image };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

function modeLabel(mode: InspectionMode) {
  if (mode === "exact") return "同尺寸像素基线";
  if (mode === "adaptive-layout") return "宽屏自适应（固定边距 + 内容拉伸）";
  return "全局缩放基线";
}
