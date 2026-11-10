import type { PageCanvasPlan } from "./page-canvas-parser";

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

/** 产品级页面意图 → 组件拼装（不依赖 LLM，可后续被模型输出同一 JSON  schema 替换） */
export function resolvePageCanvasTemplate(raw: string): PageCanvasPlan | null {
  const text = raw.trim().toLowerCase();
  if (!text) {
    return null;
  }

  if (
    includesAny(text, [
      "profile",
      "个人",
      "个人中心",
      "个人资料",
      "我的页",
      "我的主页",
      "用户主页",
      "me 页",
      "me页",
    ])
  ) {
    return {
      title: "个人资料",
      intent: "profile",
      initialState: { bottomNavIndex: 4, secondaryTabIndex: 0 },
      matched: [
        "意图模板 · 个人 Profile（Me 主页）",
        "regular-navigation · 昵称 + 分享/设置",
        "PrototypeProfileIdentity · 身份与统计（仅原型模块）",
        "button · 编辑资料 / 分享主页",
        "secondary-tab · 作品 / 相册 / 喜欢",
        "PrototypeProfileMediaGrid · Tab 宫格（仅原型模块）",
        "regular-list · 设置半层（微信式，不在内容 Tab）",
        "bottom-navigation · 默认 Me",
      ],
      warnings: [
        "身份与统计区不进入 Kit，仅作为 PrototypeProfileIdentity 支撑当前原型。",
        "内容宫格未进入 Kit，仅作为 PrototypeProfileMediaGrid 支撑当前原型。",
        "二维码/mini card 等入口未入库，当前仅在原型层表达。",
      ],
      blocks: [
        {
          kind: "regular-navigation",
          title: "小桃",
          leading: "none",
          trailing: "icon",
          componentId: "regular-navigation",
        },
        {
          kind: "secondary-tab",
          variant: "pill",
          labels: ["作品", "相册", "喜欢"],
          componentId: "secondary-tab",
        },
        {
          kind: "regular-list",
          rows: 5,
          mode: "action",
          componentId: "regular-list",
        },
        {
          kind: "bottom-navigation",
          componentId: "bottom-navigation",
        },
      ],
    };
  }

  if (
    includesAny(text, [
      "moment v3.19",
      "moment发布入口",
      "moment 发布入口",
      "纯文案圈子",
      "失败草稿恢复",
      "动态详情吸底互动",
      "moment-publish-detail",
    ])
  ) {
    return {
      title: "Moment 发布与动态详情优化",
      intent: "moment-publish-detail",
      matched: [
        "意图模板 · Moment v3.19.0（Studio）",
        "PrototypeDestinationPage · Feed 与发布 FAB",
        "regular-navigation · My Moment / New post",
        "FeedComposePagePrototype · Core 发布页面、媒体、可见范围与草稿",
        "Prototype community gap · 圈子选择、新圈子红点与后端校验增量",
        "FeedDetailPagePrototype · 吸顶作者与吸底互动",
        "SystemIcon · publish / messageFailed / like / comment / chat",
      ],
      warnings: [
        "本模板仅在原型创作（Studio）预览，不影响核心模块。",
        "圈子是否必须配图由提交后的服务端模拟判断，客户端不提前拦截。",
        "礼包入口去向、红点跨设备同步与埋点仍待产品确认。",
      ],
      blocks: [],
    };
  }

  if (
    includesAny(text, [
      "tiktok 式搜索",
      "tiktok搜索",
      "搜索优化",
      "搜索前推荐",
      "输入联想",
      "分类结果",
      "相关搜索",
      "search flow",
    ])
  ) {
    return {
      title: "全局搜索流程优化",
      intent: "search-flow",
      matched: [
        "SearchPagePrototype · Core 搜索前页面",
        "SearchControl · 输入、清除、提交与取消",
        "RegularListItem · 联想词、用户与房间结果",
        "TextSecondaryTab · Top / Moments / Users / Rooms / Games",
        "AvatarVisual + ListTag · 用户结果",
        "Prototype search gaps · Moment 卡片与相关搜索",
      ],
      warnings: [
        "借鉴 TikTok 的流程连续性与信息密度，不复制视频瀑布流和品牌视觉。",
        "联想、综合排序与相关搜索为 Studio 数据模拟，生产实现需接搜索服务。",
        "本模板仅在原型创作预览，不修改 Core 搜索页默认行为。",
      ],
      blocks: [],
    };
  }

  if (
    includesAny(text, [
      "发布动态",
      "发动态",
      "发帖",
      "new post",
      "feed compose",
      "compose post",
    ]) ||
    (includesAny(text, ["动态", "post"]) &&
      includesAny(text, ["图片", "照片", "拍照", "相册", "上传"]))
  ) {
    return {
      title: "发布动态",
      intent: "feed-compose",
      matched: [
        "意图模板 · Feed 发布动态（Figma 856:71329）",
        "IosStatusBar · 状态栏",
        "SystemIcon · close / emoji / hashtag / globe / add",
        "selector-button · Local 定位开关",
        "PrototypeFeedMediaPicker · 相册三级页（prototype）",
        "PrototypeFeedComposeEditor · 文案高亮话题 + 话题条 + 底栏 Dock",
      ],
      warnings: [
        "相册与相机为原型模拟，不代表原生权限与系统 picker 行为。",
        "Local 定位开关与话题选择器为占位交互。",
      ],
      blocks: [],
    };
  }

  if (
    includesAny(text, [
      "自定义表情",
      "custom emoji",
      "sticker",
      "贴纸",
      "im 表情",
      "im表情",
      "私聊表情",
      "表情面板",
    ]) ||
    (includesAny(text, ["im", "私聊", "聊天"]) &&
      includesAny(text, ["表情", "emoji", "贴纸", "sticker"]))
  ) {
    return {
      title: "IM 自定义表情",
      intent: "im-custom-emoji",
      matched: [
        "意图模板 · IM 自定义表情（Studio）",
        "regular-navigation · 私聊标题",
        "chat-input · 表情入口（Kit）",
        "StudioCustomEmojiPanel · Recent / Emoji / Custom（prototype）",
        "Studio 图片上传 · 添加图片表情",
      ],
      warnings: [
        "本模板仅在原型创作（Studio）预览，不影响核心模块私聊原型。",
        "上传为浏览器本地模拟，规格提示参考 Discord/Telegram 128×128。",
      ],
      blocks: [],
    };
  }

  if (
    includesAny(text, [
      "转瓶",
      "转瓶子",
      "spin the bottle",
      "spin bottle",
      "spin-bottle",
      "bottle game",
      "kiss kiss",
      "真心话",
      "破冰",
      "麦位游戏",
    ]) ||
    (includesAny(text, ["语音房", "voice room", "room"]) &&
      includesAny(text, ["转瓶", "bottle", "kiss", "真心话", "破冰"]))
  ) {
    return {
      title: "转瓶语音房",
      intent: "spin-bottle",
      matched: [
        "意图模板 · 转瓶破冰（Studio）",
        "IosStatusBar · 语音房状态栏",
        "PrototypeMicSeatCell · 8–12 麦霓虹圆环（可选席位数）",
        "PrototypeMicSeatPair · 圆环 CP 弧线（Kiss 配对）",
        "PrototypeSpinBottle · 转瓶动画与落点",
        "kitButton · Kiss / Pass 确认",
        "AvatarVisual · 52pt 麦位头像（48pt Kit + 容器）",
        "SystemIcon · 底栏 / 闭麦 / 礼物",
      ],
      warnings: [
        "围桌默认 10 麦，可在舞台区切换 8–12 麦；男女专属位交替落座。",
        "冷启动仅开放 2–3 个官方固定房，AI 机器人补位与三类引导任务为占位。",
        "真心话题库 Lv.1–3 各 ≥50 题，合规审核后下发，不支持用户出题。",
        "公屏投票赞率 >60% 仅考核男性留座，女性全程免疫请出。",
        "本模板仅在原型创作（Studio）预览，未进入核心模块目录。",
      ],
      blocks: [],
    };
  }

  if (
    includesAny(text, [
      "在房状态",
      "语音房在房状态",
      "voice room status",
      "room status visibility",
      "voice room visibility",
      "非好友可见",
      "v3.26.0",
    ])
  ) {
    return {
      title: "语音房在房状态",
      intent: "voice-room-status",
      matched: [
        "意图模板 · 语音房在房状态 v3.26.0（Studio）",
        "ProfileV3RoomFollow · 客态在房胶囊进房",
        "PrototypeFeedAvatarInRoom · 动态在房环",
        "meSecondarySettingsGroup · 隐私设置行",
        "VoiceRoomVisibilitySheet · iOS 纯文字半窗",
        "Switch · 隐身于房间",
        "SystemIcon · voiceStatus / chevronRight",
      ],
      warnings: [
        "本模板仅在原型创作（Studio）预览，未进入核心模块目录。",
        "可见范围默认值由大区策略决定（后端），原型使用 sessionStorage 模拟。",
        "动态点头像 vs 点在房标记的分工待产品确认。",
      ],
      blocks: [],
    };
  }

  if (
    includesAny(text, [
      "直播",
      "直播间",
      "live room",
      "live stream",
      "liveroom",
      "voice room",
      "送礼",
      "礼物面板",
      "gift panel",
    ]) ||
    (includesAny(text, ["live", "stream"]) &&
      includesAny(text, ["gift", "礼物", "送礼"]))
  ) {
    return {
      title: "直播间",
      intent: "live-room",
      matched: [
        "意图模板 · 直播间 + 送礼面板（Studio）",
        "IosStatusBar · 浅色状态栏",
        "AvatarVisual · 主播头像",
        "SystemIcon · 关闭 / 礼物 / 点赞 / 评论",
        "PillSecondaryTab · 礼物分类",
        "kitButton · 送礼主按钮（color.gift.giving）",
        "PrototypeLiveRoomChat · 评论与送礼消息（prototype）",
      ],
      warnings: [
        "视频流为静态封面模拟，非真实播放器。",
        "礼物动效、连击 SVGA、充值与背包同步为占位交互。",
        "本模板仅在原型创作（Studio）预览，未进入核心模块目录。",
      ],
      blocks: [],
    };
  }

  if (
    includesAny(text, ["设置页", "settings", "账号与安全", "偏好设置"]) &&
    !includesAny(text, ["profile", "个人资料", "个人中心"]) &&
    !/标题[「『"']/.test(raw) &&
    !/\d+\s*[行条个]/.test(raw) &&
    !includesAny(text, ["返回 +", "搜索框", "双按钮"])
  ) {
    return {
      title: "设置",
      intent: "settings",
      initialState: { bottomNavIndex: 4 },
      matched: [
        "意图模板 · 设置",
        "二级页导航 regular-navigation · 返回",
        "列表 regular-list · 设置项",
        "主按钮 button · 保存",
      ],
      warnings: [],
      blocks: [
        {
          kind: "regular-navigation",
          title: "设置",
          leading: "back",
          trailing: "none",
          componentId: "regular-navigation",
        },
        {
          kind: "regular-list",
          rows: 5,
          mode: "action",
          componentId: "regular-list",
        },
        {
          kind: "button-bar",
          layout: "single",
          primaryLabel: "保存",
          secondaryLabel: "取消",
          componentId: "button",
        },
      ],
    };
  }

  return null;
}
