"use client";

import { useState } from "react";
import { PrototypeAppRouter } from "@/components/prototypes/prototype-app-router";
import type { PrivateChatFriend } from "@/components/prototypes/private-chat-prototype";

const prototypes = [
  {
    id: "toptop",
    title: "TopTop · 首页",
    route: "/prototype-runtime/app/toptop",
    sourceRoute: "/prototypes/toptop",
    description: "KSA 好友状态、游戏入口、推荐用户与固定 TopTop 底栏",
    intent: "一级页面",
    kit: ["bottom-navigation"],
    prototypeModules: [
      "PrototypeTopTopHeader",
      "PrototypeJoinFriends",
      "PrototypeGameShelf",
      "PrototypeFindFriend",
    ],
  },
  {
    id: "room",
    title: "Room · 发现",
    route: "/prototype-runtime/app/room",
    sourceRoute: "/prototypes/app",
    description: "热门语音房、附近房间、多人头像与加入反馈",
    intent: "一级页面",
    kit: ["primary-navigation", "avatar", "bottom-navigation"],
    prototypeModules: ["PrototypeRoomList", "PrototypeRoomTags"],
  },
  {
    id: "feed",
    title: "Feed · 动态",
    route: "/prototype-runtime/app/feed",
    sourceRoute: "/prototypes/app",
    description: "关注与推荐流、动态卡片、点赞评论分享",
    intent: "一级页面",
    kit: ["primary-navigation", "avatar", "bottom-navigation"],
    prototypeModules: ["PrototypeFeedItem", "PrototypeFeedInteraction"],
  },
  {
    id: "message",
    title: "Message · 消息",
    route: "/prototype-runtime/app/message",
    sourceRoute: "/prototypes/message",
    description: "在线好友、会话搜索、多人头像、未读状态与消息列表",
    intent: "一级页面",
    kit: ["search-control", "regular-list", "bottom-navigation"],
    prototypeModules: ["PrototypeOnlineFriends", "PrototypeMessageInbox"],
  },
  {
    id: "search",
    title: "Search · 全局搜索",
    route: "/prototype-runtime/app/search",
    sourceRoute: "/prototypes/app",
    description: "首页二级搜索、历史关键词、用户与游戏即时结果",
    intent: "二级页面",
    kit: ["ios-status-bar", "search-control", "avatar", "list-tag"],
    prototypeModules: ["PrototypeSearchPeopleGrid", "PrototypeSearchGameGrid"],
  },
  {
    id: "private-chat",
    title: "Private Chat · 私聊",
    route: "/prototype-runtime/app/private-chat",
    sourceRoute: "/prototypes/message",
    description: "好友私聊、多类型气泡、投递反馈、消息引用、长按回复与可发送输入区",
    intent: "二级页面",
    kit: ["ios-status-bar", "avatar", "icon", "chat-bubble", "chat-input"],
    prototypeModules: [
      "PrototypePrivateChatThread",
      "PrototypeMessageActionMenu",
      "PrototypeReplyContextBar",
      "PrototypeMessageQuote",
      "PrototypeQuoteLocatorHighlight",
      "PrototypeChatSystemEvent",
    ],
  },
  {
    id: "me",
    title: "Me · 账户中心",
    route: "/prototype-runtime/app/me",
    sourceRoute: "/prototypes/me",
    description: "身份信息、Tribe、账户权益与固定 Me 底栏",
    intent: "一级页面",
    kit: ["avatar", "button", "bottom-navigation"],
    prototypeModules: ["MeIdentityHeader", "TribeCard", "MeMenuRow"],
  },
  {
    id: "profile",
    title: "个人资料",
    route: "/prototype-runtime/app/profile",
    sourceRoute: "/prototypes/profile",
    description: "动态背景、身份权益、About me 与 Movement 吸顶内容",
    intent: "二级页面",
    kit: [
      "ios-status-bar",
      "secondary-tab-underline",
      "avatar",
      "list-tag",
      "icon",
    ],
    prototypeModules: [
      "ProfileV3Navigation",
      "ProfileV3Identity",
      "ProfileV3About",
      "ProfileV3Movement",
    ],
  },
  {
    id: "wallet",
    title: "My coins",
    route: "/prototype-runtime/app/wallet",
    sourceRoute: "/prototypes/me",
    description: "顶部展示金币余额，下方 SKU 档位点击直达系统购买",
    intent: "二级页面",
    kit: ["ios-status-bar", "regular-navigation"],
    prototypeModules: [
      "PrototypeWalletCoinBalance",
      "PrototypeWalletCoinSkuGrid",
    ],
  },
  {
    id: "community-guidelines",
    title: "Community Guidelines",
    route: "/prototype-runtime/app/community-guidelines",
    sourceRoute: "/prototypes/me",
    description: "社区行为规则、执行说明与申诉入口",
    intent: "二级页面",
    kit: ["ios-status-bar", "regular-navigation", "icon"],
    prototypeModules: ["GuidelinesPage", "PrototypeDisclosure"],
  },
  {
    id: "help",
    title: "Help",
    route: "/prototype-runtime/app/help",
    sourceRoute: "/prototypes/me",
    description: "帮助内容搜索、常见问题与无结果恢复操作",
    intent: "二级页面",
    kit: ["ios-status-bar", "regular-navigation", "search-control", "icon"],
    prototypeModules: ["HelpPage", "PrototypeFaqList"],
  },
  {
    id: "settings",
    title: "Settings",
    route: "/prototype-runtime/app/settings",
    sourceRoute: "/prototypes/me",
    description: "通知、隐私与账户设置的可交互状态",
    intent: "二级页面",
    kit: ["ios-status-bar", "regular-navigation", "switch", "icon"],
    prototypeModules: ["SettingsPage"],
  },
] as const;

type PrototypeId = (typeof prototypes)[number]["id"];
type PreviewTheme = "light" | "dark";
type ViewportId = "iphone-standard" | "iphone-large" | "iphone-16-plus";

const viewportPresets = [
  { id: "iphone-standard", label: "iPhone · 375 × 812", width: 375, height: 812 },
  { id: "iphone-large", label: "iPhone Large · 393 × 852", width: 393, height: 852 },
  {
    id: "iphone-16-plus",
    label: "iPhone 16 Plus · 430 × 932",
    width: 430,
    height: 932,
  },
] as const;

type PreviewSettings = {
  viewportId: ViewportId;
  zoom: number;
};

const defaultSettings: PreviewSettings = {
  viewportId: "iphone-standard",
  zoom: 100,
};

export function PrototypePreviewShowcase() {
  const [selectedId, setSelectedId] = useState<PrototypeId>("toptop");
  const [previewAnchorId, setPreviewAnchorId] =
    useState<PrototypeId>("toptop");
  const [searchReturnScreen, setSearchReturnScreen] =
    useState<PrototypeId>("toptop");
  const [privateChatFriend, setPrivateChatFriend] =
    useState<PrivateChatFriend>({
      id: "andrew",
      name: "Andrew",
      avatar: "/prototypes/feed/andrew-avatar.png",
    });
  const [frameRevision, setFrameRevision] = useState(0);
  const [theme, setTheme] = useState<PreviewTheme>("light");
  const [pageSettings, setPageSettings] = useState<
    Record<PrototypeId, PreviewSettings>
  >(
    () =>
      Object.fromEntries(
        prototypes.map((prototype) => [
          prototype.id,
          { ...defaultSettings },
        ]),
      ) as Record<PrototypeId, PreviewSettings>,
  );
  const selected =
    prototypes.find((prototype) => prototype.id === selectedId) ?? prototypes[0];
  const settings = pageSettings[selected.id];
  const viewport =
    viewportPresets.find((item) => item.id === settings.viewportId) ??
    viewportPresets[0];
  const previewScale = settings.zoom / 100;
  const frameWidth = viewport.width + 24;
  const frameHeight = viewport.height + 24;
  const runtimeUrl = `${selected.route}?theme=${theme}&width=${viewport.width}&height=${viewport.height}`;

  const updateSettings = (patch: Partial<PreviewSettings>) => {
    setPageSettings((current) => ({
      ...current,
      [selected.id]: { ...current[selected.id], ...patch },
    }));
  };
  const selectPrototype = (nextId: PrototypeId, fromCatalog = false) => {
    if (nextId === "search" && selectedId !== "search") {
      setSearchReturnScreen(selectedId);
    }
    setSelectedId(nextId);
    if (fromCatalog) {
      setPreviewAnchorId(nextId);
    }
  };

  return (
    <section className="prototypePreview" aria-label="原型预览">
      <aside className="prototypePreviewCatalog">
        <div className="prototypeCatalogHeader">
          <div>
            <p className="canvasInspectorLabel">PROTOTYPE ROUTES</p>
            <h2>页面目录</h2>
          </div>
          <span>{prototypes.length}</span>
        </div>

        {(["一级页面", "二级页面"] as const).map((intent) => {
          const pages = prototypes.filter(
            (prototype) => prototype.intent === intent,
          );
          return (
            <div
              className="prototypeCatalogGroup"
              role="group"
              aria-label={intent}
              key={intent}
            >
              <div className="prototypeCatalogGroupTitle">
                <span>{intent}</span>
                <span>{pages.length}</span>
              </div>
              <div className="prototypeCatalogList">
                {pages.map((prototype) => (
                  <button
                    key={prototype.id}
                    type="button"
                    className={
                      prototype.id === selected.id
                        ? "prototypeCatalogItem prototypeCatalogItemActive"
                        : "prototypeCatalogItem"
                    }
                    aria-current={
                      prototype.id === selected.id ? "page" : undefined
                    }
                    onClick={() => selectPrototype(prototype.id, true)}
                  >
                    <span
                      className="prototypeCatalogBullet"
                      aria-hidden="true"
                    />
                    <span className="prototypeCatalogCopy">
                      <strong>{prototype.title}</strong>
                      <small>{prototype.description}</small>
                      <code>{prototype.sourceRoute}</code>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <div className="prototypeCatalogHint">
          <strong>页面如何调整？</strong>
          <p>
            主题为全局设置，切换后对所有页面生效且保留当前路由；设备尺寸与缩放仍按页面独立保存。可结合交付说明继续让
            Agent 修改源码。
          </p>
        </div>
      </aside>

      <div className="prototypePreviewWorkspace">
        <header className="prototypePreviewToolbar">
          <div className="prototypePreviewIdentity">
            <span className="prototypeLiveDot" aria-hidden="true" />
            <div>
              <strong>{selected.title}</strong>
              <small>
                {selected.intent} · 375 × 812 · 实时运行
              </small>
            </div>
          </div>
          <div className="prototypePreviewActions">
            <code>{selected.route}</code>
            <div
              className="prototypeThemeSwitch"
              role="group"
              aria-label="预览主题"
            >
              {(["light", "dark"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={
                    theme === value ? "prototypeThemeOptionActive" : ""
                  }
                  aria-pressed={theme === value}
                  onClick={() => setTheme(value)}
                >
                  {value === "light" ? "Light" : "Dark"}
                </button>
              ))}
            </div>
            <a
              className="button buttonPrimary"
              href={runtimeUrl}
              target="_blank"
              rel="noreferrer"
            >
              单独打开
            </a>
          </div>
        </header>

        <div className="prototypePreviewCanvas" data-theme={theme}>
          <div
            className="prototypeDeviceViewport"
            style={{
              width: frameWidth * previewScale,
              height: frameHeight * previewScale,
            }}
          >
            <div
              className="prototypeDeviceFrame"
              style={{
                width: frameWidth,
                transform: `scale(${previewScale})`,
              }}
            >
              <div className="prototypeDeviceSpeaker" aria-hidden="true" />
              <div
                key={`${previewAnchorId}-${settings.viewportId}-${frameRevision}`}
                className={`prototypeRuntimeInline${
                  theme === "dark" ? " prototypeRuntimePage--dark" : ""
                }`}
                aria-label={`${selected.title} ${theme} 可交互原型`}
                style={{ width: viewport.width, height: viewport.height }}
              >
                <PrototypeAppRouter
                  screen={previewAnchorId}
                  width={viewport.width}
                  height={viewport.height}
                  theme={theme}
                  searchReturnScreen={searchReturnScreen}
                  privateChatFriend={privateChatFriend}
                  onPrivateChatFriendChange={setPrivateChatFriend}
                  onPreviewNavigate={(screen) =>
                    selectPrototype(screen as PrototypeId)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <aside
          className="prototypeAdjustmentPanel"
          id="prototype-adjustment-panel"
          aria-label={`${selected.title} 交付说明与预览调整`}
        >
            <div className="prototypeAdjustmentHeader">
              <div>
                <strong>交付说明与预览调整</strong>
                <small>
                  主题全局生效；设备与缩放按页面独立保存，切换目录不会互相覆盖。
                </small>
              </div>
              <div className="prototypeAdjustmentControls">
                <label>
                  <span>设备</span>
                  <select
                    aria-label="预览设备"
                    value={settings.viewportId}
                    onChange={(event) =>
                      updateSettings({
                        viewportId: event.target.value as ViewportId,
                      })
                    }
                  >
                    {viewportPresets.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="prototypeZoomControl">
                  <span>缩放 {settings.zoom}%</span>
                  <input
                    type="range"
                    min="70"
                    max="110"
                    step="5"
                    value={settings.zoom}
                    aria-label="预览缩放"
                    onChange={(event) =>
                      updateSettings({ zoom: Number(event.target.value) })
                    }
                  />
                </label>
                <button
                  type="button"
                  className="button buttonSecondary"
                  onClick={() => setFrameRevision((revision) => revision + 1)}
                >
                  刷新
                </button>
                <button
                  type="button"
                  className="button buttonSecondary"
                  onClick={() => {
                    setTheme("light");
                    updateSettings(defaultSettings);
                  }}
                >
                  重置
                </button>
              </div>
            </div>
            <div className="prototypePreviewMeta">
              <div>
                <span>Kit 锚点</span>
                <p>
                  {selected.kit.map((item) => (
                    <code key={item}>{item}</code>
                  ))}
                </p>
              </div>
              <div>
                <span>Prototype 模块</span>
                <p>
                  {selected.prototypeModules.map((item) => (
                    <code key={item}>{item}</code>
                  ))}
                </p>
              </div>
              <div>
                <span>页面说明</span>
                <p>{selected.description}</p>
              </div>
            </div>
        </aside>
      </div>
    </section>
  );
}
