import type { Metadata } from "next";
import { PrototypePreviewShowcase } from "@/components/prototype-preview-showcase";

export const metadata: Metadata = {
  title: "原型预览",
  description: "集中预览本地 Agent 使用 TopTop Kit 搭建的可运行 UI 页面。",
};

export default function CanvasPage() {
  return (
    <>
      <header className="pageHeader">
        <div>
          <p className="eyebrow">PROTOTYPE PREVIEW</p>
          <h1 className="pageTitle">原型预览</h1>
          <p className="pageDescription">
            集中查看 Agent 使用 Kit 搭建的真实 UI 路由；左侧选择页面，右侧直接运行、调整预览并查看交付说明。
          </p>
        </div>
      </header>
      <PrototypePreviewShowcase />
    </>
  );
}
