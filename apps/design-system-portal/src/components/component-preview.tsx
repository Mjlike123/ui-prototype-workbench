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
import { BottomNavigationIcon } from "@/components/kit/bottom-navigation-icon";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { SystemIcon } from "@/components/kit/system-icon";
import {
  RegularListItem as KitRegularListItem,
  RegularListLeadingIcon,
} from "@/components/kit/regular-list-item";
import {
  SearchControl,
  SearchControlIcon,
} from "@/components/kit/search-control";
import {
  ChatEmojiGifPanel,
  demoChatEmojiGifPanelContentByTab,
} from "@/components/kit/chat-emoji-gif-panel";
import {
  ChatEmojiGifTabBar,
  DEFAULT_CHAT_EMOJI_GIF_TAB_ITEMS,
} from "@/components/kit/chat-emoji-gif-tab-bar";
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
import {
  AvatarGroupVisual,
  type AvatarGroupVariant,
} from "@/components/kit/avatar-group-visual";
import { ActionPanel, ActionPanelSheet } from "@/components/kit/action-panel";
import { CenterDialog } from "@/components/kit/center-dialog";
import { InRoomNotification } from "@/components/kit/in-room-notification";
import { Toast, type ToastStatus } from "@/components/kit/toast";
import {
  PublishStatusNotification,
  type PublishStatusNotificationStatus,
} from "@/components/kit/publish-status-notification";
import { SelectorButton } from "@/components/kit/selector-button";
import {
  TextButton,
  type TextButtonAppearance,
  type TextButtonEmphasis,
  type TextButtonIconPosition,
  type TextButtonSize,
} from "@/components/kit/text-button";
import { Switch } from "@/components/kit/switch";
import { ImageEmptyState } from "@/components/kit/image-empty-state";
import { EmptyState, EMPTY_STATE_ILLUSTRATIONS } from "@/components/kit/empty-state";
import { PrimaryNavigation } from "@/components/kit/primary-navigation";
import { TextSecondaryTab } from "@/components/kit/text-secondary-tab";
import { PillSecondaryTab } from "@/components/kit/pill-secondary-tab";
import { PrimaryNavigationSearchIcon } from "./primary-navigation-search-icon";
import {
  AvatarVisual,
  type AvatarBadgeKind,
  type AvatarSize,
} from "@/components/kit/avatar-visual";

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
  const isChatEmojiGifTabBar =
    component.previewKey === "chat-emoji-gif-tab-bar";
  const isChatEmojiGifPanel =
    component.previewKey === "chat-emoji-gif-panel";
  const isChatBubble = component.previewKey === "chat-bubble";
  const isSwitch = component.previewKey === "switch";
  const isSelectorButton = component.previewKey === "selector-button";
  const isActionPanel = component.previewKey === "action-panel";
  const isInRoomNotification =
    component.previewKey === "in-room-notification";
  const isToast = component.previewKey === "toast";
  const isPublishStatusNotification =
    component.previewKey === "publish-status-notification";
  const isCenterDialog = component.previewKey === "center-dialog";
  const isRegularList = component.previewKey === "regular-list";
  const isButton = component.previewKey === "button";
  const isTextButton = component.previewKey === "text-button";
  const isBottomNavigation =
    component.previewKey === "bottom-navigation";
  const isRegularNavigation =
    component.previewKey === "regular-navigation";
  const isPrimaryNavigation =
    component.previewKey === "primary-navigation";
  const isUnderline =
    component.previewKey === "secondary-tab-underline";
  const isTextTab = component.previewKey === "secondary-tab-text";
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
  const [textButtonSize, setTextButtonSize] = useState<TextButtonSize>("size16");
  const [textButtonAppearance, setTextButtonAppearance] =
    useState<TextButtonAppearance>("brand");
  const [textButtonEmphasis, setTextButtonEmphasis] =
    useState<TextButtonEmphasis>("body");
  const [textButtonIconPosition, setTextButtonIconPosition] =
    useState<TextButtonIconPosition>("leading");
  const [textButtonDisabled, setTextButtonDisabled] = useState(false);
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
  const [selectorButtonSelected, setSelectorButtonSelected] = useState(true);
  const [actionPanelVariant, setActionPanelVariant] = useState<
    "description" | "toolbar" | "destructive"
  >("description");
  const [actionPanelOpen, setActionPanelOpen] = useState(false);
  const [actionPanelSwitchChecked, setActionPanelSwitchChecked] =
    useState(true);
  const [inRoomNotificationLayout, setInRoomNotificationLayout] = useState<
    "stacked" | "compact"
  >("stacked");
  const [inRoomNotificationAction, setInRoomNotificationAction] = useState<
    "button" | "link" | "none"
  >("button");
  const [inRoomNotificationShowAvatar, setInRoomNotificationShowAvatar] =
    useState(true);
  const [toastStatus, setToastStatus] = useState<ToastStatus>("none");
  const [toastLongText, setToastLongText] = useState(false);
  const [toastShowChevron, setToastShowChevron] = useState(false);
  const [publishStatus, setPublishStatus] =
    useState<PublishStatusNotificationStatus>("uploading");
  const [publishStatusProgress, setPublishStatusProgress] = useState(42);
  const [centerDialogLayout, setCenterDialogLayout] = useState<
    "single" | "horizontal" | "vertical"
  >("horizontal");
  const [centerDialogOpen, setCenterDialogOpen] = useState(true);
  const [emojiGifTab, setEmojiGifTab] = useState(
    DEFAULT_CHAT_EMOJI_GIF_TAB_ITEMS[0]?.key ?? "emoji",
  );
  const emojiGifPanelDemo = demoChatEmojiGifPanelContentByTab();

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
          <div className="regularListCompact">
            <KitRegularListItem
              listType="action"
              surface="canvas"
              title="Invite TopTop friends"
              subtitle="Browse your friends"
              leading={<RegularListLeadingIcon icon="person" />}
              trailing={
                <SystemIcon
                  name="chevronRight"
                  size={20}
                  className="regularListTrailingIcon"
                />
              }
              onPress={() => undefined}
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
        ) : isChatEmojiGifTabBar ? (
          <div className="chatEmojiGifTabBarCompact" aria-hidden="true">
            <ChatEmojiGifTabBar
              items={DEFAULT_CHAT_EMOJI_GIF_TAB_ITEMS}
              value={DEFAULT_CHAT_EMOJI_GIF_TAB_ITEMS[0]?.key ?? "emoji"}
              onChange={() => undefined}
            />
          </div>
        ) : isChatEmojiGifPanel ? (
          <div className="chatEmojiGifPanelCompact" aria-hidden="true">
            <ChatEmojiGifPanel
              value={DEFAULT_CHAT_EMOJI_GIF_TAB_ITEMS[0]?.key ?? "emoji"}
              onChange={() => undefined}
              content={emojiGifPanelDemo.emoji}
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
        ) : isSelectorButton ? (
          <div className="selectorButtonKitCompact" aria-hidden="true">
            <SelectorButton
              selected
              onChange={() => undefined}
              aria-label="选中"
            />
          </div>
        ) : isActionPanel ? (
          <div className="actionPanelKitCompact" aria-hidden="true">
            <ActionPanel
              description="Action panel"
              actions={[{ id: "a", label: "Action" }]}
              onCancel={() => undefined}
            />
          </div>
        ) : isInRoomNotification ? (
          <div className="inRoomNotificationKitCompact" aria-hidden="true">
            <InRoomNotification />
          </div>
        ) : isToast ? (
          <div className="toastKitCompact" aria-hidden="true">
            <Toast message="我是一条提示" />
          </div>
        ) : isPublishStatusNotification ? (
          <div className="publishStatusNotificationKitCompact" aria-hidden="true">
            <PublishStatusNotification status="uploading" progress={42} />
          </div>
        ) : isCenterDialog ? (
          <div className="centerDialogKitCompact" aria-hidden="true">
            <span className="kitButton kitButton--height40 kitButton--primary">
              Confirm
            </span>
          </div>
        ) : isButton ? (
          <div className="buttonKitCompact" aria-hidden="true">
            <span className="kitButton kitButton--height48 kitButton--primary">
              Confirm
            </span>
          </div>
        ) : isTextButton ? (
          <div className="textButtonKitCompact" aria-hidden="true">
            <TextButton label="文字+icon" size="size14" iconPosition="trailing" trailingPreset="chevron" />
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
                  <BottomNavigationIcon
                    name={
                      key as
                        | "refresh"
                        | "toptop"
                        | "room"
                        | "feed"
                        | "message"
                        | "me"
                    }
                    selected={index === 0}
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
        ) : isTextTab ? (
          <div className="secondaryTabText secondaryTabText--capitalizeInactive" aria-hidden="true">
            <span className="selected">Comments</span>
            <span>like</span>
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
  ) : isSelectorButton ? (
    <SelectorButtonKitPreview
      selected={selectorButtonSelected}
      onChange={setSelectorButtonSelected}
    />
  ) : isActionPanel ? (
    <ActionPanelKitPreview
      variant={actionPanelVariant}
      open={actionPanelOpen}
      onOpenChange={setActionPanelOpen}
      switchChecked={actionPanelSwitchChecked}
      onSwitchChange={setActionPanelSwitchChecked}
    />
  ) : isInRoomNotification ? (
    <InRoomNotificationKitPreview
      layout={inRoomNotificationLayout}
      action={inRoomNotificationAction}
      showAvatar={inRoomNotificationShowAvatar}
    />
  ) : isToast ? (
    <ToastKitPreview
      status={toastStatus}
      longText={toastLongText}
      showChevron={toastShowChevron}
    />
  ) : isPublishStatusNotification ? (
    <PublishStatusNotificationKitPreview
      status={publishStatus}
      progress={publishStatusProgress}
    />
  ) : isCenterDialog ? (
    <CenterDialogKitPreview
      open={centerDialogOpen}
      layout={centerDialogLayout}
      onOpenChange={setCenterDialogOpen}
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
  ) : isChatEmojiGifTabBar ? (
    <ChatEmojiGifTabBar
      items={DEFAULT_CHAT_EMOJI_GIF_TAB_ITEMS}
      value={emojiGifTab}
      onChange={setEmojiGifTab}
    />
  ) : isChatEmojiGifPanel ? (
    <ChatEmojiGifPanel
      value={emojiGifTab}
      onChange={setEmojiGifTab}
      content={
        emojiGifPanelDemo[emojiGifTab] ?? {
          variant: "empty",
          message: "暂无内容",
        }
      }
      onVipAction={() => undefined}
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
  ) : isTextButton ? (
    <TextButtonKitPreview
      size={textButtonSize}
      appearance={textButtonAppearance}
      emphasis={textButtonEmphasis}
      iconPosition={textButtonIconPosition}
      disabled={textButtonDisabled}
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
    ) : isTextTab ? (
      <TextSecondaryTab
        items={[
          { key: "comments", label: "Comments" },
          { key: "like", label: "like" },
        ]}
        value={selectedIndex === 0 ? "comments" : "like"}
        onChange={(key) => setSelectedIndex(key === "comments" ? 0 : 1)}
        ariaLabel="纯文字二级 Tab"
      />
    ) : (
      <PillSecondaryTab
        items={labels.map((label, index) => ({
          key: String(index),
          label,
        }))}
        value={String(selectedIndex)}
        onChange={(key) => setSelectedIndex(Number(key))}
        size={pillSize}
        ariaLabel="二级 Tab"
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
              : isChatEmojiGifTabBar
              ? "切换 Emoji、GIF 与各贴纸包分类 Tab"
              : isChatEmojiGifPanel
              ? "切换分类并预览 Emoji 键盘、GIF 网格与 VIP 锁定态"
              : isChatBubble
              ? "对照文字、语音、图片和业务卡片的收发与反馈状态"
              : isSwitch
              ? "对照关闭、开启与禁用态，并体验受控切换"
              : isSelectorButton
              ? "对照未选中、选中与禁用态，并体验受控切换"
              : isActionPanel
              ? "切换变体并体验进入/离开动效、蒙层关闭与取消"
              : isInRoomNotification
              ? "对照浅色与深色表面、布局与右侧操作类型"
              : isToast
              ? "切换状态图标、长文案与可点击箭头提示"
              : isPublishStatusNotification
              ? "切换上传中、成功与失败三种发布状态"
              : isCenterDialog
              ? "切换单按钮、横排与纵排布局，体验进入/离开动效"
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
              : isTextTab
              ? "点击 Comments / Like 切换分区"
              : "点击标签或修改参数"}
          </p>
        </div>
        <span className="coveragePill coverageReady">Interactive</span>
      </div>
      <div className="previewCanvas">
        <div
          className={`previewDevice${
            isUnderline ||
            isTextTab ||
            isPrimaryNavigation ||
            isRegularNavigation ||
            isBottomNavigation ||
            isButton ||
            isSearchControl ||
            isChatInput ||
            isChatEmojiGifTabBar ||
            isChatEmojiGifPanel ||
            isChatBubble ||
            isRegularList ||
            isAvatar ||
            isListTag ||
            isIosStatusBar ||
            isSwitch ||
            isSelectorButton ||
            isActionPanel ||
            isInRoomNotification ||
            isToast ||
            isPublishStatusNotification ||
            isCenterDialog
              ? " previewDeviceFlush"
              : ""
          }${
            isPrimaryNavigation ||
            isRegularNavigation ||
            isBottomNavigation ||
            isSearchControl ||
            isChatInput ||
            isChatEmojiGifTabBar ||
            isChatEmojiGifPanel ||
            isChatBubble ||
            isSwitch ||
            isSelectorButton ||
            isActionPanel ||
            isInRoomNotification ||
            isToast ||
            isPublishStatusNotification ||
            isCenterDialog
              ? " previewDevicePrimary"
              : ""
          }${isRegularList ? " previewDeviceList" : ""}${
            isButton || isTextButton ? " previewDeviceButton" : ""
          }${isAvatar ? " previewDeviceAvatar" : ""}${
            isImageEmptyState ? " previewDeviceImageEmptyState" : ""
          }${isEmptyState ? " previewDeviceEmptyState" : ""}${
            isListTag ? " previewDeviceListTag" : ""
          }${isIosStatusBar ? " previewDeviceIosStatusBar" : ""}${
            isSwitch ? " previewDeviceSwitch" : ""
          }${isSelectorButton ? " previewDeviceSelectorButton" : ""}${
            isActionPanel ? " previewDeviceActionPanel" : ""
          }${
            isInRoomNotification ? " previewDeviceInRoomNotification" : ""
          }${isToast ? " previewDeviceToast" : ""}${
            isPublishStatusNotification
              ? " previewDevicePublishStatusNotification"
              : ""
          }${
            isCenterDialog ? " previewDeviceCenterDialog" : ""
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
        ) : isSelectorButton ? (
          <>
            <p className="selectorButtonKitMatrixNote">
              控件固定 24×24pt；选中为品牌主色实心圆 + 白勾，未选中为浅灰描边空心圆。
            </p>
            <div className="controlField">
              <label htmlFor="selector-button-demo-selected">交互示例</label>
              <select
                id="selector-button-demo-selected"
                value={selectorButtonSelected ? "on" : "off"}
                onChange={(event) =>
                  setSelectorButtonSelected(event.target.value === "on")
                }
              >
                <option value="off">未选中</option>
                <option value="on">选中</option>
              </select>
            </div>
          </>
        ) : isActionPanel ? (
          <>
            <p className="actionPanelKitMatrixNote">
              顶部圆角 16pt；操作项 64pt；取消前 4pt 分隔。进入 250ms / 离开
              200ms（蒙层 50%、Y 轴滑入）；嵌套与关闭遵循 bottom-sheet-behavior。
            </p>
            <div className="controlField">
              <label htmlFor="action-panel-demo-variant">预览变体</label>
              <select
                id="action-panel-demo-variant"
                value={actionPanelVariant}
                onChange={(event) =>
                  setActionPanelVariant(
                    event.target.value as
                      | "description"
                      | "toolbar"
                      | "destructive",
                  )
                }
              >
                <option value="description">说明标题 + 多操作</option>
                <option value="toolbar">工具栏 + 底部开关</option>
                <option value="destructive">危险操作</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="action-panel-demo-open">面板状态</label>
              <select
                id="action-panel-demo-open"
                value={actionPanelOpen ? "open" : "closed"}
                onChange={(event) =>
                  setActionPanelOpen(event.target.value === "open")
                }
              >
                <option value="open">打开</option>
                <option value="closed">关闭</option>
              </select>
            </div>
          </>
        ) : isInRoomNotification ? (
          <>
            <p className="inRoomNotificationKitMatrixNote">
              设计宽 343pt（375 屏左右各 16pt 边距）；最小高 80pt、圆角 12pt。
            </p>
            <div className="controlField">
              <label htmlFor="in-room-notification-demo-layout">文案布局</label>
              <select
                id="in-room-notification-demo-layout"
                value={inRoomNotificationLayout}
                onChange={(event) =>
                  setInRoomNotificationLayout(
                    event.target.value as "stacked" | "compact",
                  )
                }
              >
                <option value="stacked">标题 + 描述</option>
                <option value="compact">单行描述</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="in-room-notification-demo-action">右侧操作</label>
              <select
                id="in-room-notification-demo-action"
                value={inRoomNotificationAction}
                onChange={(event) =>
                  setInRoomNotificationAction(
                    event.target.value as "button" | "link" | "none",
                  )
                }
              >
                <option value="button">主按钮</option>
                <option value="link">文字链 + 箭头</option>
                <option value="none">无操作</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="in-room-notification-demo-avatar">头像</label>
              <select
                id="in-room-notification-demo-avatar"
                value={inRoomNotificationShowAvatar ? "on" : "off"}
                onChange={(event) =>
                  setInRoomNotificationShowAvatar(
                    event.target.value === "on",
                  )
                }
              >
                <option value="on">显示</option>
                <option value="off">隐藏</option>
              </select>
            </div>
          </>
        ) : isToast ? (
          <>
            <p className="toastKitMatrixNote">
              背景 rgba(47,48,57,0.9)、圆角 12pt；纯文案短/长与四种状态图标短/长布局。
            </p>
            <div className="controlField">
              <label htmlFor="toast-demo-status">状态图标</label>
              <select
                id="toast-demo-status"
                value={toastStatus}
                onChange={(event) =>
                  setToastStatus(event.target.value as ToastStatus)
                }
              >
                <option value="none">无（纯文案）</option>
                <option value="success">成功</option>
                <option value="error">失败</option>
                <option value="warning">警示</option>
                <option value="loading">加载</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="toast-demo-long-text">长文案</label>
              <select
                id="toast-demo-long-text"
                value={toastLongText ? "on" : "off"}
                onChange={(event) =>
                  setToastLongText(event.target.value === "on")
                }
              >
                <option value="off">短</option>
                <option value="on">长（最多两行）</option>
              </select>
            </div>
            {toastStatus === "none" && !toastLongText ? (
              <div className="controlField">
                <label htmlFor="toast-demo-chevron">右箭头</label>
                <select
                  id="toast-demo-chevron"
                  value={toastShowChevron ? "on" : "off"}
                  onChange={(event) =>
                    setToastShowChevron(event.target.value === "on")
                  }
                >
                  <option value="off">隐藏</option>
                  <option value="on">显示</option>
                </select>
              </div>
            ) : null}
          </>
        ) : isPublishStatusNotification ? (
          <>
            <p className="publishStatusNotificationKitMatrixNote">
              343×56pt、圆角 12pt；底部 2pt 进度条反映上传/成功/失败。
            </p>
            <div className="controlField">
              <label htmlFor="publish-status-demo-status">发布状态</label>
              <select
                id="publish-status-demo-status"
                value={publishStatus}
                onChange={(event) =>
                  setPublishStatus(
                    event.target.value as PublishStatusNotificationStatus,
                  )
                }
              >
                <option value="uploading">上传中</option>
                <option value="success">发布成功</option>
                <option value="failed">发布失败</option>
              </select>
            </div>
            {publishStatus === "uploading" ? (
              <div className="controlField">
                <label htmlFor="publish-status-demo-progress">上传进度</label>
                <select
                  id="publish-status-demo-progress"
                  value={String(publishStatusProgress)}
                  onChange={(event) =>
                    setPublishStatusProgress(Number(event.target.value))
                  }
                >
                  <option value="18">18%</option>
                  <option value="42">42%</option>
                  <option value="72">72%</option>
                </select>
              </div>
            ) : null}
          </>
        ) : isCenterDialog ? (
          <>
            <p className="centerDialogKitMatrixNote">
              固定宽 300pt、圆角 16pt；进入/离开 320ms（蒙层 50%、scale
              0.85→1.03→1）。
            </p>
            <div className="controlField">
              <label htmlFor="center-dialog-demo-layout">按钮布局</label>
              <select
                id="center-dialog-demo-layout"
                value={centerDialogLayout}
                onChange={(event) =>
                  setCenterDialogLayout(
                    event.target.value as "single" | "horizontal" | "vertical",
                  )
                }
              >
                <option value="single">单按钮</option>
                <option value="horizontal">横排双按钮</option>
                <option value="vertical">纵排双按钮</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="center-dialog-demo-open">弹窗状态</label>
              <select
                id="center-dialog-demo-open"
                value={centerDialogOpen ? "open" : "closed"}
                onChange={(event) =>
                  setCenterDialogOpen(event.target.value === "open")
                }
              >
                <option value="open">打开</option>
                <option value="closed">关闭</option>
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
        ) : isChatEmojiGifTabBar ? (
          <div className="controlField">
            <label htmlFor="chat-emoji-gif-tab-demo">当前 Tab</label>
            <select
              id="chat-emoji-gif-tab-demo"
              value={emojiGifTab}
              onChange={(event) => setEmojiGifTab(event.target.value)}
            >
              {DEFAULT_CHAT_EMOJI_GIF_TAB_ITEMS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        ) : isChatEmojiGifPanel ? (
          <div className="controlField">
            <label htmlFor="chat-emoji-gif-panel-demo">当前 Tab</label>
            <select
              id="chat-emoji-gif-panel-demo"
              value={emojiGifTab}
              onChange={(event) => setEmojiGifTab(event.target.value)}
            >
              {DEFAULT_CHAT_EMOJI_GIF_TAB_ITEMS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
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
        ) : isTextButton ? (
          <>
            <div className="controlField">
              <label htmlFor="text-button-size">字号</label>
              <select
                id="text-button-size"
                value={textButtonSize}
                onChange={(event) =>
                  setTextButtonSize(event.target.value as TextButtonSize)
                }
              >
                <option value="size16">16px</option>
                <option value="size14">14px</option>
                <option value="size12">12px</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="text-button-appearance">颜色</label>
              <select
                id="text-button-appearance"
                value={textButtonAppearance}
                onChange={(event) =>
                  setTextButtonAppearance(
                    event.target.value as TextButtonAppearance,
                  )
                }
              >
                <option value="brand">主题色</option>
                <option value="neutral">中性色</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="text-button-emphasis">状态</label>
              <select
                id="text-button-emphasis"
                value={textButtonEmphasis}
                onChange={(event) =>
                  setTextButtonEmphasis(
                    event.target.value as TextButtonEmphasis,
                  )
                }
              >
                <option value="body">正文</option>
                <option value="secondary">富文本</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="text-button-icon">图标</label>
              <select
                id="text-button-icon"
                value={textButtonIconPosition}
                onChange={(event) =>
                  setTextButtonIconPosition(
                    event.target.value as TextButtonIconPosition,
                  )
                }
              >
                <option value="none">无 icon</option>
                <option value="leading">icon 左</option>
                <option value="trailing">icon 右</option>
              </select>
            </div>
            <div className="controlField">
              <label htmlFor="text-button-disabled">交互</label>
              <select
                id="text-button-disabled"
                value={textButtonDisabled ? "disabled" : "default"}
                onChange={(event) =>
                  setTextButtonDisabled(event.target.value === "disabled")
                }
              >
                <option value="default">可点击</option>
                <option value="disabled">禁用</option>
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
            {!isUnderline && !isTextTab && (
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
              <RegularListLeadingIcon icon="person" />
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
      <TextButton
        label="文字+icon"
        size="size14"
        appearance="brand"
        iconPosition="trailing"
        trailingPreset="chevron"
        onPress={() => undefined}
      />
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

function CenterDialogKitPreview({
  open,
  layout,
  onOpenChange,
}: {
  open: boolean;
  layout: "single" | "horizontal" | "vertical";
  onOpenChange: (open: boolean) => void;
}) {
  const actions =
    layout === "single"
      ? [{ id: "ok", label: "I see", tone: "primary" as const }]
      : [
          { id: "cancel", label: "Discard", tone: "neutral" as const },
          { id: "confirm", label: "Save", tone: "primary" as const },
        ];

  return (
    <div className="centerDialogKitStage">
      <button
        type="button"
        className="kitButton kitButton--height40 kitButton--primary"
        onClick={() => onOpenChange(true)}
      >
        打开弹窗
      </button>
      <CenterDialog
        open={open}
        title="Save this draft?"
        description="Your draft will stay on this device until you publish or discard it."
        dismissible
        onDismiss={() => onOpenChange(false)}
        actionLayout={layout}
        actions={actions.map((action) => ({
          ...action,
          onPress: () => onOpenChange(false),
        }))}
      />
    </div>
  );
}

function ToastKitPreview({
  status,
  longText,
  showChevron,
}: {
  status: ToastStatus;
  longText: boolean;
  showChevron: boolean;
}) {
  const shortMessage =
    status === "success"
      ? "成功提示"
      : status === "error"
        ? "失败提示"
        : status === "warning"
          ? "警示提示"
          : status === "loading"
            ? "加载中"
            : "我是一条提示";
  const longMessage = "我是一条提示最多不建议超过两行";

  return (
    <div className="toastKitStage">
      <section aria-labelledby="toast-live-preview-title">
        <div className="listTagKitSectionHeader">
          <div>
            <h3 id="toast-live-preview-title">实时预览</h3>
            <p>根据右侧控制项切换当前 Toast 变体</p>
          </div>
        </div>
        <div className="toastKitMatrixCell">
          <Toast
            message={longText ? longMessage : shortMessage}
            status={status}
            longText={longText}
            showChevron={showChevron}
            {...(showChevron ? { onPress: () => undefined } : {})}
          />
        </div>
      </section>

      <section aria-labelledby="toast-matrix-title">
        <div className="listTagKitSectionHeader">
          <div>
            <h3 id="toast-matrix-title">Figma 变体矩阵</h3>
            <p>纯文案短/长 + 成功/失败/警示/加载 短/长</p>
          </div>
        </div>
        <div className="toastKitMatrix">
          <Toast message="我是一条提示" showChevron onPress={() => undefined} />
          <Toast message="我是一条提示最多显示是四个字" longText />
          {(
            [
              ["success", "成功提示"],
              ["error", "失败提示"],
              ["warning", "警示提示"],
              ["loading", "加载中"],
            ] as const
          ).flatMap(([variant, label]) => [
            <Toast key={`${variant}-short`} message={label} status={variant} />,
            <Toast
              key={`${variant}-long`}
              message={longMessage}
              status={variant}
              longText
            />,
          ])}
        </div>
      </section>
    </div>
  );
}

function PublishStatusNotificationKitPreview({
  status,
  progress,
}: {
  status: PublishStatusNotificationStatus;
  progress: number;
}) {
  const thumbnailSrc =
    status === "failed"
      ? undefined
      : "/prototypes/feed/latifa-photo.png";

  return (
    <div className="publishStatusNotificationKitStage">
      <section aria-labelledby="publish-status-live-preview-title">
        <div className="listTagKitSectionHeader">
          <div>
            <h3 id="publish-status-live-preview-title">实时预览</h3>
            <p>根据右侧控制项切换当前发布状态</p>
          </div>
        </div>
        <div className="publishStatusNotificationKitMatrixCell">
          <PublishStatusNotification
            status={status}
            thumbnailSrc={thumbnailSrc}
            thumbnailPlaceholder="4517 Washington Ave."
            progress={progress}
            onRetry={status === "failed" ? () => undefined : undefined}
            onDismiss={status === "failed" ? () => undefined : undefined}
          />
        </div>
      </section>

      <section aria-labelledby="publish-status-matrix-title">
        <div className="listTagKitSectionHeader">
          <div>
            <h3 id="publish-status-matrix-title">Figma 变体矩阵</h3>
            <p>上传中 / 发布成功 / 发布失败</p>
          </div>
        </div>
        <div className="publishStatusNotificationKitMatrix">
          <PublishStatusNotification
            status="uploading"
            thumbnailSrc="/prototypes/feed/latifa-photo.png"
            progress={42}
          />
          <PublishStatusNotification
            status="success"
            thumbnailSrc="/prototypes/feed/latifa-photo.png"
          />
          <PublishStatusNotification
            status="failed"
            thumbnailPlaceholder="4517 Washington Ave."
            onRetry={() => undefined}
            onDismiss={() => undefined}
          />
        </div>
      </section>
    </div>
  );
}

function InRoomNotificationKitPreview({
  layout,
  action,
  showAvatar,
}: {
  layout: "stacked" | "compact";
  action: "button" | "link" | "none";
  showAvatar: boolean;
}) {
  const description =
    layout === "compact"
      ? "我是一段描述文本我是一段描述文本"
      : "我是一段描述文本";

  const notificationProps = {
    layout,
    action,
    showAvatar,
    title: "我是标题",
    description,
  };

  return (
    <div className="inRoomNotificationKitStage">
      <div className="inRoomNotificationKitPhoneShell">
        {(
          [
            ["浅色表面", "light", "inRoomNotificationKitMatrixCell--light"],
            ["深色表面", "dark", "inRoomNotificationKitMatrixCell--dark"],
          ] as const
        ).map(([label, tone, cellClass]) => (
          <div
            className={`inRoomNotificationKitMatrixCell ${cellClass}`}
            key={tone}
            aria-label={label}
          >
            <InRoomNotification
              {...notificationProps}
              tone={tone}
              onAction={() => undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionPanelKitPreview({
  variant,
  open,
  onOpenChange,
  switchChecked,
  onSwitchChange,
}: {
  variant: "description" | "toolbar" | "destructive";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  switchChecked: boolean;
  onSwitchChange: (checked: boolean) => void;
}) {
  const dismiss = () => onOpenChange(false);

  const sheetProps =
    variant === "toolbar"
      ? {
          header: {
            title: "Screening country",
            confirmLabel: "confirm",
            onBack: dismiss,
            onConfirm: dismiss,
          },
          actions: [
            { id: "a", label: "文字操作" },
            { id: "b", label: "文字操作", tone: "emphasis" as const },
            { id: "c", label: "文字操作" },
          ],
          cancelLabel: undefined,
          footerSwitch: {
            title: "Hidden birthday",
            description: "Showing more info helps make friends",
            checked: switchChecked,
            onChange: onSwitchChange,
          },
        }
      : variant === "destructive"
        ? {
            description: "Choose how you want to manage this content.",
            actions: [
              { id: "edit", label: "Edit profile" },
              { id: "hide", label: "Hide from others" },
              {
                id: "delete",
                label: "Delete",
                tone: "destructive" as const,
              },
            ],
            onCancel: dismiss,
          }
        : {
            description:
              "This is a title that describes the current operation and is optional.",
            actions: [
              { id: "a", label: "文字操作" },
              { id: "b", label: "文字操作", tone: "emphasis" as const },
              { id: "c", label: "文字操作" },
            ],
            onCancel: dismiss,
          };

  return (
    <div className="actionPanelKitStage">
      <button
        type="button"
        className="kitButton kitButton--height40 kitButton--primary actionPanelKitTrigger"
        onClick={() => onOpenChange(true)}
      >
        打开动作面板
      </button>
      <ActionPanelSheet
        open={open}
        dismissible
        onDismiss={dismiss}
        {...sheetProps}
      />
    </div>
  );
}

function SelectorButtonKitPreview({
  selected,
  onChange,
}: {
  selected: boolean;
  onChange: (selected: boolean) => void;
}) {
  return (
    <div className="selectorButtonKitStage">
      <section aria-labelledby="selector-button-state-title">
        <div className="listTagKitSectionHeader">
          <div>
            <h3 id="selector-button-state-title">选择器状态</h3>
            <p>24×24pt 圆形 · 品牌主色选中 · 浅灰描边未选中</p>
          </div>
          <span>4 variants</span>
        </div>
        <div className="selectorButtonKitStateRow">
          {(
            [
              ["未选中", false, false],
              ["选中", true, false],
              ["禁用 · 未选中", false, true],
              ["禁用 · 选中", true, true],
            ] as const
          ).map(([label, isSelected, disabled]) => (
            <article className="selectorButtonKitStateCase" key={label}>
              <SelectorButton
                selected={isSelected}
                disabled={disabled}
                onChange={() => undefined}
                aria-label={label}
              />
              <strong>{label}</strong>
              <code>{isSelected ? "on" : "off"}</code>
            </article>
          ))}
        </div>
      </section>
      <section aria-labelledby="selector-button-interactive-title">
        <div className="listTagKitSectionHeader">
          <div>
            <h3 id="selector-button-interactive-title">受控交互</h3>
            <p>点击选择器或使用下方控件同步 selected 状态</p>
          </div>
        </div>
        <SelectorButton
          selected={selected}
          onChange={onChange}
          aria-label="受控选择器示例"
        />
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

const avatarGroupCases: Array<{
  variant: AvatarGroupVariant;
  label: string;
  scene: string;
}> = [
  { variant: "home-more", label: "首页群聊", scene: "2×2 网格 · 28pt" },
  { variant: "list-2", label: "消息列表 ×2", scene: "32pt 对角重叠" },
  { variant: "list-3", label: "消息列表 ×3", scene: "28pt 上 1 下 2" },
  { variant: "list-4", label: "消息列表 ×4", scene: "28pt 2×2 簇" },
  { variant: "list-5", label: "消息列表 ×5", scene: "24pt 五瓣簇" },
  { variant: "home-row", label: "一排头像组", scene: "24pt ×6 横排" },
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

      <section aria-labelledby="avatar-group-title">
        <div className="avatarKitSectionHeader">
          <div>
            <h3 id="avatar-group-title">头像组</h3>
            <p>48×48pt 占位内展示 2–6 位成员；消息列表重叠，首页区网格或横排</p>
          </div>
          <span>GROUP</span>
        </div>
        <div className="avatarGroupCaseGrid">
          {avatarGroupCases.map(({ variant, label, scene }) => (
            <article className="avatarGroupCase" key={variant}>
              <AvatarGroupVisual variant={variant} />
              <strong>{label}</strong>
              <p>{scene}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

const TEXT_BUTTON_MATRIX: Array<{
  size: TextButtonSize;
  label: string;
  cases: Array<{
    title: string;
    appearance: TextButtonAppearance;
    emphasis: TextButtonEmphasis;
    disabled?: boolean;
    iconPosition: TextButtonIconPosition;
  }>;
}> = [
  {
    size: "size16",
    label: "16 号字",
    cases: [
      {
        title: "中性 · 正文 · icon 左",
        appearance: "neutral",
        emphasis: "body",
        iconPosition: "leading",
      },
      {
        title: "中性 · 正文 · icon 右",
        appearance: "neutral",
        emphasis: "body",
        iconPosition: "trailing",
      },
      {
        title: "主题 · 正文 · icon 左",
        appearance: "brand",
        emphasis: "body",
        iconPosition: "leading",
      },
      {
        title: "主题 · 禁用 · icon 左",
        appearance: "brand",
        emphasis: "body",
        disabled: true,
        iconPosition: "leading",
      },
      {
        title: "中性 · 富文本 · icon 左",
        appearance: "neutral",
        emphasis: "secondary",
        iconPosition: "leading",
      },
    ],
  },
  {
    size: "size14",
    label: "14 号字",
    cases: [
      {
        title: "中性 · 富文本 · icon 左",
        appearance: "neutral",
        emphasis: "secondary",
        iconPosition: "leading",
      },
      {
        title: "主题 · 正文 · icon 左",
        appearance: "brand",
        emphasis: "body",
        iconPosition: "leading",
      },
      {
        title: "中性 · 富文本 · 无 icon",
        appearance: "neutral",
        emphasis: "secondary",
        iconPosition: "none",
      },
    ],
  },
  {
    size: "size12",
    label: "12 号字",
    cases: [
      {
        title: "中性 · 正文 · icon 左",
        appearance: "neutral",
        emphasis: "body",
        iconPosition: "leading",
      },
      {
        title: "主题 · 正文 · icon 左",
        appearance: "brand",
        emphasis: "body",
        iconPosition: "leading",
      },
      {
        title: "中性 · 正文 · 无 icon",
        appearance: "neutral",
        emphasis: "body",
        iconPosition: "none",
      },
    ],
  },
];

function TextButtonKitPreview({
  size,
  appearance,
  emphasis,
  iconPosition,
  disabled,
}: {
  size: TextButtonSize;
  appearance: TextButtonAppearance;
  emphasis: TextButtonEmphasis;
  iconPosition: TextButtonIconPosition;
  disabled: boolean;
}) {
  return (
    <div className="textButtonKitStage">
      <section aria-labelledby="text-button-live-title">
        <div className="listTagKitSectionHeader">
          <div>
            <h3 id="text-button-live-title">当前配置</h3>
            <p>字号、颜色、状态与图标位置由左侧控件驱动</p>
          </div>
        </div>
        <TextButton
          label="文字+icon"
          size={size}
          appearance={appearance}
          emphasis={emphasis}
          disabled={disabled}
          iconPosition={iconPosition}
          leadingIcon={iconPosition === "leading" ? "gift" : undefined}
          trailingPreset={
            iconPosition === "trailing" ? "chevron" : undefined
          }
          onPress={() => undefined}
        />
      </section>
      <section aria-labelledby="text-button-matrix-title">
        <div className="listTagKitSectionHeader">
          <div>
            <h3 id="text-button-matrix-title">Figma 变体矩阵</h3>
            <p>对齐 node 40:3663 · 三档字号常用组合</p>
          </div>
          <span>40:3663</span>
        </div>
        <div className="textButtonKitMatrix" aria-label="文字按钮变体矩阵">
          {TEXT_BUTTON_MATRIX.map((group) => (
            <div className="textButtonKitMatrixGroup" key={group.size}>
              <strong>{group.label}</strong>
              <div className="textButtonKitMatrixRow">
                {group.cases.map((item) => (
                  <article className="textButtonKitMatrixCase" key={item.title}>
                    <TextButton
                      label="文字+icon"
                      size={group.size}
                      appearance={item.appearance}
                      emphasis={item.emphasis}
                      disabled={item.disabled}
                      iconPosition={item.iconPosition}
                      leadingIcon={
                        item.iconPosition === "leading" ? "gift" : undefined
                      }
                      trailingPreset={
                        item.iconPosition === "trailing" ? "chevron" : undefined
                      }
                      onPress={() => undefined}
                    />
                    <p>{item.title}</p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
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
              <BottomNavigationIcon
                name={
                  item.key as
                    | "refresh"
                    | "toptop"
                    | "room"
                    | "feed"
                    | "message"
                    | "me"
                }
                selected={selected}
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
