# TopTop UI 原型工作台

> 仓库名：`ui-prototype-workbench` · 使命：Kit 定义边界，本地 Agent 搭建原型，Skills 负责验收，运行时审计完成落地闭环。

本仓库不是一个低配 Figma，也不在 Portal 服务器内托管大模型。Portal 可以部署到外网，向设计师、研发和本地 Agent 提供同一套设计资源；推理和代码修改由用户自己的 Cursor 等 Agent IDE 完成。

## 三层架构

| 层 | 名称 | 主要受众 | 要回答的问题 | 权威来源 |
|---|---|---|---|---|
| L1 | Kit 与设计表达 | 设计师、产品 | 为什么这样设计？长什么样？有哪些组件和状态？ | `specs/principles/`、`apps/design-system-portal/`、`content/`、Figma reference |
| L2 | Agent 可执行标准 | AI Agent、设计系统维护者 | 应复用什么？怎样映射和验收？ | `specs/**/*.yaml`、`packages/design-system-contract/` |
| L3 | 原型与验收工作流 | 研发、设计审查者 | 怎么搭建、审查并交付？ | `.agents/skills/`、Manifest、Yueban、Lookin |

层间规则：

1. L1 展示 L2，不复制出另一套规范。
2. L2 是组件、Token、交互和审计规则的单一事实来源。
3. L3 只能引用或同步 L2，不能在 Skill 中发明新 Token、组件或业务状态。
4. 原型发现规范缺口时，先回补 L1/L2，再把组件生命周期提升为 `stable`。

## 设计决策基线

所有页面、组件和原型先按 `specs/principles/core-design-principles.yaml` 判断：

1. **清晰简单**：主要任务、当前状态、下一步与结果应快速可理解。
2. **一致规律**：优先复用语义 Token、稳定组件和既有交互，减少重复学习。
3. **包容开放**：在稳定边界内适配多语言、多平台、无障碍和业务差异；Kit 缺口进入 Hybrid Prototype，不伪装成已有组件。

发生取舍时按以上顺序决策。原则定义“为什么与如何取舍”，具体值和行为仍以 Foundations、组件与交互 YAML 为准。

## 核心工作流

```text
用户意图 / 截图 / Figma
        ↓
本地 Cursor Agent 读取外网 Portal、Kit API 或安装包
        ↓
选择真实组件并搭建可交互功能原型
        ↓
视觉审美 · 设计规范 · 交互逻辑 · 像素还原验收
        ↓
H5 浏览器验收 / iOS Lookin 实机验收（后续闭环）
```

### 1. 浏览 Kit

- Portal：Foundations、Components、Interactions、Governance
- 结构化目录：`GET /api/catalog`（含 principles、Foundations、组件与交互）
- 契约：`specs/foundations/`、`specs/components/`、`specs/interactions/`
- 组件说明：`content/components/`

### 2. 本地 Agent 搭建原型

默认由 Cursor 直接在目标代码库中完成，而不是要求用户在网页中手工拼装：

1. 读取用户目标、截图或 Figma。
2. 查询 Kit 并确定组件映射。
3. 先输出组件栈、缺口和交互状态，再实现代码。
4. 复用真实组件和 Token；没有契约的区域明确标记，不做近似伪装。
5. 产出可运行原型和 Design MVP Manifest。

`/canvas` 是已生成 UI 路由的集中预览入口，不是设计编辑器；Agent 在目标代码库完成页面后，将可运行 route 登记到预览目录。

#### Kit 未完整时的混合策略

当前组件数量不足以覆盖完整产品页面时，默认使用 Hybrid Prototype，而不是退化为机械的组件堆叠：

```text
已有 Kit 组件 = 导航、搜索、列表、按钮等稳定锚点
基础 UI 原语 = 布局、文字、图片、分区、间隔和原生控件
Prototype 模块 = Profile hero、统计、媒体区等待验证业务结构
```

- 稳定 Kit 组件继续严格遵守契约。
- 基础原语继承 Foundations，但不计入组件覆盖率。
- 创意模块允许探索布局、层级和交互，必须标记为 `prototype`。
- 原型验证后，重复且稳定的模块才进入 Kit 的 draft → review → stable 生命周期。
- 需要多个方向时使用 `design-brainstorm` 或 `generate-variations`，而不是只换配色。

### 3. Skills 验收

| 关注点 | 默认能力 |
|---|---|
| Kit 不完整时的混合原型 | `toptop-prototype-studio` |
| Kit 映射与实现 | `toptop-design-system` |
| 视觉、设计、逻辑综合审查 | `toptop-design-review` |
| 五维设计审查 | `monkren-design/skills/04-review/5-dim-review` |
| AI slop 与层级节奏 | `ai-slop-check`、`hierarchy-rhythm-review` |
| 交互状态与反馈 | `interaction-states-pass` |
| 截图、bbox、750px 叠图 | `yueban-image-to-code` |
| 快速 UI 基础修正 | `baseline-ui`、`fixing-accessibility` |

审查必须引用具体 spec、实现文件或截图证据，并输出 P0/P1/P2 与是否可交付。

### 4. 运行时验收

- H5：浏览器 DOM、Playwright、截图与视觉 diff。
- iOS：Lookin/LookinServer 获取真实层级、属性和截图。
- 两端最终共用 Kit Profile、规则 ID 和问题报告格式。

Lookin 很重要，但当前不阻塞 Kit、Agent 原型和 Skills 验收主链。

## 仓库地图

| 路径 | 职责 |
|---|---|
| `specs/` | YAML 单一事实来源、Schema、平台映射和审计规则 |
| `content/` | 场景、正反例、异常路径与迁移说明 |
| `packages/design-system-contract/` | 加载、验证和类型化契约 |
| `apps/design-system-portal/` | 可外网部署的只读 Kit、预览和协作入口 |
| `.agents/skills/` | 本地 Agent 的实现、审查和专项能力 |
| `scripts/` | 规范验证、Skill 同步、截图验收与构建工具 |
| `src/` | 通用 Figma/H5/iOS 审计引擎 |
| `vendor/Lookin/` | 内部 iOS 运行时采集与验收客户端 |

## 日常维护

```bash
npm run specs:validate
npm run portal:test
npm run portal:build
npm run verify:mvp
```

组件完成后必须检查 YAML、MDX、Token、Variant、交互和参考预览一致性。只有验证通过且无未决问题时，才能把 YAML 生命周期更新为 `status: stable`。

## 当前优先级

### 当前主线

1. 让 Kit 对人和 Agent 都易于发现与读取。
2. 让本地 Cursor 能直接用 Kit 搭建可运行原型。
3. 让 Skills 组合有明确入口、证据要求和交付格式。
4. 让 Portal 成为外网协作入口，而不是模型运行容器。

### 后续闭环

1. H5 自动截图与 DOM 审计。
2. iOS Lookin 实机验收稳定化。
3. Figma、Kit、实现三方自动对照。
4. CI 与飞书问题流转。
