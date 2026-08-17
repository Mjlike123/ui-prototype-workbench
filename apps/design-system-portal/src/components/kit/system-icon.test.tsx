import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SystemIcon } from "./system-icon";

describe("SystemIcon", () => {
  it.each([
    ["notification", "通知"],
    ["like", "点赞"],
    ["comment", "消息"],
    ["chat", "聊天"],
    ["follow", "关注"],
    ["publish", "发布"],
    ["more", "更多动态"],
    ["loading", "loading"],
    ["edit", "编辑"],
    ["followed", "已关注"],
    ["newMessage", "消息页新增"],
    ["voiceStatus", "语音状态"],
    ["contacts", "通讯录"],
    ["back", "左箭头1"],
    ["chevronRight", "右箭头1"],
    ["guidelines", "规则"],
    ["help", "更多-横向"],
    ["settings", "设置"],
    ["search", "搜索"],
    ["voice", "语音"],
    ["addCircle", "圆圈加号"],
    ["microphone", "麦克风"],
    ["photo", "照片"],
    ["emoji", "表情"],
    ["game", "游戏"],
    ["gift", "礼物"],
    ["send", "发送"],
    ["keyboard", "键盘"],
    ["close", "关闭"],
    ["reply", "回复"],
    ["link", "链接"],
    ["messageFailed", "发送失败"],
  ] as const)("maps %s to the canonical SVG asset", (name, assetName) => {
    const { container } = render(<SystemIcon name={name} />);
    const icon = container.querySelector(`[data-system-icon="${name}"]`);

    expect(icon).toHaveStyle({
      width: "24px",
      height: "24px",
    });
    expect(icon?.querySelector("svg")).toBeTruthy();
    expect(icon).toHaveAttribute(
      "data-system-icon-asset",
      `/icons/svg/icon=${assetName}.svg`,
    );
  });
});
