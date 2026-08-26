export type PageCanvasIntent =
  | "profile"
  | "feed-compose"
  | "im-custom-emoji"
  | "settings"
  | "home-feed"
  | "search"
  | "custom";

export type PageCanvasInitialState = {
  primaryNavIndex?: number;
  secondaryTabIndex?: number;
  bottomNavIndex?: number;
};

export type PageCanvasBlock =
  | {
      kind: "primary-navigation";
      tabCount: number;
      componentId: "primary-navigation";
    }
  | {
      kind: "regular-navigation";
      title: string;
      leading: "none" | "back" | "close";
      trailing: "none" | "icon" | "text" | "button";
      componentId: "regular-navigation";
    }
  | {
      kind: "secondary-tab";
      variant: "pill" | "underline";
      labels: [string, string, string?];
      componentId: "secondary-tab" | "secondary-tab-underline";
    }
  | {
      kind: "search-control";
      placeholder: string;
      componentId: "search-control";
    }
  | {
      kind: "regular-list";
      rows: number;
      mode: "action" | "message";
      componentId: "regular-list";
    }
  | {
      kind: "button-bar";
      layout: "single" | "double";
      primaryLabel: string;
      secondaryLabel: string;
      componentId: "button";
    }
  | {
      kind: "bottom-navigation";
      componentId: "bottom-navigation";
    };

export type PageCanvasPlan = {
  title: string;
  intent: PageCanvasIntent;
  blocks: PageCanvasBlock[];
  matched: string[];
  warnings: string[];
  initialState?: PageCanvasInitialState;
};

const EXAMPLE_PROMPTS = [
  "我想要一个个人 profile 页面",
  "发布动态：文案编辑、相册选图或拍照上传、可见范围与 Post",
  "IM 私聊自定义表情：Recent / Emoji / Custom，点击添加图片表情",
  "首页：一级导航 Mine / Popular，底部 Tab，中间是消息列表",
  "设置页：返回 + 标题「账号与安全」，操作列表 5 行，底部主按钮「保存」",
  "搜索页：返回 + 搜索框，下方好友列表，列表项带箭头",
  "半窗：双按钮 取消 + 确定，上方操作列表 3 项",
] as const;

export function getPageCanvasExamples() {
  return EXAMPLE_PROMPTS;
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function extractQuoted(text: string) {
  const patterns = [
    /[「『"']([^」』"']+)[」』"']/,
    /标题[为是叫]\s*([^\s，。；;]+)/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

function extractButtonLabels(text: string) {
  const primary =
    text.match(/主按钮[「『"']([^」』"']+)[」』"']/)?.[1] ??
    text.match(/(?:确认|提交|保存|完成|发布)(?:按钮)?[「『"']([^」』"']+)[」』"']/)?.[1] ??
    (text.includes("确定") ? "确定" : undefined) ??
    (text.includes("保存") ? "保存" : undefined) ??
    (text.includes("提交") ? "提交" : undefined) ??
    (text.includes("确认") ? "确认" : undefined);

  const secondary =
    text.match(/(?:取消|辅助)[「『"']([^」』"']+)[」』"']/)?.[1] ??
    (text.includes("取消") ? "取消" : "取消");

  return { primary: primary ?? "确认", secondary };
}

import { resolvePageCanvasTemplate } from "./page-canvas-templates";

export function parsePageCanvasPrompt(raw: string): PageCanvasPlan {
  const template = resolvePageCanvasTemplate(raw);
  if (template) {
    return template;
  }

  const text = raw.trim().toLowerCase();
  const matched: string[] = [];
  const warnings: string[] = [];
  const blocks: PageCanvasBlock[] = [];

  if (!text) {
    return {
      title: "空白画布",
      intent: "custom",
      blocks: [],
      matched: [],
      warnings: ["输入页面描述后点击「生成画布」。"],
    };
  }

  const title =
    extractQuoted(raw) ??
    (includesAny(text, ["设置", "账号", "安全"])
      ? "账号与安全"
      : includesAny(text, ["搜索", "search"])
        ? "搜索"
        : includesAny(text, ["消息", "聊天"])
          ? "消息"
          : includesAny(text, ["首页", "home"])
            ? "TopTop"
            : "业务页面");

  const wantsHome = includesAny(text, [
    "首页",
    "home",
    "一级导航",
    "主 tab",
    "顶栏",
    "top tab",
  ]);
  const wantsBack = includesAny(text, [
    "返回",
    "内页",
    "二级",
    "详情",
    "设置页",
    "back",
  ]);
  const wantsClose = includesAny(text, ["关闭", "close"]);
  const wantsSearch = includesAny(text, ["搜索", "search", "筛选", "查找"]);
  const wantsList = includesAny(text, [
    "列表",
    "list",
    "消息",
    "好友",
    "设置项",
    "操作项",
    "行",
  ]);
  const wantsSecondaryTab = includesAny(text, [
    "二级 tab",
    "分段",
    "标签页",
    "pill",
    "下划线 tab",
  ]);
  const wantsBottomNav = includesAny(text, [
    "底部导航",
    "底部 tab",
    "底 tab",
    "底栏",
    "bottom",
    "一级目的地",
  ]);
  const wantsButton = includesAny(text, [
    "按钮",
    "确认",
    "提交",
    "保存",
    "cta",
    "主操作",
  ]);
  const doubleButton =
    includesAny(text, ["双按钮", "取消", "半窗"]) ||
    /取消.*确定|确定.*取消/.test(raw);

  if (wantsHome) {
    blocks.push({
      kind: "primary-navigation",
      tabCount: includesAny(text, ["5", "五个", "五栏"]) ? 5 : 3,
      componentId: "primary-navigation",
    });
    matched.push("一级导航 primary-navigation");
  }

  if (wantsBack || wantsClose || (!wantsHome && title !== "TopTop")) {
    blocks.push({
      kind: "regular-navigation",
      title,
      leading: wantsClose ? "close" : wantsBack || !wantsHome ? "back" : "none",
      trailing: includesAny(text, ["更多", "icon", "图标"])
        ? "icon"
        : includesAny(text, ["文字操作", "文案操作"])
          ? "text"
          : includesAny(text, ["post", "发布按钮"])
            ? "button"
            : "none",
      componentId: "regular-navigation",
    });
    matched.push("二级页导航 regular-navigation");
  }

  if (wantsSecondaryTab) {
    const underline = includesAny(text, ["下划线", "underline"]);
    blocks.push({
      kind: "secondary-tab",
      variant: underline ? "underline" : "pill",
      labels: underline
        ? ["About me", "Movement"]
        : ["推荐", "关注", "附近"],
      componentId: underline ? "secondary-tab-underline" : "secondary-tab",
    });
    matched.push(
      underline ? "下划线 Tab secondary-tab-underline" : "胶囊 Tab secondary-tab",
    );
  }

  if (wantsSearch) {
    blocks.push({
      kind: "search-control",
      placeholder: includesAny(text, ["userid", "id"])
        ? "Search by Name / Userid"
        : includesAny(text, ["好友"])
          ? "搜索好友"
          : "Search by Name / Userid",
      componentId: "search-control",
    });
    matched.push("搜索 search-control");
  }

  if (wantsList || blocks.some((b) => b.kind === "search-control")) {
    const rowMatch = raw.match(/(\d+)\s*[行条个]/);
    const rows = rowMatch ? Math.min(8, Math.max(2, Number(rowMatch[1]))) : 4;
    blocks.push({
      kind: "regular-list",
      rows,
      mode: includesAny(text, ["消息", "聊天", "message"]) ? "message" : "action",
      componentId: "regular-list",
    });
    matched.push(`列表 regular-list · ${rows} 行`);
  }

  if (wantsButton) {
    const labels = extractButtonLabels(raw);
    blocks.push({
      kind: "button-bar",
      layout: doubleButton ? "double" : "single",
      primaryLabel: labels.primary,
      secondaryLabel: labels.secondary,
      componentId: "button",
    });
    matched.push(`按钮 button · ${doubleButton ? "双按钮" : "单按钮"}`);
  }

  if (wantsBottomNav) {
    blocks.push({
      kind: "bottom-navigation",
      componentId: "bottom-navigation",
    });
    matched.push("底部导航 bottom-navigation");
  }

  if (blocks.length === 0) {
    warnings.push("未识别到明确模块，已套用「返回 + 列表 + 底部主按钮」模板。");
    blocks.push(
      {
        kind: "regular-navigation",
        title,
        leading: "back",
        trailing: "none",
        componentId: "regular-navigation",
      },
      {
        kind: "regular-list",
        rows: 4,
        mode: "action",
        componentId: "regular-list",
      },
      {
        kind: "button-bar",
        layout: "single",
        primaryLabel: "确认",
        secondaryLabel: "取消",
        componentId: "button",
      },
    );
    matched.push("默认模板");
  }

  if (!wantsList && !blocks.some((b) => b.kind === "regular-list")) {
    warnings.push("描述里未提到列表；若需要内容区，可加上「列表 4 行」。");
  }

  return {
    title,
    intent: "custom",
    blocks,
    matched,
    warnings,
  };
}
