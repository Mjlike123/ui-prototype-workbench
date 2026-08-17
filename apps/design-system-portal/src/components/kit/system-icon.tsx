import { InlineSvgIcon } from "./inline-svg-icon";
import { SYSTEM_ICON_SVGS } from "./generated/system-icon-svgs";

export const SYSTEM_ICON_ASSETS = {
  notification: "/icons/svg/icon=通知.svg",
  like: "/icons/svg/icon=点赞.svg",
  comment: "/icons/svg/icon=消息.svg",
  chat: "/icons/svg/icon=聊天.svg",
  follow: "/icons/svg/icon=关注.svg",
  publish: "/icons/svg/icon=发布.svg",
  more: "/icons/svg/icon=更多动态.svg",
  loading: "/icons/svg/icon=loading.svg",
  edit: "/icons/svg/icon=编辑.svg",
  followed: "/icons/svg/icon=已关注.svg",
  newMessage: "/icons/svg/icon=消息页新增.svg",
  voiceStatus: "/icons/svg/icon=语音状态.svg",
  contacts: "/icons/svg/icon=通讯录.svg",
  back: "/icons/svg/icon=左箭头1.svg",
  chevronRight: "/icons/svg/icon=右箭头1.svg",
  guidelines: "/icons/svg/icon=规则.svg",
  help: "/icons/svg/icon=更多-横向.svg",
  settings: "/icons/svg/icon=设置.svg",
  search: "/icons/svg/icon=搜索.svg",
  voice: "/icons/svg/icon=语音.svg",
  addCircle: "/icons/svg/icon=圆圈加号.svg",
  microphone: "/icons/svg/icon=麦克风.svg",
  photo: "/icons/svg/icon=照片.svg",
  emoji: "/icons/svg/icon=表情.svg",
  game: "/icons/svg/icon=游戏.svg",
  gift: "/icons/svg/icon=礼物.svg",
  send: "/icons/svg/icon=发送.svg",
  keyboard: "/icons/svg/icon=键盘.svg",
  close: "/icons/svg/icon=关闭.svg",
  reply: "/icons/svg/icon=回复.svg",
  link: "/icons/svg/icon=链接.svg",
  messageFailed: "/icons/svg/icon=发送失败.svg",
} as const;

export type SystemIconName = keyof typeof SYSTEM_ICON_ASSETS;

export function SystemIcon({
  name,
  size = 24,
  className,
}: {
  name: SystemIconName;
  size?: number;
  className?: string;
}) {
  return (
    <InlineSvgIcon
      className={["systemIcon", className].filter(Boolean).join(" ")}
      markup={SYSTEM_ICON_SVGS[name]}
      size={size}
      data-system-icon={name}
      data-system-icon-asset={SYSTEM_ICON_ASSETS[name]}
    />
  );
}
