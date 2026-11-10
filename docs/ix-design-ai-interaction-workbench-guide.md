# IX Design、AI 交互设计师与 UI 原型工作台协作指南

本文说明三者如何分工协作，以及设计相关 Skills 应该在什么阶段使用。适用于从飞书 PRD、PDF、截图、Figma 或口头需求出发，形成可评审交互方案并逐步晋升为团队 Core 原型的工作。

## 1. 先理解三个概念

### IX Design：设计过程与交付物

IX Design 不是单个页面，也不是某个 Agent。它是一套从需求摄入到交互交付的工作过程，主要回答：

- 用户要完成什么任务？
- 页面、流程、状态和业务规则是什么？
- 哪些内容是新增、修改、复用或不进入设计？
- 哪些地方可以直接复用 Core、共享模块和 Kit？
- 哪些问题必须由产品确认？

工作草稿保存在：

```text
.monkren/ix-design/{feature-id}-{YYYY-MM-DD}/
```

典型交付物包括：

- `brief.yaml`：结构化需求简报。
- `research.md`：竞品与模式研究，可选。
- `interaction.yaml`：机器可读的页面、状态、事件和跳转契约。
- `ux-review.yaml`：体验问题、优化建议与待确认项，可选。
- `design-doc.md`：供产品、设计和研发共同阅读的 UX 设计说明。
- Studio 可交互原型：用于验证主任务和关键状态。

确认后的稳定交互契约可复制到：

```text
specs/features/{feature-id}/
```

### AI 交互设计师：执行 IX Design 的 Agent 角色

“AI 交互设计师”在本仓库中主要由 `toptop-ix-designer` Skill 定义。它负责读取多模态需求、过滤范围、检索历史资产、建立交互模型、提出体验优化并生成交付物。

它是交互设计角色，不是视觉设计师，也不是生产开发：

- 负责用户任务、信息架构、流程、状态、反馈和异常路径。
- 优先调用已有 Core 页面、共享业务模块和 Kit 组件。
- 沿用 Kit 默认视觉与 Token，不擅自重做品牌视觉。
- 不替产品决定未写清的业务规则；此类问题进入 `openQuestions`。
- 默认把探索留在 Studio，不直接注册为团队 Core 原型。

AI 可以加速分析和产出，但以下环节仍由人负责：

- 产品负责人确认目标、范围、规则和商业取舍。
- 交互或 UX 负责人确认关键流程与体验优化。
- UI / 品牌设计师确认自定义视觉方向。
- Kit 维护者决定新能力是否进入组件体系。
- 工程与评审人决定原型是否晋升 Core。

### UI 原型工作台：预览、验证与交接环境

UI 原型工作台是仓库中的 Portal。它承载 Kit 文档、组件预览、原型运行和审查入口，但不是托管 AI 推理的服务，也不是主要代码编辑器。Agent 推理与代码修改仍在本地 Cursor 中完成。

启动与访问：

```bash
npm run portal:dev
# http://localhost:3000
```

与原型相关的主要入口：

- `/canvas`：原型预览总入口，当前会默认跳转到 `/canvas/core`。
- `/canvas/core`：核心模块。展示已评审、Git 管理、可供团队复用的原型。
- `/canvas/studio`：原型创作项目画廊。每张卡片使用默认场景封面，点击后进入 `/canvas/studio/[projectId]` 验证交互。
- `/prototype-runtime/app/[screen]`：以独立运行时打开指定原型屏幕。
- `/audit/visual`：整页截图视觉走查与标注导出。
- `/components`：查看 Kit 组件契约和真实预览。
- `/getting-started`：查看平台与 Agent 的协作说明。

`/canvas` 支持主题、设备尺寸与缩放。新 Core 页面只有完成实现与注册后才会出现在目录中。

## 2. 三者的协作关系

```text
产品输入
飞书 / PDF / 截图 / Figma / 口头需求
        ↓
AI 交互设计师：toptop-ix-designer
        ↓
IX Design 交付
brief.yaml + research.md + interaction.yaml + design-doc.md
        ↓
UI 原型工作台：/canvas/studio
复用 Core 页面 / 共享模块 / Kit，验证主流程与状态
        ↓
需要自定义视觉或存在较大 Kit gap？
  ├─ 否：评审与收敛
  └─ 是：toptop-prototype-studio 做 Hybrid 深化
        ↓
toptop-design-review 只读验收
        ↓
评审通过后实现为 *-prototype.tsx
        ↓
分支 + PR + Merge
        ↓
UI 原型工作台：/canvas/core
```

最重要的关系是：

1. `toptop-ix-designer` 是执行角色与方法。
2. `.monkren/ix-design/` 是工作过程和设计证据的沉淀位置。
3. `/canvas/studio` 是方案验证区。
4. `/canvas/core` 是团队认可后的正式原型目录。

## 3. 标准协作流程

### 阶段 0：需求摄入

AI 读取一个或多个来源：

- 飞书文档：使用 `lark-doc`，需要用户已登录。
- PDF：使用 `scripts/ingest-pdf.mjs`，复杂图页再用视觉能力补读。
- 截图：直接查看原图，不凭文件名或比例猜测。
- Figma：通过 Figma MCP 读取节点上下文，需要授权。
- 文字需求：直接结构化，并标明假设和缺失信息。

多源内容合并时要保留来源、置信度与冲突，不能把冲突静默覆盖。

### 阶段 1：范围过滤与需求简报

AI 不应把 PRD 每一段都机械转成页面。应先分类：

- `newBehavior`：本期新增用户任务、状态、规则或入口。
- `existingModified`：已有能力发生行为、文案、权限或状态变化。
- `existingUnchanged`：仅作为上下文重复说明的存量能力。
- `visualDirection`：配色、图标、字号、间距与动效要求。
- `designImpact`：技术或运营信息对用户体验产生的约束。
- `noDesignImpact`：排期、负责人、内部架构等无用户感知信息。

产出 `brief.yaml` 后，由人确认页面清单、主流程和 `openQuestions`。除非用户明确要求全自动，否则这是第一个人工闸门。

### 阶段 2：研究与设计依据

成熟品类或用户指定竞品时，使用 `design-research` 做完整研究；只需快速验证单个模式时使用 `quick-references`。

研究结论应落为：

- `adopt`：适合采用的成熟模式。
- `avoid`：已知问题或不适合当前业务的做法。
- `needs_validation`：需要原型或用户测试验证的假设。

竞品截图只能作为研究证据，不能当作可对外分发的素材库。

### 阶段 3：资产检索与交互建模

开始画页面前，按以下优先级检索：

1. Core 完整页面。
2. 共享业务模块。
3. Kit 组件与交互契约。
4. 历史 IX Design、研究报告和已验证方案。
5. 最小 `Prototype*` 业务缺口。

对应目录包括：

```text
apps/design-system-portal/src/components/prototypes/
apps/design-system-portal/src/components/studio/
apps/design-system-portal/src/components/kit/
specs/components/
content/components/
.monkren/research/
.monkren/ix-design/
specs/features/
```

`interaction.yaml` 至少定义页面目的、入口、出口、适用状态、控件语义、触发事件、结果、跳转和 overlay 关闭行为。`kitMapping` 必须记录真实复用证据和 `kitGap`，不能凭记忆声称组件存在。

### 阶段 4：Studio 原型验证

默认在 `/canvas/studio` 验证：

- 主任务是否可以完成。
- 页面之间是否存在死路。
- 导航、列表、Tab 和 CTA 是否有可见结果。
- loading、empty、error、disabled、selected、focus 等适用状态是否完整。
- 固定顶栏、底栏、键盘区和 FAB 是否遮挡内容。
- 375 × 812 基准视口、safe area 和横向溢出是否正确。

实现优先级始终是：

```text
Core 完整页面
  → 共享业务模块
  → Kit 组件组合
  → 最小 Prototype gap
```

### 阶段 5：视觉深化与缺口处理

Kit 不足时，不要用相似组件硬套，也不要直接创建“正式组件”。先判断：

- 组合缺口：已有组件可以组合，只缺稳定组合方式。
- 业务特例：只服务当前功能，保留为 `Prototype*`。
- 通用能力缺口：两个以上稳定场景需要，可提名 Kit candidate。
- 规范冲突：产品诉求与 Kit 语义冲突，交由相关负责人确认。
- 认知缺口：没有可靠模式，补研究或可用性验证。

需要自定义视觉或较大缺口时，使用 `toptop-prototype-studio` 的 Hybrid 模式：

```text
稳定 Kit 锚点 + 基础 UI 原语 + 明确标记的 Prototype 模块
```

只有同时具备稳定复用场景、明确 Variant 和状态、原型验证、完整契约与测试、且没有 blocker 时，才进入 Kit 生命周期。

### 阶段 6：评审与交付

使用 `toptop-design-review` 做只读验收，覆盖：

- 视觉层级、节奏与反 AI 模板化。
- componentId、Variant、Slot 和 Token 一致性。
- 主任务、交互反馈与状态完整性。
- Manifest、实现、截图和目标视口的一致性。

问题按 P0、P1、P2 分级。需要产品判断的内容继续保留为未决项，不在评审中擅自修改。

### 阶段 7：从 Studio 晋升 Core

Studio 探索不能直接成为 Core。正确路径是：

```text
Studio 探索
  → 产品 / 设计 / Kit 评审
  → 实现为 components/prototypes/*-prototype.tsx
  → 注册路由和 Catalog
  → 测试与构建
  → 分支 + PR
  → Merge 后进入 /canvas/core
```

## 4. UI 原型工作台的边界

### Core 与 Studio

Core：

- 路由：`/canvas/core`。
- 页面：`components/prototypes/*-prototype.tsx`。
- 注册：`prototype-preview-showcase.tsx`、`prototype-app-router.tsx` 等。
- 用途：团队评审通过、可复用、Git 管理的正式原型。

Studio：

- 路由：`/canvas/studio`。
- 项目详情：`/canvas/studio/[projectId]`。
- 页面：`components/studio/*` 与 Page Canvas 相关实现。
- 注册入口：`studio-project-catalog.ts`，画廊与详情工作台分别由 `studio-project-gallery.tsx`、`studio-project-workspace.tsx` 承载。
- 用途：个人探索、临时方案和 IX 交互验证。
- 不提供创作历史；旧 `toptop-page-canvas-history-v1` 数据会在进入画廊时清理。
- 项目卡片删除需二次确认，只移除 Studio catalog 条目和白名单内的 Studio 专属数据，不删除 Kit、Core、共享实现或设计资料。
- Studio 页面或平台源码可以在明确评审范围内进入 Git；不能进入 Git 的是个人临时素材和未评审草稿。

两者可以复用 Kit、Token、图标和共享模块，但页面 shell、样式命名空间和会话存储 key 必须分开，避免 Studio 改动影响 Core。

### 工作台不是什么

- 不是 AI 模型托管服务。
- Studio 中的 prompt 到 `PageCanvasPlan` 当前主要由本地规则模板解析，不等于 Portal 内置 LLM 生成。
- 不是完整的 PRD 需求管理系统；当前“Portal 需求工作台 UI”尚未实现。
- 不是主要代码编辑器；代码由本地 Agent 在仓库内修改。
- 不是把 Studio 项目自动发布到 Core 的系统。
- 不是自动通过像素对比决定设计是否合格的验收器。

## 5. 设计相关 Skills 用法

### 总入口：`toptop-design-bundle`

适合在不确定该用哪个 Skill、想了解 Kit 能力或完整工作流时使用。它只负责说明和路由，不重复组件规则。

示例：

```text
请使用 toptop-design-bundle，判断这个需求应该进入 IX、Hybrid 原型还是 Kit Strict 实现。
```

### 交互设计：`toptop-ix-designer`

适合：

- PRD 解读和需求过滤。
- 页面、流程、状态和异常路径设计。
- 竞品依据与 UX 优化。
- 输出 `brief.yaml`、`interaction.yaml` 和 `design-doc.md`。
- 先复用既有能力，再在 Studio 拼装交互原型。

不适合：

- 从零做品牌视觉。
- 未确认规则时直接写生产页面。
- 把 Studio 草稿直接注册进 Core。

示例：

```text
请使用 toptop-ix-designer 读取这份飞书 PRD。
先输出 brief.yaml 和待确认问题；我确认后再做 interaction.yaml、UX 文档和 Studio 原型。
```

### 混合原型：`toptop-prototype-studio`

适合已有交互契约，但 Kit 无法完整覆盖页面，或需要比较布局和视觉方向时使用。

它有三种强度：

- Kit Strict：组件覆盖充分，严格遵循契约。
- Hybrid Prototype：默认；Kit 锚点加基础原语和 Prototype 模块。
- Exploratory：产生稳妥、精炼、新颖三个实质不同方向，选定后再收敛。

示例：

```text
基于 interaction.yaml 使用 toptop-prototype-studio 的 Hybrid 模式实现。
保留现有导航和按钮 Kit，所有新增业务模块标明 prototype 来源与 kitGap。
```

### 严格 Kit 实现：`toptop-design-system`

适合已有较完整 Kit，需要实现可运行、可交互、可验收页面时使用。它要求先给组件映射，再实现状态和事件，最后输出 Manifest 与验证结果。

如果 Kit 无法表达页面主体，应切回 `toptop-prototype-studio`，而不是用少量组件机械拼装。

### 综合验收：`toptop-design-review`

默认只读，适合对 `interaction.yaml`、Studio 原型或 Core 候选做验收。只有用户明确要求“审查并修复”时，才进入实现或改进 Skill。

示例：

```text
请用 toptop-design-review 审查这个 Studio 原型。
按 P0/P1/P2 输出证据、影响、修复方向和是否可晋升 Core，不要修改代码。
```

### 截图映射：`page-canvas-vision`

只在已有 UI 截图，需要映射为 Page Canvas 组件栈时使用。必须查看原图，输出符合 Portal schema 的 JSON，并记录无法映射的区域。

它不是完整 IX Design 的替代品，也不能发明 Catalog 中不存在的 componentId。

### 全生命周期模块：`monkren-design`

按当前阶段只选一个主模块，必要时最多追加两个专项模块，不要一次加载全部：

- `design-research`：完整竞品、模式和最佳实践研究。
- `quick-references`：快速查找单个页面或交互参考。
- `design-brainstorm`：跨行业类比与差异化方向。
- `discovery-questions`：项目启动和系统化需求澄清。
- `wireframe`：先比较结构、流程和信息优先级。
- `generate-variations`：生成三个以上实质不同方向。
- `make-a-prototype`：实现可运行、可交互原型。
- `5-dim-review`：哲学、层级、细节、功能与创新五维审查。
- `interaction-states-pass`：检查 hover、focus、loading、error 等状态。
- `ai-slop-check`：检查模板化和 AI 生成痕迹。
- `accessibility-audit`：做系统性 WCAG 审查。
- `polish-pass`：交付前综合质量门。
- `design-improve`：根据已确认的审查报告实施修复。
- `design-decision-council`：重大、昂贵或难逆决策的只读第二意见。

### 0→1 视觉探索：`ojo-design-skills`

适合 Landing Page、品牌方向、无 Kit 覆盖区域、视觉 Token 草案和反 AI 味审计。

它不能覆盖 TopTop 已稳定的组件与 Token。若方案进入 TopTop Core，必须重新映射到 `specs/` 和 `components/kit`，不能直接把自由视觉值写入稳定 Kit。

### 快速界面收敛：`baseline-ui`

适合实现后快速修正间距、层级、排版、小型布局和常见 AI UI 问题。它是专项清理，不替代 Kit 契约或完整设计评审。

### 无障碍：`fixing-accessibility`

适合新增或修改按钮、表单、菜单、弹窗、Tab、键盘交互和焦点管理时使用。优先修复可访问名称、键盘访问、焦点与弹窗、语义和表单错误关联，并保持改动最小。

## 6. 常用 Skill 组合

### 从 PRD 到交互原型

```text
toptop-ix-designer
  + design-research（成熟品类或指定竞品）
  + toptop-design-review（交付前验收）
```

### Kit 不足，需要创意方案

```text
toptop-ix-designer
  → toptop-prototype-studio
  + generate-variations（需要多个方向时）
  → toptop-design-review
```

### 已有截图，需要映射到 TopTop

```text
page-canvas-vision
  → 人工确认组件映射
  → toptop-ix-designer 补齐任务、流程与状态
  → toptop-prototype-studio 或 toptop-design-system
```

### 已有完整 Kit，直接实现

```text
toptop-design-system
  + fixing-accessibility
  → toptop-design-review
```

### 0→1 品牌或视觉方向

```text
ojo-design-skills
  + generate-variations
  → 用户选方向
  → 若进入 TopTop：映射回 Foundations 与 Kit
```

### 交付前质量收敛

```text
toptop-design-review
  + interaction-states-pass
  + baseline-ui 或 fixing-accessibility
```

专项 Skill 应按问题选择，不要为了“流程完整”机械串联全部 Skills。

## 7. 推荐的人机协作节奏

### 人先提供

- 需求来源或功能描述。
- 目标用户与核心任务。
- 本期范围和时间边界。
- 必须遵循的产品、平台或品牌约束。
- 是否需要竞品研究、多个方向或高保真视觉。
- 是否授权 Agent 全自动推进，还是逐阶段确认。

### AI 每阶段返回

- 当前理解和证据来源。
- 新增、修改、复用和忽略内容。
- 假设、冲突和 `openQuestions`。
- 复用的 Core、模块、Kit 与对应路径。
- 本阶段产物路径。
- 下一人工闸门或推荐动作。

### 人需要确认的三个关键闸门

1. Brief 闸门：页面、主流程、范围和业务规则。
2. 方案闸门：关键交互、体验优化、视觉方向与 Kit gaps。
3. 晋升闸门：是否将 Studio 方案实现为 Core 并进入 PR。

## 8. 文件与 Git 约定

可以进入 Git 的内容：

- 评审通过的 `components/prototypes/*-prototype.tsx`。
- 原型路由、Catalog 和注册文件。
- 稳定 Kit 组件、Token、图标和共享 CSS。
- 已确认的功能契约、测试和文档。
- 经明确评审的 Studio 页面或 Studio 平台工程代码；应与 Core 功能 PR 分开描述。

不应进入 Git 的内容：

- Studio 专属 session 数据与本地 catalog 删除状态。
- 未评审的个人草稿、临时 prompt 和试验布局。
- 默认作为过程材料的 `.monkren/ix-design/` 工作草稿；确认后的团队契约应整理到 `specs/features/`。
- 仅供个人探索的参考截图。
- 未验证却被声明为稳定 Kit 的临时组件。

团队协作遵循：

```text
最新 main
  → 一个功能一个分支
  → 本地预览和测试
  → PR Review
  → Merge
  → 团队同步
```

## 9. 最低验证要求

常用验证命令：

```bash
npm run specs:validate
npm run portal:test
npm run portal:build
```

完整 MVP 门禁：

```bash
npm run verify:mvp
```

交付时至少说明：

- 主要任务是否可完成。
- 页面与关键状态是否覆盖。
- Kit、Prototype 和 Primitive 的来源是否清楚。
- 是否存在未决 `kitGap` 或产品问题。
- 实际运行过哪些验证以及结果。
- 当前状态是 Studio 草稿、Core 候选，还是已合并 Core。

## 10. 一句话总结

`toptop-ix-designer` 负责把需求变成可追溯的 IX Design 契约，`/canvas/studio` 负责验证方案，设计 Skills 按阶段提供研究、创意、实现和审查能力；只有经过人工确认、验收和 PR 的方案，才进入 `/canvas/core` 成为团队正式原型。
