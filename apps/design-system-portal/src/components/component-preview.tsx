"use client";

import Image from "next/image";
import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type { ComponentSpec } from "@toptop/design-system-contract";
import {
  ListTag,
  MEMBERSHIP_LEVELS,
} from "@/components/kit/list-tag";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { SystemIcon } from "@/components/kit/system-icon";
import {
  SearchControl,
  SearchControlIcon,
} from "@/components/kit/search-control";
import {
  ChatInput,
  type ChatInputMode,
} from "@/components/kit/chat-input";
import {
  ChatBubble,
  ChatReplyPreview,
  type ChatBubbleActionState,
  type ChatBubbleDeliveryStatus,
  type ChatBubbleDirection,
  type ChatBubbleKind,
  type ChatReplyPreviewKind,
} from "@/components/kit/chat-bubble";
import { Switch } from "@/components/kit/switch";
import { ImageEmptyState } from "@/components/kit/image-empty-state";
import { EmptyState, EMPTY_STATE_ILLUSTRATIONS } from "@/components/kit/empty-state";
import { PrimaryNavigation } from "@/components/kit/primary-navigation";
import { PrimaryNavigationSearchIcon } from "./primary-navigation-search-icon";

type PreviewProps = {
  component: ComponentSpec;
  compact?: boolean;
};

export function ComponentPreview({
  component,
  compact = false,
}: PreviewProps) {
  const isAvatar = component.previewKey === "avatar";
  const isImageEmptyState = component.previewKey === "image-empty-state";
  const isEmptyState = component.previewKey === "empty-state";
  const isIosStatusBar = component.previewKey === "ios-status-bar";
  const isListTag = component.previewKey === "list-tag";
  const isSearchControl = component.previewKey === "search-control";
  const isChatInput = component.previewKey === "chat-input";
  const isChatBubble = component.previewKey === "chat-bubble";
  const isSwitch = component.previewKey === "switch";
  const isRegularList = component.previewKey === "regular-list";
  const isButton = component.previewKey === "button";
  const isBottomNavigation =
    component.previewKey === "bottom-navigation";
  const isRegularNavigation =
    component.previewKey === "regular-navigation";
  const isPrimaryNavigation =
    component.previewKey === "primary-navigation";
  const isUnderline =
    component.previewKey === "secondary-tab-underline";
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [firstLabel, setFirstLabel] = useState(
    isUnderline ? "About me" : "Vehicles",
  );
  const [secondLabel, setSecondLabel] = useState(
    isUnderline ? "Movement" : "Gifts",
  );
  const [showCount, setShowCount] = useState(!compact);
  const [pillSize, setPillSize] = useState<"height28" | "height24">(
    "height28",
  );
  const [primaryItemCount, setPrimaryItemCount] = useState(3);
  const [primaryActions, setPrimaryActions] = useState<
    "none" | "search" | "all"
  >("search");
  const [regularLeading, setRegularLeading] = useState<
    "none" | "back" | "close"
  >("back");
  const [regularTitleMode, setRegularTitleMode] = useState<
    "title" | "wrap" | "subtitle"
  >("title");
  const [regularTrailing, setRegularTrailing] = useState<
    "none" | "icon" | "icons" | "text" | "button"
  >("none");
  const [bottomTheme, setBottomTheme] = useState<"light" | "dark">(
    "light",
  );
  const [bottomFirstItem, setBottomFirstItem] = useState<
    "toptop" | "refresh"
  >("toptop");
  const [buttonSize, setButtonSize] = useState<
    "height48" | "height40" | "height32" | "height24"
  >("height48");
  const [buttonAppearance, setButtonAppearance] = useState<
    | "primary"
    | "primary-soft"
    | "neutral"
    | "translucent"
    | "primary-outline"
    | "neutral-outline"
  >("primary");
  const [buttonState, setButtonState] = useState<
    "default" | "disabled" | "pressed"
  >("default");
  const [buttonLayout, setButtonLayout] = useState<"single" | "double">(
    "single",
  );
  const [searchValue, setSearchValue] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [chatDraft, setChatDraft] = useState("");
  const [chatMode, setChatMode] = useState<ChatInputMode>("text");
  const [chatBubbleKind, setChatBubbleKind] =
    useState<ChatBubbleKind>("text");
  const [chatBubbleDirection, setChatBubbleDirection] =
    useState<ChatBubbleDirection>("incoming");
  const [chatReplyKind, setChatReplyKind] =
    useState<ChatReplyPreviewKind>("text");
  const [chatBubbleDelivery, setChatBubbleDelivery] =
    useState<ChatBubbleDeliveryStatus>("sent");
  const [chatBubbleAction, setChatBubbleAction] =
    useState<ChatBubbleActionState>("default");
  const [chatBubbleReadStatusUpsell, setChatBubbleReadStatusUpsell] =
    useState(false);
  const [switchChecked, setSwitchChecked] = useState(true);

  const labels = [
    firstLabel,
    `${secondLabel}${showCount ? "(6)" : ""}`,
    "Set",
  ];
  const primaryLabels = [
    "Mine",
    "Popular",
    "Country",
    "Following",
    "Nearby",
  ].slice(0, primaryItemCount);

  if (compact) {
    return (
      <div className="previewDevice">
        {isIosStatusBar ? (
          <div className="iosStatusBarCompact" aria-hidden="true">
            <IosStatusBar />
          </div>
        ) : isListTag ? (
          <div className="listTagCompact" aria-hidden="true">
            <ListTag kind="membership" level={9} />
            <ListTag kind="gender" gender="female" age={28} />
          </div>
        ) : isAvatar ? (
          <div className="avatarKitCompact" aria-hidden="true">
            <AvatarVisual size={48} framed />
          </div>
        ) : isEmptyState ? (
          <div className="emptyStateKitCompact" aria-hidden="true">
            <EmptyState description="Please fill in the country first" />
          </div>
        ) : isImageEmptyState ? (
          <div className="imageEmptyStateCompact" aria-hidden="true">
            <ImageEmptyState theme="light" />
          </div>
        ) : isRegularList ? (
          <div className="regularListCompact" aria-hidden="true">
            <RegularListItem
              type="action"
              leading="icon"
              trailing="chevron"
              messageDetails="basic"
              avatarFrame={false}
            />
          </div>
        ) : isSearchControl ? (
          <div className="searchControlCompact" aria-hidden="true">
            <div className="searchControlField">
              <SearchControlIcon />
              <span>Search by Name / Userid</span>
            </div>
          </div>
        ) : isChatInput ? (
          <div className="chatInputCompact" aria-hidden="true">
            <ChatInput
              value=""
              disabled
              onChange={() => undefined}
              onSubmit={() => undefined}
            />
          </div>
        ) : isChatBubble ? (
          <div className="chatBubbleCompact" aria-hidden="true">
            <ChatBubble
              direction="outgoing"
              text="Much love back to you!"
              deliveryStatus="sent"
            />
          </div>
        ) : isSwitch ? (
          <div className="switchKitCompact" aria-hidden="true">
            <Switch checked onChange={() => undefined} aria-label="开启" />
          </div>
        ) : isButton ? (
          <div className="buttonKitCompact" aria-hidden="true">
            <span className="kitButton kitButton--height48 kitButton--primary">
              Confirm
            </span>
          </div>
        ) : isBottomNavigation ? (
          <div
            className="bottomNavigation bottomNavigationCompact bottomNavigationLight"
            aria-hidden="true"
          >
            <div className="bottomNavigationItems">
              {[
                ["toptop", "TopTop"],
                ["room", "Room"],
                ["feed", "Feed"],
                ["message", "Message"],
                ["me", "Me"],
              ].map(([key, label], index) => (
                <span
                  className={`bottomNavigationItem${
                    index === 0 ? " selected" : ""
                  }`}
                  key={key}
                >
                  <span
                    className={`bottomNavigationGlyph bottomNavigationGlyph-${key}`}
                  />
                  <small>{label}</small>
                </span>
              ))}
            </div>
            <span className="bottomNavigationHomeIndicator" />
          </div>
        ) : isRegularNavigation ? (
          <div
            className="regularNavigation regularNavigationCompact regularNavigation--leading-back regularNavigation--trailing-icons"
            aria-hidden="true"
          >
            <span className="regularNavigationCompactAction">
              <NavigationIcon name="左箭头1" />
            </span>
            <div className="regularNavigationTitle">
              <strong className="regularNavigationTitleText">主标题</strong>
            </div>
            <span className="regularNavigationCompactAction regularNavigationCompactTrailing">
              <NavigationIcon name="更多-横向" />
            </span>
          </div>
        ) : isPrimaryNavigation ? (
          <div className="primaryNavigation primaryNavigationCompact" aria-hidden="true">
            <div className="primaryNavigationItems">
              <span className="selected">Mine</span>
              <span>Popular</span>
              <span>Country</span>
            </div>
            <PrimaryNavigationSearchIcon />
          </div>
        ) : isUnderline ? (
          <div className="secondaryTabUnderline" aria-hidden="true">
            <span className="tabItem selected">About me</span>
            <span className="tabItem">Movement</span>
          </div>
        ) : (
          <div className="secondaryTabPill secondaryTabPillHeight28" aria-hidden="true">
            <span className="tabItem selected">Vehicles</span>
            <span className="tabItem">Gifts</span>
            <span className="tabItem">Set</span>
          </div>
        )}
      </div>
    );
  }

  const preview = isIosStatusBar ? (
    <IosStatusBarKitPreview />
  ) : isImageEmptyState ? (
    <ImageEmptyStateKitPreview />
  ) : isEmptyState ? (
    <EmptyStateKitPreview />
  ) : isSwitch ? (
    <SwitchKitPreview
      checked={switchChecked}
      onChange={setSwitchChecked}
    />
  ) : isListTag ? (
    <ListTagKitPreview />
  ) : isAvatar ? (
    <AvatarKitPreview />
  ) : isRegularList ? (
    <div className="regularListShowcase">
      <section aria-labelledby="action-list-preview-title">
        <div className="regularListShowcaseTitle">
          <strong id="action-list-preview-title">列表</strong>
          <span>单行 · 操作类 · 无头像框</span>
        </div>
        <div className="regularListVariantGrid regularListVariantGrid--action">
          {(["icon", "avatar", "none"] as const).map((leading) => (
            <div className="regularListVariantColumn" key={leading}>
              {(
                [
                  "badge",
                  "button",
                  "text-action",
                  "chevron",
                  "text",
                ] as const
              ).map((trailing) => (
                <RegularListItem
                  key={trailing}
                  type="action"
                  leading={leading}
                  trailing={trailing}
                  messageDetails="basic"
                  avatarFrame={false}
                />
              ))}
            </div>
          ))}
        </div>
      </section>
      <section aria-labelledby="message-list-preview-title">
        <div className="regularListShowcaseTitle">
          <strong id="message-list-preview-title">消息列表</strong>
          <span>消息会话 · 多信息状态</span>
        </div>
        <div className="regularListVariantGrid regularListVariantGrid--message">
          {(
            [
              ["rich-status", "badge", true, "stranger", "person"],
              ["tags", "none", false, "default", "person"],
              ["rich-status", "none", false, "stranger", "person"],
              ["rich-status", "none", false, "failed", "person"],
              ["rich-status", "text", false, "loading", "person"],
              ["rich-status", "none", false, "editing", "person"],
              ["rich-status", "none", false, "gift", "person"],
              ["tags", "text", false, "default", "person"],
              ["tags", "badge", false, "default", "person"],
              ["tags", "badge", false, "default", "system"],
              ["tags", "button", false, "default", "system"],
              ["basic", "none", false, "default", "person"],
            ] as const
          ).map(
            (
              [details, trailing, avatarFrame, messageStatus, avatarKind],
              index,
            ) => (
              <RegularListItem
                key={`${messageStatus}-${trailing}-${index}`}
                type="message"
                leading="avatar"
                trailing={trailing}
                messageDetails={details}
                avatarFrame={avatarFrame}
                messageStatus={messageStatus}
                avatarKind={avatarKind}
              />
            ),
          )}
        </div>
      </section>
    </div>
  ) : isSearchControl ? (
    <SearchControl
      value={searchValue}
      active={searchActive}
      placeholder="Search by Name / Userid"
      onActivate={() => setSearchActive(true)}
      onChange={setSearchValue}
      onCancel={() => {
        setSearchValue("");
        setSearchActive(false);
      }}
    />
  ) : isChatInput ? (
    <ChatInput
      value={chatDraft}
      mode={chatMode}
      onChange={setChatDraft}
      onSubmit={() => setChatDraft("")}
      onModeChange={setChatMode}
      onPhoto={() => setChatDraft("Photo")}
      onEmoji={() => setChatDraft((current) => `${current}🙂`)}
      onGame={() => setChatDraft("Game invite")}
      onGift={() => setChatDraft("Gift")}
      onVoiceHoldStart={() => undefined}
      onVoiceHoldEnd={() => undefined}
    />
  ) : isChatBubble ? (
    <div className="chatBubblePreview">
      <ChatBubble
        kind={chatBubbleKind}
        direction={chatBubbleDirection}
        text={
          chatBubbleKind === "action"
            ? "Your current VIP level is halfway through its validity period."
            : chatBubbleKind === "gift"
              ? "送了你一个装扮"
            : "Thanks for being a good fan. Keep supporting us!"
        }
        title={
          chatBubbleKind === "article"
            ? "Assistant lectures | how to send the first note"
            : chatBubbleKind === "relationship"
              ? "we become CP!"
              : undefined
        }
        description={
          chatBubbleKind === "article"
            ? "A short guide with practical steps for starting a conversation."
            : undefined
        }
        deliveryStatus={chatBubbleDelivery}
        voiceState="unread"
        actionLabel={chatBubbleKind === "gift" ? "Check out" : "Go check"}
        actionState={chatBubbleAction}
        actionDisabledReason={
          chatBubbleAction === "expired" ? "内容已过期" : undefined
        }
        mediaSrc={
          chatBubbleKind === "image"
            ? "/prototypes/chat-reply/photo-square.png"
            : undefined
        }
        mediaAlt="聊天图片示例"
        relationshipAvatars={
          chatBubbleKind === "relationship" ? (
            <>
              <Image
                src="/prototypes/chat-bubble/relation-avatar-one.png"
                alt=""
                width={40}
                height={40}
              />
              <Image
                src="/prototypes/chat-bubble/relation-avatar-two.png"
                alt=""
                width={40}
                height={40}
              />
            </>
          ) : undefined
        }
        quote={
          chatBubbleKind === "text" ? (
            <ChatReplyPreview
              direction={chatBubbleDirection}
              sender="Alice"
              kind={chatReplyKind}
              text={
                chatReplyKind === "game"
                  ? "Invites you to play Clash Royale"
                  : chatReplyKind === "voice"
                    ? "Voice message"
                    : "Thanks for being a good fan."
              }
              thumbnailSrc={
                chatReplyKind === "image"
                  ? "/prototypes/chat-reply/photo-square.png"
                  : chatReplyKind === "gif"
                    ? "/prototypes/chat-reply/sticker.png"
                    : chatReplyKind === "game"
                      ? "/prototypes/chat-reply/game.png"
                      : chatReplyKind === "gift"
                        ? "/prototypes/chat-reply/gift.png"
                        : chatReplyKind === "token"
                          ? "/prototypes/chat-reply/token.png"
                          : chatReplyKind === "activity"
                            ? "/prototypes/chat-reply/activity-square.png"
                            : undefined
              }
              onLocate={() => undefined}
            />
          ) : undefined
        }
        onAction={() => undefined}
        onMediaOpen={() => undefined}
        onVoicePlay={() => undefined}
        readStatusUpsell={
          chatBubbleKind === "text" &&
          chatBubbleDirection === "outgoing" &&
          chatBubbleReadStatusUpsell
        }
        onReadStatusActivate={() => undefined}
      />
    </div>
  ) : isButton ? (
    <ButtonKitPreview
      size={buttonSize}
      appearance={buttonAppearance}
      state={buttonState}
      layout={buttonLayout}
    />
  ) : isBottomNavigation ? (
    <BottomNavigation
      selectedIndex={Math.min(selectedIndex, 4)}
      theme={bottomTheme}
      firstItem={bottomFirstItem}
      onChange={setSelectedIndex}
    />
  ) : isRegularNavigation ? (
    <RegularNavigation
      leading={regularLeading}
      titleMode={regularTitleMode}
      trailing={regularTrailing}
    />
  ) : isPrimaryNavigation ? (
    <PrimaryNavigation
      items={primaryLabels.map((label, index) => ({
        key: String(index),
        label,
      }))}
      value={String(Math.min(selectedIndex, primaryLabels.length - 1))}
      actions={[
        ...(primaryActions === "all"
          ? [
              {
                key: "news",
                label: "News",
                icon: (
                  <Image
                    src="/icons/product/news.png"
                    alt=""
                    width={28}
                    height={28}
                    aria-hidden="true"
                  />
                ),
              },
              {
                key: "activity",
                label: "活动",
                icon: (
                  <Image
                    src="/icons/product/party.png"
                    alt=""
                    width={28}
                    height={28}
                    aria-hidden="true"
                  />
                ),
              },
            ]
          : []),
        ...(primaryActions !== "none"
          ? [
              {
                key: "search",
                label: "搜索",
                icon: <PrimaryNavigationSearchIcon />,
              },
            ]
          : []),
      ]}
      onChange={(key) => setSelectedIndex(Number(key))}
    />
  ) : isUnderline ? (
      <UnderlineTab
        labels={labels.slice(0, 2)}
        selectedIndex={selectedIndex}
        onChange={setSelectedIndex}
      />
    ) : (
      <PillTab
        labels={labels}
        selectedIndex={selectedIndex}
        size={pillSize}
        onChange={setSelectedIndex}
      />
    );

  return (
    <section className="previewPanel" aria-labelledby="preview-heading">
      <div className="previewToolbar">
        <div>
          <strong id="preview-heading">实时预览</strong>
          <p className="panelDescription">
            React 参考实现 ·{" "}
            {isIosStatusBar
              ? "对照浅色与深色背景上的 iOS 系统状态内容"
              : isListTag
              ? "对照性别、年龄、完整会员等级与消息列表组合"
              : isAvatar
              ? "对照全部头像尺寸、业务范围与头像框叠加方式"
              : isRegularList
              ? "查看操作列表组合与消息列表全部信息状态"
              : isSearchControl
              ? "体验进入搜索、输入、清除、长文案截断与取消"
              : isChatInput
              ? "体验文字、语音、长文案及礼物与发送操作切换"
              : isChatBubble
              ? "对照文字、语音、图片和业务卡片的收发与反馈状态"
              : isSwitch
              ? "对照关闭、开启与禁用态，并体验受控切换"
              : isButton
              ? "切换尺寸、视觉类型、状态与按钮组布局"
              : isBottomNavigation
              ? "切换一级目的地、区域主题与首项业务变体"
              : isRegularNavigation
              ? "切换前置操作、标题适配与尾部操作"
              : isPrimaryNavigation
              ? "切换标题数量、选中位置与尾部操作"
              : isUnderline
              ? "点击标签或左右滑动列表"
              : "点击标签或修改参数"}
          </p>
        </div>
        <span className="coveragePill coverageReady">Interactive</span>
      </div>
      <div className="previewCanvas">
        <div
          className={`previewDevice${
            isUnderline ||
            isPrimaryNavigation ||
            isRegularNavigation ||
            isBottomNavigation ||
            isButton ||
            isSearchControl ||
            isChatInput ||
            isChatBubble ||
            isRegularList ||
            isAvatar ||
            isListTag ||
            isIosStatusBar ||
            isSwitch
              ? " previewDeviceFlush"
              : ""
          }${
            isPrimaryNavigation ||
            isRegularNavigation ||
            isBottomNavigation ||
            isSearchControl ||
            isChatInput ||
            isChatBubble ||
            isSwitch
              ? " previewDevicePrimary"
              : ""
          }${isRegularList ? " previewDeviceList" : ""}${
            isButton ? " previewDeviceButton" : ""
          }${isAvatar ? " previewDeviceAvatar" : ""}${
            isImageEmptyState ? " previewDeviceImageEmptyState" : ""
          }${isEmptyState ? " previewDeviceEmptyState" : ""}${
            isListTag ? " previewDeviceListTag" : ""
          }${isIosStatusBar ? " previewDeviceIosStatusBar" : ""}${
            isSwitch ? " previewDeviceSwitch" : ""
          }`}
        >
          {preview}
        </div>
      </div>
      <div className="previewControls">
        {isIosStatusBar ? (
          <p className="iosStatusBarMatrixNote">
            状态栏固定高 44pt；浅色背景使用黑色内容，深色或图片背景使用白色内容。
          </p>
        ) : isImageEmptyState ? (
          <p className="imageEmptyStateKitMatrixNote">
            背景为单一实色；亮色场景 #E8E8E9 + light 切图，暗色场景 10% 白 + dark 切图。图标固定 72pt 居中。
          </p>
        ) : isEmptyState ? (
          <p className="emptyStateKitMatrixNote">
            插画 160pt、50% 不透明度；说明 16pt #868B94；可选 48pt 主题色主按钮，水平内边距 24pt。
          </p>
        ) : isListTag ? (
          <p className="listTagMatrixNote">
            消息列表当前仅组合会员标与性别年龄标签；标签保持 14pt 高、4pt 间距并在末端裁切。
          </p>
        ) : isAvatar ? (
          <p className="avatarKitMatrixNote">
            头像框仅用于已获得或已装备装饰权益的用户身份场景；系统通知、普通操作列表和默认头像不使用头像框。
          </p>
        ) : isRegularList ? (
          <p className="regularListMatrixNote">
            已展开全部常规列表组合与消息列表信息状态，便于集中对照尺寸、对齐和截断行为。
          </p>
        ) : isSwitch ? (
          <>
            <p className="switchKitMatrixNote">
              轨道固定 44×27pt；开启为 #34C759，关闭为 #CFCFCF。下方交互示例为受控开关。
            </p>
            <div className="controlField">
              <label htmlFor="switch-demo-checked">交互示例</label>
              <select
                id="switch-demo-checked"
                value={switchChecked ? "on" : "off"}
                onChange={(event) =>
                  setSwitchChecked(event.target.value === "on")
                }
              >
                <option value="off">关闭</option>
                <option value="on">开启</option>
              </select>
            </div>
          </>
        ) : isChatInput ? (
          <>
            <div className="controlField">
              <label htmlFor="chat-input-demo-mode">输入模式</label>
              <select
                id="chat-input-demo-mode"
                value={chatMode}
                onChange={(event) =>
                  setChatMode(event.target.value as ChatInputMode)
                }
              >
                <option value="text">文字</option>
                <option value="voice">语音</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="chat-input-demo-value">消息草稿</label>
              <textarea
                id="chat-input-demo-value"
                value={chatDraft}
                placeholder="输入测试消息"
                onChange={(event) => {
                  setChatMode("text");
                  setChatDraft(event.target.value);
                }}
              />
            </div>
          </>
        ) : isChatBubble ? (
          <>
            <div className="controlField">
              <label htmlFor="chat-bubble-demo-kind">内容类型</label>
              <select
                id="chat-bubble-demo-kind"
                value={chatBubbleKind}
                onChange={(event) =>
                  setChatBubbleKind(event.target.value as ChatBubbleKind)
                }
              >
                <option value="text">文字</option>
                <option value="voice">语音</option>
                <option value="image">图片</option>
                <option value="gift">礼物卡</option>
                <option value="action">行动卡</option>
                <option value="article">文章卡</option>
                <option value="relationship">关系卡</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="chat-bubble-demo-direction">收发方向</label>
              <select
                id="chat-bubble-demo-direction"
                value={chatBubbleDirection}
                onChange={(event) =>
                  setChatBubbleDirection(
                    event.target.value as ChatBubbleDirection,
                  )
                }
              >
                <option value="incoming">收到</option>
                <option value="outgoing">发出</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="chat-bubble-demo-reply-kind">引用类型</label>
              <select
                id="chat-bubble-demo-reply-kind"
                value={chatReplyKind}
                onChange={(event) =>
                  setChatReplyKind(event.target.value as ChatReplyPreviewKind)
                }
              >
                <option value="text">文字</option>
                <option value="link">链接</option>
                <option value="image">图片</option>
                <option value="voice">语音</option>
                <option value="gif">GIF 表情</option>
                <option value="game">游戏</option>
                <option value="gift">装扮礼物</option>
                <option value="token">信物</option>
                <option value="activity">活动</option>
                <option value="mention">群聊 @</option>
                <option value="groupGift">群聊礼物</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="chat-bubble-demo-delivery">投递状态</label>
              <select
                id="chat-bubble-demo-delivery"
                value={chatBubbleDelivery}
                onChange={(event) =>
                  setChatBubbleDelivery(
                    event.target.value as ChatBubbleDeliveryStatus,
                  )
                }
              >
                <option value="sent">已发送</option>
                <option value="sending">发送中</option>
                <option value="failed">发送失败</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="chat-bubble-demo-action">卡片操作</label>
              <select
                id="chat-bubble-demo-action"
                value={chatBubbleAction}
                onChange={(event) =>
                  setChatBubbleAction(
                    event.target.value as ChatBubbleActionState,
                  )
                }
              >
                <option value="default">默认</option>
                <option value="pressed">按下</option>
                <option value="disabled">禁用</option>
                <option value="loading">加载中</option>
                <option value="expired">已过期</option>
              </select>
            </div>
            {chatBubbleKind === "text" &&
            chatBubbleDirection === "outgoing" ? (
              <div className="controlField">
                <label htmlFor="chat-bubble-demo-read-status">
                  已读状态引导
                </label>
                <select
                  id="chat-bubble-demo-read-status"
                  value={chatBubbleReadStatusUpsell ? "upsell" : "none"}
                  onChange={(event) =>
                    setChatBubbleReadStatusUpsell(
                      event.target.value === "upsell",
                    )
                  }
                >
                  <option value="none">不展示</option>
                  <option value="upsell">会员引导</option>
                </select>
              </div>
            ) : null}
          </>
        ) : isSearchControl ? (
          <>
            <div className="controlField">
              <label htmlFor="search-demo-state">示例状态</label>
              <select
                id="search-demo-state"
                value={
                  !searchActive
                    ? "external"
                    : searchValue.length > 16
                      ? "overflow"
                      : searchValue
                        ? "filled"
                        : "idle"
                }
                onChange={(event) => {
                  const state = event.target.value;
                  setSearchActive(state !== "external");
                  setSearchValue(
                    state === "filled"
                      ? "输入完毕"
                      : state === "overflow"
                        ? "文案过长文案过长文案过长文案过长"
                        : "",
                  );
                }}
              >
                <option value="external">外部样式</option>
                <option value="idle">待输入</option>
                <option value="filled">输入完毕</option>
                <option value="overflow">超长文案</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="search-demo-value">搜索内容</label>
              <input
                id="search-demo-value"
                value={searchValue}
                placeholder="输入测试文案"
                onChange={(event) => {
                  setSearchActive(true);
                  setSearchValue(event.target.value);
                }}
              />
            </div>
          </>
        ) : isButton ? (
          <>
            <div className="controlField">
              <label htmlFor="button-size">按钮高度</label>
              <select
                id="button-size"
                value={buttonSize}
                onChange={(event) =>
                  setButtonSize(
                    event.target.value as
                      | "height48"
                      | "height40"
                      | "height32"
                      | "height24",
                  )
                }
              >
                <option value="height48">48px · 大型</option>
                <option value="height40">40px · 中型</option>
                <option value="height32">32px · 小型</option>
                <option value="height24">24px · Mini</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="button-appearance">视觉类型</label>
              <select
                id="button-appearance"
                value={buttonAppearance}
                onChange={(event) =>
                  setButtonAppearance(
                    event.target.value as
                      | "primary"
                      | "primary-soft"
                      | "neutral"
                      | "translucent"
                      | "primary-outline"
                      | "neutral-outline",
                  )
                }
              >
                <option value="primary">主题色</option>
                <option value="primary-soft">主题浅色</option>
                <option value="neutral">中性灰</option>
                <option value="translucent">15% 透明底色</option>
                <option value="primary-outline">主色描边</option>
                <option value="neutral-outline">中性灰描边</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="button-state">按钮状态</label>
              <select
                id="button-state"
                value={buttonState}
                onChange={(event) =>
                  setButtonState(
                    event.target.value as
                      | "default"
                      | "disabled"
                      | "pressed",
                  )
                }
              >
                <option value="default">常规</option>
                <option value="disabled">置灰</option>
                <option value="pressed">点击</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="button-layout">布局方式</label>
              <select
                id="button-layout"
                value={buttonLayout}
                onChange={(event) =>
                  setButtonLayout(
                    event.target.value as "single" | "double",
                  )
                }
              >
                <option value="single">单按钮</option>
                <option value="double">双按钮 · 间距 16px</option>
              </select>
            </div>
          </>
        ) : isBottomNavigation ? (
          <>
            <div className="controlField">
              <label htmlFor="bottom-selected">当前目的地</label>
              <select
                id="bottom-selected"
                value={Math.min(selectedIndex, 4)}
                onChange={(event) =>
                  setSelectedIndex(Number(event.target.value))
                }
              >
                {[
                  bottomFirstItem === "refresh" ? "Refresh" : "TopTop",
                  "Room",
                  "Feed",
                  "Message",
                  "Me",
                ].map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="bottom-theme">区域主题</label>
              <select
                id="bottom-theme"
                value={bottomTheme}
                onChange={(event) =>
                  setBottomTheme(event.target.value as "light" | "dark")
                }
              >
                <option value="light">东南亚 · 浅色</option>
                <option value="dark">中东 · 深色</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="bottom-first-item">首项目的地</label>
              <select
                id="bottom-first-item"
                value={bottomFirstItem}
                onChange={(event) => {
                  setBottomFirstItem(
                    event.target.value as "toptop" | "refresh",
                  );
                  setSelectedIndex(0);
                }}
              >
                <option value="toptop">TopTop</option>
                <option value="refresh">Refresh</option>
              </select>
            </div>
          </>
        ) : isRegularNavigation ? (
          <>
            <div className="controlField">
              <label htmlFor="regular-leading">前置操作</label>
              <select
                id="regular-leading"
                value={regularLeading}
                onChange={(event) =>
                  setRegularLeading(
                    event.target.value as "none" | "back" | "close",
                  )
                }
              >
                <option value="back">返回</option>
                <option value="close">关闭</option>
                <option value="none">无</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="regular-title-mode">标题适配</label>
              <select
                id="regular-title-mode"
                value={regularTitleMode}
                onChange={(event) =>
                  setRegularTitleMode(
                    event.target.value as "title" | "wrap" | "subtitle",
                  )
                }
              >
                <option value="title">单行主标题</option>
                <option value="wrap">主标题最多两行</option>
                <option value="subtitle">主标题 + 副标题</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="regular-trailing">尾部操作</label>
              <select
                id="regular-trailing"
                value={regularTrailing}
                onChange={(event) =>
                  setRegularTrailing(
                    event.target.value as
                      | "none"
                      | "icon"
                      | "icons"
                      | "text"
                      | "button",
                  )
                }
              >
                <option value="none">无</option>
                <option value="icon">单图标</option>
                <option value="icons">多图标</option>
                <option value="text">操作文案</option>
                <option value="button">按钮</option>
              </select>
            </div>
          </>
        ) : isPrimaryNavigation ? (
          <>
            <div className="controlField">
              <label htmlFor="primary-item-count">标题数量</label>
              <select
                id="primary-item-count"
                value={primaryItemCount}
                onChange={(event) => {
                  const count = Number(event.target.value);
                  setPrimaryItemCount(count);
                  setSelectedIndex((current) =>
                    Math.min(current, count - 1),
                  );
                }}
              >
                {[1, 2, 3, 4, 5].map((count) => (
                  <option key={count} value={count}>
                    {count} 项
                  </option>
                ))}
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="primary-selected-index">选中位置</label>
              <select
                id="primary-selected-index"
                value={Math.min(selectedIndex, primaryItemCount - 1)}
                onChange={(event) =>
                  setSelectedIndex(Number(event.target.value))
                }
              >
                {primaryLabels.map((label, index) => (
                  <option key={label} value={index}>
                    {index + 1} · {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="primary-actions">尾部操作</label>
              <select
                id="primary-actions"
                value={primaryActions}
                onChange={(event) =>
                  setPrimaryActions(
                    event.target.value as "none" | "search" | "all",
                  )
                }
              >
                <option value="none">无图标</option>
                <option value="search">搜索</option>
                <option value="all">News · 活动 · 搜索</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <div className="controlField">
              <label htmlFor="first-label">第一项文案</label>
              <input
                id="first-label"
                value={firstLabel}
                onChange={(event) => setFirstLabel(event.target.value)}
              />
            </div>
            <div className="controlField">
              <label htmlFor="second-label">第二项文案</label>
              <input
                id="second-label"
                value={secondLabel}
                onChange={(event) => setSecondLabel(event.target.value)}
              />
            </div>
            <div className="controlField">
              <label htmlFor="count-state">动态计数</label>
              <select
                id="count-state"
                value={showCount ? "visible" : "hidden"}
                onChange={(event) =>
                  setShowCount(event.target.value === "visible")
                }
              >
                <option value="visible">显示</option>
                <option value="hidden">隐藏</option>
              </select>
            </div>
            {!isUnderline && (
              <div className="controlField">
                <label htmlFor="pill-size">视觉高度</label>
                <select
                  id="pill-size"
                  value={pillSize}
                  onChange={(event) =>
                    setPillSize(
                      event.target.value as "height28" | "height24",
                    )
                  }
                >
                  <option value="height28">28px · 语音房 / 动态广场</option>
                  <option value="height24">24px · Profile</option>
                </select>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function RegularListItem({
  type,
  leading,
  trailing,
  messageDetails,
  avatarFrame,
  messageStatus = "default",
  avatarKind = "person",
}: {
  type: "action" | "message";
  leading: "icon" | "avatar" | "none";
  trailing: "badge" | "button" | "text-action" | "chevron" | "text" | "none";
  messageDetails: "basic" | "tags" | "rich-status";
  avatarFrame: boolean;
  messageStatus?:
    | "default"
    | "stranger"
    | "failed"
    | "loading"
    | "editing"
    | "gift";
  avatarKind?: "person" | "system";
}) {
  const isMessage = type === "message";
  const showSubtitle =
    isMessage || trailing === "chevron" || trailing === "text";

  return (
    <div
      className={`regularListItem ${
        isMessage ? "regularListItem--message" : "regularListItem--action"
      }`}
      role="listitem"
    >
      <button
        className="regularListMain"
        type="button"
        aria-label={
          isMessage
            ? "Hawkins，Bill.Sanders@example.com"
            : "system information"
        }
      >
        {isMessage && avatarKind === "system" ? (
          <span className="regularListSystemIcon" aria-hidden="true">
            <Image
              src="/icons/list/system-notification.png"
              alt=""
              width={48}
              height={48}
            />
          </span>
        ) : isMessage ? (
          <span className="regularListAvatarWrap">
            <Image
              className="regularListAvatar"
              src="/icons/list/message-avatar.png"
              alt=""
              width={48}
              height={48}
            />
            {avatarFrame && (
              <Image
                className="regularListAvatarFrame"
                src="/icons/list/avatar-frame.png"
                alt=""
                width={72}
                height={72}
                aria-hidden="true"
              />
            )}
          </span>
        ) : (
          <>
            {leading === "icon" && (
              <span className="regularListSystemIcon" aria-hidden="true">
                <Image
                  src="/icons/list/system-notification.png"
                  alt=""
                  width={48}
                  height={48}
                />
              </span>
            )}
            {leading === "avatar" && (
              <Image
                className="regularListAvatar"
                src="/icons/list/general-avatar.png"
                alt=""
                width={48}
                height={48}
              />
            )}
          </>
        )}

        <span className="regularListContent">
          <span className="regularListTitleRow">
            <strong>{isMessage ? "Hawkins" : "system information"}</strong>
            {isMessage && messageStatus === "stranger" && (
              <small>Stranger</small>
            )}
          </span>
          {isMessage &&
            avatarKind === "person" &&
            messageDetails !== "basic" && (
            <span className="regularListTags" aria-label="用户身份与等级标签">
              <ListTag kind="membership" level={9} />
              <ListTag kind="gender" gender="female" age={28} />
            </span>
            )}
          {showSubtitle && (
            <span className="regularListSubtitle">
              {isMessage && <MessageListStatus status={messageStatus} />}
              {isMessage
                ? "Bill.Sanders@example.com"
                : "system information"}
            </span>
          )}
        </span>
      </button>
      <RegularListTrailing type={type} trailing={trailing} />
    </div>
  );
}

function MessageListStatus({
  status,
}: {
  status: "default" | "stranger" | "failed" | "loading" | "editing" | "gift";
}) {
  if (status === "gift") return <em>[Gifts]</em>;
  if (status === "default" || status === "stranger") return null;

  if (status === "failed") {
    return (
      <span className="regularListStatusIcon" aria-label="发送失败">
        <Image src="/icons/list/failed-circle.svg" alt="" width={16} height={16} />
        <Image
          className="regularListFailedMark"
          src="/icons/list/failed-mark.svg"
          alt=""
          width={2}
          height={6}
        />
        <Image
          className="regularListFailedDot"
          src="/icons/list/failed-dot.svg"
          alt=""
          width={2}
          height={2}
        />
      </span>
    );
  }

  return (
    <span
      className={`regularListStatusIcon regularListStatusIcon--${status}`}
      aria-label={
        status === "loading" ? "发送中" : "已编辑"
      }
    >
      <SystemIcon
        name={status === "loading" ? "loading" : "edit"}
        size={status === "loading" ? 16 : 18}
        className="regularListStatusSystemIcon"
      />
    </span>
  );
}

function RegularListTrailing({
  type,
  trailing,
}: {
  type: "action" | "message";
  trailing: "badge" | "button" | "text-action" | "chevron" | "text" | "none";
}) {
  if (trailing === "none") return null;

  if (trailing === "badge") {
    return (
      <span className="regularListMessageMeta">
        {type === "message" && <small>06-24</small>}
        <span className="regularListUnread" aria-label="99 条以上未读">
          99+
        </span>
      </span>
    );
  }

  if (trailing === "button") {
    return (
      <button className="regularListButton" type="button">
        按钮
      </button>
    );
  }

  if (trailing === "text-action") {
    return (
      <button className="regularListTextAction" type="button">
        文字+icon
        <span className="regularListBrandChevron" aria-hidden="true" />
      </button>
    );
  }

  if (trailing === "chevron") {
    return (
      <span className="regularListMutedChevron" aria-hidden="true" />
    );
  }

  return (
    <span className="regularListTrailingText">
      {type === "message" ? "06-24" : "文案"}
    </span>
  );
}

type AvatarSize = 72 | 60 | 48 | 40 | 36 | 24 | 20;
type AvatarBadgeKind =
  | "gender"
  | "selected"
  | "muted"
  | "noble"
  | "online"
  | "game";

function EmptyStateKitPreview() {
  const illustrationEntries = Object.entries(EMPTY_STATE_ILLUSTRATIONS).filter(
    ([key]) => key !== "no-content-3x",
  );

  return (
    <div className="emptyStateKitStage">
      <section aria-labelledby="empty-state-default-title">
        <div className="emptyStateKitSectionHeader">
          <div>
            <h3 id="empty-state-default-title">默认空状态 + 主操作</h3>
            <p>国家 Tab 未设置时的标准占位</p>
          </div>
          <code>with action</code>
        </div>
        <div className="emptyStateKitExample">
          <EmptyState
            illustration="no-list"
            description="Please fill in the country first"
            actionLabel="Go set"
            onAction={() => undefined}
          />
        </div>
      </section>
      <section aria-labelledby="empty-state-text-title">
        <div className="emptyStateKitSectionHeader">
          <div>
            <h3 id="empty-state-text-title">仅说明文案</h3>
            <p>无下一步操作时使用</p>
          </div>
          <code>text only</code>
        </div>
        <div className="emptyStateKitExample">
          <EmptyState
            illustration="no-attention-room"
            description="No rooms match your filters yet."
          />
        </div>
      </section>
      <section aria-labelledby="empty-state-illustrations-title">
        <div className="emptyStateKitSectionHeader">
          <div>
            <h3 id="empty-state-illustrations-title">业务插画切图</h3>
            <p>160pt 展示、50% 不透明度；切图在白色承载面上预览</p>
          </div>
          <code>{illustrationEntries.length} assets</code>
        </div>
        <div className="emptyStateKitIllustrationGrid">
          {illustrationEntries.map(([key, asset]) => (
            <article className="emptyStateKitIllustrationCard" key={key}>
              <EmptyState
                illustration={key as keyof typeof EMPTY_STATE_ILLUSTRATIONS}
                description={asset.label}
              />
              <p className="emptyStateKitIllustrationCardLabel">{key}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ImageEmptyStateKitPreview() {
  return (
    <div className="imageEmptyStateKitStage">
      <section aria-labelledby="image-empty-compare-title">
        <div className="imageEmptyStateKitHeader">
          <div>
            <h3 id="image-empty-compare-title">亮暗场景</h3>
            <p>背景为单一实色；左侧 light，右侧 dark</p>
          </div>
          <code>72pt icon</code>
        </div>
        <div className="imageEmptyStateCompareRow">
          <div className="imageEmptyStateExample">
            <ImageEmptyState theme="light" />
          </div>
          <div className="imageEmptyStateExample imageEmptyStateExample--dark">
            <ImageEmptyState theme="dark" />
          </div>
        </div>
      </section>
    </div>
  );
}

function IosStatusBarKitPreview() {
  return (
    <div className="iosStatusBarKitStage">
      <section>
        <div className="iosStatusBarKitHeader">
          <div>
            <h3>黑色内容</h3>
            <p>用于白色、浅灰色等明亮背景</p>
          </div>
          <code>dark-content</code>
        </div>
        <div className="iosStatusBarExample iosStatusBarExample--light">
          <IosStatusBar appearance="dark-content" />
        </div>
      </section>
      <section>
        <div className="iosStatusBarKitHeader">
          <div>
            <h3>白色内容</h3>
            <p>用于深色、品牌色或图片背景</p>
          </div>
          <code>light-content</code>
        </div>
        <div className="iosStatusBarExample iosStatusBarExample--dark">
          <IosStatusBar appearance="light-content" />
        </div>
      </section>
    </div>
  );
}

function SwitchKitPreview({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="switchKitStage">
      <section aria-labelledby="switch-state-title">
        <div className="listTagKitSectionHeader">
          <div>
            <h3 id="switch-state-title">开关状态</h3>
            <p>44×27pt 轨道 · 白底滑块 · 160ms 过渡</p>
          </div>
          <span>4 variants</span>
        </div>
        <div className="switchKitStateRow">
          {(
            [
              ["关闭", false, false],
              ["开启", true, false],
              ["禁用 · 关闭", false, true],
              ["禁用 · 开启", true, true],
            ] as const
          ).map(([label, isOn, disabled]) => (
            <article className="switchKitStateCase" key={label}>
              <Switch
                checked={isOn}
                disabled={disabled}
                onChange={() => undefined}
                aria-label={label}
              />
              <strong>{label}</strong>
              <code>{isOn ? "on" : "off"}</code>
            </article>
          ))}
        </div>
      </section>
      <section aria-labelledby="switch-interactive-title">
        <div className="listTagKitSectionHeader">
          <div>
            <h3 id="switch-interactive-title">受控交互</h3>
            <p>点击开关或使用下方控件同步 checked 状态</p>
          </div>
        </div>
        <Switch
          checked={checked}
          onChange={onChange}
          aria-label="受控开关示例"
        />
      </section>
    </div>
  );
}

function ListTagKitPreview() {
  return (
    <div className="listTagKitStage">
      <section aria-labelledby="list-tag-gender-title">
        <div className="listTagKitSectionHeader">
          <div>
            <h3 id="list-tag-gender-title">性别与年龄</h3>
            <p>纯图标 14×14pt；年龄组合保持 14pt 高</p>
          </div>
          <span>4 variants</span>
        </div>
        <div className="listTagGenderGrid">
          {(
            [
              ["female", 28, "女性 + 年龄"],
              ["male", 28, "男性 + 年龄"],
              ["female", undefined, "女性"],
              ["male", undefined, "男性"],
            ] as const
          ).map(([gender, age, label]) => (
            <article className="listTagGenderCase" key={label}>
              <span className="listTagPreviewFrame">
                <ListTag kind="gender" gender={gender} age={age} />
              </span>
              <strong>{label}</strong>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="list-tag-membership-title">
        <div className="listTagKitSectionHeader">
          <div>
            <h3 id="list-tag-membership-title">会员等级</h3>
            <p>使用正式切图并按 14pt 高等比展示</p>
          </div>
          <span>V1–V18 · V99</span>
        </div>
        <div className="listTagMembershipGrid">
          {MEMBERSHIP_LEVELS.map((level) => (
            <article className="listTagMembershipCase" key={level}>
              <ListTag kind="membership" level={level} />
              <strong>V{level}</strong>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="list-tag-composition-title">
        <div className="listTagKitSectionHeader">
          <div>
            <h3 id="list-tag-composition-title">消息列表组合</h3>
            <p>当前顺序：会员标 → 性别年龄；标签间距 4pt</p>
          </div>
          <span>LIST USAGE</span>
        </div>
        <div className="listTagMessageExample">
          <Image
            src="/icons/list/message-avatar.png"
            alt=""
            width={48}
            height={48}
          />
          <span className="listTagMessageCopy">
            <strong>Hawkins</strong>
            <span className="listTagMessageRow" aria-label="会员 V9，女性，28 岁">
              <ListTag kind="membership" level={9} />
              <ListTag kind="gender" gender="female" age={28} />
            </span>
            <small>Bill.Sanders@example.com</small>
          </span>
          <time>16:24</time>
        </div>
      </section>
    </div>
  );
}

const avatarUsage: Array<{
  size: AvatarSize;
  label: string;
}> = [
  { size: 72, label: "Profile / mini card" },
  { size: 60, label: "亲密关系、权益页" },
  { size: 48, label: "列表、语音房" },
  { size: 40, label: "亲密关系头像" },
  { size: 36, label: "首页 Me 入口" },
  { size: 24, label: "紧凑列表" },
  { size: 20, label: "弱化展示" },
];

const avatarBadgeCases: Array<{
  badge: AvatarBadgeKind;
  label: string;
}> = [
  { badge: "gender", label: "男女标" },
  { badge: "selected", label: "选中状态" },
  { badge: "muted", label: "闭麦" },
  { badge: "noble", label: "贵族" },
  { badge: "online", label: "在线状态" },
  { badge: "game", label: "游戏标" },
];

function AvatarKitPreview() {
  return (
    <div className="avatarKitStage">
      <section aria-labelledby="avatar-usage-title">
        <div className="avatarKitSectionHeader">
          <div>
            <h3 id="avatar-usage-title">头像使用范围</h3>
            <p>按信息层级选择尺寸，不使用任意缩放值</p>
          </div>
          <span>20–72pt</span>
        </div>
        <div className="avatarUsageGrid">
          {avatarUsage.map(({ size, label }) => (
            <article className="avatarUsageItem" key={size}>
              <AvatarVisual size={size} />
              <strong>{size}×{size}</strong>
              <p>{label}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="avatar-empty-title">
        <div className="avatarKitSectionHeader">
          <div>
            <h3 id="avatar-empty-title">默认空状态</h3>
            <p>无用户头像时使用；左侧为亮色场景，右侧为暗色场景</p>
          </div>
          <span>EMPTY</span>
        </div>
        <div className="avatarEmptyCompareRow">
          <article className="avatarEmptyCase">
            <div className="avatarEmptyCaseSurface avatarEmptyCaseSurface--light">
              <AvatarVisual size={72} empty emptyTheme="light" />
            </div>
            <strong>Light</strong>
          </article>
          <article className="avatarEmptyCase">
            <div className="avatarEmptyCaseSurface avatarEmptyCaseSurface--dark">
              <AvatarVisual size={72} empty emptyTheme="dark" />
            </div>
            <strong>Dark</strong>
          </article>
        </div>
      </section>

      <section aria-labelledby="avatar-plain-title">
        <div className="avatarKitSectionHeader">
          <div>
            <h3 id="avatar-plain-title">不带头像框</h3>
            <p>常规用户身份展示，默认采用此形式</p>
          </div>
          <span>DEFAULT</span>
        </div>
        <div className="avatarComparisonRow">
          {avatarUsage.map(({ size }) => (
            <AvatarVisual size={size} key={size} />
          ))}
        </div>
      </section>

      <section aria-labelledby="avatar-framed-title">
        <div className="avatarKitSectionHeader">
          <div>
            <h3 id="avatar-framed-title">带头像框</h3>
            <p>仅用于已获得或已装备装饰权益的业务场景</p>
          </div>
          <span>ENTITLEMENT</span>
        </div>
        <div className="avatarComparisonRow avatarComparisonRow--framed">
          {avatarUsage.map(({ size }) => (
            <AvatarVisual size={size} framed key={size} />
          ))}
        </div>
      </section>

      <section aria-labelledby="avatar-badge-title">
        <div className="avatarKitSectionHeader">
          <div>
            <h3 id="avatar-badge-title">带徽标头像</h3>
            <p>徽标使用 Figma 导出的切图资源，固定在头像右下角</p>
          </div>
          <span>BADGE</span>
        </div>
        <div className="avatarBadgeCaseGrid">
          {avatarBadgeCases.map(({ badge, label }) => (
            <article className="avatarBadgeCase" key={badge}>
              <AvatarVisual size={48} badge={badge} />
              <strong>{label}</strong>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function AvatarVisual({
  size,
  framed = false,
  badge,
  empty = false,
  emptyTheme = "light",
}: {
  size: AvatarSize;
  framed?: boolean;
  badge?: AvatarBadgeKind;
  empty?: boolean;
  emptyTheme?: "light" | "dark";
}) {
  const frameSize = framed ? Math.round(size * 1.5) : size;
  const badgeLabel = avatarBadgeCases.find((item) => item.badge === badge)?.label;
  const resolvedSrc = empty
    ? emptyTheme === "dark"
      ? "/icons/avatar/default-empty-dark.png"
      : "/icons/avatar/default-empty-light.png"
    : "/icons/list/message-avatar.png";
  const imageClassName = empty
    ? "avatarVisualImage avatarVisualImage--empty"
    : "avatarVisualImage";

  return (
    <span
      className={`avatarVisual${framed ? " avatarVisual--framed" : ""}${
        empty ? " avatarVisual--empty" : ""
      }`}
      style={{ width: frameSize, height: frameSize }}
      role={empty ? undefined : "img"}
      aria-label={
        empty
          ? undefined
          : `${size} 像素头像${framed ? "，带头像框" : ""}${
              badgeLabel ? `，${badgeLabel}` : ""
            }`
      }
      aria-hidden={empty ? true : undefined}
    >
      <span
        className={imageClassName}
        style={{ width: size, height: size }}
      >
        <Image
          src={resolvedSrc}
          alt=""
          width={size}
          height={size}
          unoptimized={empty}
        />
      </span>
      {framed && (
        <Image
          className="avatarVisualFrame"
          src="/icons/list/avatar-frame.png"
          alt=""
          width={frameSize}
          height={frameSize}
          aria-hidden="true"
        />
      )}
      {badge && <AvatarBadge kind={badge} />}
    </span>
  );
}

function AvatarBadge({ kind }: { kind: AvatarBadgeKind }) {
  return (
    <span
      className={`avatarVisualBadge avatarVisualBadge--${kind}`}
      aria-hidden="true"
    >
      {kind === "gender" && (
        <Image
          src="/icons/avatar-badges/gender-female.svg"
          alt=""
          width={14}
          height={14}
        />
      )}
      {kind === "selected" && (
        <>
          <Image
            src="/icons/avatar-badges/selected-circle.svg"
            alt=""
            width={20}
            height={20}
          />
          <Image
            className="avatarVisualBadgeGlyph"
            src="/icons/avatar-badges/selected-check.svg"
            alt=""
            width={9}
            height={6}
          />
        </>
      )}
      {kind === "muted" && (
        <Image
          src="/icons/avatar-badges/muted.svg"
          alt=""
          width={12}
          height={12}
        />
      )}
      {kind === "noble" && (
        <Image
          src="/icons/avatar-badges/noble.png"
          alt=""
          width={18}
          height={18}
        />
      )}
      {kind === "online" && (
        <Image
          src="/icons/avatar-badges/online-dot.svg"
          alt=""
          width={12}
          height={12}
        />
      )}
      {kind === "game" && (
        <Image
          src="/icons/avatar-badges/game.png"
          alt=""
          width={20}
          height={20}
        />
      )}
    </span>
  );
}

function ButtonKitPreview({
  size,
  appearance,
  state,
  layout,
}: {
  size: "height48" | "height40" | "height32" | "height24";
  appearance:
    | "primary"
    | "primary-soft"
    | "neutral"
    | "translucent"
    | "primary-outline"
    | "neutral-outline";
  state: "default" | "disabled" | "pressed";
  layout: "single" | "double";
}) {
  const fluid =
    size === "height48" || (size === "height40" && layout === "double");
  const buttonClass = (buttonAppearance: typeof appearance) =>
    `kitButton kitButton--${size} kitButton--${buttonAppearance} kitButton--${state}`;

  return (
    <div className="buttonKitStage">
      <div
        className={`kitButtonGroup ${
          fluid ? "kitButtonGroup--fluid" : "kitButtonGroup--hug"
        }`}
      >
        {layout === "double" && (
          <button
            className={buttonClass("neutral-outline")}
            type="button"
            disabled={state === "disabled"}
          >
            Cancel
          </button>
        )}
        <button
          className={buttonClass(appearance)}
          type="button"
          disabled={state === "disabled"}
        >
          Confirm
        </button>
      </div>
      <p>
        {size === "height48"
          ? "页面左右边距 16px"
          : size === "height40"
            ? "弹窗与局部操作"
            : "按内容自适应宽度"}
        {layout === "double" ? " · 按钮间距 16px" : ""}
      </p>
      <div className="buttonStateMatrix" aria-label="按钮全部尺寸与状态">
        <div className="buttonStateMatrixHeader" aria-hidden="true">
          <span>高度</span>
          <span>常规</span>
          <span>置灰</span>
          <span>点击</span>
        </div>
        {(["height48", "height40", "height32", "height24"] as const).map(
          (matrixSize) => (
            <div
              className={`buttonStateMatrixRow buttonStateMatrixRow--${matrixSize}`}
              key={matrixSize}
            >
              <span>{matrixSize.replace("height", "")}</span>
              {(["default", "disabled", "pressed"] as const).map(
                (matrixState) => (
                  <div className="buttonStateCell" key={matrixState}>
                    <button
                      className={`kitButton kitButton--${matrixSize} kitButton--${appearance} kitButton--${matrixState}`}
                      type="button"
                      disabled={matrixState === "disabled"}
                      aria-label={`${matrixSize.replace("height", "")}px ${
                        matrixState === "default"
                          ? "常规"
                          : matrixState === "disabled"
                            ? "置灰"
                            : "点击"
                      }`}
                    >
                      Button
                    </button>
                  </div>
                ),
              )}
            </div>
          ),
        )}
      </div>
      <section className="pairedButtonCase" aria-labelledby="paired-button-case-title">
        <div className="pairedButtonCaseHeader">
          <span>CASE</span>
          <h3 id="paired-button-case-title">双按钮</h3>
          <p>半窗底部操作 · 左辅助、右主操作</p>
        </div>
        <div className="pairedButtonCaseRow">
          <button
            className="kitButton kitButton--height48 kitButton--neutral kitButton--default"
            type="button"
          >
            取消
          </button>
          <button
            className="kitButton kitButton--height48 kitButton--primary kitButton--default"
            type="button"
          >
            确定
          </button>
        </div>
        <p className="pairedButtonCaseNote">
          页面左右边距 16px · 按钮间距 15px · 单按钮宽 164px
        </p>
      </section>
    </div>
  );
}

function BottomNavigation({
  selectedIndex,
  theme,
  firstItem,
  onChange,
}: {
  selectedIndex: number;
  theme: "light" | "dark";
  firstItem: "toptop" | "refresh";
  onChange: (index: number) => void;
}) {
  const items = [
    {
      key: firstItem,
      label: firstItem === "refresh" ? "Refresh" : "TopTop",
    },
    { key: "room", label: "Room" },
    { key: "feed", label: "Feed" },
    { key: "message", label: "Message" },
    { key: "me", label: "Me" },
  ];

  return (
    <nav
      className={`bottomNavigation ${
        theme === "dark" ? "bottomNavigationDark" : "bottomNavigationLight"
      }`}
      aria-label="App 一级目的地"
    >
      <div className="bottomNavigationItems">
        {items.map((item, index) => {
          const selected = selectedIndex === index;

          return (
            <button
              className={`bottomNavigationItem${
                selected ? " selected" : ""
              }`}
              key={item.key}
              type="button"
              aria-current={selected ? "page" : undefined}
              aria-label={item.label}
              onClick={() => onChange(index)}
            >
              <span
                className={`bottomNavigationGlyph bottomNavigationGlyph-${item.key}`}
                aria-hidden="true"
              />
              <span className="bottomNavigationLabel">{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="bottomNavigationSafeArea" aria-hidden="true">
        <span className="bottomNavigationHomeIndicator" />
      </div>
    </nav>
  );
}

function RegularNavigation({
  leading,
  titleMode,
  trailing,
}: {
  leading: "none" | "back" | "close";
  titleMode: "title" | "wrap" | "subtitle";
  trailing: "none" | "icon" | "icons" | "text" | "button";
}) {
  const title =
    titleMode === "wrap"
      ? "主标题超出展示区域时可以折行，超出两行后省略"
      : titleMode === "subtitle"
        ? "主标题超出展示区域时省略"
        : "主标题";

  return (
    <nav
      className={`regularNavigation regularNavigation--leading-${leading} regularNavigation--trailing-${trailing}`}
      aria-label="二级页面导航"
    >
      <div className="regularNavigationLeading">
        {leading === "back" && (
          <button type="button" aria-label="返回">
            <NavigationIcon name="左箭头1" />
          </button>
        )}
        {leading === "close" && (
          <button type="button" aria-label="关闭">
            <NavigationIcon name="关闭" />
          </button>
        )}
      </div>

      <div
        className={`regularNavigationTitle${
          titleMode === "subtitle" ? " regularNavigationTitleWithSubtitle" : ""
        }`}
      >
        <h2 className="regularNavigationTitleText">{title}</h2>
        {titleMode === "subtitle" && (
          <span className="regularNavigationSubtitle">
            副标题超出展示区域时省略
          </span>
        )}
      </div>

      <div className="regularNavigationTrailing">
        {trailing === "icon" && (
          <button type="button" aria-label="添加">
            <NavigationIcon name="加号" />
          </button>
        )}
        {trailing === "icons" && (
          <>
            <button type="button" aria-label="添加">
              <NavigationIcon name="加号" />
            </button>
            <button type="button" aria-label="更多">
              <NavigationIcon name="更多-横向" />
            </button>
          </>
        )}
        {trailing === "text" && (
          <button
            type="button"
            className="regularNavigationActionText"
          >
            操作文案操作文案
          </button>
        )}
        {trailing === "button" && (
          <button
            type="button"
            className="regularNavigationActionButton"
          >
            Post
          </button>
        )}
      </div>
    </nav>
  );
}

function NavigationIcon({
  name,
}: {
  name: "左箭头1" | "关闭" | "加号" | "更多-横向";
}) {
  return (
    <Image
      src={`/icons/svg/icon=${name}.svg`}
      alt=""
      width={24}
      height={24}
      aria-hidden="true"
    />
  );
}

function PillTab({
  labels,
  selectedIndex,
  size,
  onChange,
}: {
  labels: string[];
  selectedIndex: number;
  size: "height28" | "height24";
  onChange: (index: number) => void;
}) {
  return (
    <div
      className={`secondaryTabPill ${
        size === "height24"
          ? "secondaryTabPillHeight24"
          : "secondaryTabPillHeight28"
      }`}
      role="tablist"
      aria-label="二级 Tab"
    >
      {labels.map((label, index) => (
        <button
          key={label}
          type="button"
          role="tab"
          aria-selected={selectedIndex === index}
          className={selectedIndex === index ? "selected" : ""}
          onClick={() => onChange(index)}
        >
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function UnderlineTab({
  labels,
  selectedIndex,
  onChange,
}: {
  labels: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | undefined>(undefined);
  const dragDirection = useRef<"horizontal" | "vertical" | undefined>(
    undefined,
  );

  const selectTab = (index: number) => {
    setDragOffset(0);
    onChange(index);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStart.current = { x: event.clientX, y: event.clientY };
    dragDirection.current = undefined;
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) {
      return;
    }
    const deltaX = event.clientX - dragStart.current.x;
    const deltaY = event.clientY - dragStart.current.y;
    if (!dragDirection.current && Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 6) {
      dragDirection.current =
        Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
    }
    if (dragDirection.current !== "horizontal") {
      return;
    }
    const atStart = selectedIndex === 0 && deltaX > 0;
    const atEnd = selectedIndex === labels.length - 1 && deltaX < 0;
    setDragOffset(
      Math.round(
        Math.max(-120, Math.min(120, deltaX * (atStart || atEnd ? 0.28 : 1))),
      ),
    );
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current && dragDirection.current === "horizontal") {
      const deltaX = event.clientX - dragStart.current.x;
      if (deltaX <= -48 && selectedIndex < labels.length - 1) {
        onChange(selectedIndex + 1);
      } else if (deltaX >= 48 && selectedIndex > 0) {
        onChange(selectedIndex - 1);
      }
    }
    dragStart.current = undefined;
    dragDirection.current = undefined;
    setDragOffset(0);
    setIsDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const cancelDrag = (event: PointerEvent<HTMLDivElement>) => {
    dragStart.current = undefined;
    dragDirection.current = undefined;
    setDragOffset(0);
    setIsDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextIndex = Math.min(labels.length - 1, index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      nextIndex = Math.max(0, index - 1);
    }
    if (nextIndex !== undefined) {
      selectTab(nextIndex);
      event.currentTarget.parentElement
        ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
        [nextIndex]?.focus();
    }
  };

  return (
    <div className="underlineTabDemo">
      <div
        className="secondaryTabUnderline"
        role="tablist"
        aria-label="下划线二级 Tab"
      >
        {labels.map((label, index) => (
          <button
            id={`preview-tab-${index}`}
            key={label}
            type="button"
            role="tab"
            aria-controls={`preview-panel-${index}`}
            aria-selected={selectedIndex === index}
            tabIndex={selectedIndex === index ? 0 : -1}
            className={selectedIndex === index ? "selected" : ""}
            onClick={() => selectTab(index)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className={`swipeableTabPanels${isDragging ? " isDragging" : ""}`}
        aria-label="可左右滑动的 Tab 内容"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={cancelDrag}
      >
        <div
          className="swipeableTabTrack"
          style={{
            transform: `translateX(calc(-${selectedIndex * 50}% + ${dragOffset}px))`,
          }}
        >
          <AboutPreviewPanel active={selectedIndex === 0} />
          <MovementPreviewPanel active={selectedIndex === 1} />
        </div>
      </div>
      <p className="swipeHint">左右滑动列表切换 Tab</p>
    </div>
  );
}

function AboutPreviewPanel({ active }: { active: boolean }) {
  return (
    <div
      id="preview-panel-0"
      className="previewTabPanel"
      role="tabpanel"
      aria-labelledby="preview-tab-0"
      aria-hidden={!active}
    >
      <div className="previewProfile">
        <span className="previewAvatar">TT</span>
        <div>
          <strong>TopTop Player</strong>
          <p>Design system explorer</p>
        </div>
      </div>
      <div className="previewInfoList">
        <div>
          <span>Region</span>
          <strong>Global</strong>
        </div>
        <div>
          <span>Member since</span>
          <strong>2024</strong>
        </div>
        <div>
          <span>Interests</span>
          <strong>Music · Games</strong>
        </div>
      </div>
    </div>
  );
}

function MovementPreviewPanel({ active }: { active: boolean }) {
  return (
    <div
      id="preview-panel-1"
      className="previewTabPanel"
      role="tabpanel"
      aria-labelledby="preview-tab-1"
      aria-hidden={!active}
    >
      <div className="previewMovementList">
        {[
          ["Joined TopTop Live", "Today · 18:20"],
          ["Updated profile", "Yesterday · 21:08"],
          ["Received a new badge", "Jul 18 · 14:32"],
        ].map(([title, time]) => (
          <div className="previewMovementItem" key={title}>
            <span className="movementDot" />
            <div>
              <strong>{title}</strong>
              <p>{time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
