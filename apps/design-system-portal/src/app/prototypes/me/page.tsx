import type { Metadata } from "next";
import Link from "next/link";
import { PrototypeAppRouter } from "@/components/prototypes/prototype-app-router";

export const metadata: Metadata = {
  title: "Me · 账户中心原型",
  description:
    "参考 TOP UI Kit Me 节点，以 Kit 锚点与 Prototype 模块搭建的 375×812 可交互账户中心。",
};

const mapping = [
  {
    source: "kit",
    id: "avatar",
    role: "身份头像，使用 Kit 60pt 尺寸替代参考稿 64pt",
  },
  {
    source: "kit",
    id: "button",
    role: "Edit 与 Tribe Go 操作",
  },
  {
    source: "kit",
    id: "bottom-navigation",
    role: "五个一级目的地，默认 Me",
  },
  {
    source: "prototype",
    id: "PrototypeMeIdentityHeader",
    role: "昵称、ID、等级与编辑入口",
  },
  {
    source: "prototype",
    id: "PrototypeTribeCard",
    role: "Tribe 加入引导",
  },
  {
    source: "prototype",
    id: "PrototypeMeMenuRow",
    role: "参考稿 58pt 紧凑账户菜单行",
  },
] as const;

export default function MePrototypePage() {
  return (
    <>
      <header className="pageHeader">
        <div>
          <p className="eyebrow">FIGMA-REFERENCED PROTOTYPE</p>
          <h1 className="pageTitle">Me · 账户中心</h1>
          <p className="pageDescription">
            参考 TOP UI Kit 节点 9311:275891，保留身份、Tribe、账户权益与固定
            Me 底栏；视觉使用现有 Foundations，交互由本地 Agent 补全。
          </p>
        </div>
        <div className="headerActions">
          <a
            className="button buttonSecondary"
            href="https://www.figma.com/design/tyYEbtAXWTxSLduue3ixgp/TOP-UI-kit?node-id=9311-275891"
            target="_blank"
            rel="noreferrer"
          >
            查看 Figma
          </a>
          <Link className="button buttonSecondary" href="/canvas">
            返回原型预览
          </Link>
        </div>
      </header>

      <section className="profilePrototypePageLayout" aria-label="Me 原型预览区">
        <div className="pageCanvasPhoneShell">
          <PrototypeAppRouter screen="me" />
        </div>

        <aside className="profilePrototypeManifest" aria-label="原型来源清单">
          <h2>Hybrid 来源映射</h2>
          <ul className="profilePrototypeGapList">
            {mapping.map((item) => (
              <li key={item.id}>
                <span>
                  <code>{item.source}</code> · <code>{item.id}</code>
                </span>
                <span>{item.role}</span>
              </li>
            ))}
          </ul>

          <h2>Kit gaps</h2>
          <p className="profilePrototypeManifestHint">
            参考稿中的 58pt 紧凑菜单与 Tribe 推广卡尚无正式契约，因此保留为
            Prototype，不计入 Kit 组件覆盖率。待跨页面复用与状态证据充分后再进入
            draft 生命周期。
          </p>
        </aside>
      </section>
    </>
  );
}
