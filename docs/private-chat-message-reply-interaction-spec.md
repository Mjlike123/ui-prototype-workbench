# 私聊消息回复 / 引用交互设计规范

> 文档状态：Review  
> 适用范围：TopTop 私聊 IM，iOS / Android / H5  
> 设计方向：参考 iMessage，LTR 环境使用“向右滑动消息气泡回复”  
> 更新时间：2026-07-31

## 1. 产品决策

采用“**气泡右滑快捷回复 + 长按菜单兜底 + 输入区引用上下文 + 发送后引用定位**”的完整闭环。

首版不引入独立 Thread、跨会话回复、多消息引用和局部文字引用。回复关系保存原消息 ID，不复制原消息全文作为唯一数据来源。

### 1.1 核心目标

| 目标 | 说明 | 验收标准 |
| --- | --- | --- |
| 快速 | 高频用户可单手完成回复 | 在不打开菜单的情况下完成“选消息 → 输入 → 发送” |
| 清晰 | 回复对象在输入前、发送后均可识别 | 始终显示发送者与内容摘要 |
| 安全 | 不抢占系统返回和聊天滚动 | 左侧边缘返回、垂直滚动均可稳定完成 |
| 可恢复 | 定位旧消息后不丢失阅读位置 | 定位后提供“返回回复位置” |
| 包容 | 不依赖隐藏手势 | 长按、键盘和辅助技术均有 Reply 入口 |

## 2. 范围

### 2.1 首版包含

- 右滑消息气泡进入回复。
- 长按消息后选择 Reply。
- H5 / Desktop hover 或焦点状态下显示 Reply。
- 输入框上方显示回复上下文。
- 取消回复但保留输入草稿。
- 回复文字、图片、视频、语音、表情、礼物及业务卡片。
- 点击引用定位原消息。
- 定位后返回原阅读位置。
- 原消息删除、撤回、未加载和无权限状态。
- 发送中、失败、离线和重试。
- 键盘、屏幕阅读器、RTL 与 Reduced Motion。

### 2.2 暂不包含

| 能力 | 决策 | 原因 |
| --- | --- | --- |
| iMessage 式独立 Thread | 延后 | 一对一聊天收益有限，会增加导航层级 |
| Telegram 局部文字引用 | 延后 | 选择、引用和编辑规则复杂 |
| 跨会话回复 | 延后 | 涉及权限、来源提示和隐私边界 |
| 多消息合并引用 | 延后 | 信息结构和发送模型尚未验证 |
| 回复默认通知开关 | 延后 | 私聊默认通知语义已足够明确 |
| 双击快速 Reaction | 独立评估 | 容易与媒体放大、点赞习惯冲突 |

## 3. 入口与平台行为

| 平台 / 输入方式 | 主入口 | 备用入口 | 反馈 |
| --- | --- | --- | --- |
| iOS 触屏 | 在气泡上向右滑动 | 长按 → Reply | 气泡位移、Reply 图标、阈值触觉反馈 |
| Android 触屏 | 在气泡上向右滑动 | 长按 → Reply | 气泡位移、Reply 图标、阈值触觉反馈 |
| H5 触屏 | 在气泡上向右滑动 | 长按 → Reply | 不触发浏览器返回或横向滚动 |
| Desktop 鼠标 | hover 后点击 Reply | 右键 / 更多菜单 → Reply | Reply 仅在 hover 或 focus-within 时出现 |
| 键盘 | 聚焦消息后按 `R` | `Shift+F10` / Menu 键打开菜单 | 进入回复后焦点移动到输入框 |
| 屏幕阅读器 | 消息 Custom Action：Reply | 操作菜单中的 Reply | 宣读“正在回复 {发送者} 的{内容类型}消息” |

## 4. 右滑手势规范

### 4.1 手势优先级

| 优先级 | 手势 | 规则 |
| --- | --- | --- |
| 1 | 系统返回 | 从系统返回边缘开始时，必须优先返回 |
| 2 | 垂直滚动 | 垂直意图明显时，消息列表正常滚动 |
| 3 | 媒体内部手势 | 语音进度、图片缩放等已锁定手势优先 |
| 4 | 气泡右滑回复 | 仅从气泡内容区域开始且符合水平意图时触发 |

禁止把 Reply Pan Gesture 挂在页面根节点或完整消息列表上。手势识别范围应限制在实际发生位移的气泡 Surface。

### 4.2 建议参数

以下参数为首轮原型建议值，需要通过真机测试确认：

| 参数 | 建议值 | 说明 |
| --- | --- | --- |
| 起手区域 | 消息气泡内容区域 | 头像、状态点、空白区和页面边缘不触发 |
| 边缘保护区 | 至少 24pt，或遵循系统返回识别器 | 边缘返回永远优先 |
| 意图锁定 | `abs(dx) > abs(dy) × 1.2` | 避免斜向滚动误触 |
| 开始反馈位移 | 8–12pt | 显示 Reply 图标但不承诺触发 |
| 提交阈值 | 44–56pt | 达到后进入 Ready 状态 |
| 最大视觉位移 | 64pt | 超出后增加阻尼，不继续等比移动 |
| 图标 nest / 跟移 | 自滑动侧 ±32pt 钻出，跟移上限约 28pt | 收到右滑、发出左滑；对齐 Figma 入场与 Ins 跟移手感 |
| 快速滑动 | 结合速度与距离判断 | 不能只依赖瞬时速度 |
| 取消动画 | 160–220ms | 回到原位置 |
| 完成动画 | 160–220ms | 进入回复上下文后气泡回位 |
| 触觉反馈 | 越过阈值时一次轻反馈 | 不在拖动过程中连续振动 |

### 4.3 手势状态

| 状态 | 进入条件 | 视觉 | 行为 |
| --- | --- | --- | --- |
| Idle | 未触摸 | 无 Reply 图标 | 消息正常展示 |
| Tracking | 水平意图初步成立 | 气泡跟手移动（收到右移 / 发出左移）；Reply 图标从滑动侧 nest 位渐显并跟移一段，之后滞后 | 不阻止用户反向取消 |
| Ready | 达到提交阈值 | Reply 图标满尺寸 + 约 120ms 轻微强调，与 Tracking 可一眼区分 | 触发一次轻触觉反馈 |
| Cancelled | 未达阈值、反向或手势中断 | 气泡回弹 | 不改变当前回复对象 |
| Committed | Ready 后松手 | 气泡回位 | 设置回复对象并聚焦输入框 |

### 4.4 冲突处理

| 场景 | 正确结果 |
| --- | --- |
| 从屏幕左边缘向右滑 | 返回上一页 |
| 从消息气泡中部向右滑 | 回复该消息 |
| 从消息列表空白处向右滑 | 不触发回复；允许系统导航 |
| 明显向上 / 下滚动 | 正常滚动，不显示 Reply |
| 轻微斜滑 | 根据方向锁定规则决定，不允许两个动画同时运行 |
| 自己发送的消息 | 同样向右滑回复，不改成编辑 |
| 已删除 / 已撤回消息 | 不允许进入回复 |
| 长按与滑动同时出现 | 已进入 Tracking 后不再启动长按菜单 |
| iOS 26 全屏返回识别器 | 通过 Gesture Recognizer Delegate 协调，不能只依赖边缘宽度 |

## 5. 回复上下文栏

回复上下文位于输入框上方，与输入区形成一个整体 Surface。

| 元素 | 内容规则 | 交互规则 |
| --- | --- | --- |
| 强调线 | 使用品牌色或发送者语义色 | 不单独可点击 |
| 发送者 | `Replying to {Name}` | 最多一行，超长省略 |
| 摘要 | 原消息文字或内容类型 | 最多两行；不展示敏感全文 |
| 缩略图 | 图片 / 视频可选 36–40pt 缩略图 | 裁切规则与消息缩略图一致 |
| 关闭按钮 | 可访问名称为“Cancel reply” | 仅取消引用，不清空草稿 |
| 整体区域 | 当前回复对象 | 点击可尝试定位原消息 |

### 5.1 进入回复后的行为

1. 保留当前未发送草稿。
2. 输入框获得焦点并打开键盘。
3. 输入区高度变化不得遮挡当前消息。
4. 必要时滚动消息列表，保证回复上下文和输入框完整可见。
5. 重复选择同一消息时不重复创建上下文。
6. 选择另一条消息时直接替换回复对象，草稿保持不变。
7. 退出会话再返回时，默认保留草稿；是否保留回复对象由产品草稿策略统一决定。

### 5.2 取消回复

| 操作 | 结果 |
| --- | --- |
| 点击关闭按钮 | 清除回复对象，保留草稿与键盘 |
| 按 Escape（Desktop） | 清除回复对象，焦点留在输入框 |
| 再次触发当前消息的 Reply | 不作为取消手势，保持当前状态 |
| 返回上一页 | 按统一草稿策略保存；不得静默丢失已输入文字 |

## 6. 不同内容类型的引用摘要

| 原消息类型 | 输入区摘要 | 发送后引用 | 点击行为 |
| --- | --- | --- | --- |
| 短文字 | 原文，最多两行 | 发送者 + 原文摘要 | 定位原消息 |
| 长文字 | 截断后的前两行 | 发送者 + 两行摘要 | 定位后查看全文 |
| 图片 | `[Photo]` + 可选缩略图 | 缩略图 + `Photo` | 定位原消息；不直接打开大图 |
| 视频 | `[Video]` + 缩略图 + 时长 | 缩略图 + `Video · 0:24` | 定位原消息 |
| 语音 | `[Voice message] · 18s` | 波形简图或图标 + 时长 | 定位原消息；不直接播放 |
| Emoji / Sticker | `[Sticker]` 或内容预览 | 小尺寸预览 | 定位原消息 |
| GIF | `[GIF]` + 静态首帧 | 静态缩略图 + `GIF` | 定位原消息 |
| 文件 | 文件名 + 类型 / 大小 | 文件图标 + 文件名 | 定位原消息 |
| 礼物卡 | `[Gift] {礼物名}` | 礼物缩略图 + 标题 | 定位原消息 |
| 行动卡 | 卡片标题 | 标题 + `Action card` | 定位原消息 |
| 文章卡 | 文章标题 | 封面 / 标题摘要 | 定位原消息 |
| 关系卡 | 关系状态标题 | 双头像 + 状态标题 | 定位原消息 |
| 位置 | `[Location] {地点名}` | 地图缩略图 + 地点 | 定位原消息 |
| 联系人 | `[Contact] {姓名}` | 头像 + 姓名 | 定位原消息 |
| 已删除 | `Message deleted` | 不显示历史内容 | 不可点击 |
| 已撤回 | `Message unavailable` | 不显示历史内容 | 不可点击 |
| 无权限 | `Message unavailable` | 不泄露发送者或内容 | 不可点击 |

## 7. 回复发送规则

### 7.1 数据关系

发送请求至少包含：

- 新消息临时 ID。
- 原消息稳定 ID `replyToMessageId`。
- 会话 ID。
- 本地展示所需的安全摘要快照。
- 原消息类型。
- 客户端创建时间。

回复关系必须依赖稳定消息 ID。摘要快照用于离线展示，不得绕过删除、撤回和权限规则。

### 7.2 状态矩阵

| 状态 | 引用展示 | 发送状态 | 用户操作 |
| --- | --- | --- | --- |
| Composing | 输入区显示回复对象 | 未发送 | 输入、取消、替换回复对象 |
| Sending | 新消息带引用显示 | Spinner / Sending | 阻止重复提交 |
| Sent | 引用保持可点击 | 成功状态 | 点击定位原消息 |
| Failed | 引用关系保持 | Failed + 明确提示 | Retry / Delete |
| Retrying | 引用关系保持 | Retry spinner | 阻止重复重试 |
| Offline queued | 引用关系保持 | Waiting for connection | 可取消队列消息 |
| Source unavailable | 显示不可用占位 | 新消息本身仍可发送 | 不允许定位 |

### 7.3 失败与重试

1. 失败消息不得自动消失。
2. Retry 必须复用同一客户端消息 ID 或幂等键，避免重复消息。
3. 重试必须保留 `replyToMessageId`。
4. 原消息在重试期间被撤回时，引用降级为不可用占位。
5. 失败原因应区分网络、权限、内容审核和原消息不可用。
6. 删除失败消息需要确认或可撤销反馈。

## 8. 发送后引用气泡

| 属性 | 规则 |
| --- | --- |
| 位置 | 位于当前消息正文上方，属于同一气泡 |
| 层级 | 发送者 > 引用摘要 > 当前回复正文 |
| 高度 | 内容自适应，文字摘要最多两行 |
| 宽度 | 跟随当前气泡宽度，不超过气泡内容区 |
| 颜色 | Incoming 使用正文语义色；Outgoing 使用白色半透明层级 |
| 可点击性 | 原消息可访问时整个引用区域可点击 |
| Focus | 独立 `focus-visible`，不得依赖气泡外层焦点 |
| 嵌套回复 | 只显示直接回复的那条消息，不递归嵌套历史引用 |

## 9. 定位原消息

### 9.1 正常流程

1. 记录用户当前阅读锚点与滚动位置。
2. 点击引用后查找原消息。
3. 原消息已加载：平滑滚动至可视区域中部。
4. 原消息短暂高亮 1.2–1.8 秒。
5. 显示“Back to reply”悬浮按钮。
6. 点击按钮返回此前回复消息位置。

### 9.2 定位状态

| 状态 | 反馈 | 后续操作 |
| --- | --- | --- |
| 原消息已加载 | 滚动 + 高亮 | 可返回回复位置 |
| 正在加载历史 | 引用区域或顶部显示 Loading | 允许取消 |
| 加载成功 | 定位 + 高亮 | 可返回回复位置 |
| 网络失败 | `Couldn’t load original message` | Retry |
| 原消息已删除 | `Original message was deleted` | 不定位 |
| 原消息已撤回 | `Original message is unavailable` | 不定位 |
| 无权限 | `Message unavailable` | 不泄露更多信息 |
| 会话历史已清理 | `Original message is no longer available` | 关闭反馈 |

### 9.3 高亮与返回

- 高亮不得只依赖颜色，应同时使用短暂背景变化或边框。
- `prefers-reduced-motion` 下取消大幅滚动动画，使用即时定位与静态高亮。
- “Back to reply”按钮在用户手动滚动、返回成功或超时后消失。
- 连续定位多个引用时，仅保留最近一次返回锚点。

## 10. 长按消息菜单

| 动作 | Incoming | Outgoing | 规则 |
| --- | --- | --- | --- |
| Reply | 有 | 有 | 第一组高频动作 |
| React | 有 | 有 | 与 Reply 视觉权重相近 |
| Copy | 文字消息 | 文字消息 | 非文字内容不显示 |
| Save / Download | 支持的媒体 | 支持的媒体 | 遵循权限与本地存储规则 |
| Forward | 按产品策略 | 按产品策略 | 需标记来源 |
| Report | 有 | 无 | 危险动作分组 |
| Recall / Unsend | 无 | 有 | 显示时限与结果 |
| Delete for me | 有 | 有 | 与 Recall 明确区分 |

### 10.1 菜单行为

- 触发时提供轻触觉反馈。
- 菜单出现后首个可用操作获得键盘焦点。
- 支持方向键、Home、End、Escape。
- 危险操作与普通操作分组，不使用模糊文案。
- 长按菜单不能成为唯一回复入口。

## 11. 删除、撤回与隐私

| 场景 | 原消息位置 | 已发送的引用 |
| --- | --- | --- |
| Delete for me | 当前用户看不到原消息 | 引用降级为 `Message deleted` |
| Unsend / Recall | 所有人看到撤回占位 | 引用不再展示原文，显示不可用 |
| 账号注销 | 显示统一身份占位 | 保留非敏感摘要或按隐私策略降级 |
| 被拉黑 / 权限变化 | 不允许定位 | 显示 `Message unavailable` |
| 阅后即焚到期 | 原消息消失 | 引用同步失效，不延长原内容生命周期 |
| 举报取证 | 用户界面遵循删除规则 | 后台证据保留不得反向暴露给客户端 |

产品必须明确：撤回后引用是否保留历史文本。推荐全球版本默认不保留，以降低隐私预期冲突。

## 12. 动效与触觉

| 场景 | 动效 | 时长 | 触觉 |
| --- | --- | --- | --- |
| 滑动 Tracking | 气泡跟手、图标渐显 | 实时 | 无 |
| 越过阈值 | 图标轻微强调 | 100–140ms | Light impact 一次 |
| 取消回复手势 | 气泡回弹 | 160–220ms | 无 |
| 成功进入回复 | 气泡归位、上下文栏出现 | 180–240ms | 无 |
| 上下文栏关闭 | 高度收起 | 160–200ms | 无 |
| 定位原消息 | 平滑滚动 + 高亮 | 240–400ms | 可选 Selection |
| 发送失败 | 状态图标出现 | 160ms | Warning，可按平台策略关闭 |

Reduced Motion 下：

- 保留状态变化，但取消弹簧、波形循环和长距离平滑滚动。
- 所有位移动效缩短至近乎即时。
- 不得通过动画本身传达唯一信息。

## 13. 无障碍

| 项目 | 规范 |
| --- | --- |
| 消息语义 | 宣读发送者、方向、内容类型、时间和发送状态 |
| Reply Action | 每条可回复消息暴露“Reply”辅助操作 |
| 回复上下文 | 进入后宣读“Replying to {Name}: {summary}” |
| 关闭按钮 | 使用明确名称“Cancel reply” |
| 引用定位 | 可点击引用必须是独立按钮语义 |
| 不可用引用 | 不呈现按钮语义，宣读不可用原因 |
| 焦点顺序 | 消息 → 引用 → 正文 → 状态 / 操作 |
| 焦点移动 | 进入回复后移至输入框；取消后留在输入框 |
| 状态反馈 | Sending / Failed / Located 使用可访问状态公告 |
| 对比度 | 焦点环至少 3:1；正文符合 WCAG AA |
| 触控区域 | 操作按钮至少 44×44pt |

## 14. 多语言与 RTL

| 场景 | 规则 |
| --- | --- |
| 英文长姓名 | 单行省略，保留完整可访问名称 |
| 德语等长文案 | 上下文摘要最多两行，不挤压关闭按钮 |
| CJK | 按自然换行，不插入硬编码空格 |
| RTL | 推荐按布局方向镜像回复手势：LTR 向右、RTL 向左 |
| RTL 返回 | 系统 Leading Edge 返回始终优先 |
| 方向图标 | Reply 图标与位移方向同步镜像 |
| 数字与时长 | 使用 Locale 格式，但消息 ID 与技术值不本地化 |

RTL 手势属于上线前必须真机确认的决策，不能仅靠界面镜像推断。

## 15. 响应式与布局

| 项目 | 手机 | 平板 / 宽屏 | Desktop |
| --- | --- | --- | --- |
| 气泡最大宽度 | 约 70%–76% 可用宽度 | 限制阅读行长 | 限制在聊天列内 |
| 回复上下文 | 固定在输入区上方 | 跟随输入区宽度 | 跟随 Composer |
| 消息操作 | 长按 / 滑动 | 长按 / 滑动 | hover / 右键 / 键盘 |
| 引用定位 | 单列滚动 | 单列滚动 | 可保持上下文与滚动锚点 |
| Safe Area | 输入区必须避让 | 遵循窗口 Insets | 不适用 |

## 16. 埋点建议

| 事件 | 关键字段 | 用途 |
| --- | --- | --- |
| `reply_entry_started` | gesture / long_press / mouse / keyboard / a11y | 比较入口使用率 |
| `reply_gesture_cancelled` | dx / dy / start_region | 识别阈值和误触 |
| `reply_context_opened` | message_type / ownership | 内容覆盖 |
| `reply_context_cancelled` | has_draft / duration | 判断误触与放弃 |
| `reply_sent` | entry / message_type / latency | 核心成功指标 |
| `reply_send_failed` | error_type / retryable | 失败恢复 |
| `reply_retry` | retry_count / result | 幂等和恢复效果 |
| `quote_locate_started` | source_loaded | 定位需求 |
| `quote_locate_result` | success / unavailable / network_error | 历史加载质量 |
| `quote_return_used` | distance / time_away | 返回锚点价值 |

埋点不得记录消息正文、图片内容或其他敏感信息。

## 17. QA 验收清单

### 17.1 核心流程

- [ ] 右滑收到消息可回复。
- [ ] 右滑自己消息同样可回复。
- [ ] 长按菜单可进入回复。
- [ ] 进入回复后保留草稿并聚焦输入框。
- [ ] 取消回复不清空草稿。
- [ ] 发送后引用关系正确。
- [ ] 回复另一条回复时不产生无限嵌套。
- [ ] 点击引用可定位原消息。
- [ ] 定位后可返回回复位置。

### 17.2 手势冲突

- [ ] iOS 左边缘右滑始终返回。
- [ ] iOS 26 全屏返回场景通过真机测试。
- [ ] 气泡中部右滑稳定回复。
- [ ] 空白区域右滑不触发回复。
- [ ] 垂直快速滚动不误触。
- [ ] 斜向滑动不会同时触发滚动与回复。
- [ ] 小尺寸气泡和语音波形区域可正确识别。
- [ ] Trackpad 双指手势不错误返回或回复。

### 17.3 异常与内容

- [ ] 文字、图片、视频、语音、表情和业务卡片摘要正确。
- [ ] 原消息删除、撤回、无权限时不泄露旧内容。
- [ ] 历史消息未加载时有 Loading、Retry 和取消。
- [ ] 离线发送与重试保持同一引用关系。
- [ ] 重试不会重复创建消息。
- [ ] 长文案、长姓名和多语言不遮挡关闭按钮。

### 17.4 无障碍

- [ ] VoiceOver / TalkBack 可通过 Reply Action 进入回复。
- [ ] 键盘可打开菜单、回复、取消和定位。
- [ ] 焦点环清晰可见。
- [ ] 状态变化有可访问公告。
- [ ] Reduced Motion 下不依赖动画传达状态。

## 18. 可逆实验

| 项目 | 方案 |
| --- | --- |
| 对照组 A | 仅长按菜单回复 |
| 实验组 B | 气泡右滑 + 长按兜底 |
| 用户 | 8–12 名英语区高频 IM 用户，包含 iOS / Android |
| 任务 | 回复最新消息、回复历史消息、取消回复、定位原消息、失败重试 |
| 建议通过标准 | 首次无提示完成率 ≥80%；误触率不高于长按方案；所有用户能从原消息返回 |
| 停止条件 | 明显抢占返回 / 滚动，或阈值调整后仍持续误触 |
| 重点记录 | 起手区域、滑动距离、取消率、任务时间和主观理解 |

通过标准是首轮研究目标，不是现有数据结论。

## 19. 竞品参考

- Apple Messages：[Reply to specific messages](https://support.apple.com/en-us/104974)
- Instagram：右滑消息进入 Reply，长按作为兜底。
- Signal：[Reply to a specific message](https://support.signal.org/hc/en-us/articles/6851465208986-Reply-to-a-specific-message)
- Telegram：[Replies 2.0](https://telegram.org/blog/reply-revolution)
- Discord：[Replies FAQ](https://support.discord.com/hc/en-us/articles/360057382374-Replies-FAQ)
- Snapchat：[Chat Reply](https://help.snapchat.com/hc/en-us/articles/7012338497172-How-to-Reply-to-a-Snap-in-Chat)

## 20. 待产品确认

1. RTL 是否在首版上线；若上线，是否按布局方向镜像手势。
2. 撤回后引用是否统一隐藏历史内容。
3. 离开会话后是否同时保存草稿与回复对象。
4. “Back to reply”按钮的停留时长和样式。
5. H5 是否启用触屏滑动，还是只提供长按与菜单。
6. 是否在后续版本加入局部文字引用。

## 21. UI 设计稿输出清单

本节用于直接指导 Figma 设计生产。建议先完成 P0，再补 P1；P2 只建立占位和规则，不需要在首轮画全量高保真稿。

### 21.1 需要设计的组件

| 编号 | 组件 / 模块 | 来源分类 | 需要设计的内容 | 必备 Variant / State | 优先级 | 交付形态 |
| --- | --- | --- | --- | --- | --- | --- |
| C01 | `Chat Bubble / Reply Gesture` | Interaction Layer | 气泡右滑时的位移、Reply 图标和反馈 | `idle`、`tracking`、`ready`、`cancelled` | P0 | 交互组件 + Prototype |
| C02 | `Reply / Context Bar` | Prototype，候选 Kit | 输入框上方的回复对象、摘要、缩略图和关闭按钮 | `text`、`media`、`voice`、`card`、`unavailable` | P0 | Component Set |
| C03 | `Reply / Quote Summary` | Prototype，候选 Kit | 发送后嵌在气泡中的引用摘要 | `incoming`、`outgoing` × 内容类型 × 来源状态 | P0 | Component Set |
| C04 | `Reply / Locate Highlight` | Interaction Layer | 定位原消息后的短暂高亮 | `enter`、`holding`、`exit`、`reduced-motion` | P0 | Effect / Overlay |
| C05 | `Reply / Return Anchor` | Prototype | 定位后返回回复位置的悬浮按钮 | `default`、`pressed`、`focus`、`hidden` | P0 | Component Set |
| C06 | `Reply / Load Original Feedback` | Prototype | 原消息未加载时的加载、失败与重试 | `loading`、`failed`、`unavailable` | P0 | Inline Feedback |
| C07 | `Message / Action Menu` | Prototype | 长按消息后的 Reply、React、Copy 等操作 | `incoming`、`outgoing`、`text`、`media` | P0 | Bottom Sheet / Context Menu |
| C08 | `Message / Delivery Retry` | Kit 补充 | 回复消息发送失败后的重试入口 | `sending`、`failed`、`retrying`、`offline` | P0 | Chat Bubble Variant |
| C09 | `Reply / Unavailable Source` | Prototype，候选 Kit | 删除、撤回和无权限的统一引用占位 | `deleted`、`recalled`、`permission-denied`、`expired` | P0 | Component Set |
| C10 | `Reply / A11y Focus` | Platform Primitive | 引用、关闭、重试和返回按钮的焦点样式 | `focus-visible`、`screen-reader-selected` | P1 | State Spec |
| C11 | `Reply / Desktop Action` | Platform Primitive | Hover / Focus 时出现的 Reply 快捷操作 | `hidden`、`hover`、`pressed`、`focus` | P1 | Desktop Variant |
| C12 | `Reply / RTL Gesture` | Interaction Layer | RTL 中镜像后的手势、图标与布局 | `tracking`、`ready`、`system-back-conflict` | P1 | RTL Component Page |

### 21.2 组件详细绘制要求

| 组件 | 必须画出的结构 | 尺寸 / 布局重点 | 状态重点 | 不要画成 |
| --- | --- | --- | --- | --- |
| Swipe Gesture | 原气泡、Reply 图标、图标容器、位移轨迹 | 最大位移建议 64pt；图标位于气泡起始侧 | Tracking 与 Ready 必须可一眼区分 | 常驻操作按钮或整行滑动菜单 |
| Context Bar | 强调线、发送者、摘要、可选缩略图、关闭按钮 | 跟随 Composer 宽度；关闭按钮触控区 44pt | 有草稿、无草稿、替换回复对象、不可用 | 单独漂浮在聊天区的卡片 |
| Quote Summary | 强调线、发送者、内容摘要、可选媒体预览 | 嵌在当前气泡顶部；摘要最多两行 | Incoming / Outgoing 对比度、可点击 / 不可点击 | 递归嵌套多层引用 |
| Locate Highlight | 原消息、背景高亮、必要的定位提示 | 不改变消息原有尺寸，避免列表跳动 | Motion / Reduced Motion | 强烈闪烁或只依赖颜色 |
| Return Anchor | 返回图标、`Back to reply` 文案 | 避让输入区和 Safe Area | 出现、按下、消失 | 永久占用屏幕空间的导航条 |
| Load Feedback | Loading、错误文案、Retry | 靠近引用操作发生位置 | 可取消、重试中、再次失败 | 阻塞整页的 Modal |
| Action Menu | Reaction 区、高频操作、危险操作分组 | 手机使用 Bottom Sheet；桌面使用 Context Menu | Incoming / Outgoing 权限差异 | 所有动作平铺且危险操作不分组 |
| Delivery Retry | 失败标记、重试按钮、离线说明 | 不改变气泡主内容位置 | Retry 防重复点击 | 失败后自动删除消息 |

### 21.3 需要输出的流程设计稿

| 画板编号 | 流程 / 状态 | 画面必须包含 | 需要表达的交互 | 关联组件 | 优先级 |
| --- | --- | --- | --- | --- | --- |
| F01 | 私聊默认态 | 收到 / 发出消息、输入区、返回导航 | 交互起点 | Chat Bubble、Chat Input | P0 |
| F02 | 右滑开始 | 气泡轻微右移、Reply 图标初显 | Tracking 起点 | C01 | P0 |
| F03 | 右滑达到阈值 | 气泡最大有效位移、Reply 图标完整 | Ready + 触觉反馈 | C01 | P0 |
| F04 | 右滑取消 | 气泡回弹过程 | 未达到阈值不进入回复 | C01 | P0 |
| F05 | 边缘右滑返回 | 页面跟手返回、气泡不移动 | 系统 Back 优先 | C01 | P0 |
| F06 | 垂直滚动冲突 | 手指经过气泡但列表垂直滚动 | 不触发 Reply | C01 | P0 |
| F07 | 进入文字回复 | Context Bar + 键盘 + 已聚焦输入框 | 保留已有草稿 | C02 | P0 |
| F08 | 进入图片回复 | 缩略图 + `[Photo]` 摘要 | 媒体摘要规则 | C02 | P0 |
| F09 | 进入语音回复 | Voice 图标 + 时长 | 不自动播放语音 | C02 | P0 |
| F10 | 替换回复对象 | 原 Context Bar 切换至新对象 | 草稿保持不变 | C02 | P0 |
| F11 | 取消回复 | Context Bar 收起、草稿仍存在 | Close 只取消引用 | C02 | P0 |
| F12 | 发送中 | 新消息带 Quote Summary + Sending | 阻止重复发送 | C03、C08 | P0 |
| F13 | 发送成功 | Incoming / Outgoing 引用气泡 | 引用可点击 | C03 | P0 |
| F14 | 发送失败 | 引用保持、Failed + Retry | 重试保持 reply relation | C03、C08 | P0 |
| F15 | 离线排队 | Waiting for connection | 可取消队列消息 | C08 | P1 |
| F16 | 点击引用定位 | 消息列表向历史位置移动 | Loading 或直接定位 | C03、C06 | P0 |
| F17 | 原消息高亮 | 原消息处于定位后的强调态 | 1.2–1.8 秒后恢复 | C04 | P0 |
| F18 | 返回回复位置 | 原消息 + `Back to reply` 按钮 | 返回之前阅读锚点 | C05 | P0 |
| F19 | 原消息未加载 | Inline Loading | 加载历史消息，可取消 | C06 | P0 |
| F20 | 原消息加载失败 | 错误文案 + Retry | 重试并保留阅读位置 | C06 | P0 |
| F21 | 原消息已删除 | `Message deleted` 引用占位 | 不允许定位 | C09 | P0 |
| F22 | 原消息已撤回 | `Message unavailable` 引用占位 | 不展示历史内容 | C09 | P0 |
| F23 | 原消息无权限 | 通用不可用占位 | 不泄露发送者或内容 | C09 | P0 |
| F24 | 长按消息菜单 | Reaction + Reply + Copy / Report | Reply 作为兜底入口 | C07 | P0 |
| F25 | 自己消息菜单 | Reply + Copy + Recall + Delete | 与 Incoming 权限不同 | C07 | P0 |
| F26 | Desktop Hover | 消息旁 Reply / More 快捷操作 | Hover、Focus、Right Click | C11 | P1 |
| F27 | 键盘操作 | 消息焦点、菜单焦点、Composer 焦点 | `R`、Menu、Escape | C10、C11 | P1 |
| F28 | Screen Reader | Reply Action 与状态公告说明 | 无手势也能完成回复 | C10 | P1 |
| F29 | Reduced Motion | 即时定位、静态高亮 | 不使用长距离平滑动画 | C04 | P1 |
| F30 | RTL | 右对齐内容、镜像手势与图标 | Leading Edge Back 优先 | C12 | P1 |

### 21.4 必画的内容类型矩阵

不需要为每一种内容重画完整页面。建议在单独的 Component State Grid 中集中输出。

| 内容类型 | Context Bar | Quote Summary · Incoming | Quote Summary · Outgoing | Unavailable | 优先级 |
| --- | --- | --- | --- | --- | --- |
| Text · Short | 必画 | 必画 | 必画 | 必画 | P0 |
| Text · Long | 必画 | 必画 | 必画 | 共用 | P0 |
| Photo | 必画 | 必画 | 必画 | 共用 | P0 |
| Video | 必画 | 必画 | 必画 | 共用 | P1 |
| Voice | 必画 | 必画 | 必画 | 共用 | P0 |
| Emoji / Sticker | 必画 | 必画 | 必画 | 共用 | P1 |
| GIF | 规则即可 | 规则即可 | 规则即可 | 共用 | P2 |
| File | 规则即可 | 规则即可 | 规则即可 | 共用 | P2 |
| Gift | 必画 | 必画 | 必画 | 必画 | P0 |
| Action Card | 必画 | 必画 | 必画 | 必画 | P0 |
| Article | 必画 | 必画 | 必画 | 必画 | P0 |
| Relationship | 必画 | 必画 | 必画 | 必画 | P0 |
| Location | 规则即可 | 规则即可 | 规则即可 | 共用 | P2 |
| Contact | 规则即可 | 规则即可 | 规则即可 | 共用 | P2 |

### 21.5 建议的 Figma Component Properties

#### `Reply / Context Bar`

| Property | Values | 默认值 | 说明 |
| --- | --- | --- | --- |
| `Content` | `Text / Photo / Video / Voice / Sticker / Gift / Action / Article / Relationship` | `Text` | 原消息内容类型 |
| `Source state` | `Available / Deleted / Recalled / Permission denied` | `Available` | 来源可用性 |
| `Thumbnail` | `True / False` | `False` | 媒体缩略图 |
| `Draft` | `Empty / Has text` | `Empty` | 用于验证输入区高度与节奏 |
| `Direction` | `LTR / RTL` | `LTR` | 布局与图标方向 |
| `Close` | `Default / Pressed / Focus` | `Default` | 关闭操作状态 |

#### `Reply / Quote Summary`

| Property | Values | 默认值 | 说明 |
| --- | --- | --- | --- |
| `Bubble direction` | `Incoming / Outgoing` | `Incoming` | 决定颜色和对比度 |
| `Content` | `Text / Photo / Video / Voice / Sticker / Card` | `Text` | 内容摘要类型 |
| `Source state` | `Available / Deleted / Recalled / Permission denied` | `Available` | 来源状态 |
| `Interactive` | `True / False` | `True` | 是否允许定位 |
| `Text length` | `Short / Two lines / Truncated` | `Short` | 文案压力测试 |
| `Focus` | `Default / Hover / Pressed / Focus` | `Default` | 多输入方式状态 |

#### `Reply / Swipe Affordance`

| Property | Values | 默认值 | 说明 |
| --- | --- | --- | --- |
| `State` | `Idle / Tracking / Ready / Cancelled` | `Idle` | 手势生命周期 |
| `Bubble direction` | `Incoming / Outgoing` | `Incoming` | 两类气泡都保持同一回复方向 |
| `Content width` | `Short / Medium / Max` | `Medium` | 验证小气泡和大气泡 |
| `Input direction` | `LTR / RTL` | `LTR` | 镜像策略 |
| `Motion` | `Standard / Reduced` | `Standard` | 动效适配 |

### 21.6 Figma 页面结构建议

| Page / Section | 内容 | 建议命名 |
| --- | --- | --- |
| `01 · Foundations` | Reply 图标、颜色、间距、动效参数 | `Reply / Foundations` |
| `02 · Components` | C01–C12 Component Sets | `Reply / Components` |
| `03 · Content Matrix` | 各内容类型与方向矩阵 | `Reply / Content Matrix` |
| `04 · Core Flow` | F01–F18 核心流程 | `Reply / Core Flow` |
| `05 · Error & Privacy` | F19–F23 异常和隐私 | `Reply / Error States` |
| `06 · Input Methods` | F24–F29 长按、桌面、键盘、A11y | `Reply / Input Methods` |
| `07 · RTL` | F30 与 RTL 内容压力测试 | `Reply / RTL` |
| `08 · Prototype` | 可点击主流程原型 | `Reply / Prototype` |
| `09 · Handoff` | Redline、Token、属性与验收说明 | `Reply / Handoff` |

### 21.7 首轮最小设计包

如果时间有限，第一轮至少输出以下 15 个画板：

| 顺序 | 必做画板 | 对应编号 |
| --- | --- | --- |
| 1 | 私聊默认态 | F01 |
| 2 | 右滑 Tracking | F02 |
| 3 | 右滑 Ready | F03 |
| 4 | 右滑取消 | F04 |
| 5 | 系统返回冲突 | F05 |
| 6 | 文字回复上下文 | F07 |
| 7 | 图片 / 语音回复上下文 | F08、F09 |
| 8 | 取消回复并保留草稿 | F11 |
| 9 | Incoming / Outgoing 发送成功 | F13 |
| 10 | 发送失败与 Retry | F14 |
| 11 | 点击引用定位 | F16 |
| 12 | 原消息高亮 | F17 |
| 13 | 返回回复位置 | F18 |
| 14 | 删除 / 撤回不可用 | F21、F22 |
| 15 | 长按消息菜单 | F24、F25 |

### 21.8 设计完成定义

- [ ] P0 组件均已建立 Component Set，而不是散落 Frame。
- [ ] Incoming / Outgoing 的对比度和引用层级已分别验证。
- [ ] 右滑回复、边缘返回、垂直滚动在 Prototype 中可实际操作。
- [ ] 取消回复不会清空草稿。
- [ ] Quote Summary 可定位原消息，并能返回回复位置。
- [ ] 删除、撤回和无权限状态不会泄露历史内容。
- [ ] 发送失败和 Retry 保留同一引用关系。
- [ ] Text / Photo / Voice / Gift / Action / Article / Relationship 已覆盖。
- [ ] Desktop、键盘、Screen Reader 和 Reduced Motion 有明确交付说明。
- [ ] RTL 若不在首版，必须在 Handoff 中明确标记为未覆盖，而不是默认可用。
- [ ] 所有尺寸、颜色、字体、圆角和动效均绑定 Token 或记录 Kit gap。
- [ ] Prototype 模块没有被误标为稳定 Kit 组件。

