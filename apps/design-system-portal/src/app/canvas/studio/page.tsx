import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageCanvasShowcase } from "@/components/page-canvas-showcase";
import { getPrototypePreviewBreadcrumb } from "@/lib/prototype-preview-nav";

export const metadata: Metadata = {
  title: "原型创作 · 原型预览",
  description: "个人探索画布，历史记录保存在本浏览器，不进入 Git。",
};

export default function CanvasStudioPage() {
  return (
    <>
      <header className="pageHeader">
        <div>
          <Breadcrumb items={getPrototypePreviewBreadcrumb("原型创作")} />
          <p className="eyebrow">PROTOTYPE STUDIO</p>
          <h1 className="pageTitle">原型创作</h1>
          <p className="pageDescription">
            在此探索布局与参考图对齐。历史记录仅保存在当前浏览器，未确定方案不要提交到
            GitHub。
          </p>
        </div>
      </header>
      <PageCanvasShowcase />
    </>
  );
}
