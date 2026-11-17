# 角色分工与交付门禁

本文定义**设计师**、**无 Figma 编辑权的业务（如产品）**与本仓库的关系，以及进入研发排期前的**交付门槛**。

权威分层仍以 [PROJECT.md](../PROJECT.md) 的 L1/L2/L3 为准；Figma 是设计部的生产工具，**Git 中的 `specs/` + Design System Portal 是全团队可读的单一事实来源**。

## 两条产线

| 角色 | 主工具 | 在本仓库中的动作 | 典型交付物 |
|------|--------|------------------|------------|
| **设计师**（设计部可编辑 Figma） | Figma + TOP UI Kit 团队库 | 对齐/更新 `specs/`、`content/`；通过 Portal 预览验收；组件成熟后 `stable` | Figma 实例稿、已 Publish 的库变更、契约 PR |
| **产品等业务**（无 Figma 编辑权） | 本地 Portal + Cursor Agent | `npm run portal:dev`；使用 `toptop-design-system` / `toptop-prototype-studio` 按 Kit 搭可运行原型 | 可点击原型路由、`kitGap` 清单、评审说明 |
| **研发** | 代码库 | 实现以 YAML + Portal 预览为准；需要像素对照时用 Figma + 审计工具 | PR、Lookin/浏览器验收 |

设计师**不**用本仓库替代 Figma；产品**不**在 Figma 里维护 Kit 源码（Detach、自绘图标等）。

## 单一事实来源

以下内容**全员可用**，不依赖 Figma 席位：

- Design System Portal（`npm run portal:dev`）：原则、Token、组件预览、交互说明、原型目录 `/canvas`
- Git：`specs/components/*.yaml`、`specs/foundations/`、`content/components/*.mdx`
- Catalog API：`GET /api/catalog`（Agent 与工具消费）

以下内容**仅在有文件访问与编辑权时**可用：

- 版本需求 Figma 文件内的**本地组件**（未 Publish 到团队库前，其他文件搜不到）
- Figma 团队库实例（需在 Figma 中启用库并拖实例）

## 设计师工作要点

1. 在 Figma 用**团队库实例**出稿；需要新状态时在库或需求稿中增变体，并回写契约。
2. 组件或规则变化 → 更新 YAML/MDX → `npm run specs:validate` → Portal 预览一致后再 Promote 生命周期。
3. 颜色：图标与文案绑定 TOP **颜色变量**；**红点内数字固定 `#FFFFFF`**；`[Give You A Gift]`、`[有人@你]` 等摘要用 **`警示色/stateLike`**（见个人/项目颜色约定文档）。

## 产品 / 业务工作要点（无 Figma 编辑权）

1. **需求探索与流程原型**：本地打开仓库，启动 Portal，在 Cursor 中描述场景，让 Agent 按 Kit 映射实现（参见 [design-mvp-verification.md](./design-mvp-verification.md)、Portal `/getting-started`）。
2. 产出默认标记为 **`explore` / Hybrid Prototype**：可评审逻辑与信息结构，**不自动等同视觉终稿**。
3. 发现 Kit 缺口时列出 `kitGap`，交给设计回补 L1/L2，而不是在原型里永久保留「形似组件」。

推荐命令：

```bash
npm install
npm run portal:dev    # http://localhost:3000
npm run verify:mvp    # 契约门禁（可选）
```

## 研发排期交付门禁

进入研发排期（或视为「视觉/交互已锁定」）时，须满足**其一**：

| 路径 | 条件 |
|------|------|
| **A. 规范 + Portal** | 页面/模块所用组件均在 Git 中有对应 `specs/components`（`review` 或 `stable`）；Portal 预览与 PRD 一致；交互见 `specs/interactions` |
| **B. Figma + 规范一致** | 交付 Figma 链接与 node；稿中为标准**实例**（未 Detach）；与 YAML 中 `reference.figmaUrl` / 变体一致；若有 diff，以**已合并的 spec** 为准 |

**不满足任一路径**时，仅可作为探索原型或 Spike，**不得**作为默认像素与组件验收基线。

### 产品 Agent 原型的边界

- ✅ 主流程、状态机、文案结构、Kit 组件选型、无障碍与交互规则对齐
- ❌ 替代未入库的新视觉、未写进 YAML 的间距/颜色、未评审的动效参数

需要上生产或被 iOS/H5 审计对标时，由设计在 Figma 收口或把缺口正式写入 spec。

## 与飞书 / 自动化

飞书机器人与 Worker 负责 PRD 拉取与任务编排；**Figma 写入与深审仍在设计账号 + Cursor 本仓库**中完成。见 [feishu-bot-runtime-topology.md](./feishu-bot-runtime-topology.md)。

## 快速对照

| 我想… | 去哪里 |
|--------|--------|
| 查组件有几种状态、Token 叫什么 | Portal `/components`、对应 MDX |
| 做可点击原型（没有 Figma） | 本地 Cursor + `toptop-design-system`，预览 `/canvas` |
| 出正式稿、上架 Kit | 设计部 Figma + 本仓库 spec PR |
| 判断能不能进研发 | 对照上文「交付门禁」A 或 B |