export const STUDIO_PROJECT_IDS = [
  "feed-compose",
  "im-custom-emoji",
  "live-room",
  "spin-bottle",
  "voice-room-status",
  "moment-publish-detail",
  "search-flow",
  "message-conversation-pin",
  "offer-center-optimization",
  "report-reason-optimization",
  "topic-discovery",
  "character-impression-share",
  "recipe-community-redesign",
  "app-login-flow",
  "social-splash-seeded",
  "moment-liked-mention",
] as const;

export type StudioProjectId = (typeof STUDIO_PROJECT_IDS)[number];

export type StudioProject = {
  id: StudioProjectId;
  title: string;
  description: string;
  version?: string;
  coverSrc: string;
  kit: string[];
  prototypeModules: string[];
};

export const STUDIO_PROJECTS: StudioProject[] = [
  {
    id: "moment-publish-detail",
    title: "Moment 发布与动态详情",
    description: "发布入口、Core 发布器、失败草稿恢复与动态详情互动。",
    version: "v3.19.0",
    coverSrc: "/prototypes/studio/moment-publish-detail.png",
    kit: ["primary-navigation", "bottom-navigation", "regular-navigation"],
    prototypeModules: [
      "MomentFeedScene",
      "FeedComposePagePrototype",
      "FeedDetailPagePrototype",
    ],
  },
  {
    id: "search-flow",
    title: "TopTop 搜索流程",
    description: "搜索前推荐、输入联想、分类结果与相关搜索完整流程。",
    coverSrc: "/prototypes/studio/search-flow.png",
    kit: ["search-control", "regular-list", "secondary-tab-text"],
    prototypeModules: ["StudioSearchSuggestions", "StudioSearchResults"],
  },
  {
    id: "voice-room-status",
    title: "语音房在房状态",
    description: "客态主页、动态在房环、隐私设置与 iOS 纯文字半窗。",
    version: "v3.26.0",
    coverSrc: "/prototypes/studio/voice-room-status.png",
    kit: ["regular-navigation", "switch", "system-icon"],
    prototypeModules: ["VoiceRoomStatusPrototype"],
  },
  {
    id: "feed-compose",
    title: "发布动态探索",
    description: "文案、媒体选择、可见范围、圈子与发布反馈。",
    coverSrc: "/prototypes/studio/feed-compose.png",
    kit: ["regular-navigation", "regular-list", "system-icon"],
    prototypeModules: ["StudioFeedComposePage", "PrototypeFeedMediaPicker"],
  },
  {
    id: "im-custom-emoji",
    title: "IM 自定义表情",
    description: "私聊表情面板、图片表情上传、最近使用与发送反馈。",
    coverSrc: "/prototypes/studio/im-custom-emoji.png",
    kit: ["chat-bubble", "chat-input", "system-icon"],
    prototypeModules: ["StudioCustomEmojiPanel"],
  },
  {
    id: "live-room",
    title: "直播间与送礼",
    description: "视频房间、评论流、礼物面板、数量选择与发送反馈。",
    coverSrc: "/prototypes/studio/live-room.png",
    kit: ["avatar", "secondary-tab-pill", "system-icon"],
    prototypeModules: ["StudioLiveRoomPage", "StudioGiftPanel"],
  },
  {
    id: "spin-bottle",
    title: "转瓶子语音房",
    description: "多人麦位、转瓶匹配、真心话问答与公屏投票。",
    coverSrc: "/prototypes/studio/spin-bottle.png",
    kit: ["avatar", "ios-status-bar", "system-icon"],
    prototypeModules: ["StudioSpinBottlePage", "PrototypeSpinBottleGame"],
  },
  {
    id: "message-conversation-pin",
    title: "Message 会话置顶",
    description: "左滑置顶会话、置顶分区排序、快捷菜单与状态视觉。",
    coverSrc: "/prototypes/studio/message-conversation-pin.png",
    kit: [
      "primary-navigation",
      "search-control",
      "regular-list",
      "avatar",
      "bottom-navigation",
      "action-panel",
    ],
    prototypeModules: [
      "PrototypeConversationSwipeAction",
      "PrototypePinnedConversationState",
    ],
  },
  {
    id: "offer-center-optimization",
    title: "Offer Center 信息优化",
    description:
      "强化充值进度、下一档目标、奖励状态和充值反馈的月度 Offer 流程。",
    coverSrc: "/prototypes/studio/offer-center-optimization.png",
    kit: [
      "ios-status-bar",
      "regular-navigation",
      "secondary-tab-underline",
      "button",
      "toast",
      "center-dialog",
    ],
    prototypeModules: [
      "PrototypeOfferSummary",
      "PrototypeOfferMilestones",
      "PrototypeOfferRechargeSheet",
    ],
  },
  {
    id: "topic-discovery",
    title: "Mine 话题发现",
    description:
      "Mine 推荐流、话题搜索联想、话题详情、帖子操作与关注管理完整流程。",
    coverSrc: "/prototypes/studio/topic-discovery.png",
    kit: [
      "ios-status-bar",
      "search-control",
      "regular-navigation",
      "regular-list",
      "secondary-tab-text",
      "secondary-tab-underline",
      "bottom-navigation",
      "button",
      "toast",
      "center-dialog",
    ],
    prototypeModules: [
      "PrototypeTopicFeedCard",
      "PrototypeTopicSearch",
      "PrototypeTopicDetail",
      "PrototypeTopicPostMenu",
    ],
  },
  {
    id: "character-impression-share",
    title: "形象分享与形象码",
    description:
      "AI 生成形象、形象码导入、形象库状态、分享落地页与仅自己可见开关。",
    coverSrc: "/prototypes/studio/character-share-hero-3d.png",
    kit: [
      "ios-status-bar",
      "regular-navigation",
      "pill-secondary-tab",
      "button",
      "center-dialog",
      "action-panel",
      "avatar",
      "toast",
      "system-icon",
    ],
    prototypeModules: [
      "PrototypeCharacterGenerationForm",
      "PrototypeCharacterLibraryGrid",
      "PrototypeCharacterShareLanding",
    ],
  },
  {
    id: "recipe-community-redesign",
    title: "配方社区首页改版",
    description:
      "从三套 IA 探索收敛到影像驱动的相机工作台，覆盖收藏、槽位选择、覆盖确认、写入进度与 Duo 双栏。",
    coverSrc: "/prototypes/studio/topic-discovery.png",
    kit: [
      "ios-status-bar",
      "primary-navigation",
      "search-control",
      "pill-secondary-tab",
      "underline-secondary-tab",
      "text-secondary-tab",
      "regular-navigation",
      "regular-list",
      "button",
      "toast",
      "system-icon",
    ],
    prototypeModules: [
      "PrototypeRecipeQualityWorkbench",
      "PrototypeCameraSlotWriter",
      "PrototypeRecipeCommunityFujiStyleFeed",
      "PrototypeRecipeCommunityWorkbench",
      "PrototypeRecipeCommunityPostRecipeSplit",
      "PrototypeRecipeModuleComparison",
    ],
  },
  {
    id: "app-login-flow",
    title: "App 登录流程",
    description:
      "原创 Toppy 登录首页，覆盖 Apple、Google、手机号、TopTop ID、验证码与可恢复异常状态。",
    coverSrc: "/prototypes/studio/app-login-flow.png",
    kit: ["ios-status-bar", "button", "system-icon"],
    prototypeModules: [
      "PrototypeLoginHero",
      "PrototypeAuthProviderMark",
      "PrototypeAuthField",
      "PrototypeOtpInput",
      "PrototypeAuthSuccess",
    ],
  },
  {
    id: "moment-liked-mention",
    title: "动态结构 · 我赞过的 · @好友",
    description:
      "大区差异化动态卡片、Mine 赞过列表、发布/评论 @ 半窗与动态通知清理。",
    coverSrc: "/prototypes/studio/moment-liked-mention.png",
    kit: [
      "regular-navigation",
      "regular-list",
      "search-control",
      "center-dialog",
      "bottom-navigation",
    ],
    prototypeModules: [
      "PrototypeDestinationPage",
      "FeedComposePagePrototype",
      "FeedDetailPagePrototype",
      "MePagePrototype",
      "PrototypeMentionPickerSheet",
    ],
  },
  {
    id: "social-splash-seeded",
    title: "TopTop 社交应用启动页 · 三方向",
    description:
      "在 TopTop Token、图标与动效约束下，对比品牌核心、好友信号和双层字标三种启动页方向。",
    version: "3-direction exploration",
    coverSrc: "/prototypes/studio/social-splash-seeded.png",
    kit: ["ios-status-bar", "bottom-navigation", "pill-secondary-tab"],
    prototypeModules: [
      "PrototypeSplashBrandCore",
      "PrototypeSplashSocialPulse",
      "PrototypeSplashTypeGate",
    ],
  },
  {
    id: "report-reason-optimization",
    title: "用户举报原因优化",
    description:
      "统一新版 H5 举报原因、Other 条件输入、资料自动取证提示与可恢复提交反馈。",
    coverSrc: "/prototypes/studio/report-reason-optimization.png",
    kit: [
      "ios-status-bar",
      "regular-navigation",
      "selector-button",
      "button",
      "system-icon",
      "toast",
    ],
    prototypeModules: [
      "PrototypeReportReasonForm",
      "PrototypeReportEvidenceNotice",
      "PrototypeReportEvidenceUpload",
    ],
  },
];

export function isStudioProjectId(value: string): value is StudioProjectId {
  return STUDIO_PROJECT_IDS.includes(value as StudioProjectId);
}

export function getStudioProject(id: string) {
  return STUDIO_PROJECTS.find((project) => project.id === id);
}
