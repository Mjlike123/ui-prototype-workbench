---
name: toptop-design-review
description: |
  对使用 TopTop Kit 搭建的页面或功能原型做只读综合验收，覆盖视觉审美、组件与 Token 规范、交互逻辑和交付完整性。输出带证据的 P0/P1/P2 与是否可交付；默认不修改文件。
---

# TopTop 原型综合验收

默认只读。只有用户明确要求修复时，才进入实现 Skill 或专项改进 Skill。

## 审查输入

至少确认：

- 用户目标和主要任务
- 页面截图、运行地址或实现文件
- 使用的 componentId / Manifest
- 目标视口和平台

## 最小读取范围

1. Manifest 中列出的组件 YAML。
2. 对应 Foundations 和 Interaction YAML。
3. 相关实现文件与样式。
4. 必要时查看运行截图。

不要默认加载整个 Monkren references。

## 四层审查

### A. 视觉审美

- 第一视线和信息层级是否明确
- 间距、密度和节奏是否稳定
- 颜色、字体和图标是否来自 Kit
- 是否出现模板化 AI slop

需要深查时调用：

- `monkren-design/skills/04-review/5-dim-review`
- `ai-slop-check`
- `hierarchy-rhythm-review`

### B. 设计规范

- 每个可见模块能否追溯到 componentId
- Variant、Slot、Token 和内容约束是否匹配
- 自定义区域是否被诚实标为 Kit gap
- 没有用近似组件掩盖缺失契约

### C. 交互逻辑

- 用户能否完成主要任务
- 导航、Tab、列表行和 CTA 是否有可见结果
- selected、pressed、focus、empty、error 是否合理
- 是否存在静默操作、死路或状态互相矛盾

需要深查时调用 `interaction-states-pass`。

### D. 交付完整性

- Manifest、实现和截图是否指向同一版本
- H5 是否通过常用视口与可访问性检查
- 像素要求是否有 Yueban/截图证据
- iOS 实机要求是否明确为后续 Lookin 验收

## 严重度

- **P0**：主要任务不可完成、核心模块错误、严重误导或无障碍阻断。
- **P1**：明显违反 Kit、关键状态缺失、交付后高概率返工。
- **P2**：局部层级、文案、节奏和细节优化。

## 输出格式

```text
结论：可交付 / 有条件可交付 / 不可交付

P0
- [位置] 问题 — 影响 — 证据（spec 或 file:line）— 修复方向

P1
...

P2
...

简分
- 视觉审美 x/10：证据
- 设计一致性 x/10：证据
- 交互逻辑 x/10：证据
- 交付完整性 x/10：证据

未决 Kit gaps
- ...
```

没有证据的意见不列为问题。不要因为“看起来不错”跳过功能和状态验证。
