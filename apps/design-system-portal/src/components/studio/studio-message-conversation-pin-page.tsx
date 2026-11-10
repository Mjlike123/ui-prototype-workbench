"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ActionPanelSheet } from "@/components/kit/action-panel";
import { AvatarGroupVisual } from "@/components/kit/avatar-group-visual";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { BottomNavigation } from "@/components/kit/bottom-navigation";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { PrimaryNavigation } from "@/components/kit/primary-navigation";
import { RegularListItem } from "@/components/kit/regular-list-item";
import { SearchControl } from "@/components/kit/search-control";
import { SystemIcon } from "@/components/kit/system-icon";
import { Toast } from "@/components/kit/toast";

type ConversationKind = "private" | "group" | "room-group" | "system";

type Conversation = {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread?: string;
  kind: ConversationKind;
  avatar?: string;
};

const PIN_ACTION_WIDTH = 56;
const DELETE_ACTION_WIDTH = 56;
const ACTION_GAP = 8;
const ACTION_TRAILING_PADDING = 16;
const ACTION_WIDTH =
  PIN_ACTION_WIDTH + ACTION_GAP + DELETE_ACTION_WIDTH + ACTION_TRAILING_PADDING;
const OPEN_THRESHOLD = ACTION_WIDTH / 2;
const LONG_PRESS_MS = 520;
const QUICK_MENU_EXIT_MS = 160;

const CONVERSATIONS: Conversation[] = [
  {
    id: "andrew",
    name: "Andrew",
    preview: "I’ll send the notes today.",
    time: "14:32",
    unread: "2",
    kind: "private",
    avatar: "/prototypes/feed/andrew-avatar.png",
  },
  {
    id: "weekend-group",
    name: "Weekend game partners",
    preview: "Felix: Room starts at 8 tonight",
    time: "13:48",
    unread: "9",
    kind: "group",
  },
  {
    id: "latifa",
    name: "Latifa",
    preview: "The new photos look great!",
    time: "12:06",
    kind: "private",
    avatar: "/prototypes/feed/latifa-avatar.png",
  },
  {
    id: "room-group",
    name: "Riyadh rank partners",
    preview: "Room Group · 5 friends online",
    time: "11:42",
    kind: "room-group",
    avatar: "/prototypes/message/conversation-3.png",
  },
  {
    id: "candy",
    name: "Candy",
    preview: "See you there 👋",
    time: "Yesterday",
    kind: "private",
    avatar: "/prototypes/toptop-home/avatar-felix.png",
  },
  {
    id: "system",
    name: "TopTop notifications",
    preview: "Your account safety report is ready",
    time: "Sun",
    kind: "system",
    avatar: "/prototypes/message/conversation-1.png",
  },
];

export function StudioMessageConversationPinPage({
  width = 375,
  height = 812,
  theme = "light",
}: {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack?: () => void;
}) {
  const [pinnedIds, setPinnedIds] = useState<string[]>(["latifa"]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [openRowId, setOpenRowId] = useState<string>();
  const [menuRowId, setMenuRowId] = useState<string>();
  const [feedback, setFeedback] = useState<string>();
  const [quickMenuPhase, setQuickMenuPhase] = useState<
    "closed" | "open" | "closing"
  >("closed");
  const quickMenuRef = useRef<HTMLDivElement>(null);
  const quickMenuTriggerRef = useRef<HTMLButtonElement | undefined>(undefined);

  const orderedConversations = useMemo(() => {
    const byId = new Map(CONVERSATIONS.map((item) => [item.id, item]));
    const regular = CONVERSATIONS.filter(
      (item) => !pinnedIds.includes(item.id) && !hiddenIds.includes(item.id),
    );
    const pinned = pinnedIds
      .map((id) => byId.get(id))
      .filter(
        (item): item is Conversation =>
          Boolean(item) && !hiddenIds.includes(item!.id),
      );
    return [...pinned, ...regular];
  }, [hiddenIds, pinnedIds]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(undefined), 1800);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (quickMenuPhase === "open") {
      quickMenuRef.current
        ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
        ?.focus({ preventScroll: true });
      return;
    }
    if (quickMenuPhase !== "closing") return;
    const timer = window.setTimeout(() => {
      setQuickMenuPhase("closed");
      quickMenuTriggerRef.current?.focus({ preventScroll: true });
    }, QUICK_MENU_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [quickMenuPhase]);

  const openQuickMenu = () => {
    quickMenuTriggerRef.current =
      document.querySelector<HTMLButtonElement>(
        'button[aria-label="创建新消息"]',
      ) ?? undefined;
    setOpenRowId(undefined);
    setMenuRowId(undefined);
    setQuickMenuPhase("open");
  };

  const closeQuickMenu = () => {
    if (quickMenuPhase === "open") setQuickMenuPhase("closing");
  };

  const updatePinned = (conversation: Conversation) => {
    const pinned = pinnedIds.includes(conversation.id);
    setPinnedIds((current) =>
      pinned
        ? current.filter((id) => id !== conversation.id)
        : [conversation.id, ...current],
    );
    setOpenRowId(undefined);
    setMenuRowId(undefined);
    setFeedback(
      pinned
        ? `已取消置顶 ${conversation.name}`
        : `已置顶 ${conversation.name}`,
    );
  };

  const deleteConversation = (conversation: Conversation) => {
    setHiddenIds((current) => [...current, conversation.id]);
    setPinnedIds((current) => current.filter((id) => id !== conversation.id));
    setOpenRowId(undefined);
    setMenuRowId(undefined);
    setFeedback(`已删除 ${conversation.name}`);
  };

  const menuConversation = CONVERSATIONS.find(
    (item) => item.id === menuRowId,
  );
  const menuConversationPinned = menuConversation
    ? pinnedIds.includes(menuConversation.id)
    : false;

  return (
    <div
      className={[
        "pageCanvasDevice",
        "studioMessagePinDevice",
        theme === "dark" ? "studioMessagePinDevice--dark" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`Message 会话置顶原型 · ${width}×${height}`}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) setOpenRowId(undefined);
      }}
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />
      <PrimaryNavigation
        className="studioMessagePinNavigation"
        items={[{ key: "message", label: "Message" }]}
        value="message"
        onChange={() => undefined}
        ariaLabel="Message 顶部导航"
        actions={[
          {
            key: "contacts",
            label: "添加好友",
            icon: <SystemIcon name="contacts" size={28} />,
            onPress: () => setFeedback("打开添加好友"),
          },
          {
            key: "new-message",
            label: "创建新消息",
            icon: <SystemIcon name="newMessage" />,
            onPress: openQuickMenu,
          },
        ]}
      />
      <div className="studioMessagePinSearch">
        <SearchControl
          value=""
          active={false}
          placeholder="Search by Name / Userid"
          ariaLabel="搜索消息"
          onActivate={() => setFeedback("打开消息搜索")}
          onChange={() => undefined}
          onCancel={() => undefined}
        />
      </div>

      <main
        className="studioMessagePinScroll"
        onScroll={() => setOpenRowId(undefined)}
      >
        <div className="studioMessagePinList" role="list" aria-label="消息列表">
          {orderedConversations.map((conversation) => {
            const pinned = pinnedIds.includes(conversation.id);
            const canPin = conversation.kind !== "system";
            return (
              <SwipeableConversationRow
                key={conversation.id}
                conversation={conversation}
                pinned={pinned}
                canPin={canPin}
                open={openRowId === conversation.id}
                onOpen={() => setOpenRowId(conversation.id)}
                onClose={() =>
                  setOpenRowId((current) =>
                    current === conversation.id ? undefined : current,
                  )
                }
                onTogglePin={() => updatePinned(conversation)}
                onDelete={() => deleteConversation(conversation)}
                onOpenMenu={() => {
                  setOpenRowId(undefined);
                  setMenuRowId(conversation.id);
                }}
                onPress={() => setFeedback(`打开 ${conversation.name}`)}
              />
            );
          })}
        </div>
      </main>

      <BottomNavigation
        className="studioMessagePinBottomNavigation"
        value="message"
        onChange={(destination) =>
          setFeedback(`切换到 ${destination}（原型保持在 Message）`)
        }
      />

      {feedback ? (
        <Toast
          className="studioMessagePinToast"
          message={feedback}
          status="success"
        />
      ) : null}

      {quickMenuPhase !== "closed" ? (
        <div
          className={[
            "studioMessageQuickMenuLayer",
            quickMenuPhase === "closing"
              ? "studioMessageQuickMenuLayer--closing"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          role="presentation"
        >
          <button
            type="button"
            className="studioMessageQuickMenuBackdrop"
            aria-label="关闭消息快捷菜单"
            onClick={closeQuickMenu}
          />
          <div
            ref={quickMenuRef}
            className="studioMessageQuickMenuBubble"
            role="dialog"
            aria-modal="true"
            aria-label="消息快捷菜单"
            onKeyDown={(event) => {
              const items = Array.from(
                event.currentTarget.querySelectorAll<HTMLButtonElement>(
                  '[role="menuitem"]',
                ),
              );
              const index = items.indexOf(
                document.activeElement as HTMLButtonElement,
              );
              if (event.key === "Escape") {
                event.preventDefault();
                closeQuickMenu();
              } else if (
                event.key === "ArrowDown" ||
                (event.key === "Tab" && !event.shiftKey)
              ) {
                event.preventDefault();
                items[(index + 1 + items.length) % items.length]?.focus();
              } else if (
                event.key === "ArrowUp" ||
                (event.key === "Tab" && event.shiftKey)
              ) {
                event.preventDefault();
                items[(index - 1 + items.length) % items.length]?.focus();
              }
            }}
          >
            <div role="menu" aria-label="可创建的消息">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setFeedback("创建群聊");
                  closeQuickMenu();
                }}
              >
                <SystemIcon name="newMessage" size={24} />
                <span>创建群聊</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setFeedback("添加朋友");
                  closeQuickMenu();
                }}
              >
                <SystemIcon name="follow" size={24} />
                <span>添加朋友</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ActionPanelSheet
        open={Boolean(menuConversation)}
        onDismiss={() => setMenuRowId(undefined)}
        aria-label={
          menuConversation ? `${menuConversation.name} 会话操作` : "会话操作"
        }
        description={menuConversation?.name}
        actions={
          menuConversation
            ? [
                {
                  id: menuConversationPinned ? "unpin" : "pin",
                  label: menuConversationPinned ? "Unpin" : "Pin",
                  tone: "emphasis",
                  onPress: () => updatePinned(menuConversation),
                },
                {
                  id: "delete",
                  label: "Delete",
                  tone: "destructive",
                  onPress: () => deleteConversation(menuConversation),
                },
              ]
            : []
        }
        cancelLabel="取消"
        onCancel={() => setMenuRowId(undefined)}
        showHomeIndicator={false}
      />
    </div>
  );
}

function SwipeableConversationRow({
  conversation,
  pinned,
  canPin,
  open,
  onOpen,
  onClose,
  onTogglePin,
  onDelete,
  onOpenMenu,
  onPress,
}: {
  conversation: Conversation;
  pinned: boolean;
  canPin: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  onOpenMenu: () => void;
  onPress: () => void;
}) {
  const [dragX, setDragX] = useState<number>();
  const startRef = useRef<
    { x: number; y: number; offset: number } | undefined
  >(undefined);
  const longPressTimerRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);
  const suppressClickRef = useRef(false);

  const currentOffset = dragX ?? (open ? -ACTION_WIDTH : 0);

  const clearLongPress = () => {
    if (!longPressTimerRef.current) return;
    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = undefined;
  };

  const finishPointer = () => {
    clearLongPress();
    if (dragX !== undefined) {
      if (dragX <= -OPEN_THRESHOLD) onOpen();
      else onClose();
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
    setDragX(undefined);
    startRef.current = undefined;
  };

  const leading =
    conversation.kind === "group" || conversation.kind === "room-group" ? (
      <AvatarGroupVisual />
    ) : (
      <AvatarVisual
        size={48}
        src={
          conversation.avatar ?? "/prototypes/message/conversation-1.png"
        }
        alt=""
      />
    );

  return (
    <div
      className={[
        "studioMessagePinRow",
        pinned ? "studioMessagePinRow--pinned" : "",
        !canPin ? "studioMessagePinRow--system" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-pinned={pinned ? "true" : "false"}
    >
      {canPin ? (
        <div className="studioMessagePinActions" aria-hidden={!open}>
          <button
            type="button"
            className="studioMessagePinAction studioMessagePinAction--pin"
            aria-label={`${pinned ? "Unpin" : "Pin"} ${conversation.name}`}
            tabIndex={open ? 0 : -1}
            onClick={onTogglePin}
          >
            {pinned ? "Unpin" : "Pin"}
          </button>
          <button
            type="button"
            className="studioMessagePinAction studioMessagePinAction--delete"
            aria-label={`Delete ${conversation.name}`}
            tabIndex={open ? 0 : -1}
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      ) : null}
      <div
        className="studioMessagePinRowSurface"
        style={{ transform: `translate3d(${currentOffset}px, 0, 0)` }}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          event.currentTarget.setPointerCapture?.(event.pointerId);
          startRef.current = {
            x: event.clientX,
            y: event.clientY,
            offset: open ? -ACTION_WIDTH : 0,
          };
          if (!canPin) return;
          clearLongPress();
          longPressTimerRef.current = setTimeout(() => {
            suppressClickRef.current = true;
            onOpenMenu();
            window.setTimeout(() => {
              suppressClickRef.current = false;
            }, 0);
          }, LONG_PRESS_MS);
        }}
        onPointerMove={(event) => {
          const start = startRef.current;
          if (!start || !canPin) return;
          const deltaX = event.clientX - start.x;
          const deltaY = event.clientY - start.y;
          if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) clearLongPress();
          if (Math.abs(deltaY) >= Math.abs(deltaX)) return;
          const next = Math.max(
            -ACTION_WIDTH,
            Math.min(0, start.offset + deltaX),
          );
          setDragX(next);
        }}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        onContextMenu={(event) => {
          if (!canPin) return;
          event.preventDefault();
          clearLongPress();
          suppressClickRef.current = true;
          onOpenMenu();
          window.setTimeout(() => {
            suppressClickRef.current = false;
          }, 0);
        }}
      >
        <RegularListItem
          listType="message"
          className="studioMessagePinListItem"
          title={conversation.name}
          subtitle={conversation.preview}
          leading={leading}
          tags={
            pinned ? (
              <span className="studioMessagePinIndicator">PINNED</span>
            ) : undefined
          }
          trailing={
            <span className="regularListMessageMeta" aria-hidden="true">
              <small>{conversation.time}</small>
              {conversation.unread ? (
                <span className="regularListUnread">{conversation.unread}</span>
              ) : null}
            </span>
          }
          ariaLabel={[
            conversation.name,
            pinned ? "已置顶" : "",
            conversation.preview,
            conversation.time,
            conversation.unread ? `${conversation.unread} 条未读` : "",
          ]
            .filter(Boolean)
            .join("，")}
          onPress={() => {
            if (suppressClickRef.current) return;
            if (open) {
              onClose();
              return;
            }
            onPress();
          }}
        />
      </div>
    </div>
  );
}
