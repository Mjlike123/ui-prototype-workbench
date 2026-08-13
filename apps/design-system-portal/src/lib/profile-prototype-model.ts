import { parsePageCanvasPrompt } from "./page-canvas-parser";
import { buildDesignMvpManifest } from "./design-mvp-bundle";

/** 内容 Tab：对齐 TikTok 作品/喜欢 + 相册，而非把「设置」塞进 Tab */
export type ProfileSecondaryTabKey = "works" | "album" | "liked";

export type ProfileListItem = {
  id: string;
  title: string;
  subtitle?: string;
  trailing?: "chevron";
  hrefLabel: string;
};

export type ProfileMediaCell = {
  id: string;
  badge?: string;
  tone?: "brand" | "neutral" | "violet";
};

export const PROFILE_PROTOTYPE_PROMPT = "我想要一个个人 profile 页面";

export const PROFILE_VIEWPORT = { width: 375, height: 812 } as const;

export const PROFILE_PENDING_COMPONENTS = [] as const;

export const PROFILE_COMPONENT_MAPPING = {
  intent: "profile",
  layers: [
    {
      componentId: "ios-status-bar",
      role: "固定 iOS 时间状态栏",
    },
    {
      componentId: "secondary-tab-underline",
      role: "About me / Movement(6) 双等分吸顶 Tab",
    },
    { componentId: "avatar", role: "个人头像、Supporters 与动态作者头像" },
    { componentId: "list-tag", role: "动态中的性别年龄与会员等级" },
    { componentId: "icon", role: "返回、更多、发布、点赞、评论与右箭头" },
  ],
  kitGaps: [
    "ProfileV3Navigation：双行标题、座驾与更多操作的组合暂未进入 Kit",
  ],
  prototypeModules: [
    {
      id: "ProfileV3Identity",
      role: "背景、语音房跟随状态、基础资料与权益展示",
    },
    {
      id: "PrototypeRoomEntry",
      source: "prototype",
      role: "头像右侧的实时语音房入口，点击整体直接进入当前语音房",
      kitCandidate: true,
      evidence: "Profile 当前语音房入口场景验证后评估是否沉淀",
    },
    {
      id: "ProfileV3About",
      role: "Relationship、Supporters、Exhibition 与 Chat Rooms",
    },
    {
      id: "ProfileV3Movement",
      role: "个人动态列表与发布入口",
    },
  ],
  pendingReview: [] as string[],
} as const;

export const PROFILE_USER = {
  displayName: "小桃",
  handle: "8829103",
  bio: "语音房常驻 · 周末开黑搭子 · 曼谷",
  stats: {
    following: "286",
    followers: "1.2万",
    likes: "9.8万",
    roomHours: "128h",
  },
} as const;

export const PROFILE_SECONDARY_TABS: {
  key: ProfileSecondaryTabKey;
  label: string;
}[] = [
  { key: "works", label: "作品" },
  { key: "album", label: "相册" },
  { key: "liked", label: "喜欢" },
];

export const PROFILE_STATS = [
  { key: "following", label: "关注", value: PROFILE_USER.stats.following },
  { key: "followers", label: "粉丝", value: PROFILE_USER.stats.followers },
  { key: "likes", label: "获赞", value: PROFILE_USER.stats.likes },
  { key: "roomHours", label: "连麦", value: PROFILE_USER.stats.roomHours },
];

export const PROFILE_WORKS_GRID: ProfileMediaCell[] = [
  { id: "work-1", badge: "1.2万", tone: "brand" },
  { id: "work-2", badge: "860", tone: "neutral" },
  { id: "work-3", badge: "2.4万", tone: "violet" },
  { id: "work-4", badge: "320", tone: "neutral" },
  { id: "work-5", badge: "5.6万", tone: "brand" },
  { id: "work-6", badge: "108", tone: "neutral" },
];

export const PROFILE_ALBUM_GRID: ProfileMediaCell[] = Array.from(
  { length: 9 },
  (_, index) => ({
    id: `album-${index + 1}`,
    tone: (index % 3 === 0 ? "brand" : "neutral") as ProfileMediaCell["tone"],
  }),
);

export const PROFILE_SETTINGS_LIST: ProfileListItem[] = [
  {
    id: "account-security",
    title: "账号与安全",
    subtitle: "+66 ·••• 8821 · 登录保护已开启",
    trailing: "chevron",
    hrefLabel: "账号与安全",
  },
  {
    id: "privacy",
    title: "隐私设置",
    subtitle: "谁可以私信我、查看作品与 Room 状态",
    trailing: "chevron",
    hrefLabel: "隐私设置",
  },
  {
    id: "notifications",
    title: "通知",
    subtitle: "Room 邀请、新粉丝、系统公告",
    trailing: "chevron",
    hrefLabel: "通知",
  },
  {
    id: "blocklist",
    title: "黑名单",
    subtitle: "3 位用户",
    trailing: "chevron",
    hrefLabel: "黑名单",
  },
  {
    id: "help",
    title: "帮助与反馈",
    subtitle: "FAQ · 工单 #9281 处理中",
    trailing: "chevron",
    hrefLabel: "帮助与反馈",
  },
];

export const BOTTOM_NAV_DESTINATIONS = [
  { key: "toptop", label: "TopTop" },
  { key: "room", label: "Room" },
  { key: "feed", label: "Feed" },
  { key: "message", label: "Message" },
  { key: "me", label: "Me" },
] as const;

export type BottomNavKey = (typeof BOTTOM_NAV_DESTINATIONS)[number]["key"];

export function statListLabel(key: string) {
  const labels: Record<string, string> = {
    following: "关注列表",
    followers: "粉丝列表",
    likes: "获赞明细",
    roomHours: "连麦记录",
  };
  return labels[key] ?? key;
}

export function buildProfilePrototypeManifest() {
  const plan = parsePageCanvasPrompt("我想要一个个人 profile 页面");
  return {
    ...buildDesignMvpManifest({
      prompt: PROFILE_PROTOTYPE_PROMPT,
      plan,
      viewportWidth: PROFILE_VIEWPORT.width,
      viewportHeight: PROFILE_VIEWPORT.height,
    }),
    componentMapping: PROFILE_COMPONENT_MAPPING,
    pendingComponents: PROFILE_PENDING_COMPONENTS,
    implementation:
      "apps/design-system-portal/src/components/prototypes/profile-page-prototype.tsx",
    route: "/prototypes/profile",
  };
}

export function destinationLabel(key: BottomNavKey) {
  return BOTTOM_NAV_DESTINATIONS.find((item) => item.key === key)?.label ?? key;
}
