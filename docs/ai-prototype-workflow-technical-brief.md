---
documentId: toptop-ai-prototype-workflow
schemaVersion: 1
title: TopTop AI 原型工作流：技术研究与 Agent 上下文规格
status: draft-for-technical-research
language: zh-CN
audience:
  - engineering
  - ai-agent
  - design-system
owners:
  - design-system
sourceOfTruth:
  projectBoundary: PROJECT.md
  designPrinciples: specs/principles/core-design-principles.yaml
  contracts: specs/**/*.yaml
  componentGuidance: content/components/*.mdx
  roleAndHandoff: docs/design-roles-handoff.md
  verification: docs/design-mvp-verification.md
lastReviewed: 2026-11-17
---

# TopTop AI 原型工作流

## 0. 文档用途

本文用于帮助技术同学和 AI Agent 研究、实现或评估 TopTop 的“需求 → 原型 → 规范审查 → Figma 收口 → 研发交付”流程。

本文同时服务两类读者：

- 人：理解系统边界、数据流、门禁和待研究问题。
- AI：按固定读取顺序、状态标签、输入输出契约和禁止项执行任务。

本文不是新的设计规范。发生冲突时，按以下优先级处理：

1. `specs/**/*.yaml`
2. `content/components/*.mdx`
3. Portal 中由上述文件生成的预览
4. 本文

## 1. 状态标签

AI 必须区分以下状态，不得把规划项描述为当前能力：

- `current`：仓库中已有代码或可执行入口。
- `policy`：团队约束或交付规则。
- `partial`：已有底层逻辑，但入口或闭环不完整。
- `proposal`：供技术研究的建议，不代表已经实现。
- `future`：后续方向，不阻塞当前主链。

## 2. 一句话定义

```text
Kit 定义边界
→ 本地 Agent 读取需求与契约
→ 生成可运行或可评审原型
→ Skills 输出带证据的审查结果
→ 设计在 Figma 收口
→ 研发按规范或 Figma 实例稿实现
```

## 3. 系统边界

### 3.1 目标

- 让人和 AI 使用同一套组件、Token、交互和治理信息。
- 让没有 Figma 编辑权的产品同学也能做标准化需求探索。
- 让原型中的 Kit 组件、基础原语和探索模块可追溯。
- 让审查结果包含 spec、文件或截图证据。
- 保持 Figma 作为设计生产与正式视觉收口工具。

### 3.2 非目标

- Portal 不是在线 AI 模型托管平台。
- `/canvas` 不是 Figma 替代品，也不是主要页面编辑器。
- Agent 原型默认不是研发像素验收基线。
- Skill 不得创建另一套 Token 或组件规范。
- 整页截图像素相同不等于体验与组件验收通过。

## 4. 三层架构

### L1：Kit 与设计表达

- 状态：`current`
- 受众：设计、产品、研发
- 回答：为什么这样设计、长什么样、有哪些状态
- 来源：
  - `specs/principles/`
  - `content/`
  - `apps/design-system-portal/`
  - Figma reference

### L2：Agent 可执行标准

- 状态：`current`
- 受众：AI Agent、设计系统维护者、CI
- 回答：应复用什么、允许什么、怎样验证
- 来源：
  - `specs/foundations/*.yaml`
  - `specs/components/*.yaml`
  - `specs/interactions/*.yaml`
  - `packages/design-system-contract/`

### L3：原型与验收工作流

- 状态：`current`，运行时闭环部分为 `partial`
- 受众：产品、设计审查者、研发
- 回答：怎样搭建、预览、审查和交付
- 来源：
  - `.agents/skills/`
  - Portal `/canvas`
  - Design MVP Manifest 相关库
  - H5 / Lookin 审计工具

### 层间硬规则

1. L1 展示 L2，不复制另一套规范。
2. L2 是 Token、组件、交互和审计规则的单一事实来源。
3. L3 只能引用 L2，不得在 Skill 内发明新 Token、组件或业务状态。
4. 发现规范缺口时，记录 `kitGap`；不允许用相似组件伪装。
5. 新模式经过真实场景验证后，才进入 `draft → review → stable` 生命周期。

## 5. 角色与交付边界

### 设计

- 主工具：Figma + TOP UI Kit 团队库。
- 产出：正式视觉稿、标准实例、组件变更、契约更新。
- 负责：Figma 收口、Kit 变更、YAML/MDX/预览一致性。

### 产品或业务

- 主工具：本地 Cursor + Portal。
- 产出：可点击探索原型、组件映射、状态清单、`kitGap`。
- 默认状态：`explore` 或 Hybrid Prototype。

### 研发

- 主工具：目标代码库、Portal、YAML、Figma、运行时审计。
- 产出：生产实现、测试和验收证据。

### 正式交付门禁

进入研发排期前至少满足一条：

- 路径 A：所用组件均有 `review` 或 `stable` 契约，Portal 预览和交互规范完整。
- 路径 B：提供 Figma 链接与节点，稿中使用标准实例且与已合并 spec 一致。

不满足 A 或 B 时，只能作为探索原型或技术 Spike。

## 6. 端到端流程

```text
[输入]
PRD / 飞书文档 / 文字 / 截图 / Figma 节点 / 现有代码
  ↓
[1. 任务归一化]
目标用户、主要任务、平台、视口、状态、交付级别
  ↓
[2. 最小上下文检索]
原则 → Foundations → 候选组件 → MDX → Interaction → 现有实现
  ↓
[3. 模式与 Skill 路由]
Kit Strict / Hybrid / Exploratory / Screenshot-driven / Review-only
  ↓
[4. 先规划]
页面蓝图、组件栈、来源标记、状态清单、kitGap
  ↓
[5. 实现或生成]
目标代码库中的可运行页面，或需求 Figma 文件中的本地方案
  ↓
[6. 预览]
/canvas、目标路由、Figma 节点
  ↓
[7. 审查]
视觉、Kit、交互、交付完整性；输出 P0/P1/P2 和证据
  ↓
[8. 收口]
设计确认 → Figma 正式稿或 spec/Portal 完整路径
  ↓
[9. 研发与运行时验收]
H5 浏览器检查；可选 Lookin / Figma 对照
```

## 7. 任务模式与 Skill 路由

### 7.1 路由规则

#### Kit Strict

- 条件：已有完整或接近完整的 Kit 覆盖；目标是生产实现。
- 主 Skill：`toptop-design-system`
- 失败条件：关键能力无契约。
- 失败处理：标记 blocker，不自行创建正式组件。

#### Hybrid Prototype

- 条件：Kit 只能覆盖导航、Tab、搜索、列表、按钮等稳定区域。
- 主 Skill：`toptop-prototype-studio`
- 组成：
  - `kit`：稳定组件，严格遵守契约。
  - `primitive`：布局、文字、图片、Surface 等基础原语。
  - `prototype`：待验证业务模块。
- 输出必须包含 `kitGap`。

#### Exploratory

- 条件：需要多个方向、布局探索或反常规方案。
- 主 Skill：
  - `design-brainstorm`
  - `generate-variations`
  - `wireframe`
- 收敛要求：选定方向后回到 Hybrid，不直接承诺生产可用。

#### Screenshot-driven

- 条件：输入以截图或 750px 设计稿为主，需要图片、文字和 bbox 还原。
- 主 Skill：`yueban-image-to-code`
- 后续：回到 `toptop-design-system` 或 Hybrid 做组件语义映射。

#### Figma design workflow

- 条件：读取、生成或修改 Figma 设计节点。
- Skills：
  - `figma-design-to-code`：读取和理解现有节点。
  - `figma-generate-design`：生成页面或方案。
  - `figma-use`：通过 Figma API 读取、创建或修改节点。
  - `toptop-design-system`：查询 TOP UI Kit 组件与变量并执行约束。

#### Review-only

- 条件：用户要求审查、验收或发现问题，不要求修复。
- 主 Skill：`toptop-design-review`
- 可选：
  - `5-dim-review`
  - `ai-slop-check`
  - `hierarchy-rhythm-review`
  - `interaction-states-pass`
  - `accessibility-audit`

## 8. AI 最小读取协议

AI 不应默认加载整个仓库。推荐顺序：

1. `PROJECT.md`
2. `specs/principles/core-design-principles.yaml`
3. 当前任务相关的 `specs/foundations/*.yaml`
4. 候选 `specs/components/<componentId>.yaml`
5. 对应 `content/components/<componentId>.mdx`
6. 相关 `specs/interactions/*.yaml`
7. 目标代码库中的现有组件和 Token

设计决策顺序固定为：

```text
clarity（清晰简单）
→ consistency（一致规律）
→ openness（包容开放）
```

## 9. AI 任务输入输出契约

以下为 `proposal`，建议技术同学用作编排层或任务日志的数据模型。它不等同于当前 `DesignMvpManifest` 实现。

```yaml
schemaVersion: 1
taskId: shop-optimization-001
status: proposed

request:
  intent: optimize-feature
  summary: 优化道具商城浏览、预览和购买体验
  targetPlatform: mobile
  targetViewport:
    width: 375
    height: 812
  deliveryLevel: explore

inputs:
  prd:
    type: text-or-url
    value: null
  screenshots: []
  figmaNodes:
    - fileKey: Tc3TmhS6Bi39yfgqDxCaWZ
      nodeId: "255:12060"
      role: current-production-reference
  codePaths: []

routing:
  mode: hybrid
  skills:
    - figma-design-to-code
    - figma-generate-design
    - figma-use
    - toptop-design-system
  reason: 需要读取线上状态，在需求 Figma 文件中生成方案，并复用 Kit

context:
  principles:
    - specs/principles/core-design-principles.yaml
  foundations: []
  components: []
  interactions: []

plan:
  primaryTask: 浏览、预览并购买装扮
  requiredStates:
    - browse
    - category-expanded
    - item-preview
    - purchase
    - owned
    - expired
  componentMapping: []
  layers: []
  kitGaps: []

artifacts:
  prototypeRoute: null
  figmaNodes: []
  screenshots: []
  manifestPath: null
  reviewReportPath: null

gates:
  specsValidated: false
  primaryTaskCompletable: false
  interactionStatesCovered: false
  designReviewConclusion: pending
  formalDeliveryPath: none

evidence: []
openQuestions: []
```

### `layers` 推荐结构

```json
[
  {
    "id": "primary-navigation",
    "source": "kit",
    "componentId": "regular-navigation",
    "role": "页面标题与操作",
    "specPath": "specs/components/regular-navigation.yaml"
  },
  {
    "id": "product-grid",
    "source": "prototype",
    "componentId": null,
    "role": "商品浏览与预览",
    "kitCandidate": true,
    "evidence": "商城方案验证后评估"
  }
]
```

`source` 只允许：

- `kit`
- `primitive`
- `prototype`

## 10. 各阶段完成条件

### Stage 1：任务归一化

必须得到：

- 主要用户任务。
- 完成条件。
- 平台与视口。
- 必须覆盖的状态。
- 输入参考的性质：视觉合同、结构参考或灵感。
- 交付级别：`explore`、`review`、`production`。

### Stage 2：组件映射

必须得到：

- 自上而下组件栈。
- 每层 `componentId` 和 spec 路径。
- 无匹配能力的 `kitGap`。
- `kit` / `primitive` / `prototype` 来源标记。

### Stage 3：原型实现

必须满足：

- 使用真实文案和有意义的数据。
- 导航、Tab、列表行和 CTA 有可见结果。
- 主要任务可以完成。
- 关键状态不使用静态截图伪装。
- 目标代码库中存在可运行入口，或 Figma 中存在可定位节点。

### Stage 4：审查

每条问题必须包含：

- 位置。
- 严重度：P0 / P1 / P2。
- 影响。
- 证据：spec、文件行号、Figma 节点或截图。
- 修复方向。

结论只允许：

- `可交付`
- `有条件可交付`
- `不可交付`

### Stage 5：正式收口

必须明确：

- 是否由设计确认。
- 是否进入正式 Figma 稿。
- 是否更新 spec。
- 是否满足交付路径 A 或 B。
- 是否仍有 blocker。

## 11. 当前可用接口

### Portal

- 状态：`current`
- 启动：`npm run portal:dev`
- 默认地址：`http://localhost:3000`

关键路由：

- `/getting-started`：协作说明。
- `/principles`：设计原则。
- `/foundations`：Token 和视觉基础。
- `/components`：组件契约与真实预览。
- `/interactions`：交互规范。
- `/canvas`：已登记原型路由的预览目录。
- `/audit/visual`：本地图片标注和叠图。
- `/governance`：生命周期和治理。

### Catalog API

- 状态：`current`
- 方法：`GET /api/catalog`
- 返回顶层字段：

```json
{
  "generatedAt": "ISO-8601",
  "principles": [],
  "components": [],
  "foundations": [],
  "interactions": [],
  "platformMappings": [],
  "auditRegistries": []
}
```

### 原型登记

- 状态：`current`，登记过程为手动。
- 文件：`apps/design-system-portal/src/components/prototype-preview-showcase.tsx`
- 结果：原型出现在 `/canvas`。

### Design MVP Manifest

- 状态：`partial`
- 当前代码：`apps/design-system-portal/src/lib/design-mvp-bundle.ts`
- 已有：构建、导出和测试逻辑。
- 缺失：当前 Portal 页面入口。
- 注意：当前实现以旧 `page-canvas` 结构为源，不等同于本文建议的编排任务契约。

## 12. 校验与命令

### 基础门禁

```bash
npm run specs:validate
npm run skill:check
npm run portal:test
npm run portal:build
npm run verify:mvp
```

### 可选视觉核对

```bash
npm run verify:screenshot -- path/to/reference.png path/to/actual.png
```

截图 diff 是辅助证据，不是整页自动交付结论。

### 可选运行时验收

```bash
npm run ui
npm run audit -- \
  --figma-json samples/figma-page.json \
  --ui-json samples/lookin-page.json \
  --out out
```

Lookin 和实机验收不阻塞原型主链。

## 13. 案例：道具商城优化

### 输入

- 线上状态：
  - Figma fileKey：`Tc3TmhS6Bi39yfgqDxCaWZ`
  - nodeId：`255:12060`
- 优化方案：
  - nodeId：`264:12045`

### 现状问题

1. 二级或长尾类目藏在折叠菜单，曝光不足。
2. 居中预览弹窗遮挡列表，无法边逛边比较。
3. 2 列与 3 列栅格、卡片尺寸和信息密度不一致。
4. 聊天气泡缺少真实会话上下文预览。
5. “我的装扮”存在过期空槽，但缺少续费闭环。

### 实际 Skill 链

```text
figma-design-to-code
→ figma-generate-design / figma-use
→ toptop-design-system
```

说明：

- `figma-design-to-code`：读取线上状态和节点结构。
- `figma-generate-design` / `figma-use`：在需求设计文件中创建并迭代方案。
- `toptop-design-system`：查询 TOP UI Kit 组件、变量和约束。

### 两条方案方向

- 方案 A：保留商城心智，前置一级类目，增加焦点预览、统一商品流、底部快捷操作和半屏购买。
- 方案 B：将商城与“我的装扮”聚合，增加搜索、分类导航和过期续费闭环。

### 遵循的设计约束

- 375pt 移动端基准。
- 复用状态栏、常规导航、一级类目 Tab、搜索框、全局按钮、Half-screen Sheet 等 Kit 能力。
- 状态栏、导航和一级 Tab 使用 `color.surface.panel`。
- 页面内容背景使用 `color.surface.canvas`。
- 文本和图标绑定语义颜色变量，不直接填写 HEX。
- 普通组件图标从 canonical 24pt 等比例缩放到 16pt；页面顶部导航操作可使用 24pt。
- 商品卡和媒体容器宽度使用 Fill container。
- 图片保持宽高比，使用等比例 Fill/Cover，不允许单轴拉伸。
- 浅色页面的内容卡使用浅色 Surface 和轻边框；没有业务依据时不使用大面积近黑卡。

### 治理边界

- 方案位于需求设计文件。
- 使用本地需求组件和正式 Kit 实例。
- 未修改或发布正式 TOP UI Kit。
- 正式 Kit 新增、替换或发布仍需用户明确确认。

## 14. Agent 启动提示词

下面的提示词可以直接提供给具备仓库读取能力的 AI：

```text
你正在 TopTop UI 原型工作台中执行任务。

目标：
根据用户需求、截图、Figma 或现有代码，产出可追溯的组件映射、功能原型和审查证据。

强制读取顺序：
1. PROJECT.md
2. specs/principles/core-design-principles.yaml
3. 与任务相关的 specs/foundations/*.yaml
4. 候选 specs/components/<id>.yaml
5. 对应 content/components/<id>.mdx
6. 相关 specs/interactions/*.yaml

执行规则：
- 先归一化任务，再选择 Kit Strict / Hybrid / Exploratory / Screenshot-driven。
- 实现前输出主要任务、状态清单、组件栈、来源标记和 kitGap。
- source 只允许 kit / primitive / prototype。
- 不得在 Skill 中发明 Token、正式组件或业务状态。
- Portal 是只读规范与预览入口，不托管模型。
- /canvas 是原型预览目录，不是设计编辑器。
- 产品 Agent 原型默认是 explore，不自动成为研发像素基线。
- 正式交付必须满足规范 + Portal，或 Figma 实例 + 已合并规范。
- 每条审查结论必须引用 spec、实现文件、Figma 节点或截图证据。

输出顺序：
1. task-normalization
2. routing-decision
3. component-mapping
4. state-coverage
5. implementation-plan
6. artifacts
7. review
8. delivery-gate
9. open-questions
```

## 15. 技术研究建议

以下均为 `proposal`。

### P0：上下文打包器

输入：

- 用户需求。
- 目标平台。
- Figma 节点、截图或代码路径。

输出：

- 最小 principles / foundations / components / interactions 上下文包。
- 候选组件和匹配理由。
- 读取过的文件及版本。

价值：减少把整个仓库灌入模型，降低规则冲突和上下文成本。

### P0：统一任务与证据 Manifest

建议把第 9 节契约落成版本化 JSON Schema，记录：

- 输入引用。
- Skill 路由。
- 组件映射。
- 原型来源标记。
- 审查问题。
- 证据。
- 交付门禁。

价值：让 Cursor、Portal、CI、Figma 和运行时审计交换同一份任务状态。

### P1：原型登记自动化

当前 `/canvas` 原型清单需要修改代码登记。可研究：

- Manifest 自动发现。
- 路由存在性检查。
- 截图和状态清单自动生成。
- 失效路由清理。

### P1：规范检索与匹配服务

可研究：

- `GET /api/catalog` 的过滤和版本参数。
- 按 intent、platform、status、role 查询组件。
- 返回匹配置信度、拒绝原因和 `kitGap` 建议。

### P1：审查编排

将视觉、Kit、交互和交付四层审查统一为结构化结果：

```json
{
  "conclusion": "conditional",
  "issues": [
    {
      "severity": "P1",
      "location": "商品卡",
      "ruleId": "responsive-card-media",
      "evidence": ["specs/...", "figma:264:12045"],
      "recommendation": "媒体容器使用 Fill，并保持原始比例"
    }
  ]
}
```

### P2：运行时闭环

- H5：DOM、Playwright、截图证据。
- iOS：Lookin 层级、属性和截图。
- 统一 Kit Profile、规则 ID、证据格式和问题状态。

## 16. 已知缺口

- 没有单一服务自动完成需求读取、Skill 路由、实现和审查。
- 当前 Manifest 有库和测试，但没有 Portal 页面入口。
- `/canvas` 原型登记仍需手动修改列表。
- Figma、spec 和实现之间还没有稳定的自动双向 diff。
- 整页像素比较仍容易受字体、动态数据和图片内容影响。
- 运行时 iOS 验收依赖本地设备和 Lookin。
- Skill 执行日志、模型版本、上下文版本和成本尚未形成统一审计记录。

## 17. 技术评估问题

1. 是否需要独立编排服务，还是继续使用本地 Agent + Git 工件？
2. Manifest 应由 Agent 生成、CI 生成，还是两者共同维护？
3. Catalog API 如何支持版本、增量、权限和缓存？
4. 组件匹配的置信度如何计算，何时必须返回 `kitGap`？
5. 如何保证 Prompt、Skill、spec 和 Figma 引用属于同一版本？
6. 如何存储截图、Figma 节点和运行时证据，避免链接失效？
7. 哪些门禁适合自动阻断，哪些只能作为人工提醒？
8. 如何让正式 Kit 变更始终经过显式审批？
9. 如何在不上传敏感需求的前提下运行本地或企业模型？
10. 如何度量流程收益：返工率、Kit 复用率、审查问题数、交付周期或上下文成本？
