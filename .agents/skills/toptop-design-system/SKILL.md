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

### 现有页面上的增量功能

当需求是在现有 UI 中增加能力时，先列出「现有页面保持什么、仅新增什么、触发后出现哪些状态」。以原稿的网格、内容层级、组件样式和真实素材为基线，局部修改入口与受影响区域，不把整页重画成近似布局，也不通过克隆参考画板冒充独立设计。

选组件时同时检查任务语义、内容模型、尺寸与交互状态。视觉上相似不等于适用：可搜索、可选择的好友半屏应使用半屏内容容器并组合搜索和列表；`action-panel` 的动作菜单语义不适用于这种任务。Kit 外壳能复用而业务内容不能复用时，保留 Kit 实例作为外壳，把内容作为明确的原型组合，并记录组件缺口。

增量设计至少核对触发前、触发后、选中或输入中、完成后四类状态，以及入口与结果在其他相关页面的呈现。用户提供的标注与参考图用于解释设计意图；从中提炼可复用规则后，用未见过的状态验证规则，不能只复制图层。

## Phase 2：最小化读取 Kit

1. 读取 `../toptop-profile/SKILL.md`、`../toptop-profile/profile.yaml` 和 `references/mdesign-baseline.md`，确认权威顺序、目标视口与共享硬基线。M-Design PDF 只提供通用 UI 基线，不能覆盖 TopTop YAML。
2. 读取 `specs/principles/core-design-principles.yaml` 和 `specs/foundations/*.yaml` 中与当前页面有关的分类，按清晰简单 → 一致规律 → 包容开放确定取舍。
3. 搜索可复用组件，只读取候选 `specs/components/<id>.yaml`。
4. 读取对应 `content/components/<id>.mdx`，并根据组件 `interactionIds` 读取 `specs/interactions/<id>.yaml` 与 `content/interactions/<id>.mdx`。
5. 搜索目标代码库中已有组件、Token 和页面模式。

组件存在时必须复用；没有匹配契约时把它列为 `kitGap`，不要伪装成相似组件。原型任务可以通过 `toptop-prototype-studio` 补齐探索区域；生产任务仍把缺失能力视为 blocker。

品牌主色默认使用 `color.brand.primary`（`#16D8C8`）。只有需求、既有页面契约或业务 Profile 明确指定 KU、Teami/TW 等区域/包时，才可使用 `color.ku.*`、`color.brand.tw-*` 等覆盖 Token；“更温暖”“更醒目”等视觉偏好不是切换区域品牌色的依据。

实现前必须形成 `baselineEvidence`：记录本页采用的视口、16pt 内容边距或合法 full-bleed、间距 Token、图标来源、44pt 触控区、颜色 Token、Safe Area、关键状态和可恢复结果。无对应要求时写明不适用；不得省略检查或用截图观感代替合同证据。

当交付物包含 Figma 写入时，每次完成目标节点修改后自动读取并执行 `references/figma-node-token-audit.md`：扫描可见硬编码颜色，并检查 Primary/Regular Navigation 是否绑定 `背景色/bgPrimary`。结果写入 `baselineEvidence.figmaAudit`；当前只报告、不自动修复、不作为交付门禁。

### Kit candidate 进入条件

只有同时满足以下条件，才进入 Kit 落地：

- `toptop-prototype-studio` 已提供 Prototype 功能合同与结构化 candidate；
- `toptop-design-review` 的候选结论为 `nominate`；
- 当前任务明确授权修改 Kit；
- 无未决产品、内容、能力或工程 blocker。

先按缺口类型确定落点，不能把所有候选都做成组件：

- `componentGap` → `specs/components/` 与真实 Kit component；
- `interactionGap` → `specs/interactions/`，必要时再关联组件；
- `tokenGap` → Foundations 提案，检查对全局组件的影响；
- `contentGap` → 图标、素材或内容规范，不建立视觉组件；
- `pageGap` / 页面专属业务模块 → 默认保留 Prototype。

落地前冻结候选的单一语义、非目标、内容模型、Variants、状态、交互、无障碍和响应式边界。不要把首次原型的页面布局、业务文案或局部 CSS 偶然形态固化成组件 API。

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
- 严格复用平台「交互与模式」定义的 trigger、transition、feedback、duration/easing、dismiss、focus restore、键盘、异常恢复和 edge cases；无覆盖的新模式标为 interaction `kitGap`。
- 导航、Tab、列表行和 CTA 必须产生可见结果。
- H5 至少验证常用移动视口、键盘和可访问名称。
- 不以代码简洁为由偏离 Kit，也不为像素相似破坏组件语义。

### 候选组件落地顺序

当任务包含已提名候选时：

1. 新建或更新 YAML，初始使用 `status: draft`；
2. 补齐语义、非目标、Slots、Variants、状态、Token、Interaction 与平台映射；
3. 编写 MDX 指南、正反例、内容约束与迁移说明；
4. 实现真实 Kit 组件、交互行为、测试和参考预览；
5. 用至少一个来源原型迁移验证 API，移除对应局部复制实现；
6. 运行规范、组件和 Portal 验证；
7. 无未决问题时进入 `review`；完成一致性检查与验收后再提升为 `stable`。

不要为了让候选通过而降低现有 Token、交互或无障碍要求。若实现证明边界不稳定，退回 `keep-prototype`，不要留下半正式 componentId。

## Phase 5：交付 Manifest

原型完成后输出或更新 Design MVP Manifest：

- 用户意图与目标视口
- 自上而下组件栈
- componentId 与 spec 路径
- 交互状态和未覆盖区域
- 截图/Figma 引用（如有）
- `baselineEvidence.figmaAudit`（存在 Figma 写入时）
- `kitGaps`
- Kit candidates 的评审结论、落点与生命周期状态

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
- 关联 `interactionIds` 的适用状态、转换、关闭与焦点行为已实际操作验证
- 没有静默点击
- 无新增 lint/type 错误
- 新增 Kit 能力的 YAML、MDX、Token、Variants、Interaction、测试和参考预览一致
- 候选生命周期与验证结果匹配；有 blocker 时保持 `draft` 或 `review`

## 边界

- 不自动修改组件 YAML 生命周期。
- 不把 `nominate` 直接解释为 `stable`；生命周期必须由实际交付完整性决定。
- 不把截图中的任意区域都强行映射为已有组件。
- 不把 Portal `/canvas` 当作主要编码环境；优先直接在目标项目实现。
- 不启动 Lookin，除非用户明确进入 iOS 实机验收阶段。
