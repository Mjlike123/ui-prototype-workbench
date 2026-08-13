import type { Metadata } from "next";
import Link from "next/link";
import { PrototypeAppRouter } from "@/components/prototypes/prototype-app-router";
import {
  PROFILE_COMPONENT_MAPPING,
  PROFILE_VIEWPORT,
} from "@/lib/profile-prototype-model";

export const metadata: Metadata = {
  title: "个人资料 · 功能原型",
  description:
    "TopTop V3.24.0 个人 Profile 可交互原型（375×812），包含吸顶导航与双 Tab。",
};

export default function ProfilePrototypePage() {
  return (
    <>
      <header className="pageHeader">
        <div>
          <p className="eyebrow">FUNCTIONAL PROTOTYPE</p>
          <h1 className="pageTitle">个人资料</h1>
          <p className="pageDescription">
            参考 V3.24.0 节点 14:4071 与 16:15659 · 视口{" "}
            {PROFILE_VIEWPORT.width}×{PROFILE_VIEWPORT.height} ·
            顶部导航与 About me / Movement Tab 保持吸顶。
          </p>
        </div>
        <Link className="button buttonSecondary" href="/canvas">
          返回原型预览
        </Link>
      </header>

      <section className="profilePrototypePageLayout" aria-label="原型预览区">
        <div className="pageCanvasPhoneShell">
          <PrototypeAppRouter screen="profile" />
        </div>

        <aside className="profilePrototypeManifest" aria-label="交付清单">
          <h2>组件映射</h2>
          <ol>
            {PROFILE_COMPONENT_MAPPING.layers.map((layer) => (
              <li key={layer.componentId}>
                <code>{layer.componentId}</code> — {layer.role}
              </li>
            ))}
          </ol>

          <p className="profilePrototypeManifestHint">
            复用 <code>ios-status-bar</code>、
            <code>secondary-tab-underline</code>、<code>avatar</code>、
            <code>list-tag</code> 与 <code>SystemIcon</code>；资料内容区保持为
            Prototype 模块。
          </p>
        </aside>
      </section>
    </>
  );
}
