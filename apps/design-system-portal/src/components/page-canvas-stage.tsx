"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import type { PageCanvasBlock, PageCanvasPlan } from "@/lib/page-canvas-parser";
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

export function PageCanvasStage({
  plan,
  width,
  height,
  referenceOverlay,
}: PageCanvasStageProps) {
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [secondaryIndex, setSecondaryIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [searchActive, setSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activeRow, setActiveRow] = useState<number | null>(null);

  useEffect(() => {
    // This reset synchronizes interactive preview state with a newly selected plan.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrimaryIndex(plan.initialState?.primaryNavIndex ?? 0);
    setSecondaryIndex(plan.initialState?.secondaryTabIndex ?? 0);
    setBottomIndex(plan.initialState?.bottomNavIndex ?? 0);
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
      <div className="pageCanvasStatusBar" aria-hidden="true">
        <span>9:41</span>
        <span className="pageCanvasStatusIcons" />
      </div>
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
            primaryIndex={primaryIndex}
            onPrimaryChange={setPrimaryIndex}
            secondaryIndex={secondaryIndex}
            onSecondaryChange={setSecondaryIndex}
            bottomIndex={bottomIndex}
            onBottomChange={setBottomIndex}
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
  primaryIndex,
  onPrimaryChange,
  secondaryIndex,
  onSecondaryChange,
  bottomIndex,
  onBottomChange,
  searchActive,
  searchValue,
  onSearchActive,
  onSearchValue,
  activeRow,
  onActiveRow,
}: {
  block: PageCanvasBlock;
  primaryIndex: number;
  onPrimaryChange: (index: number) => void;
  secondaryIndex: number;
  onSecondaryChange: (index: number) => void;
  bottomIndex: number;
  onBottomChange: (index: number) => void;
  searchActive: boolean;
  searchValue: string;
  onSearchActive: (active: boolean) => void;
  onSearchValue: (value: string) => void;
  activeRow: number | null;
  onActiveRow: (row: number | null) => void;
}) {
  switch (block.kind) {
    case "primary-navigation":
      return (
        <CanvasPrimaryNavigation
          tabCount={block.tabCount}
          selectedIndex={primaryIndex}
          onChange={onPrimaryChange}
        />
      );
    case "regular-navigation":
      return (
        <CanvasRegularNavigation
          title={block.title}
          leading={block.leading}
          trailing={block.trailing}
        />
      );
    case "secondary-tab":
      return (
        <CanvasSecondaryTab
          variant={block.variant}
          labels={block.labels}
          selectedIndex={secondaryIndex}
          onChange={onSecondaryChange}
        />
      );
    case "search-control":
      return (
        <CanvasSearchControl
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
      );
    case "regular-list":
      return (
        <CanvasRegularList
          rows={block.rows}
          mode={block.mode}
          activeRow={activeRow}
          onActiveRow={onActiveRow}
        />
      );
    case "button-bar":
      return (
        <CanvasButtonBar
          layout={block.layout}
          primaryLabel={block.primaryLabel}
          secondaryLabel={block.secondaryLabel}
        />
      );
    case "bottom-navigation":
      return (
        <CanvasBottomNavigation
          selectedIndex={bottomIndex}
          onChange={onBottomChange}
        />
      );
    default:
      return null;
  }
}

function CanvasPrimaryNavigation({
  tabCount,
  selectedIndex,
  onChange,
}: {
  tabCount: number;
  selectedIndex: number;
  onChange: (index: number) => void;
}) {
  const labels = ["Mine", "Popular", "Country", "Following", "Nearby"].slice(
    0,
    tabCount,
  );

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") {
      nextIndex = Math.min(labels.length - 1, index + 1);
    } else if (event.key === "ArrowLeft") {
      nextIndex = Math.max(0, index - 1);
    }
    if (nextIndex === undefined) {
      return;
    }
    event.preventDefault();
    onChange(nextIndex);
  };

  return (
    <div className="primaryNavigation pageCanvasBlockFlush">
      <div className="primaryNavigationItems" role="tablist" aria-label="一级导航">
        {labels.map((label, index) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={selectedIndex === index}
            tabIndex={selectedIndex === index ? 0 : -1}
            className={selectedIndex === index ? "selected" : ""}
            onClick={() => onChange(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="primaryNavigationActions" aria-label="导航操作">
        <button type="button" aria-label="搜索">
          <PrimaryNavigationSearchIcon />
        </button>
      </div>
    </div>
  );
}

function CanvasRegularNavigation({
  title,
  leading,
  trailing,
}: {
  title: string;
  leading: "none" | "back" | "close";
  trailing: "none" | "icon" | "text" | "button";
}) {
  return (
    <nav
      className={`regularNavigation regularNavigation--leading-${leading} regularNavigation--trailing-${trailing} pageCanvasBlockFlush`}
      aria-label="二级页面导航"
    >
      <div className="regularNavigationLeading">
        {leading === "back" && (
          <button type="button" aria-label="返回">
            <CanvasNavIcon name="back" />
          </button>
        )}
        {leading === "close" && (
          <button type="button" aria-label="关闭">
            <CanvasNavIcon name="close" />
          </button>
        )}
      </div>
      <div className="regularNavigationTitle">
        <h2 className="regularNavigationTitleText">{title}</h2>
      </div>
      <div className="regularNavigationTrailing">
        {trailing === "icon" && (
          <button type="button" aria-label="更多">
            <CanvasNavIcon name="more" />
          </button>
        )}
        {trailing === "text" && (
          <button type="button" className="regularNavigationActionText">
            管理
          </button>
        )}
        {trailing === "button" && (
          <button type="button" className="regularNavigationActionButton">
            Post
          </button>
        )}
      </div>
    </nav>
  );
}

function CanvasNavIcon({ name }: { name: "back" | "close" | "more" }) {
  const iconName =
    name === "back"
      ? "左箭头1"
      : name === "close"
        ? "关闭"
        : "更多-横向";
  return (
    <Image
      src={`/icons/svg/icon=${iconName}.svg`}
      alt=""
      width={24}
      height={24}
      aria-hidden="true"
    />
  );
}

function CanvasSecondaryTab({
  variant,
  labels,
  selectedIndex,
  onChange,
}: {
  variant: "pill" | "underline";
  labels: [string, string, string?];
  selectedIndex: number;
  onChange: (index: number) => void;
}) {
  const items = labels.filter(Boolean) as string[];
  if (variant === "underline") {
    return (
      <div
        className="secondaryTabUnderline pageCanvasBlockFlush"
        role="tablist"
        aria-label="二级 Tab"
      >
        {items.slice(0, 2).map((label, index) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={selectedIndex === index}
            className={selectedIndex === index ? "selected" : ""}
            onClick={() => onChange(index)}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className="secondaryTabPill secondaryTabPillHeight28 pageCanvasBlockFlush"
      role="tablist"
      aria-label="二级 Tab"
    >
      {items.map((label, index) => (
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

function CanvasSearchControl({
  placeholder,
  active,
  value,
  onActivate,
  onChange,
  onCancel,
}: {
  placeholder: string;
  active: boolean;
  value: string;
  onActivate: () => void;
  onChange: (value: string) => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active) {
      inputRef.current?.focus();
    }
  }, [active]);

  return (
    <form
      className="searchControl pageCanvasBlockFlush"
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      {active ? (
        <>
          <div className="searchControlField">
            <span className="searchControlIcon" aria-hidden="true">
              <Image
                src="/icons/search-control/search.svg"
                alt=""
                width={21}
                height={21}
              />
            </span>
            <input
              ref={inputRef}
              type="search"
              aria-label="搜索关键词"
              value={value}
              placeholder={placeholder}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  onCancel();
                }
              }}
            />
          </div>
          <button className="searchControlCancel" type="button" onClick={onCancel}>
            Cancel
          </button>
        </>
      ) : (
        <button
          className="searchControlField searchControlTrigger"
          type="button"
          aria-label={`打开搜索：${placeholder}`}
          onClick={onActivate}
        >
          <span className="searchControlIcon" aria-hidden="true">
            <Image
              src="/icons/search-control/search.svg"
              alt=""
              width={21}
              height={21}
            />
          </span>
          <span>{placeholder}</span>
        </button>
      )}
    </form>
  );
}

function CanvasRegularList({
  rows,
  mode,
  activeRow,
  onActiveRow,
}: {
  rows: number;
  mode: "action" | "message";
  activeRow: number | null;
  onActiveRow: (row: number | null) => void;
}) {
  return (
    <div className="pageCanvasList" role="list">
      {Array.from({ length: rows }, (_, index) => {
        const title =
          mode === "message"
            ? `会话 ${index + 1}`
            : `操作项 ${index + 1}`;
        const pressed = activeRow === index;
        return (
          <div
            key={title}
            className={`regularListItem ${
              mode === "message"
                ? "regularListItem--message"
                : "regularListItem--action"
            }${pressed ? " pageCanvasListItemActive" : ""}`}
            role="listitem"
          >
            <button
              className="regularListMain"
              type="button"
              aria-pressed={pressed}
              onClick={() => onActiveRow(pressed ? null : index)}
            >
              {mode === "message" ? (
                <Image
                  className="regularListAvatar"
                  src="/icons/list/message-avatar.png"
                  alt=""
                  width={48}
                  height={48}
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
              )}
              <span className="regularListContent">
                <span className="regularListTitleRow">
                  <strong>{title}</strong>
                </span>
                <span className="regularListSubtitle">
                  {mode === "message" ? "最近一条消息预览" : "辅助说明文案"}
                </span>
              </span>
            </button>
            {mode === "action" ? (
              <span className="regularListMutedChevron" aria-hidden="true" />
            ) : (
              <span className="regularListMessageMeta">
                <small>06-2{index}</small>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CanvasButtonBar({
  layout,
  primaryLabel,
  secondaryLabel,
}: {
  layout: "single" | "double";
  primaryLabel: string;
  secondaryLabel: string;
}) {
  return (
    <div className="pageCanvasButtonBar">
      <div
        className={`kitButtonGroup ${
          layout === "double" ? "kitButtonGroup--fluid" : "kitButtonGroup--hug"
        }`}
      >
        {layout === "double" && (
          <button
            className="kitButton kitButton--height48 kitButton--neutral-outline kitButton--default"
            type="button"
          >
            {secondaryLabel}
          </button>
        )}
        <button
          className="kitButton kitButton--height48 kitButton--primary kitButton--default"
          type="button"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}

function CanvasBottomNavigation({
  selectedIndex,
  onChange,
}: {
  selectedIndex: number;
  onChange: (index: number) => void;
}) {
  const items = [
    { key: "toptop", label: "TopTop" },
    { key: "room", label: "Room" },
    { key: "feed", label: "Feed" },
    { key: "message", label: "Message" },
    { key: "me", label: "Me" },
  ];

  return (
    <nav
      className="bottomNavigation bottomNavigationLight pageCanvasBlockFlush pageCanvasBottomNav"
      aria-label="App 一级目的地"
    >
      <div className="bottomNavigationItems">
        {items.map((item, index) => (
          <button
            className={`bottomNavigationItem${
              selectedIndex === index ? " selected" : ""
            }`}
            key={item.key}
            type="button"
            aria-current={selectedIndex === index ? "page" : undefined}
            onClick={() => onChange(index)}
          >
            <span
              className={`bottomNavigationGlyph bottomNavigationGlyph-${item.key}`}
              aria-hidden="true"
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
