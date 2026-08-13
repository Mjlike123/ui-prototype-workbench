---
name: toptop-prototype-studio
description: |
  在 TopTop Kit 尚未覆盖完整页面时，用“Kit 锚点 + 基础 UI 原语 + 创意模块”搭建高质量功能原型。用户要求做页面概念、探索布局、增加创意、生成多个方向或现有组件不足以支撑原型时使用。
---

# TopTop Hybrid Prototype Studio

## 目标

当前 Kit 只覆盖部分导航、搜索、列表和按钮，不应强迫 Agent 用少量组件拼出所有产品界面。本 Skill 允许在不破坏既有 Kit 的前提下完成具有产品表达力的原型，并为后续组件沉淀保留证据。

默认模式是 **Hybrid**：

```text
稳定 Kit 组件（强约束）
        +
基础 UI 原语（结构自由）
        +
探索性业务模块（允许创意）
```

## 三档约束

### 1. Kit Strict

适用于生产页面、已有完整组件覆盖和工程验收。

- `status: stable` 的组件必须按 YAML、MDX 和 Token 实现。
- 不允许改变既有组件的核心结构、Variant 和交互语义。
- 缺失能力列为 blocker，不自行设计生产组件。

### 2. Hybrid Prototype（默认）

适用于大多数功能原型。

- 已有稳定组件作为页面锚点，例如导航、Tab、搜索、列表、按钮。
- 未覆盖区域可用基础 UI 原语和页面局部模块完成。
- 新模块必须标记为 `prototype`，不能冒充 Kit componentId。
- 视觉语言继续继承 Foundations；布局、层级和内容组织可以探索。
- 原型验证有效后，再决定是否沉淀为 Kit 组件。

### 3. Exploratory

适用于概念探索、多个设计方向和反常规方案。

- 先保留品牌 Token 和基本可用性底线。
- 允许改变布局模型、内容层级和交互方式。
- 默认生成三个实质不同的方向：稳妥、精炼、新颖。
- 选择方向后再收敛到 Hybrid Prototype，不直接承诺生产可用。

## 基础 UI 原语

以下是实现手段，不是 Design Kit 组件，不需要虚构 YAML：

- `Stack` / `Inline`：垂直与水平布局
- `Section`：语义内容分区
- `Surface`：无业务语义的背景容器
- `Text`：标题、正文、说明和数字
- `Image` / `AvatarFrame`：真实图片及裁切容器
- `Icon`：成熟图标集或现有资产
- `Divider` / `Spacer`
- `ScrollArea`
- 原生表单控件与项目现有可访问性 Primitive

这些原语必须使用现有 Foundations Token，不作为未来 Kit 组件候选，除非出现稳定复用模式。

## 探索性业务模块

可以为原型临时建立：

- Profile hero、封面、身份信息和统计
- 内容摘要、数据概览和活动流
- 空状态、引导区和上下文提示
- 图片画廊、媒体区和内容卡片
- 页面专属工具栏、筛选区和状态面板

命名使用 `Prototype*` 或放在 `prototypes/` 范围内，并在 Manifest 中记录：

```json
{
  "id": "profile-hero",
  "source": "prototype",
  "role": "身份与统计摘要",
  "kitCandidate": true,
  "evidence": "Profile 原型验证后评估"
}
```

## 创意工作流

### Phase 1：先定义问题

明确用户任务、主要内容、设备、品牌约束，以及原型需要验证的假设。不要从“需要什么卡片”开始。

### Phase 2：选择探索强度

- 用户只说“做个功能原型” → Hybrid
- 用户说“多几个方案 / 更有创意” → Exploratory
- 用户说“按现有 Kit 落地生产” → Kit Strict

### Phase 3：按需组合现有 Skills

| 目的 | Skill |
|---|---|
| 跨行业创意方向 | `monkren-design → design-brainstorm` |
| 三个实质不同的方案 | `monkren-design → generate-variations` |
| 先验证结构与流程 | `monkren-design → wireframe` |
| 完成交互原型 | `monkren-design → make-a-prototype` |
| 基础层级与间距收敛 | `baseline-ui` |
| 可访问性底线 | `fixing-accessibility` |
| 完成后五维验收 | `toptop-design-review` / `5-dim-review` |

不要一次加载全部 Skill。默认只选一个创意 Skill，加一个交付或审查 Skill。

### Phase 4：先给方向，再实现

Hybrid 模式给一个推荐方向；Exploratory 模式给三个：

1. **稳妥**：最大化使用现有 Kit。
2. **精炼**：保留 Kit 锚点，重构层级和内容节奏。
3. **新颖**：改变一个核心布局或交互模型，而不只是换色。

每个方向说明验证价值、风险和 Kit gaps。明确推荐后再编码。

### Phase 5：实现与标记来源

每个可见层标记来源：

- `kit`：来自稳定或评审中的组件契约
- `primitive`：通用布局和视觉原语
- `prototype`：探索性业务模块

不要让 `primitive` 和 `prototype` 出现在组件覆盖率统计中。

### Phase 6：收敛与反哺

原型审查后：

1. 删除无价值的探索模块。
2. 保留被验证的交互和内容结构。
3. 统计跨两个以上原型重复出现的 `prototype` 模块。
4. 只有具备稳定需求、Variant 和状态证据时，才进入 Kit 组件生命周期。
5. 新组件从 `draft` 开始，补齐 YAML、MDX、Token、交互和参考预览后再提升状态。

## 交付格式

```text
模式：Kit Strict / Hybrid / Exploratory
核心假设：
Kit 锚点：
基础原语：
Prototype 模块：
Kit gaps：
选定方向与理由：
验证方式：
```

最终原型必须可运行、主要任务可完成，并能区分“已由 Kit 保证”和“仍在探索”的部分。
