"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PageCanvasStage } from "@/components/page-canvas-stage";
import { ProfilePagePrototype } from "@/components/prototypes/profile-page-prototype";
import { DesignMvpActions } from "@/components/design-mvp-actions";
import { YuebanCanvasActions } from "@/components/yueban-canvas-actions";
import {
  getPageCanvasExamples,
  parsePageCanvasPrompt,
  type PageCanvasPlan,
} from "@/lib/page-canvas-parser";
import {
  clampPageCanvasDimension,
  DEFAULT_PAGE_CANVAS_PRESET_ID,
  findMatchingPresetId,
  getPageCanvasPreset,
  PAGE_CANVAS_SIZE_PRESETS,
} from "@/lib/page-canvas-size";
import {
  loadImageElement,
  readReferenceImageFile,
  revokeReferenceImage,
  type PageCanvasReferenceState,
} from "@/lib/page-canvas-reference";
import {
  buildCursorVisionAnalysisPrompt,
  extractJsonFromAgentText,
  parsePageCanvasAgentVisionResult,
  type PageCanvasAgentVisionResult,
} from "@/lib/page-canvas-agent-vision";
import { copyText } from "@/lib/design-mvp-bundle";
import { downloadBlob } from "@/lib/yueban-artboard";
import {
  appendPageCanvasHistoryEntry,
  buildHistoryEntry,
  clearPageCanvasHistory,
  formatHistorySavedAt,
  isDuplicateOfLatest,
  loadPageCanvasHistory,
  removePageCanvasHistoryEntry,
  type PageCanvasHistoryEntry,
} from "@/lib/page-canvas-history";

const DEFAULT_PROMPT = "我想要一个个人 profile 页面";
const defaultPreset = getPageCanvasPreset(DEFAULT_PAGE_CANVAS_PRESET_ID)!;

export function PageCanvasShowcase() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [plan, setPlan] = useState<PageCanvasPlan>(() =>
    parsePageCanvasPrompt(DEFAULT_PROMPT),
  );
  const [viewportWidth, setViewportWidth] = useState(defaultPreset.width);
  const [viewportHeight, setViewportHeight] = useState(defaultPreset.height);
  const [reference, setReference] = useState<PageCanvasReferenceState | null>(
    null,
  );
  const [referenceOverlayOpacity, setReferenceOverlayOpacity] = useState(35);
  const [showReferenceOverlay, setShowReferenceOverlay] = useState(true);
  const [agentVision, setAgentVision] =
    useState<PageCanvasAgentVisionResult | null>(null);
  const [agentJsonDraft, setAgentJsonDraft] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<PageCanvasHistoryEntry[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const examples = getPageCanvasExamples();
  const componentIds = useMemo(
    () => [...new Set(plan.blocks.map((block) => block.componentId))],
    [plan],
  );
  const activePresetId = findMatchingPresetId(viewportWidth, viewportHeight);

  useEffect(() => {
    return () => revokeReferenceImage(reference);
  }, [reference]);

  useEffect(() => {
    const timer = window.setTimeout(() => setHistory(loadPageCanvasHistory()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function currentSnapshot() {
    return {
      prompt,
      plan,
      viewportWidth,
      viewportHeight,
      reference: reference
        ? { fileName: reference.fileName, dataUrl: reference.dataUrl }
        : null,
    };
  }

  function persistHistory(
    source: PageCanvasHistoryEntry["source"],
    options?: { skipIfDuplicate?: boolean },
  ) {
    const entry = buildHistoryEntry(currentSnapshot(), source);
    const existing = loadPageCanvasHistory();
    if (options?.skipIfDuplicate && isDuplicateOfLatest(entry, existing[0])) {
      setHistory(existing);
      if (existing[0]) setActiveHistoryId(existing[0].id);
      return entry;
    }
    const next = appendPageCanvasHistoryEntry(entry);
    setHistory(next);
    setActiveHistoryId(entry.id);
    return entry;
  }

  function restoreHistoryEntry(entry: PageCanvasHistoryEntry) {
    revokeReferenceImage(reference);
    setPrompt(entry.prompt);
    setPlan(entry.plan);
    setViewportWidth(entry.viewport.width);
    setViewportHeight(entry.viewport.height);
    setAgentVision(null);
    setAgentJsonDraft("");
    if (entry.reference?.dataUrl) {
      setReference({
        fileName: entry.reference.fileName,
        dataUrl: entry.reference.dataUrl,
        objectUrl: entry.reference.dataUrl,
      });
      setShowReferenceOverlay(true);
    } else {
      setReference(null);
    }
    setActiveHistoryId(entry.id);
    setStatus(`已恢复历史：${entry.plan.title}`);
  }

  function applyPrompt(nextPrompt: string, options?: { recordHistory?: boolean }) {
    setPrompt(nextPrompt);
    setPlan(parsePageCanvasPrompt(nextPrompt));
    setAgentVision(null);
    if (options?.recordHistory !== false) {
      persistHistory("auto", { skipIfDuplicate: true });
    }
    setStatus("已切换原型");
  }

  function applyPreset(id: string) {
    const preset = getPageCanvasPreset(id);
    if (!preset) return;
    setViewportWidth(preset.width);
    setViewportHeight(preset.height);
  }

  async function copyPrototypePrompt() {
    const stack = plan.blocks
      .map(
        (block, index) =>
          `${index + 1}. ${block.componentId} (${block.kind})`,
      )
      .join("\n");
    await copyText(
      [
        "使用 @toptop-prototype-studio 在当前项目中继续实现这个功能原型，默认采用 Hybrid 模式。",
        "",
        `用户目标：${prompt}`,
        `原型标题：${plan.title}`,
        `视口：${viewportWidth}×${viewportHeight}`,
        "",
        "当前 Kit 组件栈：",
        stack,
        "",
        "要求：",
        "- 读取对应 specs/components、foundations 和 interactions",
        "- Kit 组件作为稳定锚点；缺失区域允许使用基础 UI 原语和 Prototype 模块",
        "- 每个可见层标记 source: kit | primitive | prototype",
        "- 直接在目标项目实现可运行交互，不要另起低保真画布",
        "- 使用真实业务文案和状态",
        "- 无法映射的区域列为 kitGap，不要虚构 componentId",
        "- 如果用户需要创意，先用 generate-variations 给出稳妥、精炼、新颖三个方向并推荐一个",
        "- 完成后调用 @toptop-design-review 做只读验收",
      ].join("\n"),
    );
    setStatus("已复制 Cursor 原型任务");
  }

  async function handleReferenceFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    try {
      revokeReferenceImage(reference);
      const next = await readReferenceImageFile(file);
      setReference(next);
      setAgentVision(null);
      setAgentJsonDraft("");
      setShowReferenceOverlay(true);
      persistHistory("auto", { skipIfDuplicate: true });
      setStatus("参考图已加入，可在 Cursor 中分析");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "参考图加载失败");
    } finally {
      setBusy(false);
    }
  }

  function clearReference() {
    revokeReferenceImage(reference);
    setReference(null);
    setAgentVision(null);
    setAgentJsonDraft("");
    setStatus("已移除参考图");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function copyVisionPrompt() {
    if (!reference) return;
    setBusy(true);
    try {
      const image = await loadImageElement(reference.dataUrl);
      await copyText(
        buildCursorVisionAnalysisPrompt({
          referenceFileName: reference.fileName,
          sourceWidth: image.naturalWidth,
          sourceHeight: image.naturalHeight,
          viewportWidth,
          viewportHeight,
          userPrompt: prompt,
        }),
      );
      setStatus("已复制视觉分析任务，请在 Cursor 中附上同一张图");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "复制失败");
    } finally {
      setBusy(false);
    }
  }

  async function downloadReference() {
    if (!reference) return;
    const response = await fetch(reference.dataUrl);
    downloadBlob(reference.fileName, await response.blob());
    setStatus("已下载参考图");
  }

  function applyAgentResult() {
    setBusy(true);
    try {
      const result = parsePageCanvasAgentVisionResult(
        extractJsonFromAgentText(agentJsonDraft),
      );
      setPlan(result.plan);
      setAgentVision(result);
      persistHistory("auto", { skipIfDuplicate: true });
      setStatus("已应用 Agent 分析结果");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "JSON 解析失败");
    } finally {
      setBusy(false);
    }
  }

  const referenceOverlay =
    reference && showReferenceOverlay
      ? { src: reference.dataUrl, opacity: referenceOverlayOpacity / 100 }
      : null;

  return (
    <div className="canvasShowcase">
      <header className="canvasShowcaseToolbar">
        <div className="canvasShowcaseIdentity">
          <span className="canvasShowcaseStatus" aria-hidden="true" />
          <div>
            <strong>{plan.title}</strong>
            <small>
              {viewportWidth} × {viewportHeight} · {componentIds.length} 个 Kit
              组件
            </small>
          </div>
        </div>

        <div className="canvasShowcaseControls">
          <label className="canvasCompactControl">
            <span>原型</span>
            <select
              aria-label="切换示例原型"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) applyPrompt(event.target.value);
                event.target.value = "";
              }}
            >
              <option value="">切换示例</option>
              {examples.map((example) => (
                <option key={example} value={example}>
                  {example}
                </option>
              ))}
            </select>
          </label>
          <label className="canvasCompactControl">
            <span>设备</span>
            <select
              aria-label="切换设备尺寸"
              value={activePresetId}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {PAGE_CANVAS_SIZE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
              <option value="custom">自定义</option>
            </select>
          </label>
          <button
            type="button"
            className="button buttonPrimary"
            onClick={() => void copyPrototypePrompt()}
          >
            在 Cursor 中继续
          </button>
        </div>
      </header>

      {status ? (
        <p className="canvasShowcaseNotice" role="status">
          {status}
        </p>
      ) : null}

      <div className="canvasShowcaseLayout">
        <main className="canvasShowcaseStage" aria-label="功能原型预览">
          {plan.intent === "profile" ? (
            <ProfilePagePrototype width={viewportWidth} height={viewportHeight} />
          ) : (
            <PageCanvasStage
              plan={plan}
              width={viewportWidth}
              height={viewportHeight}
              referenceOverlay={referenceOverlay}
            />
          )}
        </main>

        <aside className="canvasShowcaseInspector" aria-label="原型信息">
          <section className="canvasInspectorSection">
            <p className="canvasInspectorLabel">当前原型</p>
            <h2>{plan.title}</h2>
            <p>{prompt}</p>
            <div className="pageCanvasSpecRow">
              {componentIds.map((id) => (
                <code key={id}>{id}</code>
              ))}
            </div>
          </section>

          <section className="canvasInspectorSection">
            <p className="canvasInspectorLabel">交付状态</p>
            <div className="canvasReadiness">
              <span
                className={
                  plan.warnings.length === 0
                    ? "canvasReadinessMark canvasReadinessMarkReady"
                    : "canvasReadinessMark"
                }
                aria-hidden="true"
              />
              <div>
                <strong>
                  {plan.warnings.length === 0
                    ? "可进入审查"
                    : `${plan.warnings.length} 个待确认项`}
                </strong>
                <small>
                  {plan.intent === "profile"
                    ? "功能原型 · /prototypes/profile"
                    : agentVision
                      ? "已包含 Agent 视觉映射"
                      : "当前为 Kit 组件预览"}
                </small>
              </div>
            </div>
            {plan.warnings.length > 0 ? (
              <ul className="canvasWarningList">
                {plan.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="canvasInspectorSection">
            <div className="canvasInspectorHeading">
              <div>
                <p className="canvasInspectorLabel">视觉参考</p>
                <strong>{reference ? reference.fileName : "未添加"}</strong>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="pageCanvasReferenceFileInput"
                onChange={(event) =>
                  void handleReferenceFile(event.target.files?.[0] ?? null)
                }
              />
              <button
                type="button"
                className="button buttonSecondary"
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
              >
                {reference ? "更换" : "添加"}
              </button>
            </div>
            {reference ? (
              <>
                <label className="pageCanvasReferenceCheck">
                  <input
                    type="checkbox"
                    checked={showReferenceOverlay}
                    onChange={(event) =>
                      setShowReferenceOverlay(event.target.checked)
                    }
                  />
                  叠加参考图
                </label>
                <label className="canvasOpacityControl">
                  <span>透明度 {referenceOverlayOpacity}%</span>
                  <input
                    type="range"
                    min={0}
                    max={90}
                    step={5}
                    value={referenceOverlayOpacity}
                    disabled={!showReferenceOverlay}
                    onChange={(event) =>
                      setReferenceOverlayOpacity(Number(event.target.value))
                    }
                  />
                </label>
              </>
            ) : (
              <p className="canvasInspectorHint">
                参考图只用于对照，不改变 Kit 组件本身。
              </p>
            )}
          </section>

          <details className="canvasAdvanced">
            <summary>输入与 Agent 交接</summary>
            <div className="canvasAdvancedContent">
              <label className="pageCanvasPromptLabel" htmlFor="canvas-prompt">
                原型描述
              </label>
              <textarea
                id="canvas-prompt"
                className="pageCanvasPromptInput canvasCompactTextarea"
                rows={4}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
              <button
                type="button"
                className="button buttonSecondary"
                onClick={() => applyPrompt(prompt)}
              >
                更新预览
              </button>

              {reference ? (
                <>
                  <div className="canvasAdvancedActions">
                    <button
                      type="button"
                      className="button buttonSecondary"
                      disabled={busy}
                      onClick={() => void copyVisionPrompt()}
                    >
                      复制视觉任务
                    </button>
                    <button
                      type="button"
                      className="button buttonSecondary"
                      onClick={() => void downloadReference()}
                    >
                      下载原图
                    </button>
                    <button
                      type="button"
                      className="button buttonSecondary"
                      onClick={clearReference}
                    >
                      移除
                    </button>
                  </div>
                  <label
                    className="pageCanvasPromptLabel"
                    htmlFor="canvas-agent-json"
                  >
                    Agent 返回 JSON
                  </label>
                  <textarea
                    id="canvas-agent-json"
                    className="pageCanvasPromptInput canvasCompactTextarea"
                    rows={4}
                    value={agentJsonDraft}
                    onChange={(event) => setAgentJsonDraft(event.target.value)}
                    placeholder='{"schemaVersion":1,"plan":{...}}'
                  />
                  <button
                    type="button"
                    className="button buttonSecondary"
                    disabled={!agentJsonDraft.trim() || busy}
                    onClick={applyAgentResult}
                  >
                    应用 Agent 结果
                  </button>
                </>
              ) : null}

              <div className="canvasDimensionGrid">
                <label>
                  <span>宽度</span>
                  <input
                    type="number"
                    min={320}
                    max={480}
                    value={viewportWidth}
                    onChange={(event) =>
                      setViewportWidth(
                        clampPageCanvasDimension(
                          Number(event.target.value),
                          "width",
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  <span>高度</span>
                  <input
                    type="number"
                    min={480}
                    max={960}
                    value={viewportHeight}
                    onChange={(event) =>
                      setViewportHeight(
                        clampPageCanvasDimension(
                          Number(event.target.value),
                          "height",
                        ),
                      )
                    }
                  />
                </label>
              </div>
            </div>
          </details>

          <details className="canvasAdvanced">
            <summary>验收与交付</summary>
            <div className="canvasAdvancedContent">
              <DesignMvpActions
                prompt={prompt}
                plan={plan}
                viewportWidth={viewportWidth}
                viewportHeight={viewportHeight}
                reference={
                  reference
                    ? {
                        present: true,
                        fileName: reference.fileName,
                        overlayOpacity: referenceOverlayOpacity,
                        restoredFromReference: Boolean(agentVision),
                      }
                    : undefined
                }
              />
              <YuebanCanvasActions
                reference={
                  reference
                    ? {
                        fileName: reference.fileName,
                        dataUrl: reference.dataUrl,
                      }
                    : null
                }
                plan={plan}
                viewportWidth={viewportWidth}
                viewportHeight={viewportHeight}
                agentVision={agentVision}
              />
            </div>
          </details>
        </aside>
      </div>

      <footer className="canvasShowcaseHistoryBar" aria-label="原型历史记录">
        <div className="canvasHistoryBarHead">
          <div>
            <p className="canvasInspectorLabel">历史记录</p>
            <strong>
              {history.length > 0
                ? `${history.length} 条 · 保存在本浏览器`
                : "生成或保存原型后会出现在下方"}
            </strong>
          </div>
          <div className="canvasHistoryActions">
            <button
              type="button"
              className="button buttonSecondary"
              onClick={() => {
                persistHistory("manual");
                setStatus("已保存当前原型到历史");
              }}
            >
              保存当前
            </button>
            {history.length > 0 ? (
              <button
                type="button"
                className="button buttonSecondary"
                onClick={() => {
                  if (
                    !window.confirm("确定清空全部原型历史？此操作不可恢复。")
                  ) {
                    return;
                  }
                  clearPageCanvasHistory();
                  setHistory([]);
                  setActiveHistoryId(null);
                  setStatus("已清空历史记录");
                }}
              >
                清空
              </button>
            ) : null}
          </div>
        </div>
        <ul className="canvasHistoryStrip" role="list">
          {history.length === 0 ? (
            <li className="canvasHistoryStripEmpty" role="listitem">
              切换示例、更新预览或上传参考图后会自动记录；也可点「保存当前」。
            </li>
          ) : (
            history.map((entry) => (
              <li
                key={entry.id}
                role="listitem"
                className={
                  entry.id === activeHistoryId
                    ? "canvasHistoryCard canvasHistoryCardActive"
                    : "canvasHistoryCard"
                }
              >
                <button
                  type="button"
                  className="canvasHistoryCardMain"
                  onClick={() => restoreHistoryEntry(entry)}
                >
                  <span className="canvasHistoryItemTitle">
                    {entry.plan.title}
                  </span>
                  <span className="canvasHistoryItemMeta">
                    {formatHistorySavedAt(entry.savedAt)} ·{" "}
                    {entry.viewport.width}×{entry.viewport.height}
                  </span>
                  <span className="canvasHistoryItemPrompt">{entry.prompt}</span>
                </button>
                <button
                  type="button"
                  className="canvasHistoryCardDelete"
                  aria-label={`删除 ${entry.plan.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    const next = removePageCanvasHistoryEntry(entry.id);
                    setHistory(next);
                    if (activeHistoryId === entry.id) {
                      setActiveHistoryId(null);
                    }
                    setStatus("已删除一条历史");
                  }}
                >
                  ×
                </button>
              </li>
            ))
          )}
        </ul>
      </footer>
    </div>
  );
}
