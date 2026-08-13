"use client";

import { useMemo, useState } from "react";
import {
  buildDesignMvpManifest,
  buildMonkrenReviewPrompt,
  copyText,
  downloadJson,
  type DesignMvpReferenceMeta,
} from "@/lib/design-mvp-bundle";
import type { PageCanvasPlan } from "@/lib/page-canvas-parser";

type DesignMvpActionsProps = {
  prompt: string;
  plan: PageCanvasPlan;
  viewportWidth: number;
  viewportHeight: number;
  reference?: DesignMvpReferenceMeta;
};

export function DesignMvpActions({
  prompt,
  plan,
  viewportWidth,
  viewportHeight,
  reference,
}: DesignMvpActionsProps) {
  const [status, setStatus] = useState<string | null>(null);

  const manifest = useMemo(
    () =>
      buildDesignMvpManifest({
        prompt,
        plan,
        viewportWidth,
        viewportHeight,
        reference,
      }),
    [prompt, plan, viewportWidth, viewportHeight, reference],
  );

  async function withStatus(message: string, action: () => void | Promise<void>) {
    try {
      await action();
      setStatus(message);
    } catch {
      setStatus("操作失败，请检查浏览器权限（剪贴板）。");
    }
    window.setTimeout(() => setStatus(null), 3200);
  }

  return (
    <div className="designMvpActions">
      <div className="panelHeader">
        <div>
          <h2 className="panelTitle">Design MVP 交付</h2>
          <p className="panelDescription">
            导出 Manifest（组件层栈 + spec 提示）并在 Cursor 用 Monkren 只读审查。像素对比见{" "}
            <code>docs/design-mvp-verification.md</code>。
          </p>
        </div>
      </div>
      <div className="buttonRow">
        <button
          type="button"
          className="button buttonPrimary"
          onClick={() =>
            withStatus("已下载 Manifest JSON", () =>
              downloadJson(
                `design-mvp-${plan.intent}-${Date.now()}.json`,
                manifest,
              ),
            )
          }
        >
          下载 Manifest JSON
        </button>
        <button
          type="button"
          className="button buttonSecondary"
          onClick={() =>
            withStatus("已复制 Monkren 审查指令", () =>
              copyText(buildMonkrenReviewPrompt({ manifest })),
            )
          }
        >
          复制 Monkren 审查指令
        </button>
      </div>
      {status && <p className="designMvpStatus">{status}</p>}
      <ol className="designMvpSteps">
        <li>生成画布并确认交互</li>
        <li>下载 Manifest → 归档或给 Agent</li>
        <li>复制指令 → Cursor 粘贴 → 只读五维报告</li>
        <li>
          有设计稿时：<code>npm run verify:screenshot</code> 对比参考图与截图
        </li>
        <li>实机验收：<code>npm run ui</code> + 验收中心</li>
      </ol>
    </div>
  );
}
