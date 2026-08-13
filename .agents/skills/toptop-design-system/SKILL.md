---
name: toptop-design-system
description: |
  使用 TopTop Kit 搭建功能原型。用户要求根据产品描述、截图或 Figma 生成页面、交互原型、组件组合或实现代码时使用。优先复用 specs/components 与项目现有实现，并产出可追溯的组件栈和验证结果。
---

# TopTop Kit 原型实现

## 结果要求

交付的是可运行、可交互、可验收的功能原型，不是静态截图临摹，也不是新的设计系统。

如果当前 Kit 无法表达页面主体，不要用少量组件机械拼装。切换到 `toptop-prototype-studio` 的 Hybrid 模式：稳定 Kit 继续作为锚点，缺失区域使用基础 UI 原语和明确标记的 Prototype 模块。

## Phase 1：确认目标

提取并明确：

- 主要用户任务与完成条件
- 目标平台：H5、iOS 参考或跨端
- 页面、半窗、弹层或组件级范围
- 必须展示的业务数据和状态
- 截图/Figma 是视觉合同、结构参考还是灵感

没有截图时根据产品目标搭建；有截图时直接查看图片，不用像素带启发式猜测。

## Phase 2：最小化读取 Kit

1. 读取 `specs/principles/core-design-principles.yaml`，按清晰简单 → 一致规律 → 包容开放确定取舍。
2. 读取 `specs/foundations/*.yaml` 中与当前页面有关的分类。
3. 搜索可复用组件，只读取候选 `specs/components/<id>.yaml`。
4. 读取对应 `content/components/<id>.mdx` 和相关交互 YAML。
5. 搜索目标代码库中已有组件、Token 和页面模式。

组件存在时必须复用；没有匹配契约时把它列为 `kitGap`，不要伪装成相似组件。原型任务可以通过 `toptop-prototype-studio` 补齐探索区域；生产任务仍把缺失能力视为 blocker。

## Phase 3：先给组件映射

实现前形成简短映射：

```json
{
  "intent": "message-list",
  "layers": [
    { "componentId": "regular-navigation", "role": "页面标题与操作" },
    { "componentId": "search-control", "role": "搜索会话" },
    { "componentId": "regular-list", "role": "消息列表" },
    { "componentId": "bottom-navigation", "role": "一级目的地" }
  ],
  "kitGaps": []
}
```

组件顺序应与视觉和语义层级一致。

## Phase 4：实现功能原型

- 遵循目标项目框架，不另起无关脚手架。
- 使用真实文案和有意义的数据，不用“操作项 1”等占位内容冒充完成稿。
- 实现与任务相关的 default、selected、pressed、focus、empty、error 等状态。
- 导航、Tab、列表行和 CTA 必须产生可见结果。
- H5 至少验证常用移动视口、键盘和可访问名称。
- 不以代码简洁为由偏离 Kit，也不为像素相似破坏组件语义。

## Phase 5：交付 Manifest

原型完成后输出或更新 Design MVP Manifest：

- 用户意图与目标视口
- 自上而下组件栈
- componentId 与 spec 路径
- 交互状态和未覆盖区域
- 截图/Figma 引用（如有）
- `kitGaps`

若使用图片还原并需要切图，交给 `yueban-image-to-code` 精修 bitmap/text bbox；组件层仍以 Kit 契约为准。

## Phase 6：验证

最低检查：

```bash
npm run specs:validate
npm run portal:test
npm run portal:build
```

页面原型再检查：

- 组件与 Token 均可追溯
- 主要任务可以完成
- 当前状态可见
- 没有静默点击
- 无新增 lint/type 错误

## 边界

- 不自动修改组件 YAML 生命周期。
- 不把截图中的任意区域都强行映射为已有组件。
- 不把 Portal `/canvas` 当作主要编码环境；优先直接在目标项目实现。
- 不启动 Lookin，除非用户明确进入 iOS 实机验收阶段。
