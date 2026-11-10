# 动态结构优化 · 我赞过的 · @好友

- **版本：** v0.1（交互稿）
- **日期：** 2026-10-28
- **交互设计师：** Agent（toptop-ix-designer）
- **状态：** 草稿 · 待产品确认 openQuestions
- **Studio 入口：** `/canvas/studio/moment-liked-mention`
- **运行时预览：** `/prototype-runtime/studio/moment-liked-mention?width=375&height=812`

## 1. 设计目标

### 1.1 背景

Moment 需要在不破坏现有发布/详情能力的前提下，完成三件事：**卡片结构按大区关系收敛**、**个人页可回看赞过的内容**、**发布与评论支持 @ 好友并打通通知**。

### 1.2 用户与场景

| 用户 | 场景 | 核心任务 |
|------|------|----------|
| 浏览流用户 | 推荐/关注 Moment | 读动态、点赞、私聊或加好友（视大区而定） |
| 回顾型用户 | 想找回之前点过赞的帖 | 从本人 Profile 进入「我赞过的」并打开详情 |
| 创作者 | 发帖希望好友来看 | 在发布器 @ 好友并发布 |
| 互动用户 | 评论里拉人讨论 | 在详情评论 @ 好友 |

### 1.3 设计原则（本期取舍）

- **一套卡片、配置化操作**：开放/非开放关系只改 footer 操作集，不复制两套列表 UI。
- **@ 交互只做一个半窗**：发布与评论共用 `Choose who to remind`，降低学习与实现成本。
- **回看入口克制**：「我赞过的」作为本人 Profile 内一行私密入口，不放入 Me 功能列表，也不与公开资料混淆。
- **回看效率优先**：「我赞过的」使用摘要卡片按点赞时间排序；完整媒体与正文进入详情，宽屏同时展示列表与当前详情。

### 1.4 成功标准

- [ ] 用户能在本人 Profile 找到并打开「我赞过的」列表
- [ ] 发布与评论均可完成 @ 选择并在正文看到高亮昵称
- [ ] 通知列表可单删、可 Clear all 且必须确认
- [ ] 开放/非开放大区卡片差异在原型中可切换验证

### 1.5 质量方向与探索边界

- **品类 / 主任务：** 社交动态流 + 个人回看 + 社交提醒
- **首屏主角 / 记忆点：** Moment 卡片一致性；@ 选择半窗的「搜索 + 多选」
- **锁定项：** 既有 FAB/详情吸顶吸底、ME/KSA 无 Chat、Kit 导航与列表行
- **可变项：** Mine 入口位置（模块内顺序）、空态文案、通知类型排序
- **参考取舍：** 采纳参考图中 @ 半窗与通知 Clear 确认；避免另做一套好友选择 UI

---

## 2. 输入来源

| 来源 | 类型 | 引用 | 置信度 |
|------|------|------|--------|
| 动态结构 / 我赞过的 | image | `exports/reference-feed-liked-profile.jpg` | high |
| @ 好友 / 通知 | image | `exports/reference-mention-notifications.png` | high |
| Moment v3.19 IX | existing-ix | `moment-publish-detail-v319-2026-09-07` | high |

### 2.1 待确认（needs-product-confirm）

| 议题 | 当前方案 | 风险 |
|------|----------|------|
| 无赞过内容时入口是否置灰 | 入口常显 + 空态页 | 与「隐藏入口」策略冲突 |
| 取消点赞后是否从「我赞过的」移除 | 建议即时移除 | 需与后端同步策略 |
| @ 非互关好友 | 原型允许选择 | 可能触发 spam 策略 |

---

## 3. 用户流程

### 3.1 主流程

```text
本人 Profile → 我赞过的 → 列表 → 动态详情

Moment → 发布 → 输入 @ → Choose who to remind → 发布 → 通知

动态详情 → 评论 → @ → 同一半窗 → 发送 → 通知
```

### 3.2 动态结构（大区）

| 大区 | 卡片 footer | 说明 |
|------|-------------|------|
| 开放关系 | Chat、Add/已关注、点赞、评论 | 与参考图「开放关系」列一致 |
| 非开放关系 | 无 Chat 或替换为区域策略按钮 | 与参考图「非开放关系大区」列一致 |

---

## 4. 页面说明

### 4.1 Profile · 我赞过的入口

- 参考图所示页面在代码中对应 Core `ProfilePagePrototype`。
- 仅在查看本人 Profile 时显示 `RegularListItem` 导航行：「我赞过的」+ 当前数量 + chevron；他人资料页不展示。
- 入口位于身份资料与内容 Tab 之间，副文案明确「仅你可见」。
- 不在本页展示完整列表，避免与个人动态 Tab 混淆。

### 4.2 我赞过的列表

- 顶栏：`RegularNavigation` 标题「我赞过的」。
- 上下文：显示当前数量、按点赞时间排序和仅自己可见，避免与普通 Feed 混淆。
- 列表：作者、身份、点赞时间、正文摘要、可选缩略图和互动数；卡片与「查看详情」进入完整动态。
- 取消点赞：点击明确的「已赞」操作后，以 `motion.duration.standard` 退出列表；底部 `Toast` 提供短时撤销。
- 宽屏：左侧紧凑列表，右侧显示当前选中动态；选中关系通过结构与品牌色细边共同表达。
- **空态：**「还没有赞过的动态」+ 次要按钮「去逛逛 Moment」。

### 4.3 发布 / 评论 @ 好友

- 触发：键盘输入 `@`、或 composer 工具栏 `@`。
- 半窗：标题 **Choose who to remind**；`SearchControl` + 好友 `RegularListItem` 多选。
- 确认：在光标处插入 `@昵称` token（品牌色链接样式）；提交 payload 带 `mentionUserIds`。
- **与评论复用：** 同一 overlay 组件、同一 dismiss 与 reduced-motion 规则。

### 4.4 动态通知

- 行类型：Liked my post / Replied / Commented / mentioned you in a post（与参考图对齐，文案可本地化）。
- 右上 **Clear all** → `CenterDialog`：「Sure to clear all notifications?」Cancel / Clear。
- 行左滑或行内 Delete：单条删除，无需二次确认（与参考图一致）。

---

## 5. Kit 与缺口

### 5.1 复用（Core 核心模块）

| 模块 | 实现 |
|------|------|
| Moment / Feed 列表 | `PrototypeDestinationPage` · `screen="feed"` |
| 我赞过的列表 | Studio `PrototypeLikedMomentsPage` · Kit 导航/身份/空态/Toast 锚点 |
| 动态发布 | `FeedComposePagePrototype` |
| 动态详情 / 评论 | `FeedDetailPagePrototype` |
| 本人 Profile | Core `ProfilePagePrototype`（通过可选 `onOpenLikedMoments` 扩展） |
| @ 半窗 / 通知列表 | Studio 增量 overlay（`mention-picker-sheet`） |

非开放关系：Studio 仅通过 `.studioMomentRegion--closed` 隐藏 Core 卡片上的 `Chat`；详情 ME/KSA 复用 `.studioMomentDetail--closed-region` 隐藏 Chat。

### 5.2 Prototype gaps

| 模块 | 说明 |
|------|------|
| `PrototypeMentionPickerSheet` | 多选好友半窗 + 与 composer 协同 |
| `PrototypeMentionInline` | 正文/评论 @ token 样式与点击 |
| `PrototypeFeedCardRegionActions` | 卡片 footer 大区配置 slot |
| `PrototypeLikedMomentCard` | 回看场景的摘要卡片、取消点赞与撤销；属于页面结构，不提名 Kit |
| `PrototypeLikedMomentSplitDetail` | 890 宽屏列表—详情连续布局；属于页面适配，不提名 Kit |

---

## 6. 验收清单（交互）

- [ ] 切换「开放关系 / 非开放关系」场景，卡片 footer 差异可见
- [ ] 本人 Profile → 我赞过的 → 详情 主路径可走通
- [ ] 我赞过的可取消点赞、短时撤销，全部移除后展示 Kit 空态
- [ ] 890×626 同时展示紧凑列表与当前详情，375/466 保持单列摘要列表
- [ ] 发布器 @ 后正文出现高亮 @昵称
- [ ] 详情评论 @ 打开同一半窗
- [ ] 通知 Clear all 取消后列表不变；确认后为空态
- [ ] 375×812 无横向溢出；主要触控 ≥ 44pt
- [ ] `prefers-reduced-motion` 下半窗仅 opacity 过渡

---

## 7. 下游证据（Prototype Studio）

已实现 Studio 可交互原型并完成 **第 1 轮** 运行截图：

- **Manifest：** `.monkren/ix-design/moment-structure-liked-mention-2026-10-28/exports/manifest.json`
- **复拍命令：** `node scripts/capture-moment-liked-mention.mjs`（需 `npm run portal:dev`）
- **视口：** 375×812、466×678、890×626
- **验收记录：** `ux-review.yaml`（当前：有条件可交付，待产品确认 openQuestions）

主路径在原型中可验证：本人 Profile → 我赞过的 → 详情；发布/评论 @ 半窗；通知 Clear all 确认。

---

## 8. 相关文件

- `brief.yaml` — 需求范围与 openQuestions
- `interaction.yaml` — 页面、状态、overlay、kitMapping
- `wireframes/index.html` — Kit 对齐灰度稿
- `ux-review.yaml` — 综合验收（当前为方案阶段评审）
