# M-Design 基础 UI 基线的采纳边界

来源：用户提供的 `M-Design设计体系_全部页面PDF`（飞书「M设计系统」导出）。这些 PDF 是设计方法和通用 UI 规则的参考，不是 TopTop 的品牌色板，也不是 TopTop Kit 的组件尺寸合同。后续 agent 先按本页判断来源，再读对应 `specs/` 合同和 Figma 组件实例。

## 决策优先级

1. 当前已确认的产品目标、业务规则、范围和目标页面状态。它们定义「做什么」，但不能绕过无障碍、安全底线，或静默改写 Kit 合同。
2. `specs/principles/core-design-principles.yaml` 及无障碍、安全约束。
3. 相关 `specs/foundations/*.yaml`、`specs/components/*.yaml` 与 `specs/interactions/*.yaml` 结构化合同。
4. 已批准的 TopTop 业务 Figma 页面、本地语义变量、真实 Kit 实现与 Core 页面。它们是当前设计证据；与结构化合同冲突时应记录差异，不能反向覆盖合同。
5. 下表中与上述来源不冲突的 M-Design 通用基线。

M-Design 的品牌色、色值、插画、装饰效果、专属图标、产品文案和示例页面外观不迁入 TopTop。需要颜色时按状态和业务语义选择 TopTop 本地变量；不要吸取 PDF 截图色值。PDF 中的具体像素值仅作设计思路参考，TopTop Kit 对应组件已有明确尺寸时以 Kit 为准。

## TopTop 硬基线（每次必检）

本表是跨 IX、实现和 Review 的检查入口，不替代所引用的 YAML 合同。合同更新后，以 YAML 为准并同步本表。

| 基线 | 执行要求 | 权威来源 |
| --- | --- | --- |
| 默认移动视口 | 未指定移动设备时以 375×812 作为常规手机基线；选定方向还需按任务验证 466×678 和 890×626。不得把 375×812 当作所有设备的固定画布。 | `toptop-profile/profile.yaml` 的 `qualityPolicy.targetViewports` |
| 页面内容边距 | 普通移动内容左右各 16pt；只有组件或业务合同明确允许时才 full-bleed。固定顶栏、底栏、键盘区和浮层需处理 Safe Area 与内容 inset。 | `specs/foundations/responsive-layout.yaml` |
| 间距系统 | 只使用 `spacing.1/2/3/4/6/8`，即 4/8/12/16/24/32；20 不是通用间距 Token。业务特例必须说明来源，不能扩写成全局规则。 | `specs/foundations/spacing.yaml` |
| 图标与触达 | 语义图标复用 TopTop icon Kit、`SystemIcon` 或 canonical SVG，使用 24×24 Frame、`currentColor` 和语义颜色；禁止 Unicode、文字层、CSS mask、`<img>` 或手画近似图标替代。主要操作触控区至少 44×44pt。 | `specs/foundations/icons.yaml`、`toptop-profile/profile.yaml` |
| 颜色 | 使用语义 Token；未指定区域或包时默认 `color.brand.primary`（`#16D8C8`）。KU、TW/Teami 等覆盖色必须有明确业务上下文，不从语言、截图或审美偏好推断。 | `specs/foundations/colors.yaml`、`toptop-profile/profile.yaml` |
| 导航背景 | Primary Navigation 与 Regular Navigation 的容器默认绑定 `color.surface.canvas`，对应 Figma Token `背景色/bgPrimary`；标题、图标和尾部操作自身背景保持透明。禁止硬编码白色、透明色或改用 `color.surface.panel`。只有沉浸式、媒体覆盖等组件 Variant 或业务合同明确要求时，才允许使用其他语义背景。 | `specs/components/primary-navigation.yaml`、`specs/components/regular-navigation.yaml` |
| 页面表面连续性 | 同一页面的 Screen、状态栏、Primary/Regular Navigation 与固定内容底层统一绑定 `color.surface.canvas`（Figma：`背景色/bgPrimary`）；工具栏、列表标题和普通区块容器默认透明继承该表面，禁止在同层级混入硬编码白色或 `color.surface.panel` 形成无语义色块。只有 Card、Sheet、Dialog、Toast 或合同明确的独立层级才使用其他 Surface Token。 | `specs/foundations/colors.yaml`、`specs/components/primary-navigation.yaml`、`specs/components/regular-navigation.yaml` |
| 搜索框背景 | `SearchControl` 的 56pt 外层容器透明并透传页面 `color.surface.canvas`；40pt 胶囊输入框必须绑定 `color.button.secondary`，对应 Figma Token `按钮透明/btnSecondary`。不得把输入框本体绑定为 `背景色/bgPrimary`、硬编码白色或其他近似透明色。 | `specs/components/search-control.yaml`、`specs/foundations/colors.yaml` |
| Toast 位置 | 普通 Toast 默认相对完整屏幕视口水平、垂直居中，不跟随滚动内容，也不默认贴底展示。只有键盘避让、沉浸式媒体或业务合同明确指定时才能偏移，并需记录定位依据；不能凭页面空白位置自行摆放。 | `specs/components/toast.yaml` |
| 组件与页面复用 | 按 Core 页面 → 共享业务模块 → Kit 组件/交互模式 → Foundation primitive → 最小 `Prototype*` gap 的顺序检索；不得用近似标记伪装已有组件。 | `toptop-profile/SKILL.md` |
| 状态与结果 | 主任务必须有可观察、可恢复的结果；按适用性覆盖 default、loading、empty、error、disabled、permission、offline、selected/focus/pressed。破坏性操作说明对象、后果和恢复路径。 | 相关 `specs/interactions/*.yaml` 与 `toptop-design-review/SKILL.md` |

## 已采纳的通用基线

| 规则 | 在 TopTop 中如何执行 | PDF 来源 |
| --- | --- | --- |
| 清晰简单、一致规律、包容开放 | 明确主任务、状态和操作结果；先复用组件与交互；为多语言和复杂业务保留受控扩展。 | `00_M-Design设计体系.pdf` 第 2–3 页；`01_概述.pdf` 第 2–3 页。已落在 `specs/principles/core-design-principles.yaml`。 |
| 分割线服务信息层级 | 开放间距不足以区分信息时才用线或分隔带；同类列表按内容关系选择通栏或缩进。TopTop 的相同属性 0.5pt、跨属性模块 4pt、颜色 `color.border.subtle`（分割线透明/bordBg1）继续生效。 | `03_交互规范/01_通用/03_分割线 Divider.pdf` 第 1、3–4 页；TopTop 具体值见 `specs/foundations/responsive-layout.yaml`。 |
| 图标统一栅格与清晰度 | 优先复用 TopTop icon Kit 矢量实例，使用现有 24px Frame；按组件合同调整视觉尺寸，保持像素对齐和稳定触达区。颜色按语义 Token，紧跟文字的图标继承文字 Token。 | `03_交互规范/01_通用/06_图标 Icon.pdf` 第 1 页；TopTop 具体规则见 `specs/foundations/icons.yaml`。 |
| 头像表达实体类别，组合头像控制信息密度 | 用户身份用圆形头像；房间、家族封面等实体按其业务组件选形态。组合头像过多时要压缩或显示数量，不能无限堆叠。TopTop 已定义的头像尺寸、组合数量与装饰规则优先。 | `03_交互规范/03_数据/01_头像 Avatar.pdf` 第 1–2 页；TopTop 尺寸见 `specs/components/avatar.yaml`。 |
| 搜索让输入、清除和取消可预期 | 输入内容时显示清除操作；清除后保持可继续输入；长文案不得挤压取消或搜索操作。进入搜索页时按 TopTop 转场完成后再聚焦，避免键盘打断。 | `03_交互规范/01_通用/02_通用搜索栏 Search Bars.pdf` 第 1–3 页；TopTop 状态见 `specs/interactions/search-control-input.yaml`。 |
| 半屏只承载与当前上下文相关的有限任务 | 内容按任务选择关闭、取消、完成、返回；支持手势或系统返回，并在未保存重要内容时确认。可调整高度的半屏按内容决定是否提供中间停靠点。TopTop 根层与嵌套层的退出语义以交互合同为准。 | `03_交互规范/02_浮层类功能/05_半屏弹窗 Sheets-Popup.pdf` 第 1、5–6 页；`09_半浮层 Bottom Sheet.pdf` 第 1–6 页；TopTop 规则见 `specs/interactions/bottom-sheet-behavior.yaml`。 |
| 对话框聚焦一次短决策 | 重要或高风险操作才用模态对话框；信息和操作围绕单一任务。尺寸、按钮位置和动效按 TopTop `center-dialog` 合同。 | `03_交互规范/02_浮层类功能/04_对话框 Dialog.pdf` 第 1 页；TopTop 规则见 `specs/interactions/center-dialog-behavior.yaml`。 |
| 加载超过短暂等待时考虑骨架屏 | 整页或图文密集内容预计超过约 500ms 时，可用骨架降低等待不确定性；骨架应对应真实内容结构，加载失败和空结果仍分别呈现。 | `03_交互规范/03_数据/04_骨架屏 Skeleton.pdf` 第 1 页。 |
| 动效解释状态和空间关系 | 小控件反馈快，大容器可略长；进入适合减速、离开适合加速，循环加载可线性。动效交付写明触发条件、对象、属性、变化量、起止时间和曲线；具体时长使用 TopTop motion Token 与交互合同，不直接复制 M-Design 示例值。 | `04_动效规范.pdf` 第 1–14、21–22 页；TopTop Token 见 `specs/foundations/motion.yaml`。 |
| 宽屏按元素属性适配 | 边距、图标、非大图头像和小按钮保持尺寸；文字、通栏按钮、线段延展但字号、高度、线宽不变；背景和大图保持比例；对话框限宽并避让 Safe Area。 | `05_效果技术实现/06_UI&开发 宽屏适配规则.pdf` 第 1–6 页；已落在 `specs/foundations/responsive-layout.yaml`。 |
| 文案为本地化而写 | 文案应易读、易理解、易翻译；长文案、RTL 和动态内容下仍能完成任务，不能靠缩小字号硬塞。 | `06_海外本地化/04_多语言适配及本地化.pdf` 第 1 页；TopTop 原则见 `specs/principles/core-design-principles.yaml`。 |

## 不直接迁入的示例

- M-Design 的品牌主色、渐变、发光和页面装饰：由 TopTop 当前业务、Figma 本地变量和语义 Token 决定。
- M-Design 头像组“默认不超过 4 个”、头像尺寸和图标阶梯：TopTop Kit 已有正式变体，不用另一产品的数值覆盖。
- M-Design Toast“不可点击”和固定展示 2 秒：TopTop Toast 有可操作变体及可访问时长要求，按当前组件合同执行。
- M-Design 搜索页“进入即自动弹键盘”：TopTop 搜索页先完成转场再聚焦，按当前交互合同执行。
- M-Design 半屏、对话框示例的外观和动画数值：只采纳任务范围、层级、退出与反馈原则；具体视觉和状态仍以 TopTop Kit 为准。

新增规则时，记录对应 PDF 页码、TopTop 适用场景、现有组件或 Token 的映射；若存在冲突，先说明冲突并以更高优先级的来源决策，不能悄悄覆盖现有合同。
