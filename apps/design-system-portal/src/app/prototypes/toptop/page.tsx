import type { Metadata } from "next";
import Link from "next/link";
import { PrototypeAppRouter } from "@/components/prototypes/prototype-app-router";

export const metadata: Metadata = {
  title: "TopTop · 首页原型",
  description:
    "参考 TOP UI Kit KSA 首页，以底部导航 Kit 与页面级 Prototype 模块搭建的 375×812 可交互原型。",
};

const mapping = [
  {
    source: "kit",
    id: "bottom-navigation",
    role: "五个一级目的地，默认 TopTop",
  },
  {
    source: "prototype",
    id: "PrototypeTopTopHeader",
    role: "个人信息、金币、礼物、签到、排行榜与搜索入口",
  },
  {
    source: "prototype",
    id: "PrototypeJoinFriends",
    role: "好友在线与游戏状态入口",
  },
  {
    source: "prototype",
    id: "PrototypeGameShelf",
    role: "KSA 首页游戏入口宫格",
  },
  {
    source: "prototype",
    id: "PrototypeFindFriend",
    role: "推荐用户与身份标签列表",
  },
] as const;

export default function TopTopPrototypePage() {
  return (
    <>
      <header className="pageHeader">
        <div>
          <p className="eyebrow">FIGMA-REFERENCED PROTOTYPE</p>
          <h1 className="pageTitle">TopTop · 首页</h1>
          <p className="pageDescription">
            参考 TOP UI Kit 节点 9311:270486，复现 KSA 首页的好友、游戏与推荐用户结构；
            当前作为页面原型，不新增或调整 Kit 组件定义。
          </p>
        </div>
        <div className="headerActions">
          <a
            className="button buttonSecondary"
            href="https://www.figma.com/design/tyYEbtAXWTxSLduue3ixgp/TOP-UI-kit?node-id=9311-270486"
            target="_blank"
            rel="noreferrer"
          >
            查看 Figma
          </a>
          <Link className="button buttonSecondary" href="/canvas">
            返回原型设计
          </Link>
        </div>
      </header>

      <section
        className="profilePrototypePageLayout"
        aria-label="TopTop 首页原型预览区"
      >
        <div className="pageCanvasPhoneShell">
          <PrototypeAppRouter screen="toptop" />
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
            顶部资产区、好友状态条、游戏宫格和推荐用户行目前仅作为 Prototype
            模块存在，不计入 Kit 组件覆盖率。后续只有在明确指定沉淀且补齐复用证据后，
            才进入组件生命周期。
          </p>
        </aside>
      </section>
    </>
  );
}
