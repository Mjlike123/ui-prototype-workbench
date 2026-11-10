# 用户举报页面举报原因优化 · UX 设计说明

**版本：** v0.1  
**日期：** 2026-09-08  
**交互设计师：** Agent（ix-designer-core + toptop-profile + cursor-adapter）  
**状态：** Studio 原型评审中

## 1. 设计目标

### 1.1 背景

V3.15.0 已上线新版 H5 举报与用户举证能力，但 FR 区语音房常见的跟踪、挑衅等骚扰缺少明确原因，用户转向人工运营渠道。当前需求面向 All region 扩充并统一原因集合，同时让资料类举报的自动取证范围更透明。

### 1.2 用户与场景

| 用户                 | 场景                       | 核心任务                             |
| -------------------- | -------------------------- | ------------------------------------ |
| 遭遇骚扰的语音房用户 | 从用户卡或相关内容发起举报 | 快速找到 Harassment 并提交可审核信息 |
| 资料违规举报者       | 举报个人或房间资料         | 选择违规资料并理解系统会提交哪些证据 |
| 全球 H5 用户         | 使用本地化原因列表         | 在长文案下仍能准确选择与提交         |

### 1.3 本期设计原则

- **增量优先：** V3.15.0 已有入口、对象提示、描述、上传和校验均复用。
- **原因优先：** 原因是主任务；Harassment 放在 Insult 后，首屏可见。
- **字段不混淆：** Other 100 字必填与 Violation description 200 字可选明确分离。
- **证据透明：** 就近说明自动提交所选资料，不新增确认步骤。
- **失败可恢复：** 提交失败不清空任何用户输入。

### 1.4 成功标准

- [ ] 用户可在首屏发现并选择 Harassment。
- [ ] 选择 Other 后可理解“为什么需要填写、最多多少字”。
- [ ] 资料类用户知道系统只提交所选资料作为证据。
- [ ] 长原因与本地化扩展不产生水平溢出。
- [ ] 提交失败后可原地重试且内容保持。

## 2. 输入来源与过滤

| 来源                                           | 类型         | 用途                                           | 置信度 |
| ---------------------------------------------- | ------------ | ---------------------------------------------- | ------ |
| 【非版本】用户举报页面举报原因优化             | 飞书 PRD     | 本期新增、改名、地区和文案规则                 | high   |
| 【V3.15.0】内容生态：用户举证通道、CS 举证通道 | 飞书历史文档 | 核验存量入口、资料选择、描述、上传与提交规则   | high   |
| PRD 两张 H5 截图                               | image        | 核验当前页面结构与控件状态                     | high   |
| v3.21.0 Report `26:4454`                       | Figma        | 资料页标题、列表、分区和底部操作视觉几何       | high   |
| TikTok、Instagram、Discord 官方说明            | web          | 验证贴近对象举报、用户语言原因和可恢复提交原则 | medium |

### 2.1 信息过滤结论

**进入设计：**

- 新增 4 个原因：Harassment、Privacy & Safety、Violence / gore / terrorism、Political / religious violations。
- 3 个原因改名：Pornography、Advertising / Diversion、Impersonation。
- Other 独立 100 字必填输入。
- 个人资料与房间资料自动取证说明。
- 长列表滚动、固定操作、提交中与失败恢复。

**只复用、不重做：**

- 举报入口和被举报对象展示。
- 资料类型多选与原因单选。
- 200 字 Violation description。
- 最多 4 个图片/视频证据及提交时上传。
- 各地区审核后台路由。

**不进入 UI：**

- 后台 `other-%AA` 字符串拼接。
- CS 内部举证通道。
- 截图中的 DBG、水印和评审标注。

完整过滤见 `brief.yaml`。

## 3. 已确认决策

1. 正式英文使用 `Harassment`，修正 PRD 中的 `Harrassment`。
2. Other 使用独立于 Violation description 的 100 字输入；选择 Other 时必填。
3. 所有新版 H5 举报场景统一原因集合与排序；`Under age user` 只在 FR 区展示。
4. 提交成功原型只确认 `Report submitted`，不新增结果页或承诺审核时长。

## 4. 用户流程

### 4.1 通用主流程

```text
现有举报入口
→ 确认被举报对象
→ 选择一个原因
→ 按需填写 200 字描述 / 添加证据
→ Submit report
→ 提交中
→ 已收到举报 / 保留内容并重试
```

### 4.2 Other 分支

```text
选择 Other
→ 就近展开 Tell us what happened
→ 输入 1–100 字具体原因
→ Submit report 可用
→ 后台接收 other-%AA（不在 UI 展示）
```

### 4.3 资料类分支

```text
选择至少一个个人/房间资料类型
→ 查看“只提交所选资料”的自动取证说明
→ 选择统一举报原因
→ 完成可选描述与证据
→ 提交
```

## 5. 页面设计

### 5.1 通用举报原因页

**结构顺序：**

1. `RegularNavigation`：Report + Back。
2. 被举报对象：`You are about to report {name}`。
3. 原因 `radiogroup`：整行点击 + `SelectorButton selectionMode="single"`。
4. Other 条件输入：原生 textarea，持久 label，`maxLength=100`。
5. Violation description：独立可选 textarea，`maxLength=200`。
6. 存量证据上传：原型模拟添加 / 移除。
7. 固定操作坞：Cancel + Submit report。

**布局：**

- 导航与操作坞不进入滚动容器。
- 内容纵向独立滚动，普通内容保持 16px gutter。
- 原因行最小 60px；长本地化文案自然增高。
- 底部操作坞使用 `color.surface.canvas`，包含底部 safe area。

### 5.2 个人资料举报页

- 多选：Avatar、Nickname、Signature、Profile background。
- 至少选择一项。
- 提示：`We’ll submit the profile details you select as evidence for review.`
- 其余原因、Other、描述、上传和操作完全复用通用表单。

### 5.3 房间资料举报页

- 多选：Room cover、Room name、Room announcement。
- 至少选择一项。
- 提示：`We’ll submit the room details you select as evidence for review.`
- 其余表单复用通用结构。

### 5.4 Figma 细节收敛

- 资料类型标题区采用 50px：16px Semibold 标题 + 12px 对象说明；对象名使用设计稿强调色。
- 原因标题区采用 40px；选择行由 56px 调整为 60px，正文统一为 14px Regular。
- 选择状态只由 24px `SelectorButton` 表达，移除整行品牌浅色背景，降低长列表视觉噪声。
- 分区之间由 8px 调整为 4px `color.border.subtle` 隔断；列表分割线继续使用同一 Token。
- 底部双按钮间距调整为 15px；操作坞上方增加 16px 滚动渐隐，并补齐 134×5 Home Indicator。
- Figma 里的旧原因、`Inuslt` / `Sigature` 拼写、绝对定位和旧提交文案不进入实现；以已确认 PRD 与当前 Kit 为准。

## 6. 状态与反馈

| 状态           | 条件                                        | 表现                                               |
| -------------- | ------------------------------------------- | -------------------------------------------------- |
| incomplete     | 原因为空；资料类类型为空；或 Other 内容为空 | Submit report 原生 disabled                        |
| selected       | 原因或资料类型已选                          | SelectorButton 品牌色实心圆 + 白勾                 |
| other-expanded | 选择 Other                                  | 200ms 内展开 100 字输入并聚焦                      |
| submitting     | 点击有效 Submit report                      | 按钮显示 Submitting…、禁用重复提交、loading Toast  |
| success        | 提交成功                                    | success Toast：Report submitted                    |
| error          | 上传或提交失败                              | 保留全部内容；固定区显示错误和恢复方式；按钮可重试 |

`prefers-reduced-motion` 下移除 Other 展开动画，不移除状态变化、焦点和反馈。

## 7. 研究依据

详细报告见 `research.md`。

- TikTok 与 Instagram 均从具体内容或账号附近进入举报，并要求选择用户可理解的原因。
- Discord 强调举报内容与上下文可验证；提交结果不应承诺处罚。
- 三者共同支持“原因准确、对象清楚、证据上下文、结果确认”的模式。

**采用：** 贴近对象、清晰原因、条件字段、证据透明、失败可恢复。  
**避免：** 抄竞品视觉、多级分类扩步、暴露后台枚举、承诺审核结果。

## 8. Kit 与页面复用证据

### 8.1 检索结果

- 未找到现成 Core Report 页面或 Studio Report 模块，因此不复制其他完整页面。
- 二级页壳参考 `apps/design-system-portal/src/components/prototypes/me-secondary-prototypes.tsx` 的 `pageCanvasDevice + RegularNavigation + scroll` 结构；只迁移已验证的页面层级，不复用其设置业务内容。
- 单选列表参考 `apps/design-system-portal/src/components/prototypes/voice-room-status-prototype.tsx` 的可见范围选择模式；举报页改用原生 radio 语义和整页滚动，不套用半窗。
- 字数限制、提交禁用与异步状态参考 `apps/design-system-portal/src/components/prototypes/feed-compose-page-prototype.tsx`；字段用途、上限和文案仍完全按举报需求定义。
- `RegularNavigation`：`apps/design-system-portal/src/components/kit/regular-navigation.tsx`
- `SelectorButton`：`apps/design-system-portal/src/components/kit/selector-button.tsx`
- `Toast`：`apps/design-system-portal/src/components/kit/toast.tsx`
- Kit Button 契约类：`specs/components/button.yaml`
- Tokens：`specs/foundations/colors.yaml`、`spacing.yaml`、`typography.yaml`、`motion.yaml`
- 历史上传和资料选择规则：V3.15.0 飞书文档，不擅自重构。

### 8.2 组件栈

| 区域               | 来源      | 组件 / 原语                                     |
| ------------------ | --------- | ----------------------------------------------- |
| 状态栏             | Kit       | `IosStatusBar`                                  |
| 页面标题与返回     | Kit       | `RegularNavigation`                             |
| 单选 / 多选指示    | Kit       | `SelectorButton`                                |
| 底部操作           | Kit       | `kitButton` 契约类                              |
| 提交反馈           | Kit       | `Toast`                                         |
| 图标               | Kit       | `SystemIcon`                                    |
| 字段与可变高选择行 | primitive | 原生 fieldset、label、radio、checkbox、textarea |
| 自动取证说明       | prototype | `PrototypeReportEvidenceNotice`                 |
| 证据上传演示       | prototype | `PrototypeReportEvidenceUpload`                 |

### 8.3 Kit gaps

1. Kit 尚无通用表单字段、textarea 和可变高 radio row 契约。
2. 现有通知组件语义不适用于持久的表单证据说明。
3. Portal 尚无可复用举报证据上传模块。
4. Portal 没有完整 Report 页面。

以上均保持在 Studio Prototype，不新增虚构 componentId，不晋升 Core。

## 9. 相对 PRD 的 UX 补全

| 类型              | 议题         | 补全                                            |
| ----------------- | ------------ | ----------------------------------------------- |
| design-completion | Other 有效性 | 用户确认独立且必填；空内容不能提交              |
| ux-improvement    | 自动取证说明 | 放在资料类型之后，明确只提交所选资料            |
| design-completion | 长原因列表   | 固定导航 / 操作坞，内容独立滚动                 |
| design-completion | 异步失败     | 保留内容、给出可重试反馈                        |
| ux-improvement    | 动作文案     | Submit 改为 Submit report，提交中为 Submitting… |

## 10. 验收清单

### 需求

- [ ] Harassment 拼写正确且位于 Insult 后。
- [ ] 所有新增、改名原因按确认顺序展示。
- [ ] Under age user 仅 FR 模式出现。
- [ ] Other 与 Violation description 为两个独立字段。
- [ ] 个人 / 房间自动取证提示内容正确。

### 交互

- [ ] 原因是原生单选语义，资料类型是原生多选语义。
- [ ] 必填未满足时 Submit report 不可聚焦或激活。
- [ ] Other 展开后聚焦，达到 100 字后停止输入。
- [ ] 提交中不能重复触发。
- [ ] 失败后全部内容保持并可重试。
- [ ] Back 与 Cancel 均产生可见退出结果。

### UI 与无障碍

- [ ] 375×812、390×844 等视口无横向溢出。
- [ ] 导航和底部按钮固定，首尾内容不被遮挡。
- [ ] 背景、文字、分割线、选中态和反馈均来自语义 Token。
- [ ] 长英文、法文和 200% 缩放下可完成主任务。
- [ ] 所有图标通过 `SystemIcon`，无 `<img>` 引用语义 SVG。

## 11. 交付物

- `brief.yaml`
- `research.md`
- `interaction.yaml`
- `ux-review.yaml`
- `design-mvp-manifest.yaml`
- Studio 原型：`/canvas/studio/report-reason-optimization`
- 实现：`apps/design-system-portal/src/components/studio/studio-report-reason-page.tsx`

## 12. 验证结果

- 组件与原型测试：81 个测试文件、308 项测试通过。
- 设计系统契约：60 份文件校验通过。
- IX Skill 一致性：2 份文档 × 5 个 Skill 检查通过。
- Portal 生产构建：通过。
- 实际 DOM（375×812）：导航 44px、SelectorButton 24×24px、按钮 48px；滚动区 `scrollWidth = clientWidth = 373px`。
- 紧凑视口（320×568）：设备尺寸精确为 320×568，滚动区无水平溢出。
- Token：导航和固定操作坞解析为 `color.surface.canvas`；分割线解析为 `color.border.subtle`；暗色 SelectorButton 描边解析为 `color.border.image`。
- 视觉截图：`prototype-profile.png`、`prototype-other.png`、`prototype-dark.png`。
- Figma 对齐截图：`figma-report-reference.png`、`prototype-figma-refined.png`。
