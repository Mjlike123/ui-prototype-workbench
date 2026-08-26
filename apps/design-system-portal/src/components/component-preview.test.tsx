import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ComponentSpec } from "@toptop/design-system-contract";
import { ComponentPreview } from "./component-preview";

const component: ComponentSpec = {
  schemaVersion: 1,
  id: "secondary-tab-underline",
  version: "1.0.0",
  title: "二级 Tab（下划线）",
  status: "stable",
  platforms: ["ios", "android", "h5"],
  previewKey: "secondary-tab-underline",
  detection: {
    figmaComponentIds: ["13468:186532"],
    nameAliases: ["underline tab"],
  },
  roles: ["container", "tabItem", "label"],
  rules: [],
};

const primaryNavigation: ComponentSpec = {
  schemaVersion: 1,
  id: "primary-navigation",
  version: "1.0.0",
  title: "一级导航",
  status: "stable",
  platforms: ["ios", "android", "h5"],
  previewKey: "primary-navigation",
  detection: {
    figmaComponentIds: ["743:6003"],
    nameAliases: ["一级导航"],
  },
  roles: ["container", "tabItem", "label"],
  rules: [],
};

const bottomNavigation: ComponentSpec = {
  schemaVersion: 1,
  id: "bottom-navigation",
  version: "1.0.0",
  title: "底部导航",
  status: "stable",
  platforms: ["ios", "android", "h5"],
  previewKey: "bottom-navigation",
  detection: {
    figmaComponentIds: ["209:13859"],
    nameAliases: ["底部导航"],
  },
  roles: ["container", "tabItem", "label"],
  rules: [],
};

const regularNavigation: ComponentSpec = {
  schemaVersion: 1,
  id: "regular-navigation",
  version: "1.0.0",
  title: "常规导航栏",
  status: "stable",
  platforms: ["ios", "android", "h5"],
  previewKey: "regular-navigation",
  detection: {
    figmaComponentIds: ["710:12619"],
    nameAliases: ["常规导航栏"],
  },
  roles: ["container", "label"],
  rules: [],
};

const button: ComponentSpec = {
  schemaVersion: 1,
  id: "button",
  version: "1.0.0",
  title: "按钮",
  status: "review",
  platforms: ["ios", "android", "h5"],
  previewKey: "button",
  detection: {
    figmaComponentIds: ["40:3516"],
    nameAliases: ["按钮"],
  },
  roles: ["container", "label"],
  rules: [],
};

const searchControl: ComponentSpec = {
  schemaVersion: 1,
  id: "search-control",
  version: "1.0.0",
  title: "搜索控件",
  status: "review",
  platforms: ["ios", "android", "h5"],
  previewKey: "search-control",
  detection: {
    figmaComponentIds: ["777:7549"],
    nameAliases: ["搜索控件"],
  },
  roles: ["container", "field", "input"],
  rules: [],
};

const chatInput: ComponentSpec = {
  schemaVersion: 1,
  id: "chat-input",
  version: "1.0.0",
  title: "私聊底部输入模块",
  status: "stable",
  platforms: ["ios", "android", "h5"],
  previewKey: "chat-input",
  detection: {
    figmaComponentIds: ["1356:10112"],
    nameAliases: ["私聊底部输入模块"],
  },
  roles: ["container", "field", "trailingAction"],
  rules: [],
};

const chatBubble: ComponentSpec = {
  schemaVersion: 1,
  id: "chat-bubble",
  version: "1.0.0",
  title: "私聊消息气泡",
  status: "stable",
  platforms: ["ios", "android", "h5"],
  previewKey: "chat-bubble",
  detection: {
    figmaComponentIds: ["13667:240539"],
    nameAliases: ["私聊消息气泡"],
  },
  roles: ["container", "content", "statusBadge", "trailingAction"],
  rules: [],
};

const switchControl: ComponentSpec = {
  schemaVersion: 1,
  id: "switch",
  version: "1.0.0",
  title: "开关",
  status: "review",
  platforms: ["ios", "android", "h5"],
  previewKey: "switch",
  detection: {
    figmaComponentIds: ["1356:11898"],
    nameAliases: ["开关"],
  },
  roles: ["container", "trailing"],
  rules: [],
};

const regularList: ComponentSpec = {
  schemaVersion: 1,
  id: "regular-list",
  version: "1.0.0",
  title: "常规列表",
  status: "review",
  platforms: ["ios", "android", "h5"],
  previewKey: "regular-list",
  detection: {
    figmaComponentIds: ["1526:11194", "1597:10106"],
    nameAliases: ["常规列表", "消息列表"],
  },
  roles: ["container", "listItem", "content"],
  rules: [],
};

const avatar: ComponentSpec = {
  schemaVersion: 1,
  id: "avatar",
  version: "1.0.0",
  title: "头像",
  status: "review",
  platforms: ["ios", "android", "h5"],
  previewKey: "avatar",
  detection: {
    figmaComponentIds: ["3035:22528"],
    nameAliases: ["头像", "头像框"],
  },
  roles: ["container", "avatarImage", "decorationFrame", "statusBadge"],
  rules: [],
};

const imageEmptyState: ComponentSpec = {
  schemaVersion: 1,
  id: "image-empty-state",
  version: "1.0.0",
  title: "图片空状态",
  status: "review",
  platforms: ["ios", "android", "h5"],
  previewKey: "image-empty-state",
  detection: {
    figmaComponentIds: ["66:46250", "66:46209"],
    nameAliases: ["图片空状态", "兜底图"],
  },
  roles: ["container", "icon"],
  rules: [],
};

const emptyState: ComponentSpec = {
  schemaVersion: 1,
  id: "empty-state",
  version: "1.0.0",
  title: "页面空状态",
  status: "review",
  platforms: ["ios", "android", "h5"],
  previewKey: "empty-state",
  detection: {
    figmaComponentIds: ["4417:21995", "13868:240358"],
    nameAliases: ["页面空状态", "空状态"],
  },
  roles: ["container", "icon", "label", "trailingAction"],
  rules: [],
};

const listTag: ComponentSpec = {
  schemaVersion: 1,
  id: "list-tag",
  version: "1.0.0",
  title: "列表标签",
  status: "review",
  platforms: ["ios", "android", "h5"],
  previewKey: "list-tag",
  detection: {
    figmaComponentIds: ["1540:12522", "1540:12531"],
    nameAliases: ["列表标签", "会员标"],
  },
  roles: ["container", "icon", "value", "membershipAsset"],
  rules: [],
};

const iosStatusBar: ComponentSpec = {
  schemaVersion: 1,
  id: "ios-status-bar",
  version: "1.0.0",
  title: "iOS 时间状态栏",
  status: "review",
  platforms: ["ios", "h5"],
  previewKey: "ios-status-bar",
  detection: {
    figmaComponentIds: ["13624:186173", "13624:186190"],
    nameAliases: ["iOS 状态栏"],
  },
  roles: ["container", "label", "icon"],
  rules: [],
};

const pillTab: ComponentSpec = {
  schemaVersion: 1,
  id: "secondary-tab",
  version: "1.2.0",
  title: "二级 Tab",
  status: "review",
  platforms: ["ios", "android", "h5"],
  previewKey: "secondary-tab-pill",
  detection: {
    figmaComponentIds: [],
    nameAliases: ["二级tab"],
  },
  roles: ["container", "tabItem", "label"],
  rules: [],
};

describe("ComponentPreview", () => {
  it("switches selected tab and exposes accessible state", () => {
    render(<ComponentPreview component={component} />);

    const aboutTab = screen.getByRole("tab", { name: "About me" });
    const movementTab = screen.getByRole("tab", {
      name: "Movement(6)",
    });
    expect(aboutTab).toHaveAttribute("aria-selected", "true");

    fireEvent.click(movementTab);

    expect(movementTab).toHaveAttribute("aria-selected", "true");
    expect(aboutTab).toHaveAttribute("aria-selected", "false");
  });

  it("supports the dynamic count boundary", async () => {
    render(<ComponentPreview component={component} />);

    fireEvent.change(screen.getByLabelText("动态计数"), {
      target: { value: "hidden" },
    });

    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: "Movement" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("tab", { name: "Movement(6)" }),
      ).not.toBeInTheDocument();
    });
  });

  it("switches tabs when the content list is swiped horizontally", () => {
    render(<ComponentPreview component={component} />);

    const swipeArea = screen.getByLabelText("可左右滑动的 Tab 内容");
    fireEvent.pointerDown(swipeArea, {
      clientX: 240,
      clientY: 90,
      pointerId: 1,
    });
    fireEvent.pointerMove(swipeArea, {
      clientX: 150,
      clientY: 92,
      pointerId: 1,
    });
    fireEvent.pointerUp(swipeArea, {
      clientX: 150,
      clientY: 92,
      pointerId: 1,
    });

    expect(
      screen.getByRole("tab", { name: "Movement(6)" }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("offers an equivalent keyboard interaction", () => {
    render(<ComponentPreview component={component} />);

    const aboutTab = screen.getByRole("tab", { name: "About me" });
    const movementTab = screen.getByRole("tab", {
      name: "Movement(6)",
    });
    aboutTab.focus();
    fireEvent.keyDown(aboutTab, { key: "ArrowRight" });

    expect(movementTab).toHaveAttribute("aria-selected", "true");
    expect(movementTab).toHaveFocus();
  });

  it("renders primary navigation variants from the Figma contract", () => {
    render(<ComponentPreview component={primaryNavigation} />);

    fireEvent.change(screen.getByLabelText("标题数量"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("尾部操作"), {
      target: { value: "all" },
    });
    fireEvent.click(screen.getByRole("tab", { name: "Country" }));

    expect(screen.getByRole("tab", { name: "Country" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Nearby" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "News" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "活动" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "搜索" })).toBeInTheDocument();
  });

  it("renders regular navigation title and action variants", () => {
    render(<ComponentPreview component={regularNavigation} />);

    fireEvent.change(screen.getByLabelText("标题适配"), {
      target: { value: "subtitle" },
    });
    fireEvent.change(screen.getByLabelText("尾部操作"), {
      target: { value: "button" },
    });
    fireEvent.change(screen.getByLabelText("前置操作"), {
      target: { value: "close" },
    });

    expect(screen.getByRole("button", { name: "关闭" })).toBeInTheDocument();
    expect(
      screen.getByText("副标题超出展示区域时省略"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Post" })).toBeInTheDocument();
  });

  it("renders bottom navigation destination and region variants", () => {
    render(<ComponentPreview component={bottomNavigation} />);

    const navigation = screen.getByRole("navigation", {
      name: "App 一级目的地",
    });
    expect(screen.getByRole("button", { name: "TopTop" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    fireEvent.change(screen.getByLabelText("当前目的地"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("区域主题"), {
      target: { value: "dark" },
    });
    fireEvent.change(screen.getByLabelText("首项目的地"), {
      target: { value: "refresh" },
    });

    expect(navigation).toHaveClass("bottomNavigationDark");
    expect(screen.getByRole("button", { name: "Refresh" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders button sizes, states and responsive groups", () => {
    render(<ComponentPreview component={button} />);

    expect(screen.getByRole("button", { name: "Confirm" })).toHaveClass(
      "kitButton--height48",
      "kitButton--primary",
    );
    expect(screen.getByLabelText("按钮全部尺寸与状态")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "48px 常规" })).toHaveClass(
      "kitButton--height48",
      "kitButton--default",
    );
    expect(screen.getByRole("button", { name: "24px 置灰" })).toBeDisabled();
    expect(
      screen.getByRole("heading", { name: "双按钮" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "取消" })).toHaveClass(
      "kitButton--neutral",
      "kitButton--height48",
    );
    expect(screen.getByRole("button", { name: "确定" })).toHaveClass(
      "kitButton--primary",
      "kitButton--height48",
    );

    fireEvent.change(screen.getByLabelText("按钮高度"), {
      target: { value: "height24" },
    });
    fireEvent.change(screen.getByLabelText("视觉类型"), {
      target: { value: "primary-outline" },
    });
    fireEvent.change(screen.getByLabelText("按钮状态"), {
      target: { value: "disabled" },
    });
    fireEvent.change(screen.getByLabelText("布局方式"), {
      target: { value: "double" },
    });

    expect(screen.getByRole("button", { name: "Confirm" })).toHaveClass(
      "kitButton--height24",
      "kitButton--primary-outline",
      "kitButton--disabled",
    );
    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("supports search activation, input, clear and cancel", () => {
    render(<ComponentPreview component={searchControl} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "打开搜索：Search by Name / Userid",
      }),
    );

    const input = screen.getByRole("searchbox", { name: "搜索关键词" });
    expect(input).toHaveFocus();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "TopTop user" } });
    fireEvent.click(screen.getByRole("button", { name: "清除搜索内容" }));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();

    fireEvent.change(input, { target: { value: "another query" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.getByRole("button", {
        name: "打开搜索：Search by Name / Userid",
      }),
    ).toBeInTheDocument();
  });

  it("previews chat input text, send and voice modes", () => {
    render(<ComponentPreview component={chatInput} />);

    const input = screen.getByRole("textbox", { name: "消息内容" });
    expect(screen.getByRole("button", { name: "发送礼物" })).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.click(screen.getByRole("button", { name: "发送消息" }));
    expect(input).toHaveValue("");

    fireEvent.change(screen.getByLabelText("输入模式"), {
      target: { value: "voice" },
    });
    expect(
      screen.getByRole("button", { name: "Hold to talk" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "切换到文字输入" }),
    ).toBeInTheDocument();
  });

  it("previews chat bubble content and feedback variants", () => {
    render(<ComponentPreview component={chatBubble} />);

    fireEvent.change(screen.getByLabelText("内容类型"), {
      target: { value: "gift" },
    });
    fireEvent.change(screen.getByLabelText("卡片操作"), {
      target: { value: "expired" },
    });
    expect(
      screen.getByRole("button", { name: "Expired，内容已过期" }),
    ).toBeDisabled();

    fireEvent.change(screen.getByLabelText("内容类型"), {
      target: { value: "text" },
    });
    fireEvent.change(screen.getByLabelText("收发方向"), {
      target: { value: "outgoing" },
    });
    fireEvent.change(screen.getByLabelText("投递状态"), {
      target: { value: "failed" },
    });
    expect(screen.getByRole("status", { name: "消息发送失败" })).toBeInTheDocument();
  });

  it("renders avatar sizes with and without decoration frames", () => {
    const { container } = render(<ComponentPreview component={avatar} />);

    expect(screen.getByRole("heading", { name: "头像使用范围" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "默认空状态" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "不带头像框" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "带头像框" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "带徽标头像" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "头像组" })).toBeInTheDocument();
    expect(container.querySelectorAll(".avatarUsageItem")).toHaveLength(7);
    expect(container.querySelectorAll(".avatarGroupCase")).toHaveLength(6);
    expect(container.querySelectorAll(".avatarVisual--framed")).toHaveLength(7);
    expect(container.querySelectorAll(".avatarVisualBadge")).toHaveLength(6);
    expect(
      container.querySelectorAll('.avatarVisualBadge img[src*="avatar-badges"]')
        .length,
    ).toBeGreaterThanOrEqual(6);
    expect(
      container.querySelector(
        '.avatarVisualBadge--gender img[src*="gender-female.svg"]',
      ),
    ).not.toBeNull();
    expect(
      container.querySelector('img[src*="default-empty-light.png"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('img[src*="default-empty-dark.png"]'),
    ).not.toBeNull();
  });

  it("renders image empty state light and dark previews", () => {
    const { container } = render(
      <ComponentPreview component={imageEmptyState} />,
    );

    expect(screen.getByRole("heading", { name: "亮暗场景" })).toBeInTheDocument();
    expect(container.querySelector(".imageEmptyState--light")).not.toBeNull();
    expect(container.querySelector(".imageEmptyState--dark")).not.toBeNull();
    expect(
      container.querySelector('img[src*="picture-light.png"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('img[src*="picture-dark.png"]'),
    ).not.toBeNull();
  });

  it("renders page empty state with and without action", () => {
    const { container } = render(<ComponentPreview component={emptyState} />);

    expect(screen.getByRole("heading", { name: "默认空状态 + 主操作" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "仅说明文案" })).toBeInTheDocument();
    expect(
      screen.getAllByText("Please fill in the country first"),
    ).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Go set" })).toBeInTheDocument();
    expect(
      screen.getByText("No rooms match your filters yet."),
    ).toBeInTheDocument();
    expect(
      container.querySelector('img[src*="no-list.png"]'),
    ).not.toBeNull();
    expect(screen.getByRole("heading", { name: "业务插画切图" })).toBeInTheDocument();
    expect(
      container.querySelector('img[src*="no-network.png"]'),
    ).not.toBeNull();
  });

  it("renders gender variants, membership levels and list composition", () => {
    const { container } = render(<ComponentPreview component={listTag} />);

    expect(screen.getByRole("heading", { name: "性别与年龄" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "会员等级" })).toBeInTheDocument();
    expect(container.querySelectorAll(".listTagMembershipCase")).toHaveLength(19);
    expect(screen.getAllByLabelText("会员 V9").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("女性，28 岁").length).toBeGreaterThan(0);
  });

  it("renders both iOS status bar appearances", () => {
    const { container } = render(
      <ComponentPreview component={iosStatusBar} />,
    );

    expect(screen.getByRole("heading", { name: "黑色内容" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "白色内容" })).toBeInTheDocument();
    expect(container.querySelectorAll(".iosStatusBar")).toHaveLength(2);
  });

  it("renders all regular list and message list variants", () => {
    const { container } = render(
      <ComponentPreview component={regularList} />,
    );

    expect(container.querySelectorAll(".regularListItem--action")).toHaveLength(
      15,
    );
    expect(
      container.querySelectorAll(".regularListItem--message"),
    ).toHaveLength(12);
    expect(screen.getAllByText("Hawkins")).toHaveLength(12);
    expect(screen.getByText("[Gifts]")).toBeInTheDocument();
    expect(screen.getAllByText("06-24").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("会员 V9").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("女性，28 岁").length).toBeGreaterThan(0);
    expect(
      screen.getAllByLabelText("用户身份与等级标签").length,
    ).toBeGreaterThan(0);
    expect(screen.getByLabelText("发送失败")).toBeInTheDocument();
    expect(screen.getByLabelText("发送中")).toBeInTheDocument();
    expect(screen.getByLabelText("已编辑")).toBeInTheDocument();
    expect(container.querySelector(".regularListAvatarFrame")).not.toBeNull();
  });

  it("switches between 28px and 24px pill heights", () => {
    render(<ComponentPreview component={pillTab} />);

    const tabList = screen.getByRole("tablist", { name: "二级 Tab" });
    expect(tabList).toHaveClass("secondaryTabPillHeight28");

    fireEvent.change(screen.getByLabelText("视觉高度"), {
      target: { value: "height24" },
    });

    expect(tabList).toHaveClass("secondaryTabPillHeight24");
    expect(tabList).not.toHaveClass("secondaryTabPillHeight28");
  });

  it("renders switch states and syncs the interactive demo", () => {
    render(<ComponentPreview component={switchControl} />);

    expect(screen.getByRole("switch", { name: "关闭" })).not.toBeChecked();
    expect(screen.getByRole("switch", { name: "开启" })).toBeChecked();
    expect(screen.getByRole("switch", { name: "受控开关示例" })).toBeChecked();

    fireEvent.click(screen.getByRole("switch", { name: "受控开关示例" }));
    expect(
      screen.getByRole("switch", { name: "受控开关示例" }),
    ).not.toBeChecked();

    fireEvent.change(screen.getByLabelText("交互示例"), {
      target: { value: "on" },
    });
    expect(
      screen.getByRole("switch", { name: "受控开关示例" }),
    ).toBeChecked();
  });
});
