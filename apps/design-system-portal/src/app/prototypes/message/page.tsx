import type { Metadata } from "next";
import Link from "next/link";
import { PrototypeAppRouter } from "@/components/prototypes/prototype-app-router";

export const metadata: Metadata = {
  title: "Message · 消息原型",
  description:
    "参考设计主帧界面节点 7:4214，使用搜索、在线好友、会话列表与底部导航搭建的 375×812 可交互原型。",
};

const mapping = [
  { source: "kit", id: "search-control", role: "搜索用户与会话" },
  { source: "kit", id: "regular-list", role: "72pt 消息会话列表" },
  { source: "kit", id: "avatar", role: "在线好友与会话头像" },
  { source: "kit", id: "bottom-navigation", role: "五个一级目的地，选中 Message" },
  { source: "kit", id: "chat-input", role: "好友私聊页底部消息输入与发送" },
  {
    source: "kit",
    id: "chat-bubble",
    role: "私聊文字、语音、图片、业务卡片与投递反馈状态",
  },
  {
    source: "prototype",
    id: "PrototypeOnlineFriends",
    role: "在线好友横向入口与多人头像",
  },
  {
    source: "prototype",
    id: "PrototypeMessageReply",
    role: "长按菜单、回复上下文、引用摘要与原消息定位反馈",
  },
  {
    source: "prototype",
    id: "PrototypeChatSystemEvent",
    role: "撤回、举报、欢迎和日期等非气泡系统事件",
  },
] as const;

export default function MessagePrototypePage() {
  return (
    <>
      <header className="pageHeader">
        <div>
          <p className="eyebrow">FIGMA-REFERENCED PROTOTYPE</p>
          <h1 className="pageTitle">Message · 消息</h1>
          <p className="pageDescription">
            参考设计主帧界面节点 7:4214，复现页面标题、搜索、在线好友与消息列表；
            好友私聊页复用 Kit 的私聊气泡与底部输入模块。
          </p>
        </div>
        <div className="headerActions">
          <a
            className="button buttonSecondary"
            href="https://www.figma.com/design/cyq2oRQvURaHWzJLtlMWQS/%E8%AE%BE%E8%AE%A1%E4%B8%BB%E5%B8%A7%E7%95%8C%E9%9D%A2?node-id=7-4214"
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

      <section className="profilePrototypePageLayout" aria-label="Message 原型预览区">
        <div className="pageCanvasPhoneShell">
          <PrototypeAppRouter screen="message" />
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
            在线好友横排、消息回复编排与居中系统事件当前保留为 Prototype
            模块，不计入 Kit 组件覆盖率。
          </p>
        </aside>
      </section>
    </>
  );
}
