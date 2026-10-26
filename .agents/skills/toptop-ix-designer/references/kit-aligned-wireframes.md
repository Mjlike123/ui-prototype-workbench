# Kit 对齐的黑白交互稿

交互稿是**设计系统在灰度下的骨架预览**，不是另一套通用 UI 语言。
可以没有品牌色，但**结构、组件、间距、圆角、导航模型**必须与 TopTop Kit 一致。

## 核心原则

```text
黑白 = 不上色，不是换一套设计系统
交互稿 = Kit 骨架 + 流程/状态，不是 Dribbble 模板
```

对齐顺序（与 `specs/principles/core-design-principles.yaml` 一致）：

1. **清晰简单** — 任务与状态可读
2. **一致规律** — 复用 Kit 组件与 Foundations
3. **包容开放** — Kit 缺口标 `prototype` / `kitGap`，不伪装成 stable 组件

## 必须对齐什么

### 1. Foundations（灰度也要用对尺度）

交付前读取并遵守：

| 契约 | 交互稿中怎么用 |
|------|----------------|
| `specs/foundations/spacing.yaml` | 页边距 16px（`spacing.4`）；列表行高约 52–56；卡片间距 8–12 |
| `specs/foundations/radius.yaml` | 卡片/按钮 `radius-8`；全圆按钮/头像 `radius-full`；半窗顶圆角 16–20 |
| `specs/foundations/typography.yaml` | 导航标题 ≈17px semibold；正文 15px；辅助 12–13px |
| `specs/foundations/semantic-colors.yaml` | 灰度映射：主文 `#1c1c1e` 档、次要 `#8e8e93` 档、分割 `#e5e5ea` 档（禁止随意取色） |

### 2. Kit 组件（用语必须来自契约）

黑白稿中的每个可见区域应能标注 `componentId`：

| 场景 | 优先 Kit | 说明 |
|------|----------|------|
| 二级页顶栏 | `regular-navigation` | back/close + title + trailing |
| 一级 Tab | `primary-navigation` / `secondary-tab` | 与现网一致 |
| 设置/隐私列表 | `regular-list` | 行高、chevron、右侧值 |
| 搜索 | `search-control` | 占位与圆角 |
| 底部主导航 | `bottom-navigation` | 五栏结构 |
| 主按钮 | `button`（kitButton 契约） | 高度 32/44、圆角 pill |
| 开关行 | `switch` | 与列表组合 |
| 图标 | `system-icon` | 禁止 wireframe 里画陌生图标体系 |

未覆盖区域用 `Prototype*` 模块，并在 `kitMapping` 标 `kitGap`。

### 3. 现有 Core 原型（版式参考，不是抄竞品）

画新功能前，先找最接近的已入库屏幕作**版式锚点**：

| 功能域 | 参考实现 |
|--------|----------|
| 发布/表单 | `feed-compose-page-prototype` |
| 列表/动态 | `toptop-home-prototype`、Feed 相关 |
| 设置/隐私 | `me-page-prototype`、me-secondary |
| 半窗/选择 | `feed-compose` 的 audience sheet、leave confirm |

交互稿的**信息架构和导航深度**应与这些屏幕同级，而不是套 iOS 设置或 Material Dashboard 的陌生壳。

### 4. 交互模式（可参考 Apple / Google，但要落地到 Kit）

| 外部模式 | TopTop 落地 |
|----------|-------------|
| iOS 分组列表 | `regular-list` + 分组标题间距 |
| Material Bottom Sheet | 与现有 `feedComposeOverlay` / sheet 一致：顶把手、选项列表、选择即生效 |
| HIG 披露指示符 chevron | 列表行右侧 `›`，不单独发明新箭头样式 |
| 分段控件 | 若有 `secondary-tab` / pill tab 契约则复用，否则标 prototype |

**禁止**：为「好看」引入产品里不存在的 Dynamic Island、陌生 Tab 样式、与 Kit 不符的大标题导航（除非该功能域已有先例）。

## 交付检查清单（Phase 5 必过）

- [ ] 每屏 `kitMapping` 已填，且 componentId 存在于 `specs/components/` 或标为 `prototype`
- [ ] 页边距、列表行高、按钮高度与 Foundations 同量级（误差 ≤4px）
- [ ] 顶栏/底栏形态与同类 Core 原型一致
- [ ] 半窗/弹层与现有 overlay 模式一致（遮罩 + 自下而上）
- [ ] 灰度仅 3–4 档，对应 semantic 层级，无彩虹灰
- [ ] `design-doc.md` § Kit 映射与线框图一致
- [ ] 未使用 ui-ux-pro-max / 通用模板替换 TopTop 导航与列表语义

## 与「纯线框」skill 的关系

`monkren-design → wireframe` 提供**探索阶段**的低保真广度；
`toptop-ix-designer` 的交付线框是**Kit 约束下的灰度稿**。

冲突时以本文件与 `specs/**/*.yaml` 为准。

## 反例（voice-room 初稿教训）

| 问题 | 应改为 |
|------|--------|
| 通用 iPhone 壳 + 陌生 Profile 布局 | 对齐 `profile-page-prototype` 客态结构 |
| 自创 Segmented / Tab 样式 | 用 Feed 现网 tab 或 `secondary-tab` |
| 隐私页像 iOS 设置克隆 | 用 `regular-list` + 项目既有隐私设置行样式 |
| 半窗像 Material 演示页 | 对齐 `feed-compose` audience/leave 半窗交互 |
