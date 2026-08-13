import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";
import { VisualInspectionWorkbench } from "@/components/visual-inspection-workbench";

export const metadata: Metadata = {
  title: "视觉走查工作台",
  description: "在本地浏览器中对比设计稿与实现截图，定位并导出可见差异。",
};

export default function VisualInspectionPage() {
  return (
    <>
      <header className="pageHeader">
        <div>
          <Breadcrumb
            items={[
              { label: "验收中心", href: "/audit" },
              { label: "视觉走查工作台" },
            ]}
          />
          <p className="eyebrow">VISUAL INSPECTION</p>
          <h1 className="pageTitle">视觉走查工作台</h1>
          <p className="pageDescription">
            上传设计稿与实现截图，在本地完成标注、平铺、透明叠加和问题导出。图片不会上传到服务端。
          </p>
        </div>
        <div className="headerActions">
          <Link className="button buttonSecondary" href="/audit">
            返回验收中心
          </Link>
        </div>
      </header>
      <VisualInspectionWorkbench />
    </>
  );
}
