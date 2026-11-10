# 形象分享与形象码 — UX 设计说明

## 背景与目标

基于 PRD 截图（飞书 Wiki 待同步全文），本期聚焦 **AI 形象生成 + 形象码传播 + 可见性控制**。用户既要能自己生成形象，也要能通过好友分享的形象码快速「同款」使用，并在站外落地页完成受邀转化。

## 页面与主流程

| 页面 | 用户任务 |
|------|----------|
| Generate Characters | 上传人物图、填写 Prompt、选模板、生成或打开形象码 |
| All character | 管理 My Generations（Add / Generating / Failed / Using） |
| View Characters | 预览、Use、share、复制 code、「仅自己可见」 |
| 分享落地（受邀） | 识别分享者 → 预览形象 → 复制形象码 → **单一**「Open in TopTop」 |
| 异常 | 数据损坏 → Delete / Try Again |

主路径：**上传 →（首次免费确认）→ 生成 → Use / 分享**。分支：**Characters Code 导入**、**站外受邀**。

## 分享落地页结构（参考抖音站外 H5，落地 TopTop）

对标抖音分享链接在浏览器中的常见模式（Mobbin 未订阅，依据品类惯例）：

| 抖音惯例 | TopTop 落地 |
|----------|-------------|
| 深色沉浸、内容铺满视区 | 形象预览区占主舞台，底部渐变压暗 |
| 顶栏：产品标识 +「打开 App」 | TopTop 标识 +「打开 App」+ 关闭预览 |
| 预览上叠加作者信息 | 预览底部 `@昵称` +「分享了一个 AI 形象」 |
| 一句转化文案 | 「上 TopTop 使用同款形象，一起进房玩」 |
| 底部唯一强 CTA | 「打开 TopTop」（导入形象 + 深链，合一） |
| 次级：复制/备用路径 | 「复制形象码 xxx」文字按钮 |
| 脚注：安装/跳转说明 | 已安装自动跳转 / 未安装去商店 |

**不照搬**：抖音视频竖屏播放器 UI、关注按钮、红色品牌按钮；仍用 TopTop `kitButton--primary` 与品牌 Token。

创作者 **Edit / 可见性** 仅在 App 内详情，不出现在站外页。

### 备选：Snapchat 站外结构（Studio「分享·Snap」）

| Snap 惯例 | TopTop 落地 |
|-----------|-------------|
| 浅色底、圆角卡片 | 白底 + 大圆角预览卡 + 轻阴影 |
| 好友邀请条（「xx sent you…」） | 顶区胶囊条：头像 + **Andrew sent you a Character** |
| 短标题 + 说明 | Try this look together + 一句进房说明 |
| 内容卡居中（类似 Lens / Bitmoji） | 形象预览 + 底部 **code chip**（点按复制） |
| 底部胶囊主按钮 | **Open TopTop**（全宽圆角 `kitButton`） |
| 文字次级操作 | Copy code instead |

不照搬 Snap 黄/ghost 资产；与「分享·抖音」共用同一深链与复制码逻辑，仅信息架构与视觉节奏不同。

## 交互补全（design-completion）

- 未上传人物图时拦截 Generate，并提示先上传（PRD 文案：否则流程失败）。
- 形象码弹窗：不足 8 位禁用 ok，输入自动大写。
- 分享面板提供复制码 / IM / 复制链接（链接切到落地场景）。

## 体验建议（ux-improvement · suggested）

- 「只能我自己用」使用可点击整行 + `aria-pressed`，避免仅小勾选不易点。
- 生成中在表单区展示 `Generating…`，避免重复点击。

## 待产品确认（needs-product-confirm）

见 `brief.yaml` → `openQuestions`（形象码规则、Hot 列表、失败退款、Go to play 目标）。

## 原型入口

- Studio：**原型创作 → 形象分享与形象码**
- 路由：`/canvas/studio/character-impression-share`

## 验收清单

- [ ] 演示场景：生成 / 形象库 / 详情 / 分享·抖音 / 分享·Snap / 异常
- [ ] 主流程可走通：上传 → 首次确认 → 生成 → Use
- [ ] 形象码 `32HU22PXCC` 导入后详情展示正确 code
- [ ] 分享面板可进入落地页场景
- [ ] 私密开关文案与勾选态一致
