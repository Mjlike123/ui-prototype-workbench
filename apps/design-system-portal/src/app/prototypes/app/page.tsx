import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TopTop App · 串联原型",
  description: "通过统一路由串联 TopTop、Room、Feed、Message、Me 与个人资料。",
};

const routes = [
  ["TopTop", "/prototype-runtime/app/toptop", "首页、好友状态和游戏入口"],
  ["Room", "/prototype-runtime/app/room", "热门语音房与发现"],
  ["Feed", "/prototype-runtime/app/feed", "关注与推荐动态流"],
  ["Message", "/prototype-runtime/app/message", "在线好友、消息搜索与会话列表"],
  ["Me", "/prototype-runtime/app/me", "账户、权益与设置入口"],
  ["Profile", "/prototype-runtime/app/profile", "个人资料与内容分类"],
] as const;

export default function PrototypeAppDeliveryPage() {
  return (
    <>
      <header className="pageHeader">
        <div>
          <p className="eyebrow">ROUTED PROTOTYPE</p>
          <h1 className="pageTitle">TopTop App · 串联原型</h1>
          <p className="pageDescription">
            一级目的地使用真实 URL 串联，可刷新、分享和直接打开；个人资料作为 Me
            的二级页面保留独立路径。
          </p>
        </div>
        <div className="headerActions">
          <Link className="button buttonPrimary" href="/prototype-runtime/app/toptop">
            打开完整原型
          </Link>
          <Link className="button buttonSecondary" href="/canvas">
            返回原型设计
          </Link>
        </div>
      </header>

      <section className="section">
        <div className="sectionHeader">
          <div>
            <h2 className="sectionTitle">页面路由</h2>
            <p className="sectionDescription">
              底部导航会在五个一级页面间切换，Me 头像进入个人资料。
            </p>
          </div>
          <span className="tag">{routes.length} routes</span>
        </div>
        <div className="componentGrid">
          {routes.map(([title, href, description]) => (
            <Link className="componentCard" href={href} key={href}>
              <span className="componentCardCategory">PROTOTYPE</span>
              <h3>{title}</h3>
              <p>{description}</p>
              <code>{href}</code>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
