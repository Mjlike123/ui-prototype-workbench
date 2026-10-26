# 交付物与质量标准

## 必交付清单

| 文件 | 格式 | 受众 |
|------|------|------|
| `design-doc.md` | Markdown | 产品、设计、研发评审 |
| `interaction.yaml` | YAML | Agent / 下游 prototype-studio |
| Kit 组件交互原型 | Studio 可运行页面 | 产品、设计、研发走查 |

可选：`brief.yaml`、`ux-review.yaml`、`research.md`、黑白交互稿

## 组件交互原型标准

**默认策略：** 先复用 TopTop Design 平台已有完整页面；没有可直接复用页面时，再用共享业务模块与 Kit 组件拼装。不得因为进入 Studio 就复制 Core 页面。

- 复用优先级：Core 页面 → 共享业务模块 → Kit 组件组合 → 最小 `Prototype*` gap。
- 开始原型前必须搜索 `specs/components/`、`components/kit/`、Core `*-prototype.tsx`、`.monkren/research/`、`.monkren/ix-design/` 与 `specs/features/`，先建立资产与历史设计知识清单。
- 完整页面已覆盖主体布局和任务时，直接调用页面，通过 props、route、state、slot 或局部 overlay 表达本期增量。
- 已有 Kit / Core 模式直接复用，只补本期增量状态和事件。
- 现有页面没有安全扩展点时，记录 page-level gap；优先提取共享模块，不复制整页形成第二套实现。
- `design-doc.md` 必须列出复用证据与适用差异；历史 UI 方案只能迁移已验证的布局和交互原则，不得忽略新需求的用户、版本和业务规则。
- 使用组件默认 Token 与图标资产，不在 IX 阶段重新做品牌视觉。
- 组件无法覆盖时，建立最小 `Prototype*` 模块并记录 `kitGap`。
- 原型默认进入「原型预览 → 原型创作」，评审前不得注册进 Core。
- 主路径可操作；适用的 loading / error / disabled / empty 状态可验证。
- 动效只用于反馈、层级切换和状态变化，并支持 `prefers-reduced-motion`。
- **基础布局门禁**：375×812 默认视口下，普通内容遵循 16px 页面 gutter；只有契约明确的媒体或背景可 full-bleed。状态栏、Home Indicator 与 `safe-area` 不得被内容或操作覆盖。
- **溢出检查**：禁止出现 `width: 100%` 叠加 margin/padding 导致的横向越界；固定顶栏、底栏与 FAB 必须给滚动内容预留对应 inset，最后一项可完整滚出遮挡区。

## 黑白交互稿标准

**定位：** 当用户明确要求、需要多方向探索、Kit gap 较大或 Portal 不可用时的补充材料。灰度稿仍须遵循 `references/kit-aligned-wireframes.md`。

- **纯灰度** — 黑、白、3–4 档灰，对应 semantic 层级；**无品牌色**
- **Kit 结构** — 顶栏/列表/半窗/底栏使用契约组件语义，版式参考同类 Core 原型
- **Foundations 尺度** — 边距 16、卡片圆角 8、列表行高 52+、按钮高 32/44（见 spacing/radius/typography yaml）
- **375×812** — 移动端默认
- **标注** — 编号 callout + `kitMapping` 中的 componentId
- **禁止** — 陌生 Dynamic Island、与产品无关的 Dashboard/设置克隆、ui-ux-pro-max 通用壳

探索性多方案宽线框可用 `monkren-design → wireframe`；正式静态稿必须使用 Kit 对齐骨架。

### 最低屏数

| 功能复杂度 | 建议屏数 |
|-----------|----------|
| 单页表单 | 1–2（含空/满态） |
| 多步流程 | 主路径每步 1 屏 + 关键 overlay |
| 含媒体选择 | + picker 空态 / 已选态 |

## interaction.yaml 质量

- 每个 `page` 至少 1 个 `state` 和 1 个 `transition` 或显式 `terminal: true`
- 每个 `overlay` 有 `dismiss` 行为
- `rules` 与 `brief.rules` 可追溯
- `kitMapping` 诚实标注 `prototype` 与 `kitGap`

## UX 文档质量

- 每条「优化」能对应 PRD 或竞品证据
- `needs-product-confirm` 项不混入已采纳方案正文
- 验收清单可执行（可勾选用例）

## 评审闸门

默认在以下节点暂停征求确认：

1. **brief 确认** — 页面清单与主流程
2. **竞品 adopt/avoid 确认** — 有重大产品影响时
3. **交付确认** — 决定保留 Studio、进入 Hybrid 深化或晋升 Core

用户说「全自动」「不要打断」时可跳过 1–2，但 `needs-product-confirm` 仍须列出。

## 目录约定

```text
.monkren/ix-design/{feature-id}-{YYYY-MM-DD}/   # 草稿迭代
specs/features/{feature-id}/                    # 确认后晋升
```

晋升条件：用户明确「确认交互稿」或「可以开发原型」。

## 与 research 目录关系

- 深度竞品：`design-research` → `.monkren/research/{topic}-{date}/report.md`
- IX 功能包：`specs/features/{feature-id}/` 内 `research.md` 或链接到 `.monkren/research/`

避免重复写两份完整报告；IX 文档中摘要 + 链接即可。
