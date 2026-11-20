import Image from "next/image";
import { SystemIcon } from "./system-icon";

const messageStatusLabels = {
  default: "",
  stranger: "Stranger",
  failed: "发送失败",
  loading: "发送中",
  editing: "已编辑",
  gift: "[Gifts]",
} as const;

export type MessageStatus = keyof typeof messageStatusLabels;

export function getMessageStatusLabel(status: MessageStatus) {
  return messageStatusLabels[status];
}

export function MessageStrangerTag() {
  return <small>{messageStatusLabels.stranger}</small>;
}

export function MessageListStatus({ status }: { status: MessageStatus }) {
  if (status === "gift") return <em>{messageStatusLabels.gift}</em>;
  if (status === "default" || status === "stranger") return null;

  if (status === "failed") {
    return (
      <span className="regularListStatusIcon" role="img" aria-label={messageStatusLabels.failed}>
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
      role="img"
      aria-label={messageStatusLabels[status]}
    >
      <SystemIcon
        name={status === "loading" ? "loading" : "edit"}
        size={status === "loading" ? 16 : 18}
        className="regularListStatusSystemIcon"
      />
    </span>
  );
}
