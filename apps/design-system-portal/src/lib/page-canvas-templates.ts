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
        "意图模板 · Feed 发布动态（Hybrid）",
        "regular-navigation · 返回 + Post",
        "AvatarVisual · 作者头像",
        "PrototypeFeedMediaPicker · 相册 / 拍照（prototype）",
        "PrototypeFeedComposeEditor · 文案与话题（prototype）",
      ],
      warnings: [
        "相册与相机为原型模拟，不代表原生权限与系统 picker 行为。",
        "可见范围切换为占位交互，完整受众选择页尚未入库。",
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
