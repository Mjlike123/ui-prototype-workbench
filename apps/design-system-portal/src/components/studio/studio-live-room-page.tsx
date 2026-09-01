"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { PillSecondaryTab } from "@/components/kit/pill-secondary-tab";
import { SystemIcon } from "@/components/kit/system-icon";

type StudioLiveRoomPageProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack: () => void;
};

type GiftTab = "popular" | "luxury" | "backpack";

type GiftItem = {
  id: string;
  name: string;
  price: number;
  src: string;
};

type LiveChatItem =
  | {
      id: string;
      kind: "text";
      user: string;
      text: string;
    }
  | {
      id: string;
      kind: "gift";
      user: string;
      giftName: string;
      giftSrc: string;
      quantity: number;
    }
  | {
      id: string;
      kind: "system";
      text: string;
    };

const HOST = {
  name: "Latifa Alghanim",
  avatar: "/prototypes/feed/latifa-avatar.png",
  viewers: "12.4K",
};

const ROOM_COVER = "/prototypes/feed/latifa-photo.png";

const GIFT_TABS: Array<{ key: GiftTab; label: string }> = [
  { key: "popular", label: "Popular" },
  { key: "luxury", label: "Luxury" },
  { key: "backpack", label: "Backpack" },
];

const GIFT_CATALOG: Record<GiftTab, GiftItem[]> = {
  popular: [
    {
      id: "rose",
      name: "Rose",
      price: 10,
      src: "/prototypes/chat-reply/sticker.png",
    },
    {
      id: "heart",
      name: "Heart",
      price: 20,
      src: "/icons/product/toptop-gift.png",
    },
    {
      id: "star",
      name: "Star",
      price: 50,
      src: "/prototypes/profile-v3/supporter-card.png",
    },
    {
      id: "fire",
      name: "Fire",
      price: 99,
      src: "/prototypes/chat-reply/gift.png",
    },
    {
      id: "crown",
      name: "Crown",
      price: 199,
      src: "/prototypes/feed/n8-badge.png",
    },
    {
      id: "rocket",
      name: "Rocket",
      price: 520,
      src: "/prototypes/message/conversation-4.png",
    },
  ],
  luxury: [
    {
      id: "yacht",
      name: "Yacht",
      price: 999,
      src: "/prototypes/message/group-1.png",
    },
    {
      id: "castle",
      name: "Castle",
      price: 1999,
      src: "/prototypes/message/conversation-1.png",
    },
    {
      id: "galaxy",
      name: "Galaxy",
      price: 5200,
      src: "/prototypes/message/conversation-2.png",
    },
    {
      id: "throne",
      name: "Throne",
      price: 9999,
      src: "/prototypes/message/conversation-3.png",
    },
  ],
  backpack: [
    {
      id: "free-rose",
      name: "Rose",
      price: 0,
      src: "/prototypes/chat-reply/sticker.png",
    },
  ],
};

const INITIAL_CHAT: LiveChatItem[] = [
  {
    id: "c1",
    kind: "system",
    text: "Welcome to Latifa's live room",
  },
  {
    id: "c2",
    kind: "text",
    user: "Jane",
    text: "Hey! Glad to catch the stream ✨",
  },
  {
    id: "c3",
    kind: "gift",
    user: "Obaid",
    giftName: "Heart",
    giftSrc: "/icons/product/toptop-gift.png",
    quantity: 3,
  },
];

/** Studio-only live room with gift panel — not Core catalog. */
export function StudioLiveRoomPage({
  width = 375,
  height = 812,
  theme = "light",
  onBack,
}: StudioLiveRoomPageProps) {
  const chatRef = useRef<HTMLDivElement>(null);
  const sequence = useRef(INITIAL_CHAT.length + 1);

  const [followed, setFollowed] = useState(false);
  const [giftPanelOpen, setGiftPanelOpen] = useState(false);
  const [giftTab, setGiftTab] = useState<GiftTab>("popular");
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [coinBalance, setCoinBalance] = useState(8888);
  const [chat, setChat] = useState(INITIAL_CHAT);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sendingGift, setSendingGift] = useState(false);

  const gifts = GIFT_CATALOG[giftTab];
  const selectedGift =
    gifts.find((gift) => gift.id === selectedGiftId) ??
    GIFT_CATALOG.popular.find((gift) => gift.id === selectedGiftId) ??
    GIFT_CATALOG.luxury.find((gift) => gift.id === selectedGiftId) ??
    GIFT_CATALOG.backpack.find((gift) => gift.id === selectedGiftId) ??
    null;

  const totalCost = selectedGift ? selectedGift.price * quantity : 0;
  const canSendGift =
    Boolean(selectedGift) &&
    !sendingGift &&
    (selectedGift?.price === 0 || coinBalance >= totalCost);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 2400);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    const list = chatRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [chat, giftPanelOpen]);

  useEffect(() => {
    if (!giftPanelOpen) return;
    const firstGift = GIFT_CATALOG[giftTab][0];
    setSelectedGiftId(firstGift?.id ?? null);
    setQuantity(1);
  }, [giftPanelOpen, giftTab]);

  const openGiftPanel = () => {
    setGiftPanelOpen(true);
  };

  const closeGiftPanel = () => {
    if (sendingGift) return;
    setGiftPanelOpen(false);
  };

  const sendGift = () => {
    if (!selectedGift || !canSendGift) return;

    setSendingGift(true);
    window.setTimeout(() => {
      if (selectedGift.price > 0) {
        setCoinBalance((current) => current - totalCost);
      }

      setChat((current) => [
        ...current,
        {
          id: `chat-${sequence.current++}`,
          kind: "gift",
          user: "You",
          giftName: selectedGift.name,
          giftSrc: selectedGift.src,
          quantity,
        },
      ]);

      setSendingGift(false);
      setGiftPanelOpen(false);
      setFeedback(`已送出 ${selectedGift.name} ×${quantity}`);
    }, 680);
  };

  return (
    <div
      className={[
        "pageCanvasDevice studioLiveRoomDevice",
        giftPanelOpen ? "studioLiveRoomDevice--giftOpen" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`Studio 直播间探索 · ${width}×${height}`}
    >
      <IosStatusBar appearance="light-content" />

      <div className="studioLiveRoomBody">
        <div className="studioLiveRoomStage" aria-hidden={giftPanelOpen}>
          <Image
            className="studioLiveRoomCover"
            src={ROOM_COVER}
            alt=""
            width={375}
            height={812}
            priority
          />
          <div className="studioLiveRoomScrim" aria-hidden="true" />
        </div>

        <div className="studioLiveRoomContent">
        <header className="studioLiveRoomTopBar" aria-label="直播间顶栏">
          <button type="button" aria-label="关闭直播间" onClick={onBack}>
            <SystemIcon name="close" size={24} />
          </button>

          <div className="studioLiveRoomHost">
            <AvatarVisual size={36} src={HOST.avatar} alt="" />
            <div className="studioLiveRoomHostCopy">
              <strong>{HOST.name}</strong>
              <span>{HOST.viewers} watching</span>
            </div>
            <button
              type="button"
              className={`studioLiveRoomFollow${
                followed ? " studioLiveRoomFollow--active" : ""
              }`}
              aria-label={followed ? "已关注主播" : "关注主播"}
              aria-pressed={followed}
              onClick={() => setFollowed((current) => !current)}
            >
              {followed ? "Following" : "Follow"}
            </button>
          </div>

          <button
            type="button"
            className="studioLiveRoomViewerPill"
            aria-label={`${HOST.viewers} 正在观看`}
          >
            <SystemIcon name="contacts" size={16} />
            <span>{HOST.viewers}</span>
          </button>
        </header>

        <aside className="studioLiveRoomRail" aria-label="直播间快捷操作">
          <button type="button" aria-label="点赞">
            <SystemIcon name="like" size={28} />
            <span>999</span>
          </button>
          <button type="button" aria-label="评论">
            <SystemIcon name="comment" size={28} />
            <span>128</span>
          </button>
          <button
            type="button"
            className="studioLiveRoomRailGift"
            aria-label="打开送礼面板"
            aria-expanded={giftPanelOpen}
            onClick={openGiftPanel}
          >
            <SystemIcon name="gift" size={28} />
            <span>Gift</span>
          </button>
          <button type="button" aria-label="分享">
            <SystemIcon name="link" size={28} />
            <span>Share</span>
          </button>
        </aside>

        <section className="studioLiveRoomChat" aria-label="直播评论">
          <div className="studioLiveRoomChatScroll" ref={chatRef}>
            {chat.map((item) => (
              <LiveChatRow key={item.id} item={item} />
            ))}
          </div>
        </section>

        <footer className="studioLiveRoomComposer" aria-label="直播互动栏">
          <label className="studioLiveRoomCommentField">
            <span className="visuallyHidden">发送评论</span>
            <input
              type="text"
              readOnly
              placeholder="Say something..."
              onFocus={() => setFeedback("评论输入待接入")}
            />
          </label>
          <button
            type="button"
            className="studioLiveRoomGiftTrigger"
            aria-label="打开送礼面板"
            aria-expanded={giftPanelOpen}
            onClick={openGiftPanel}
          >
            <SystemIcon name="gift" size={24} />
          </button>
        </footer>
        </div>
      </div>

      {giftPanelOpen ? (
        <div className="feedComposeOverlay studioLiveRoomGiftOverlay" role="presentation">
          <button
            type="button"
            className="feedComposeOverlayBackdrop"
            aria-label="关闭送礼面板"
            onClick={closeGiftPanel}
          />
          <section
            className="feedComposeMediaSheet studioLiveRoomGiftSheet"
            aria-label="送礼面板"
          >
            <div className="feedComposeMediaSheetHandle" aria-hidden="true" />

            <header className="studioLiveRoomGiftHeader">
              <div className="studioLiveRoomGiftBalance">
                <span className="studioLiveRoomCoinMark" aria-hidden="true">
                  ◆
                </span>
                <strong>{coinBalance.toLocaleString()}</strong>
                <button type="button" onClick={() => setFeedback("充值入口待接入")}>
                  Recharge
                </button>
              </div>
              <PillSecondaryTab
                className="studioLiveRoomGiftTabs"
                ariaLabel="礼物分类"
                items={GIFT_TABS}
                value={giftTab}
                onChange={(key) => setGiftTab(key as GiftTab)}
              />
            </header>

            <div className="studioLiveRoomGiftGrid" role="list">
              {gifts.length === 0 ? (
                <p className="studioLiveRoomGiftEmpty">Backpack is empty</p>
              ) : (
                gifts.map((gift) => {
                  const selected = gift.id === selectedGiftId;
                  return (
                    <button
                      key={gift.id}
                      type="button"
                      role="listitem"
                      className={`studioLiveRoomGiftCell${
                        selected ? " studioLiveRoomGiftCell--selected" : ""
                      }`}
                      aria-label={`${gift.name}，${gift.price} coins`}
                      aria-pressed={selected}
                      onClick={() => {
                        setSelectedGiftId(gift.id);
                        setQuantity(1);
                      }}
                    >
                      <Image src={gift.src} alt="" width={56} height={56} />
                      <strong>{gift.name}</strong>
                      <span>
                        {gift.price === 0 ? "Free" : `${gift.price} ◆`}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <footer className="studioLiveRoomGiftFooter">
              <div className="studioLiveRoomGiftQuantity">
                <button
                  type="button"
                  aria-label="减少数量"
                  disabled={quantity <= 1 || sendingGift}
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                >
                  −
                </button>
                <span aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  aria-label="增加数量"
                  disabled={quantity >= 99 || sendingGift}
                  onClick={() => setQuantity((current) => Math.min(99, current + 1))}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className={`kitButton kitButton--height48 kitButton--primary studioLiveRoomGiftSend${
                  sendingGift ? " studioLiveRoomGiftSend--loading" : ""
                }`}
                disabled={!canSendGift}
                aria-busy={sendingGift}
                aria-label={
                  selectedGift
                    ? `送出 ${selectedGift.name} ×${quantity}`
                    : "选择礼物"
                }
                onClick={sendGift}
              >
                {sendingGift ? (
                  <SystemIcon name="loading" size={20} />
                ) : selectedGift ? (
                  `Send · ${totalCost === 0 ? "Free" : `${totalCost} ◆`}`
                ) : (
                  "Send"
                )}
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      {feedback ? (
        <div className="profilePrototypeToast" role="status" aria-live="polite">
          {feedback}
        </div>
      ) : null}
    </div>
  );
}

function LiveChatRow({ item }: { item: LiveChatItem }) {
  if (item.kind === "system") {
    return (
      <p className="studioLiveRoomChatSystem" aria-label={item.text}>
        {item.text}
      </p>
    );
  }

  if (item.kind === "gift") {
    return (
      <p className="studioLiveRoomChatGift" aria-label={`${item.user} 送出礼物`}>
        <strong>{item.user}</strong>
        <span>
          sent {item.giftName}
          {item.quantity > 1 ? ` ×${item.quantity}` : ""}
        </span>
        <Image src={item.giftSrc} alt="" width={20} height={20} />
      </p>
    );
  }

  return (
    <p className="studioLiveRoomChatText">
      <strong>{item.user}</strong>
      <span>{item.text}</span>
    </p>
  );
}
