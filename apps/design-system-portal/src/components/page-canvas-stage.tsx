"use client";

import Image from "next/image";
import {
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import type { PageCanvasBlock, PageCanvasPlan } from "@/lib/page-canvas-parser";
import {
  BOTTOM_NAV_DESTINATIONS,
  type BottomNavKey,
} from "@/lib/profile-prototype-model";
import { BottomNavigation } from "@/components/kit/bottom-navigation";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { PillSecondaryTab } from "@/components/kit/pill-secondary-tab";
import {
  PrimaryNavigation,
  type PrimaryNavigationItem,
} from "@/components/kit/primary-navigation";
import { PrototypeAvatarImage } from "@/components/kit/prototype-avatar-image";
import { RegularListItem } from "@/components/kit/regular-list-item";
import { RegularNavigation } from "@/components/kit/regular-navigation";
import { SearchControl } from "@/components/kit/search-control";
import { SystemIcon } from "@/components/kit/system-icon";
import { UnderlineSecondaryTab } from "@/components/kit/underline-secondary-tab";
import { PrimaryNavigationSearchIcon } from "@/components/primary-navigation-search-icon";

export type PageCanvasReferenceOverlay = {
  src: string;
  opacity: number;
};

type PageCanvasStageProps = {
  plan: PageCanvasPlan;
  width: number;
  height: number;
  referenceOverlay?: PageCanvasReferenceOverlay | null;
};

const PRIMARY_NAV_LABELS = [
  "Mine",
  "Popular",
  "Country",
  "Following",
  "Nearby",
] as const;

export function PageCanvasStage({
  plan,
  width,
  height,
  referenceOverlay,
}: PageCanvasStageProps) {
  const [primaryKey, setPrimaryKey] = useState(
    PRIMARY_NAV_LABELS[plan.initialState?.primaryNavIndex ?? 0],
  );
  const [secondaryKey, setSecondaryKey] = useState("tab-0");
  const [bottomKey, setBottomKey] = useState<BottomNavKey>(
    BOTTOM_NAV_DESTINATIONS[plan.initialState?.bottomNavIndex ?? 0].key,
  );
  const [searchActive, setSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activeRow, setActiveRow] = useState<number | null>(null);

  useEffect(() => {
    // This reset synchronizes interactive preview state with a newly selected plan.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrimaryKey(
      PRIMARY_NAV_LABELS[plan.initialState?.primaryNavIndex ?? 0],
    );
    setSecondaryKey("tab-0");
    setBottomKey(
      BOTTOM_NAV_DESTINATIONS[plan.initialState?.bottomNavIndex ?? 0].key,
    );
    setSearchActive(false);
    setSearchValue("");
    setActiveRow(null);
  }, [plan.title, plan.intent, plan.blocks.length, plan.initialState]);

  return (
    <div
      className="pageCanvasDevice"
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`原型预览：${plan.title} · ${width}×${height}`}
    >
      <IosStatusBar className="pageCanvasStatusBar" appearance="dark-content" />
      <div className="pageCanvasContentShell">
        {referenceOverlay ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="pageCanvasReferenceOverlay"
            src={referenceOverlay.src}
            alt=""
            aria-hidden="true"
            style={{ opacity: referenceOverlay.opacity }}
          />
        ) : null}
        <div className="pageCanvasScroll">
          {plan.blocks.map((block, index) => (
            <PageCanvasBlockView
              key={`${block.kind}-${index}`}
              block={block}
              primaryKey={primaryKey}
              onPrimaryChange={setPrimaryKey}
              secondaryKey={secondaryKey}
              onSecondaryChange={setSecondaryKey}
              bottomKey={bottomKey}
              onBottomChange={setBottomKey}
              searchActive={searchActive}
              searchValue={searchValue}
              onSearchActive={setSearchActive}
              onSearchValue={setSearchValue}
              activeRow={activeRow}
              onActiveRow={setActiveRow}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PageCanvasBlockView({
  block,
  primaryKey,
  onPrimaryChange,
  secondaryKey,
  onSecondaryChange,
  bottomKey,
  onBottomChange,
  searchActive,
  searchValue,
  onSearchActive,
  onSearchValue,
  activeRow,
  onActiveRow,
}: {
  block: PageCanvasBlock;
  primaryKey: string;
  onPrimaryChange: (key: string) => void;
  secondaryKey: string;
  onSecondaryChange: (key: string) => void;
  bottomKey: BottomNavKey;
  onBottomChange: (key: BottomNavKey) => void;
  searchActive: boolean;
  searchValue: string;
  onSearchActive: (active: boolean) => void;
  onSearchValue: (value: string) => void;
  activeRow: number | null;
  onActiveRow: (row: number | null) => void;
}) {
  switch (block.kind) {
    case "primary-navigation": {
      const items: PrimaryNavigationItem[] = PRIMARY_NAV_LABELS.slice(
        0,
        block.tabCount,
      ).map((label) => ({ key: label, label }));

      return (
        <PrimaryNavigation
          className="pageCanvasBlockFlush"
          items={items}
          value={primaryKey}
          onChange={onPrimaryChange}
          actions={[
            {
              key: "search",
              label: "搜索",
              icon: <PrimaryNavigationSearchIcon />,
            },
          ]}
        />
      );
    }
    case "regular-navigation":
      return (
        <RegularNavigation
          className="pageCanvasBlockFlush"
          title={block.title}
          leading={block.leading}
          onBack={() => undefined}
          trailing={buildRegularNavigationTrailing(block.trailing)}
          trailingKind={
            block.trailing === "button"
              ? "button"
              : block.trailing === "text"
                ? "text"
                : "icon"
          }
        />
      );
    case "secondary-tab": {
      const labels = block.labels.filter(Boolean) as string[];
      const items = labels.map((label, index) => ({
        key: `tab-${index}`,
        label,
      }));
      const value =
        items.find((item) => item.key === secondaryKey)?.key ??
        items[0]?.key ??
        "tab-0";

      if (block.variant === "underline" && items.length >= 2) {
        return (
          <UnderlineSecondaryTab
            className="pageCanvasBlockFlush"
            items={[items[0], items[1]]}
            value={value}
            onChange={onSecondaryChange}
          />
        );
      }

      return (
        <PillSecondaryTab
          className="pageCanvasBlockFlush"
          items={items}
          value={value}
          onChange={onSecondaryChange}
        />
      );
    }
    case "search-control":
      return (
        <div className="pageCanvasBlockFlush">
          <SearchControl
            placeholder={block.placeholder}
            active={searchActive}
            value={searchValue}
            onActivate={() => onSearchActive(true)}
            onChange={onSearchValue}
            onCancel={() => {
              onSearchValue("");
              onSearchActive(false);
            }}
          />
        </div>
      );
    case "regular-list":
      return (
        <div className="pageCanvasList" role="list">
          {Array.from({ length: block.rows }, (_, index) => {
            const title =
              block.mode === "message"
                ? `会话 ${index + 1}`
                : `操作项 ${index + 1}`;
            const pressed = activeRow === index;

            return (
              <RegularListItem
                key={title}
                listType={block.mode}
                title={title}
                subtitle={
                  block.mode === "message"
                    ? "最近一条消息预览"
                    : "辅助说明文案"
                }
                className={pressed ? "pageCanvasListItemActive" : undefined}
                leading={
                  block.mode === "message" ? (
                    <PrototypeAvatarImage
                      className="regularListAvatar"
                      src="/icons/list/message-avatar.png"
                      alt=""
                      displaySize={48}
                    />
                  ) : (
                    <span className="regularListSystemIcon" aria-hidden="true">
                      <Image
                        src="/icons/list/system-notification.png"
                        alt=""
                        width={48}
                        height={48}
                      />
                    </span>
                  )
                }
                trailing={
                  block.mode === "action" ? (
                    <span className="regularListMutedChevron" aria-hidden="true" />
                  ) : (
                    <span className="regularListMessageMeta">
                      <small>06-2{index}</small>
                    </span>
                  )
                }
                onPress={() => onActiveRow(pressed ? null : index)}
              />
            );
          })}
        </div>
      );
    case "button-bar":
      return (
        <div className="pageCanvasButtonBar">
          <div
            className={`kitButtonGroup ${
              block.layout === "double"
                ? "kitButtonGroup--fluid"
                : "kitButtonGroup--hug"
            }`}
          >
            {block.layout === "double" ? (
              <button
                className="kitButton kitButton--height48 kitButton--neutral-outline kitButton--default"
                type="button"
              >
                {block.secondaryLabel}
              </button>
            ) : null}
            <button
              className="kitButton kitButton--height48 kitButton--primary kitButton--default"
              type="button"
            >
              {block.primaryLabel}
            </button>
          </div>
        </div>
      );
    case "bottom-navigation":
      return (
        <BottomNavigation
          className="pageCanvasBlockFlush pageCanvasBottomNav"
          value={bottomKey}
          onChange={onBottomChange}
        />
      );
    default:
      return null;
  }
}

function buildRegularNavigationTrailing(
  trailing: "none" | "icon" | "text" | "button",
) {
  switch (trailing) {
    case "icon":
      return (
        <button type="button" aria-label="更多">
          <SystemIcon name="help" />
        </button>
      );
    case "text":
      return (
        <button type="button" className="regularNavigationActionText">
          管理
        </button>
      );
    case "button":
      return (
        <button type="button" className="regularNavigationActionButton">
          Post
        </button>
      );
    default:
      return undefined;
  }
}
