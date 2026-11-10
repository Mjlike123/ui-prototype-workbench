# Offer Center UI 信息优化

## 目标与输入

- 目标：让用户快速理解当前 Offer、累计充值、下一档目标、奖励内容和可执行操作。
- 输入：用户提供的 Offer Center / History / My coins / reward 弹窗流程截图。
- 截图角色：结构与业务流程参考，不作为像素级视觉合同。
- 原型位置：`/canvas/studio/offer-center-optimization`。

## 基线审查

### P1 · 当前目标被卡片细节淹没

截图中 `Monthly Offer`、目标金额、奖励缩略图、剩余天数和状态以接近的字号与颜色平铺。用户进入页面后无法先看到“已完成多少、还差多少、下一档是什么”，需要逐行扫描。

**验收标准**：首屏独立呈现累计充值、总目标、百分比、剩余时间和下一档差额；眯眼时仍能识别主任务。

### P1 · 奖励生命周期不直观

原方案依赖序号、小锁和小型奖励图表示 locked / unlocked / claimed，状态含义需要推断；固定 `Recharge` CTA 也未说明本次操作与哪档奖励相关。

**验收标准**：每档奖励明确显示金额门槛、奖励内容、状态和唯一可执行动作；主 CTA 直接说明将解锁的档位。

### P1 · Offer 分类命名与上下文割裂

`Active / Not Activated / History` 分散在 Tab 和右上图标中，`Not Activated` 是系统状态而非用户语言；历史页也缺少完成结果的可扫读摘要。

**验收标准**：使用 `Active / Available`；History 使用文字入口，记录同时显示时间、结果和已获得/未完成信息。

### P2 · 充值面板与 Offer 进度缺乏闭环

原 My coins 面板只列商品，充值后用户无法预判 Offer 进度是否更新、奖励是否解锁。

**验收标准**：选中套餐、充值成功、进度更新、奖励解锁和领取反馈形成连续可见链路。

## 五维度评分

- 哲学一致性：5/10。主任务存在，但截图中的渐变 CTA、浅黄 Offer 卡、大量灰色微文案与小锁状态混合，未形成“清晰简单”的统一决策顺序。
- 视觉层级：4/10。目标金额、奖励、Bonus、剩余天数和序号大多处于同一微型字号层，主进度与下一步没有占据首要视觉位置。
- 细节执行：5/10。卡片内多层边框和紧密网格基本对齐，但间距、缩略图尺度和状态标记密度不一致，弱化了扫读节奏。
- 功能性：5/10。Active、History、Recharge、reward detail 流程齐全，但固定 CTA 和隐晦锁定态增加判断成本，充值到领取的结果反馈不连续。
- 创新性：5/10。生产型商业功能采用常规里程碑和充值商品模式是合理基线；重点应放在信息效率而非新奇表现。

## 优化方案

1. 首卡改为 Offer 摘要：`$12 / $30`、40%、20 days left、下一档还差 `$8`。
2. 奖励改为纵向里程碑：每行只保留门槛、两类奖励和 locked / unlocked / claimed。
3. CTA 使用结果导向文案：`Recharge to unlock $20 reward`。
4. `Not Activated` 改为 `Available`，卡片中明确激活后才开始累计。
5. History 记录增加 Completed / Expired 和实际奖励结果。
6. My coins 面板保留六档商品，增加当前余额、单选态和明确支付金额。
7. 充值达到门槛后立即出现 Claim；领取使用 Kit `CenterDialog` 呈现到账内容。

## Kit 映射

| 层级 | 组件 | 用途 |
| --- | --- | --- |
| 系统区域 | `IosStatusBar` | iOS 状态栏 |
| 页面导航 | `RegularNavigation` | Offer Center、History 与返回 |
| 内容分类 | `UnderlineSecondaryTab` | Active / Available |
| 主操作 | `kitButton` | Recharge、Activate、Claim |
| 短反馈 | `Toast` | 激活与充值结果 |
| 奖励到账 | `CenterDialog` | 已领取奖励与配图 |

## Kit gaps

- `PrototypeOfferSummary`：Offer 累计进度和下一档目标的业务摘要。
- `PrototypeOfferMilestones`：充值门槛、组合奖励和领取状态。
- `PrototypeOfferRechargeSheet`：包含余额和充值 SKU 的商业购买面板；不是通用动作列表，不映射为 `ActionPanel`。

## 原型假设

- 示例月度目标为 `$30`，里程碑为 `$10 / $20 / $30`。
- 默认已充值 `$12`，默认选择 `$9.99` 套餐，用于演示跨过 `$20` 门槛。
- 商品数量、币值、折扣和奖励均为原型模拟数据，需由产品和运营提供真实配置。
- 同一时间只允许激活一个 Offer；是否支持并行 Offer 仍是产品决策项。
