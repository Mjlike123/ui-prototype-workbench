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

## 视觉基础自动预检（实现前必做）

开始任何页面或组件代码前，自动读取当前任务相关的 `specs/foundations/`、候选组件 YAML/MDX、交互 YAML 和真实 `components/kit` 实现，并先形成组件与 Token 映射。

- 页面与列表底色、文字、图标、间距、字号、圆角和动效必须引用对应 Foundations Token。
- 新页面、Prototype 和未指定区域/包的场景，品牌主色默认使用 `color.brand.primary`（`#16D8C8`）。`color.ku.*`、`color.brand.tw-*` 等区域 Token 只有在需求、既有页面契约或业务 Profile 明确指定时才能使用；不得因视觉偏好自行选择。
- 已有 Kit 组件只允许做外部布局组合，不得用 Studio 局部 CSS 改写其内部 height、padding、gap、颜色、字体、圆角或图标。
- 根据组件 YAML 的 `interactionIds` 自动读取 `specs/interactions/` 与对应 `content/interactions/`，复用平台「交互与模式」中的状态、转换、反馈、时长、缓动、关闭、焦点恢复、无障碍和边界规则。
- 已有 Pattern 覆盖时不得在原型内另写近似手势或弹层行为；未覆盖的新交互必须记录为 interaction `kitGap`。
- Kit 未覆盖的区域才允许新设计，并隔离为 `Prototype*`、记录 `kitGap`；新设计仍须使用 Foundations Token。
- 需要额外专项能力时，通过 `ui-skills-root` 自动选择最小 Skill；默认最多追加一个，不得覆盖 TopTop 规范。
- 实现后必须在目标视口读取实际 DOM bounds、computed style 并操作主流程，核对组件尺寸、16pt 页面 gutter、safe area、Token 解析值以及 Pattern 状态转换；源码看似复用但实际行为偏离契约仍视为失败。

## 自由设计边界与缺口分类

“Kit 无法覆盖”不等于可以任意设计。先确认缺口，再决定允许探索的范围：

| 判断 | 记录方式 | 处理 |
|---|---|---|
| 已有组件可完成任务，只缺组合方式 | 不是 gap；记录真实 `sourceRef` 与组合 `notes` | 复用 Kit，不新增组件 |
| 页面专属结构或业务内容模块 | `pageGap`，`source: prototype` | 保留 `Prototype*`，默认不提名 Kit |
| 缺少可跨场景复用的功能控件 | `componentGap` | 受控设计，可建立 component candidate |
| 缺少状态机、手势或反馈规则 | `interactionGap` | 先定义行为，再评估 pattern candidate |
| 现有语义 Token 无法表达稳定需求 | `tokenGap` | 不写局部魔法值，提交 Token 候选 |
| 缺少文案、图片、图标或真实数据 | `contentGap` | 记录素材缺口，不包装成组件问题 |
| 当前运行时或平台能力无法实现 | `capabilityGap` | 降级或列 blocker，不用视觉伪装功能 |

每个 `prototype` 区域只能有一个主缺口类型。多个问题并存时拆成多个映射项，避免用一句笼统的 `kitGap` 掩盖不同责任。

### Prototype 功能合同（生成前必填）

AI 设计新的功能控件或交互模式前，必须写清：

1. **用户任务**：谁在什么场景下要完成什么；
2. **触发与结果**：从哪里进入，成功、取消和失败后分别发生什么；
3. **输入与信息优先级**：真实内容、必填信息和第一视觉焦点；
4. **状态集合**：至少覆盖适用的 default、pressed、selected、loading、empty、error、disabled；
5. **行为边界**：关闭、撤销、恢复、焦点、键盘、无障碍与 reduced motion；
6. **系统约束**：必须复用的 Token、Kit 锚点、目标视口与 44 × 44pt 触控底线；
7. **探索边界**：允许改变的结构或交互，以及禁止重写的 Kit 内部契约。

缺少以上事实时，先补需求或用最小可逆方案；不得用视觉细节替代功能定义。自由度优先用于信息组织、操作模型和反馈方式，颜色、字体、圆角、图标与基础动效继续受 Foundations 约束。

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
  "gapType": "componentGap",
  "gap": "Kit 缺少可复用的实时房间入口",
  "candidate": {
    "id": "live-room-entry",
    "kind": "component",
    "intent": "展示实时房间状态并允许进入",
    "recommendation": "nominate",
    "reuseEvidence": ["个人主页", "会话资料页"],
    "validation": ["进入结果", "离线降级", "44pt 触控", "无障碍名称"],
    "blockers": []
  }
}
```

`candidate` 只表示提名证据，不是正式 componentId，也不自动创建 Kit。复用证据不足时使用 `recommendation: keep-prototype`。

## 创意工作流

### Phase 0：上游交互设计（可选）

若用户仅有 PRD、PDF、截图或 Figma，尚未有可运行原型，先使用 `toptop-ix-designer` 产出 `interaction.yaml` 与黑白交互稿，确认后再进入本 Skill。

### Phase 1：任务与质量北极星

明确用户任务、主要内容、设备、品牌约束，以及原型需要验证的假设。不要从“需要什么卡片”开始。

若发现 Kit 缺口，先完成「缺口分类 + Prototype 功能合同」，再画界面。需求已经明确时只给一个推荐解法；只有结构或交互模型存在实质不确定性时才生成多个方向。

新页面、整页优化或用户明确要求高质量视觉时，还必须写一张简短的质量方向卡：

- **品类与主任务**：用户进入首屏首先看什么、完成什么；
- **首屏主角**：只能有一个主视觉或主要操作；
- **设计特异性**：哪些构图、内容或交互只能属于当前产品，不能原样换到其他产品；
- **视觉语言**：构图、字体、色彩、素材与一个记忆点；
- **内容真实性**：需要哪些真实文案、数据和互不重复的素材；缺失时明确降级策略；
- **质量标杆**：参考中具体 `adopt` / `avoid` 的模式，不复制品牌资产；
- **验收标准**：主任务、目标视口、状态、触控尺寸、截图与评审门槛。

质量方向卡不能用“高级、干净、有氛围”代替可观察的决定。

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

Exploratory 模式先用同一份内容做三个首屏，用户选定后才展开完整页面。三个方向在“布局骨架、字体层级、色彩面积、关键素材”四项中至少两项不同；缩成 480px 宽并排后仍相似，就重做结构，不以换色充数。

### Phase 5：实现与标记来源

每个可见层标记来源：

- `kit`：来自稳定或评审中的组件契约
- `primitive`：通用布局和视觉原语
- `prototype`：探索性业务模块

不要让 `primitive` 和 `prototype` 出现在组件覆盖率统计中。

- 主要 CTA 必须产生可观察、可恢复的结果；不能把收藏、保存、支付、发布或写入等主任务只做成 Toast。
- 首屏不得用同一张图伪装多个作者、品类或内容实体。素材不足时减少内容数量、使用诚实的参数/色板表达，或把缺口写进交付说明。
- 所有可见控制保证至少 44 × 44pt 触控区域；筛选必须更新选中态与结果。
- 先完成一个代表性页面和一条端到端主流程，再扩展其他页面。

### Phase 6：收敛与反哺

原型审查后：

1. 对选定方向取得 375×812、466×678、890×626 的运行截图；不支持某视口时记录真实 blocker。
2. 先只看截图做一次独立视觉审查，再结合 DOM、组件映射和交互证据审查。
3. 修正后重新截图；新页面或整页改版至少完成两轮“截图 → 审查 → 修正”。
4. 单独做减法：每屏一个主角，删除不影响理解和任务完成的重复文字、线、卡片与强调色。
5. 删除无价值的探索模块，保留被验证的交互和内容结构。
6. 统计跨两个以上原型重复出现的 `prototype` 模块。
7. 对每个候选给出 `keep-prototype`、`nominate` 或 `reject`，不得用“看起来合理”作为提名依据。
8. 只有满足以下条件才可 `nominate`：
   - 现有 Kit 组合无法在不扭曲语义的前提下完成任务；
   - 用户任务、语义边界、Variants、状态和异常路径可定义；
   - 使用 Foundations Token，并通过目标视口、可访问性和主流程验证；
   - 已在两个稳定场景复用，或属于经产品/Kit owner 确认的平台级基础能力；
   - 没有未决产品、内容、能力或工程 blocker。
9. 提名不等于晋升。通过 `toptop-design-review` 候选门禁后，才由 `toptop-design-system` 建立 `draft` 契约。
10. 新组件补齐 YAML、MDX、Token、Interaction、实现、测试和参考预览，并通过验证后，才可按 `draft → review → stable` 提升状态。

## 交付格式

```text
模式：Kit Strict / Hybrid / Exploratory
核心假设：
质量方向卡：
Kit 锚点：
基础原语：
Prototype 模块：
Kit gaps（类型 / 原因 / 降级）：
Prototype 功能合同：
Kit candidates（keep-prototype / nominate / reject）：
选定方向与理由：
内容与素材缺口：
主流程验证：
375 / 466 / 890 截图证据：
独立评审与修正轮次：
```

最终原型必须可运行、主要任务可完成，并能区分“已由 Kit 保证”和“仍在探索”的部分。
