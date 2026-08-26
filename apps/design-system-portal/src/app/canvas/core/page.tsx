import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { PrototypePreviewShowcase } from "@/components/prototype-preview-showcase";
import { getPrototypePreviewBreadcrumb } from "@/lib/prototype-preview-nav";

export const metadata: Metadata = {
  title: "核心模块 · 原型预览",
  description: "团队统一维护的核心交互模版预览。",
};

export default function CanvasCorePage() {
  return (
    <>
      <header className="pageHeader">
        <div>
          <Breadcrumb items={getPrototypePreviewBreadcrumb("核心模块")} />
          <p className="eyebrow">CORE TEMPLATES</p>
          <h1 className="pageTitle">核心模块</h1>
          <p className="pageDescription">
            查看已验收、由 Git 统一发布的交互模版。更新走分支与 PR，合并后全员同步。
          </p>
        </div>
      </header>
      <PrototypePreviewShowcase />
    </>
  );
}
