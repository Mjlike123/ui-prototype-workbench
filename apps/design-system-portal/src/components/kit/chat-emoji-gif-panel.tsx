"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import {
  ChatEmojiGifTabBar,
  DEFAULT_CHAT_EMOJI_GIF_TAB_ITEMS,
  type ChatEmojiGifTabItem,
} from "./chat-emoji-gif-tab-bar";
import type {
  ChatEmojiGifPanelCell,
  ChatEmojiGifPanelContent,
  ChatEmojiGifPanelSection,
} from "./chat-emoji-gif-panel-assets";
import { SystemIcon } from "./system-icon";

export type {
  ChatEmojiGifPanelCell,
  ChatEmojiGifPanelContent,
  ChatEmojiGifPanelSection,
};
export {
  CHAT_EMOJI_GIF_PANEL_ASSETS,
  demoChatEmojiGifPanelContentByTab,
  demoGifCells,
  demoImageCells,
} from "./chat-emoji-gif-panel-assets";

export function ChatEmojiGifPanel({
  tabs = DEFAULT_CHAT_EMOJI_GIF_TAB_ITEMS,
  value,
  onChange,
  content,
  onCellPress,
  onDelete,
  onVipAction,
  ariaLabel = "表情与 GIF 面板",
  className,
}: {
  tabs?: readonly ChatEmojiGifTabItem[];
  value: string;
  onChange: (key: string) => void;
  content: ChatEmojiGifPanelContent;
  onCellPress?: (cell: ChatEmojiGifPanelCell, tabKey: string) => void;
  onDelete?: () => void;
  onVipAction?: () => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <section
      className={["chatEmojiGifPanel", className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
      data-open="true"
      data-slot="chat-emoji-gif-panel"
    >
      <ChatEmojiGifTabBar
        className="chatEmojiGifPanelTabs"
        items={tabs}
        value={value}
        onChange={onChange}
      />
      <ChatEmojiGifPanelBody
        content={content}
        onCellPress={(cell) => onCellPress?.(cell, value)}
        onDelete={onDelete}
        onVipAction={onVipAction}
      />
    </section>
  );
}

function panelShowsDelete(content: ChatEmojiGifPanelContent) {
  if (content.variant === "unicode-grid" || content.variant === "emoji-sheet") {
    return Boolean(content.showDelete);
  }
  return false;
}

function ChatEmojiGifPanelBody({
  content,
  onCellPress,
  onDelete,
  onVipAction,
}: {
  content: ChatEmojiGifPanelContent;
  onCellPress?: (cell: ChatEmojiGifPanelCell) => void;
  onDelete?: () => void;
  onVipAction?: () => void;
}) {
  const showDelete = panelShowsDelete(content);

  return (
    <div
      className={[
        "chatEmojiGifPanelBody",
        showDelete ? "chatEmojiGifPanelBody--delete" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="tabpanel"
    >
      <div className="chatEmojiGifPanelScroll">
        <PanelScrollContent
          content={content}
          onCellPress={onCellPress}
          onVipAction={onVipAction}
        />
      </div>
      {showDelete ? <PanelDeleteButton onDelete={onDelete} /> : null}
    </div>
  );
}

function PanelScrollContent({
  content,
  onCellPress,
  onVipAction,
}: {
  content: ChatEmojiGifPanelContent;
  onCellPress?: (cell: ChatEmojiGifPanelCell) => void;
  onVipAction?: () => void;
}) {
  switch (content.variant) {
    case "unicode-grid":
      return (
        <UnicodeGridBody sections={content.sections} onCellPress={onCellPress} />
      );
    case "emoji-sheet":
      return (
        <EmojiSheetBody
          recentTitle={content.recentTitle}
          allTitle={content.allTitle}
          recentStripSrc={content.recentStripSrc}
          sheetSrc={content.sheetSrc}
        />
      );
    case "media-grid":
      return (
        <MediaGridBody cells={content.cells} onCellPress={onCellPress} />
      );
    case "vip-locked":
      return (
        <VipLockedBody
          title={content.title}
          actionLabel={content.actionLabel}
          backdropCells={content.backdropCells}
          onAction={onVipAction}
          onCellPress={onCellPress}
        />
      );
    case "empty":
      return <p className="chatEmojiGifPanelEmpty">{content.message}</p>;
    default:
      return null;
  }
}

function PanelDeleteButton({ onDelete }: { onDelete?: () => void }) {
  return (
    <button
      type="button"
      className="chatEmojiGifPanelDelete"
      aria-label="删除输入字符"
      onClick={onDelete}
    >
      <SystemIcon name="backspace" size={24} />
    </button>
  );
}

function UnicodeGridBody({
  sections,
  onCellPress,
}: {
  sections: ChatEmojiGifPanelSection[];
  onCellPress?: (cell: ChatEmojiGifPanelCell) => void;
}) {
  return (
    <div className="chatEmojiGifPanelUnicodeShell">
      {sections.map((section) => (
        <div className="chatEmojiGifPanelSection" key={section.title ?? "grid"}>
          {section.title ? (
            <p className="chatEmojiGifPanelSectionTitle">{section.title}</p>
          ) : null}
          <div className="chatEmojiGifPanelUnicodeGrid" role="group">
            {section.cells.map((cell) => (
              <PanelCellButton
                key={cell.id}
                cell={cell}
                className="chatEmojiGifPanelUnicodeCell"
                onPress={onCellPress}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmojiSheetBody({
  recentTitle,
  allTitle,
  recentStripSrc,
  sheetSrc,
}: {
  recentTitle?: string;
  allTitle?: string;
  recentStripSrc?: string;
  sheetSrc: string;
}) {
  return (
    <div className="chatEmojiGifPanelEmojiSheet">
      {recentStripSrc ? (
        <div className="chatEmojiGifPanelSection">
          {recentTitle ? (
            <p className="chatEmojiGifPanelSectionTitle">{recentTitle}</p>
          ) : null}
          <div className="chatEmojiGifPanelRecentStrip">
            <Image src={recentStripSrc} alt="" width={351} height={27} />
          </div>
        </div>
      ) : null}
      <div className="chatEmojiGifPanelSection">
        {allTitle ? (
          <p className="chatEmojiGifPanelSectionTitle">{allTitle}</p>
        ) : null}
        <div className="chatEmojiGifPanelSheetFrame">
          <Image src={sheetSrc} alt="" width={351} height={372} />
        </div>
      </div>
    </div>
  );
}

function MediaGridBody({
  cells,
  onCellPress,
}: {
  cells: ChatEmojiGifPanelCell[];
  onCellPress?: (cell: ChatEmojiGifPanelCell) => void;
}) {
  return (
    <div className="chatEmojiGifPanelMediaGrid" role="group" aria-label="表情列表">
      {cells.map((cell) => (
        <PanelCellButton
          key={cell.id}
          cell={cell}
          className="chatEmojiGifPanelMediaCell"
          onPress={onCellPress}
        />
      ))}
    </div>
  );
}

function VipLockedBody({
  title,
  actionLabel,
  backdropCells = [],
  onAction,
  onCellPress,
}: {
  title: string;
  actionLabel: string;
  backdropCells?: ChatEmojiGifPanelCell[];
  onAction?: () => void;
  onCellPress?: (cell: ChatEmojiGifPanelCell) => void;
}) {
  return (
    <div className="chatEmojiGifPanelVipLocked">
      <div className="chatEmojiGifPanelVipBackdrop" aria-hidden="true">
        <MediaGridBody cells={backdropCells} onCellPress={onCellPress} />
      </div>
      <div className="chatEmojiGifPanelVipOverlay">
        <p>{title}</p>
        <button
          type="button"
          className="kitButton kitButton--height40 kitButton--primary kitButton--default chatEmojiGifPanelVipAction"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function PanelCellButton({
  cell,
  className,
  onPress,
}: {
  cell: ChatEmojiGifPanelCell;
  className: string;
  onPress?: (cell: ChatEmojiGifPanelCell) => void;
}) {
  let content: ReactNode;
  if (cell.kind === "unicode") {
    content = <span className="chatEmojiGifPanelGlyph">{cell.value}</span>;
  } else if (cell.kind === "add") {
    content = (
      <span className="chatEmojiGifPanelAdd">
        <SystemIcon name="addCircle" size={24} />
      </span>
    );
  } else {
    content = (
      <>
        <Image src={cell.src} alt="" width={72} height={72} />
        {cell.disabled ? (
          <span className="chatEmojiGifPanelPending">处理中</span>
        ) : null}
      </>
    );
  }

  return (
    <button
      type="button"
      className={[
        className,
        cell.kind === "add" ? "chatEmojiGifPanelMediaCell--add" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={cell.label}
      disabled={cell.kind === "image" ? cell.disabled : false}
      onClick={() => onPress?.(cell)}
    >
      {content}
    </button>
  );
}
