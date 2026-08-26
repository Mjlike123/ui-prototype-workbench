"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { ListTag } from "@/components/kit/list-tag";
import { BottomNavigationIcon } from "@/components/kit/bottom-navigation-icon";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import {
  SystemIcon,
  type SystemIconName,
} from "@/components/kit/system-icon";
import {
  BOTTOM_NAV_DESTINATIONS,
  type BottomNavKey,
} from "@/lib/profile-prototype-model";
import type { MeSecondaryScreen } from "@/lib/prototype-app-routes";

type MeMenuItem = {
  id: string;
  label: string;
  icon?: string;
  systemIcon?: SystemIconName;
  iconTone?: "blue" | "pink" | "orange" | "violet" | "teal" | "neutral";
  productIcon?: boolean;
  trailing?: string;
  badge?: string;
  dot?: boolean;
};

const activityItems: MeMenuItem[] = [
  {
    id: "visitors",
    label: "Who saw me",
    icon: "/prototypes/me/menu-icons/who-saw-me.png",
    productIcon: true,
    badge: "99",
  },
  {
    id: "moments",
    label: "My Moments",
    icon: "/prototypes/me/menu-icons/my-moments.png",
    productIcon: true,
  },
];

const accountItems: MeMenuItem[] = [
  {
    id: "wallet",
    label: "My wallet",
    icon: "/prototypes/me/menu-icons/my-wallet.png",
    productIcon: true,
  },
  {
    id: "offers",
    label: "Offer Center",
    icon: "/prototypes/me/menu-icons/offer-center.png",
    productIcon: true,
  },
  {
    id: "vip",
    label: "VIP",
    icon: "/prototypes/me/menu-icons/vip.png",
    productIcon: true,
    dot: true,
  },
  {
    id: "mine",
    label: "Mine",
    icon: "/prototypes/me/menu-icons/mine.png",
    productIcon: true,
    trailing: "Starter mine",
  },
  {
    id: "noble",
    label: "Noble",
    icon: "/prototypes/me/menu-icons/noble.png",
    productIcon: true,
    trailing: "N3",
  },
  {
    id: "shop",
    label: "Shopping Center",
    icon: "/prototypes/me/menu-icons/shopping-center.png",
    productIcon: true,
  },
  {
    id: "invite",
    label: "Invite friends",
    icon: "/prototypes/me/menu-icons/invite-friends.png",
    productIcon: true,
  },
];

const supportItems: MeMenuItem[] = [
  {
    id: "guidelines",
    label: "Community Guidelines",
    systemIcon: "guidelines",
    iconTone: "neutral",
  },
  {
    id: "help",
    label: "Help",
    systemIcon: "help",
    iconTone: "neutral",
  },
  {
    id: "settings",
    label: "Settings",
    systemIcon: "settings",
    iconTone: "neutral",
  },
];

type MePagePrototypeProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onNavigate?: (destination: BottomNavKey) => void;
  onOpenProfile?: () => void;
  onOpenSecondary?: (screen: MeSecondaryScreen) => void;
};

export function MePagePrototype({
  width = 375,
  height = 812,
  theme = "light",
  onNavigate,
  onOpenProfile,
  onOpenSecondary,
}: MePagePrototypeProps) {
  const [bottomNav, setBottomNav] = useState<BottomNavKey>("me");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showAction = (message: string) => setToast(message);

  return (
    <div
      className="pageCanvasDevice mePrototypeDevice"
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`Me 账户中心原型 · ${width}×${height}`}
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />

      <div className="pageCanvasContentShell">
        <div className="pageCanvasScroll mePrototypeScroll">
          {bottomNav === "me" ? (
            <>
              <MeIdentityHeader
                onOpenProfile={onOpenProfile}
                onEdit={() => showAction("进入编辑资料")}
                onCopyId={() => showAction("ID 已复制")}
              />

              <TribeCard onPress={() => showAction("开始创建或加入 Tribe")} />

              <MeMenuGroup
                label="Activity"
                items={activityItems}
                onItemPress={(item) => showAction(`打开 ${item.label}`)}
              />
              <div className="meMenuDivider" aria-hidden="true" />
              <MeMenuGroup
                label="Account and benefits"
                items={accountItems}
                onItemPress={(item) => {
                  if (item.id === "wallet" && onOpenSecondary) {
                    onOpenSecondary("wallet");
                    return;
                  }
                  showAction(`打开 ${item.label}`);
                }}
              />
              <div className="meMenuDivider" aria-hidden="true" />
              <MeMenuGroup
                label="Support"
                items={supportItems}
                onItemPress={(item) => {
                  const screenByItem: Partial<
                    Record<string, MeSecondaryScreen>
                  > = {
                    guidelines: "community-guidelines",
                    help: "help",
                    settings: "settings",
                  };
                  const secondaryScreen = screenByItem[item.id];
                  if (secondaryScreen && onOpenSecondary) {
                    onOpenSecondary(secondaryScreen);
                    return;
                  }
                  showAction(`打开 ${item.label}`);
                }}
              />
            </>
          ) : (
            <section className="mePrototypePlaceholder">
              <h2>
                {
                  BOTTOM_NAV_DESTINATIONS.find(
                    (destination) => destination.key === bottomNav,
                  )?.label
                }
              </h2>
              <p>当前功能原型聚焦 Me 账户中心。</p>
              <button type="button" onClick={() => setBottomNav("me")}>
                返回 Me
              </button>
            </section>
          )}
        </div>

        <MeBottomNavigation
          selected={bottomNav}
          onChange={(key) => {
            if (onNavigate) {
              onNavigate(key);
              return;
            }
            setBottomNav(key);
            showAction(
              key === "me"
                ? "已回到 Me"
                : `切换到 ${
                    BOTTOM_NAV_DESTINATIONS.find(
                      (destination) => destination.key === key,
                    )?.label
                  }`,
            );
          }}
        />
      </div>

      {toast ? (
        <div className="profilePrototypeToast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function MeIdentityHeader({
  onOpenProfile,
  onEdit,
  onCopyId,
}: {
  onOpenProfile?: () => void;
  onEdit: () => void;
  onCopyId: () => void;
}) {
  return (
    <section className="meIdentityHeader" aria-label="个人身份">
      <button
        type="button"
        className="meIdentityProfileLink"
        aria-label="打开个人资料"
        onClick={onOpenProfile ?? onEdit}
      />
      <span className="meIdentityAvatar" aria-hidden="true">
        <AvatarVisual size={60} alt="" />
      </span>
      <div className="meIdentityContent">
        <div className="meIdentityNameRow">
          <h1>Lisaaaaaaaaaaaaa…</h1>
          <ListTag kind="gender" gender="female" />
        </div>
        <button
          type="button"
          className="meIdentityId"
          onClick={onCopyId}
          aria-label="复制 ID 1234567"
        >
          ID: 1234567
          <SystemIcon name="copy" size={14} className="meIdentityCopyIcon" />
        </button>
        <div className="meLevelRow" aria-label="等级徽章">
          <span>👑</span>
          <span>🌟</span>
          <span>🌙</span>
          <span>⭐</span>
          <span>⭐</span>
          <span className="meLevelHelp">?</span>
        </div>
      </div>
      <button
        type="button"
        className="kitButton kitButton--height24 kitButton--neutral-outline"
        onClick={onEdit}
      >
        <SystemIcon name="edit" size={16} className="meEditSystemIcon" />
        Edit
      </button>
    </section>
  );
}

function TribeCard({ onPress }: { onPress: () => void }) {
  return (
    <section className="meTribeCard" aria-label="Tribe">
      <span className="meTribeIcon" aria-hidden="true">
        <Image
          src="/prototypes/me/tribe.png"
          alt=""
          width={48}
          height={48}
        />
      </span>
      <div className="meTribeCopy">
        <h2>Join Tribe</h2>
        <p>Meet friends and get bonus</p>
      </div>
      <button
        type="button"
        className="kitButton kitButton--height32 kitButton--primary"
        onClick={onPress}
      >
        Go
      </button>
    </section>
  );
}

function MeMenuGroup({
  label,
  items,
  onItemPress,
}: {
  label: string;
  items: MeMenuItem[];
  onItemPress: (item: MeMenuItem) => void;
}) {
  return (
    <section className="meMenuGroup" aria-label={label}>
      {items.map((item) => (
        <button
          type="button"
          className="meMenuRow"
          key={item.id}
          onClick={() => onItemPress(item)}
        >
          <span
            className={`meMenuIcon ${
              item.productIcon
                ? "meMenuIcon--product"
                : `meMenuIcon--${item.iconTone ?? "neutral"}`
            }`}
          >
            {item.systemIcon ? (
              <SystemIcon name={item.systemIcon} size={24} />
            ) : item.icon ? (
              <Image
                src={item.icon}
                alt=""
                width={item.productIcon ? 24 : 18}
                height={item.productIcon ? 24 : 18}
              />
            ) : null}
          </span>
          <span className="meMenuLabel">{item.label}</span>
          <span className="meMenuTrailing">
            {item.badge ? (
              <span className="meMenuBadge" aria-label={`${item.badge} 条未读`}>
                {item.badge}
              </span>
            ) : null}
            {item.trailing ? <span>{item.trailing}</span> : null}
            {item.dot ? (
              <span className="meMenuDot" aria-label="有新内容" />
            ) : null}
            <SystemIcon name="chevronRight" size={16} />
          </span>
        </button>
      ))}
    </section>
  );
}

function MeBottomNavigation({
  selected,
  onChange,
}: {
  selected: BottomNavKey;
  onChange: (key: BottomNavKey) => void;
}) {
  return (
    <nav
      className="bottomNavigation bottomNavigationLight pageCanvasBottomNav"
      aria-label="App 一级目的地"
    >
      <div className="bottomNavigationItems">
        {BOTTOM_NAV_DESTINATIONS.map((item) => (
          <button
            className={`bottomNavigationItem${
              selected === item.key ? " selected" : ""
            }`}
            key={item.key}
            type="button"
            aria-current={selected === item.key ? "page" : undefined}
            onClick={() => onChange(item.key)}
          >
            <BottomNavigationIcon
              name={item.key}
              selected={selected === item.key}
            />
            <span className="bottomNavigationLabel">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="bottomNavigationSafeArea" aria-hidden="true">
        <span className="bottomNavigationHomeIndicator" />
      </div>
    </nav>
  );
}
